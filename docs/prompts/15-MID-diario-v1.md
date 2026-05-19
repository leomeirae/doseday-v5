# Prompt 15-MID-diario-v1

**Branch:** `feature/15-diario-v1`
**Modelo recomendado:** Sonnet (decisões de UX 1-tap + modal sheet + timeline + arrays/jsonb do Supabase)
**Pré-requisito:** Prompt 14 (refactor AuthButton) mergeado em `main`. `react-native-devtools-mcp` conectado. Auth completo, Home + Doses conectados com dados reais.

---

## Contexto

Hoje a tab "Diário" é placeholder. Este prompt destrava o segundo fluxo de WRITE do projeto: registro de sintomas e check-in diário — coração do conceito **"memória inteligente do tratamento"**.

### Reaproveitar 100% do schema V4

O projeto V4 já tem schema clínico robusto. **Não criar tabela nova.** Reaproveitar:

| Tabela V4 | Uso no V5 | Status hoje |
|---|---|---|
| **`quick_logs`** | Registro rápido 1-tap (náusea, fadiga, álcool, "bem hoje", etc) | 1 registro V4 |
| **`daily_checkins`** | Check-in completo do dia (humor + sintomas + triggers + notas) | 9 registros V4 |
| ❌ `symptom_logs` | **Não usar no V1** — versão "evoluída" com `context jsonb` redundante. V2+ | — |
| ❌ `lifestyle_logs` / `lifestyle_triggers` | Vazios na V4. V2+ | — |

### Edge Functions já existentes (NÃO chamar neste prompt)

- `generate-checkin-insight` (V4 ativo) — gera insight LLM após check-in. **Integrar no Prompt 16** (não aqui)
- `memory-daily-insight` (V4 ativo) — insight diário com memória. **Prompt 16+**

### Aprendizado 29 (do Prompt 13)

> "Registro de dose ≠ Registro de sintomas. Momentos clínicos distintos. Não migrar padrões da V4 sem questionar UX."

Este Prompt 15 **confirma essa separação**: efeitos colaterais entram no Diário, não no modal de Registrar Dose.

---

## Tarefa

Substituir o placeholder de `app/(tabs)/diario.tsx` por tela funcional com 3 seções: Quick log (1-tap) + Check-in do dia + Histórico timeline. Criar 2 modais (`/diario/quick-log` e `/diario/checkin`) e helpers de query/mutation.

### Estrutura de arquivos

```
app/
├── (tabs)/diario.tsx              ← SUBSTITUIR (placeholder → tela funcional)
└── diario/
    ├── quick-log.tsx              ← NOVO (modal sheet, opcional — detalhar quick log)
    └── checkin.tsx                ← NOVO (modal sheet, check-in completo)

components/diario/
├── QuickLogChips.tsx              ← NOVO (10 chips horizontais 1-tap)
├── CheckinCard.tsx                ← NOVO (card "Como você está hoje?" / resumo do checkin)
├── EmotionalStatePicker.tsx       ← NOVO (5 emojis de humor: péssimo/mal/ok/bem/ótimo)
├── SymptomsMultiSelect.tsx        ← NOVO (chips multi-select de sintomas)
├── TriggersMultiSelect.tsx        ← NOVO (chips multi-select de triggers)
├── DiarioTimelineItem.tsx         ← NOVO (item da timeline: quick log OU check-in)
└── SectionHeader.tsx              ← REUSAR (já existe em components/doses/)

lib/
├── supabase/queries/diario.ts     ← NOVO (getDiarioSummary, registerQuickLog, registerCheckin)
└── validation/diarioSchemas.ts    ← NOVO (Zod schemas + enums + labels PT-BR)

hooks/
├── useDiarioSummary.ts            ← NOVO (React Query)
├── useRegisterQuickLog.ts         ← NOVO (mutation)
└── useRegisterCheckin.ts          ← NOVO (mutation)
```

### 1. Enums e labels PT-BR (`lib/validation/diarioSchemas.ts`)

```typescript
import { z } from 'zod'

// Constraint do DB: quick_logs.log_type
export const QUICK_LOG_TYPES = [
  'nausea', 'headache', 'fatigue', 'diarrhea', 'constipation',
  'heartburn', 'injection_pain', 'alcohol', 'feeling_good', 'other',
] as const

export const QUICK_LOG_LABELS: Record<QuickLogType, string> = {
  nausea: 'Náusea',
  headache: 'Dor de cabeça',
  fatigue: 'Cansaço',
  diarrhea: 'Diarreia',
  constipation: 'Constipação',
  heartburn: 'Azia',
  injection_pain: 'Dor na injeção',
  alcohol: 'Bebi álcool',
  feeling_good: 'Bem hoje',
  other: 'Outro',
}

// Constraint do DB: quick_logs.intensity (1=leve, 2=moderado, 3=forte)
export const INTENSITY_LABELS = {
  1: 'Leve',
  2: 'Moderado',
  3: 'Forte',
} as const

export const EMOTIONAL_STATES = ['terrible', 'bad', 'ok', 'good', 'great'] as const
export const EMOTIONAL_LABELS: Record<EmotionalState, string> = {
  terrible: 'Péssimo',
  bad: 'Mal',
  ok: 'Ok',
  good: 'Bem',
  great: 'Ótimo',
}
export const EMOTIONAL_EMOJIS: Record<EmotionalState, string> = {
  terrible: '😣',
  bad: '😕',
  ok: '😐',
  good: '🙂',
  great: '😊',
}

// Triggers (do schema lifestyle_triggers.trigger_type, mas guardados em daily_checkins.symptom_triggers como array de strings)
export const TRIGGERS = [
  'alcohol', 'fatty_food', 'sweet_excess', 'fasting',
  'poor_water', 'fast_eating', 'stress',
] as const

export const TRIGGER_LABELS: Record<Trigger, string> = {
  alcohol: 'Álcool',
  fatty_food: 'Comida gordurosa',
  sweet_excess: 'Excesso de doces',
  fasting: 'Jejum',
  poor_water: 'Pouca água',
  fast_eating: 'Comer rápido',
  stress: 'Estresse',
}

export const quickLogSchema = z.object({
  logType: z.enum(QUICK_LOG_TYPES),
  intensity: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2),
  notes: z.string().max(500).optional(),
  loggedAt: z.date().refine((d) => d.getTime() <= Date.now(), {
    message: 'Não é possível registrar no futuro',
  }).default(() => new Date()),
})

export const checkinSchema = z.object({
  date: z.date().refine((d) => d.toISOString().slice(0, 10) <= new Date().toISOString().slice(0, 10), {
    message: 'Não é possível fazer check-in pra data futura',
  }).default(() => new Date()),
  emotionalState: z.enum(EMOTIONAL_STATES),
  emotionalIntensity: z.number().int().min(1).max(5).default(3),
  symptoms: z.array(z.enum(QUICK_LOG_TYPES.filter((t) => t !== 'feeling_good' && t !== 'alcohol') as readonly QuickLogType[])).default([]),
  symptomTriggers: z.array(z.enum(TRIGGERS)).default([]),
  notes: z.string().max(1000).optional(),
})

export type QuickLogType = typeof QUICK_LOG_TYPES[number]
export type EmotionalState = typeof EMOTIONAL_STATES[number]
export type Trigger = typeof TRIGGERS[number]
export type QuickLogInput = z.infer<typeof quickLogSchema>
export type CheckinInput = z.infer<typeof checkinSchema>
```

### 2. Queries (`lib/supabase/queries/diario.ts`)

```typescript
import { supabase } from '@lib/supabase/client'
import type { QuickLogInput, CheckinInput, QuickLogType, EmotionalState, Trigger } from '@lib/validation/diarioSchemas'

export type QuickLogRecord = {
  id: string
  logType: QuickLogType
  intensity: 1 | 2 | 3
  notes: string | null
  loggedAt: Date
}

export type CheckinRecord = {
  id: string
  date: string // YYYY-MM-DD
  emotionalState: EmotionalState | null
  emotionalIntensity: number | null
  symptoms: string[]
  symptomTriggers: string[]
  hasAdverseReaction: boolean
  notes: string | null
  createdAt: Date
}

export type DiarioSummary = {
  todayCheckin: CheckinRecord | null
  recentQuickLogs: QuickLogRecord[]        // últimos 7 dias
  recentCheckins: CheckinRecord[]          // últimos 30 dias (sem o de hoje, que está em todayCheckin)
}

export async function getDiarioSummary(userId: string): Promise<DiarioSummary> {
  const todayISO = new Date().toISOString().slice(0, 10)

  // 1. Check-in de hoje (se existir)
  const { data: todayData, error: todayErr } = await supabase
    .from('daily_checkins')
    .select('id, date, emotional_state, emotional_intensity, symptoms, symptom_triggers, has_adverse_reaction, notes, created_at')
    .eq('user_id', userId)
    .eq('date', todayISO)
    .maybeSingle()
  if (todayErr) throw todayErr

  // 2. Quick logs últimos 7 dias
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: qlData, error: qlErr } = await supabase
    .from('quick_logs')
    .select('id, log_type, intensity, notes, logged_at')
    .eq('user_id', userId)
    .gte('logged_at', sevenDaysAgo)
    .order('logged_at', { ascending: false })
    .limit(50)
  if (qlErr) throw qlErr

  // 3. Check-ins últimos 30 dias (sem o de hoje)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const { data: ckData, error: ckErr } = await supabase
    .from('daily_checkins')
    .select('id, date, emotional_state, emotional_intensity, symptoms, symptom_triggers, has_adverse_reaction, notes, created_at')
    .eq('user_id', userId)
    .neq('date', todayISO)
    .gte('date', thirtyDaysAgo)
    .order('date', { ascending: false })
    .limit(30)
  if (ckErr) throw ckErr

  return {
    todayCheckin: todayData ? mapCheckinRow(todayData) : null,
    recentQuickLogs: (qlData ?? []).map(mapQuickLogRow),
    recentCheckins: (ckData ?? []).map(mapCheckinRow),
  }
}

export async function registerQuickLog(userId: string, input: QuickLogInput): Promise<void> {
  const { error } = await supabase.from('quick_logs').insert({
    user_id: userId,
    log_type: input.logType,
    intensity: input.intensity,
    notes: input.notes ?? null,
    logged_at: input.loggedAt.toISOString(),
  })
  if (error) throw error
}

export async function registerCheckin(userId: string, input: CheckinInput, treatmentContext: {
  daysSinceLastDose: number | null
  treatmentWeek: number | null
  currentDoseMg: number | null
}): Promise<void> {
  const dateISO = input.date.toISOString().slice(0, 10)
  const hasAdverse = input.symptoms.length > 0

  const { error } = await supabase.from('daily_checkins').insert({
    user_id: userId,
    date: dateISO,
    emotional_state: input.emotionalState,
    emotional_intensity: input.emotionalIntensity,
    symptoms: input.symptoms,
    symptom_triggers: input.symptomTriggers,
    has_adverse_reaction: hasAdverse,
    notes: input.notes ?? null,
    days_since_last_dose: treatmentContext.daysSinceLastDose,
    treatment_week: treatmentContext.treatmentWeek,
    current_dose_mg: treatmentContext.currentDoseMg,
    data_quality_score: hasAdverse ? 2 : 1,
  })
  if (error) throw error
}

// (mapCheckinRow e mapQuickLogRow conversores camelCase ↔ snake_case)
```

### 3. Hooks

```typescript
// hooks/useDiarioSummary.ts
export function useDiarioSummary() {
  const { session } = useSession()
  const userId = session?.user?.id
  return useQuery({
    queryKey: ['diarioSummary', userId],
    queryFn: () => getDiarioSummary(userId!),
    enabled: !!userId,
  })
}

// hooks/useRegisterQuickLog.ts — invalidate ['diarioSummary']
// hooks/useRegisterCheckin.ts — invalidate ['diarioSummary'] + opcionalmente ['doseSummary']
//   (porque has_adverse_reaction pode influenciar próximas decisões — V2)
```

Calcular `treatmentContext` no client antes do INSERT:
- `currentDoseMg` ← `profile.currentDose`
- `treatmentWeek` ← `Math.floor((today - profile.treatmentStartDate) / 7)`
- `daysSinceLastDose` ← derivado de `doseSummary.history[0].applicationDate`

---

## Layout da tela `app/(tabs)/diario.tsx`

```
┌────────────────────────────────────┐
│ Diário                             │ ← typography.headline (header inline)
├────────────────────────────────────┤
│                                    │
│ Registro rápido                    │ ← subtitle (label de seção)
│                                    │
│ ┌────────────────────────────────┐ │
│ │ [Náusea] [Dor de cabeça]       │ │ ← QuickLogChips (ScrollView horizontal, 10 chips)
│ │ [Cansaço] [Diarreia] [+]       │ │   Tap = INSERT com intensity=2
│ └────────────────────────────────┘ │   Long-press = abre /diario/quick-log
│                                    │
│ Check-in do dia                    │ ← subtitle
│                                    │
│ ┌────────────────────────────────┐ │
│ │  Como você está hoje?          │ │ ← CheckinCard (se !todayCheckin)
│ │  Anota como tá sua semana 10   │ │   CTA "Fazer check-in" → /diario/checkin
│ │  ┌────────────────────────┐    │ │
│ │  │   Fazer check-in       │    │ │
│ │  └────────────────────────┘    │ │
│ └────────────────────────────────┘ │
│                                    │
│ Histórico                          │ ← subtitle
│                                    │
│ ┌────────────────────────────────┐ │
│ │ ●  Náusea • Moderado           │ │ ← DiarioTimelineItem (quick log)
│ │    Há 2 horas                  │ │
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ 🙂  Check-in • Ontem           │ │ ← DiarioTimelineItem (check-in)
│ │    Náusea, Cansaço             │ │
│ │    Triggers: Álcool            │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

### Estados especiais

| Estado | Render |
|---|---|
| Loading | `ActivityIndicator` discreto no topo da seção Histórico |
| Erro | Texto inline + botão "Tentar novamente" (chama `refetch`) |
| Empty (zero quick logs + zero check-ins) | Histórico: "Seu diário vai aparecer aqui. Comece registrando como você está hoje." |
| Já fez check-in hoje | CheckinCard mostra emoji do humor + resumo (sintomas/triggers) + tap pra abrir modal de edit (V2: por enquanto sem edit, render apenas) |
| Feedback de tap em quick log chip | Haptic light + chip pulse (scale 0.95 → 1.0 com Reanimated) + toast "Registrado" (helper já existente) |

---

## Layout dos modais

### `app/diario/quick-log.tsx` (modal sheet, opcional)

Usado SÓ via long-press no chip (caso usuário queira detalhar antes de salvar). Tap simples no chip salva direto sem modal.

Layout:
- Header: ✕ + "Registrar [tipo]"
- LogType: chip já selecionado (read-only no modal — veio do contexto)
- Intensity: 3 chips (Leve / Moderado / Forte) — default = Moderado
- Notas: TextField multiline opcional
- Botão "Registrar"

### `app/diario/checkin.tsx` (modal sheet, check-in completo)

Layout:
- Header: ✕ + "Como foi seu dia?"
- Data: read-only "Hoje, 18 de maio" (V2: permitir editar)
- **EmotionalStatePicker**: 5 emojis em row (😣 😕 😐 🙂 😊). Tap = seleciona. Single-select.
- **SymptomsMultiSelect**: chips horizontais scrolláveis (8 tipos — exclui `feeling_good` e `alcohol`)
- **TriggersMultiSelect**: chips horizontais scrolláveis (7 triggers)
- Notas: TextField multiline opcional
- Botão "Salvar check-in"

---

## Skills obrigatórias

| Skill | Por quê |
|---|---|
| `react-native-best-practices` | Hooks, mutations, FlatList timeline, KeyboardAvoidingView, multi-select chips |
| `supabase-postgres-best-practices` | INSERT em arrays (`symptoms`, `symptom_triggers`), `maybeSingle()`, RLS-aware |
| `/impeccable craft` | Hierarquia visual da timeline, EmotionalStatePicker (emoji + label), 1-tap UX |
| `/impeccable harden` | Edge cases: tap-spam em chip, double submit, sem profile/medication, network drop |
| `superpowers:writing-plans` | OBRIGATÓRIO antes de tocar em código (regra anti-pirraça 21) — salvar em `docs/superpowers/plans/2026-05-18-diario-v1.md` |

---

## Validação automatizada via `react-native-devtools-mcp`

### Bateria de testes

| # | Ação | Tool | Critério |
|---|---|---|---|
| 1 | Cold start + signin Leonardo | `tap` + `type_text` | Redirect pra Home |
| 2 | Navegar pra tab Diário | `tap` | Tela renderiza com 3 seções |
| 3 | Screenshot tela inicial | `screenshot` | "Como você está hoje?" CTA visível |
| 4 | A11y na tela | `get_view_hierarchy` | Todos chips com accessibilityLabel, CTA com role=button |
| 5 | Tap chip "Náusea" (quick log 1-tap) | `tap` | Haptic + chip pulse + toast "Registrado" |
| 6 | Verificar INSERT via Supabase MCP | `execute_sql SELECT FROM quick_logs WHERE user_id=...` | 1 registro novo com log_type=nausea, intensity=2 |
| 7 | Timeline atualizada | `screenshot` | Novo item aparece no Histórico |
| 8 | Tap "Fazer check-in" | `tap` | Modal sheet abre |
| 9 | Screenshot modal vazio | `screenshot` | EmotionalStatePicker visível, chips de sintomas/triggers visíveis |
| 10 | Selecionar humor "Bem" | `tap` no emoji 🙂 | Chip selecionado |
| 11 | Selecionar 2 sintomas | `tap` "Cansaço" + `tap` "Náusea" | Multi-select funciona |
| 12 | Selecionar 1 trigger | `tap` "Álcool" | Chip selecionado |
| 13 | Tap "Salvar check-in" | `tap` | Loading → modal fecha → toast "Check-in registrado" |
| 14 | Verificar INSERT via Supabase MCP | `execute_sql SELECT FROM daily_checkins WHERE user_id=... AND date=CURRENT_DATE` | 1 registro com symptoms=[nausea,fatigue], triggers=[alcohol], has_adverse_reaction=true |
| 15 | Tela Diário atualizada | `screenshot` | CheckinCard agora mostra emoji 🙂 + resumo dos sintomas |
| 16 | Tentar fazer check-in novamente | `tap` em "Fazer check-in" se ainda renderizar OU verificar que CheckinCard mostra resumo (não CTA) | Apenas 1 check-in por dia — sem CTA duplicado |
| 17 | Limpar fixtures de teste | `mcp__supabase__execute_sql` DELETE | Remove o quick_log e o daily_checkin criados nos testes |

### Greps técnicos

```bash
npm run type-check                # 0 erros
npm run lint                      # 0 erros novos

# Garantir que generate-checkin-insight NÃO foi chamada (adiamos pro Prompt 16)
grep -rn "generate-checkin-insight\|generateCheckinInsight" lib/ hooks/ app/
# Esperado: vazio

# Garantir que symptom_logs (versão V2 evoluída) NÃO foi usada
grep -rn "symptom_logs" lib/supabase/queries/ hooks/
# Esperado: vazio

# Zero hard-coded
grep -rE "#[0-9A-Fa-f]{6}" components/diario/ app/\(tabs\)/diario.tsx app/diario/
# Esperado: vazio
```

---

## Critérios de aceitação

- [ ] `lib/validation/diarioSchemas.ts` com schemas Zod + enums + labels PT-BR
- [ ] `lib/supabase/queries/diario.ts` com `getDiarioSummary`, `registerQuickLog`, `registerCheckin`
- [ ] 3 hooks (`useDiarioSummary`, `useRegisterQuickLog`, `useRegisterCheckin`)
- [ ] `app/(tabs)/diario.tsx` substituído por tela funcional com 3 seções
- [ ] `app/diario/checkin.tsx` (modal sheet) funcional com EmotionalStatePicker + SymptomsMultiSelect + TriggersMultiSelect
- [ ] `app/diario/quick-log.tsx` opcional (long-press) — pode ser deferido pra V2 se Léo concordar
- [ ] 6 componentes em `components/diario/` (QuickLogChips, CheckinCard, EmotionalStatePicker, SymptomsMultiSelect, TriggersMultiSelect, DiarioTimelineItem)
- [ ] `SectionHeader` REUSADO de `components/doses/` (se específico de doses, mover pra `components/ui/` antes — registrar como mini-refactor)
- [ ] `Stack.Screen` config em `app/_layout.tsx` pra `diario/quick-log` e `diario/checkin` com `presentation: 'modal'`
- [ ] Validação Zod + INSERT corretos (`symptoms` array, `symptom_triggers` array, `has_adverse_reaction` derivado)
- [ ] Cálculo de `treatment_week` + `days_since_last_dose` + `current_dose_mg` no client antes do INSERT (consumir `useProfile` + `useDoseSummary`)
- [ ] Toast em todas as mutations
- [ ] Loading/empty/error states em todas as seções
- [ ] Zero `colors.brand` na timeline (regra Vital Mint Rarity — só CTA "Fazer check-in" pode usar)
- [ ] Zero `BlurView` (camada de conteúdo)
- [ ] Zero `as any` / `// @ts-ignore`
- [ ] A11y validado via `get_view_hierarchy`
- [ ] `npm run type-check` zero erros
- [ ] `npm run lint` zero erros novos
- [ ] Bateria de 17 testes MCP executada
- [ ] **5 screenshots REAIS no PR** (regra 20): tela Diário inicial, chip pressed pós-tap, modal check-in vazio, modal check-in preenchido, tela Diário com check-in feito
- [ ] `/impeccable critique` ≥ 28/40, P1/P2 resolvidos
- [ ] `/impeccable harden` rodado
- [ ] **Plano salvo em `docs/superpowers/plans/2026-05-18-diario-v1.md` ANTES de executar** (regra 21)
- [ ] Fixtures de teste deletadas pós-validação
- [ ] Commit: `feat(diario): tela Diário V1 com quick log + check-in + histórico`
- [ ] PR aberto

---

## Restrições

- **Sem chamar `generate-checkin-insight`** — fica pro Prompt 16
- **Sem chamar `memory-daily-insight`** — fica pro Prompt 16
- **Sem `symptom_logs`** (tabela V2 evoluída) — V1 usa só `quick_logs` + `daily_checkins`
- **Sem `lifestyle_logs` / `lifestyle_triggers`** — V2+
- **Sem edit/delete de quick_log ou check-in** — V2+
- **Apenas 1 check-in por dia** — UPSERT não necessário no V1 (se já houver, CheckinCard mostra resumo, não CTA)
- **Sem charts ou agregados** — Prompt 17 (Tela Relatórios)
- **Sem InsightCard novo** — InsightCard da Home continua mockado até Prompt 16
- **Sem mudanças em** `lib/theme/tokens.ts`, infra auth, `app/(tabs)/_layout.tsx`, `lib/supabase/client.ts`
- **Sem migrations no Supabase** — schema V4 já é suficiente

---

## Antes de executar

1. Ler `CLAUDE.md` (em especial regras 14 RTK calibrado, 20 screenshots reais, 21 salvar plano)
2. Ler `docs/architecture.md` seções 14.x e 15 + aprendizados 20-29
3. Ler `docs/PRODUCT.md` Voice & Tone (especialmente "Tom Mariana" pra copy do CheckinCard)
4. Ler `lib/supabase/queries/doses.ts` + `hooks/useDoseSummary.ts` (padrão a seguir)
5. Ler `app/dose/registrar.tsx` (modal sheet — pattern a replicar pro check-in)
6. Confirmar via `ping` que simulador está rodando
7. Credenciais teste: `leonardo@teste.com` / `123456`
8. **Apresentar plano completo** + aguardar `ok` antes de tocar em código (regra 1)

## Pós-execução

1. Rodar `/impeccable critique` da tela Diário com screenshot real via MCP
2. Rodar `/impeccable harden` (edge cases: tap-spam, profile null, network drop)
3. Resolver P1/P2 antes do commit
4. **5 screenshots REAIS** via MCP anexados no PR description (markdown `![desc](url)`)
5. Atualizar `docs/architecture.md` seção "Aprendizados" se houver descoberta nova (padrão multi-select array, dia-único check-in, etc)
6. Atualizar `CLAUDE.md` tabela "Histórico" com linha do Prompt 15
7. Atualizar `docs/handoff/HANDOFF-prompt-15.md` se sessão for longa
8. PR description deve incluir:
   - "Segundo fluxo de WRITE — Diário V1 (quick log 1-tap + check-in completo)"
   - Lista dos 5 screenshots
   - Padrões estabelecidos (multi-select array, 1 check-in por dia)
   - Pendência: `generate-checkin-insight` ainda não chamada (Prompt 16)
