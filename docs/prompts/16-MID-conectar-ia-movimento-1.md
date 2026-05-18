# Prompt 16-MID-conectar-ia-movimento-1

**Branch:** `feature/16-conectar-ia-movimento-1`
**Modelo recomendado:** Sonnet (decisões de integração + estados loading/error com timeouts longos + mapping de enums)
**Pré-requisito:** Prompt 15 (Diário V1) mergeado. `react-native-devtools-mcp` conectado. Subscription `active` em `user_subscriptions` pro user de teste já provisionada (`leonardo@teste.com`).

---

## Contexto

O DoseDay V5 se posiciona como **"memória inteligente do tratamento"**. Até aqui, o `InsightCard` da Home está mockado (texto fixo desde o Prompt 06). Hora de conectar a IA real.

A V4 já tem **2 Edge Functions ativas** prontas pra consumir — não vamos criar IA do zero. Vamos **plugar** o que existe.

### Edge Functions disponíveis (V4 ATIVAS)

**1. `generate-checkin-insight` (POST)**

Foi projetada pra rodar APENAS no **primeiro check-in** do usuário. Tem UPSERT em `educational_insights` por `(user_id, trigger_source='first_checkin')` — chamar a cada checkin substituiria o anterior.

| Item | Detalhe |
|---|---|
| Auth | `Authorization: Bearer <jwt>` (header obrigatório) |
| Body | `{ medication, dose_mg, treatment_week, current_weight, initial_weight, goal_weight, mood, days_since_last_dose }` |
| Mood obrigatório | `'mal' \| 'ok' \| 'bem' \| 'otimo'` (HTTP 400 se inválido) |
| Response 200 | `{ headline: string, body: string, disclaimer: string }` |
| Side effect | UPSERT em `public.educational_insights` |
| Modelo | `gpt-5-mini` (lento, 5-15s) |
| Disclaimer | Função FIXA o disclaimer — não confiar no texto retornado pelo LLM, mas o disclaimer vem certo do servidor |

**2. `memory-daily-insight` (POST)**

Insight diário que lê 30 dias de dados do usuário (doses, peso, sintomas, check-ins, próxima consulta) e gera insight contextualizado.

| Item | Detalhe |
|---|---|
| Auth | `Authorization: Bearer <jwt>` |
| Body | Empty |
| Cache nativo | **24h** — chamadas dentro de 24h retornam o cached. Sem lógica de cache no cliente |
| Gate Premium | Sem `user_subscriptions` ativa → retorna `{ content: null, mode: 'free_placeholder', placeholder_key: 'dashboard.insightToday.freePlaceholder' }` (sem chamada OpenAI) |
| Response Premium 200 | `{ id: string, insight_text: string, generated_at: string }` |
| Response Free 200 | `{ content: null, mode: 'free_placeholder', placeholder_key }` |
| Response Fallback | `{ insight_text: 'Sua memória será atualizada em breve.', id: null }` |
| Side effect | INSERT em `public.memory_daily_insights` quando gera novo |
| Modelo | `gpt-5-nano` (barato, ~5s) |

### Aprendizado (registrar)

- `generate-checkin-insight` UPSERT por `(user_id, trigger_source='first_checkin')` — não escala pra check-ins recorrentes. V5 chama SÓ no primeiro
- `memory-daily-insight` tem gate de subscription E cache 24h nativo — cliente não duplica lógica
- **System prompt do `memory-daily-insight` é PLACEHOLDER** (`[PLACEHOLDER — será preenchido pelo PO]`). Função funciona, qualidade do output é provisória. Substituição do prompt é follow-up fora do escopo deste prompt

---

## Tarefa

Escopo C refinado — 3 frentes:

1. **Cliente Edge Function** — funções tipadas pra chamar as 2 Edge Functions + queries pra ler tabelas de insights
2. **Hooks React Query** — `useDailyInsight` (Home), chamada manual de `generateCheckinInsight` dentro do `useRegisterCheckin` quando primeiro checkin
3. **UI** — InsightCard real lendo dados / placeholder se free / fallback se erro. CheckinInsightView mostra insight inline pós-primeiro-checkin no modal Diário. InsightDisclaimer badge reutilizável

### Estrutura

```
lib/supabase/queries/
├── insights.ts                       ← NOVO (3 funções)
└── ...existentes intactos

hooks/
├── useDailyInsight.ts                ← NOVO
├── useRegisterCheckin.ts             ← MODIFICAR (chamar generate-checkin-insight no primeiro)
└── useLatestEducationalInsight.ts    ← NOVO (fallback secundário)

components/
├── home/InsightCard.tsx              ← MODIFICAR (substitui prop mocked por hook)
├── diario/CheckinInsightView.tsx     ← NOVO (tela inline pós-primeiro-checkin)
└── ui/InsightDisclaimer.tsx          ← NOVO (badge sempre visível)

app/diario/checkin.tsx                ← MODIFICAR (renderiza CheckinInsightView se primeiro)

lib/validation/diarioSchemas.ts       ← MODIFICAR (adicionar map EmotionalState → mood)
```

### 1. Cliente Edge Function — `lib/supabase/queries/insights.ts`

```typescript
import { supabase } from '@lib/supabase/client'
import type { EmotionalState } from '@lib/validation/diarioSchemas'

// ── Tipos das Edge Functions ────────────────────────────────────

export type GenerateCheckinInsightInput = {
  medication: string | null
  dose_mg: number | null
  treatment_week: number | null
  current_weight: number | null
  initial_weight: number | null
  goal_weight: number | null
  mood: 'mal' | 'ok' | 'bem' | 'otimo'   // OBRIGATÓRIO
  days_since_last_dose: number | null
}

export type CheckinInsightOutput = {
  headline: string
  body: string
  disclaimer: string
}

// Discriminated union — captura os 3 caminhos do response da memory-daily-insight
export type DailyInsightResponse =
  | { kind: 'premium'; id: string; insightText: string; generatedAt: string }
  | { kind: 'free_placeholder'; placeholderKey: string }
  | { kind: 'fallback'; insightText: string }

// Mapping V5 EmotionalState → enum aceito pela Edge Function
const MOOD_MAP: Record<EmotionalState, GenerateCheckinInsightInput['mood']> = {
  terrible: 'mal',
  bad: 'mal',
  ok: 'ok',
  good: 'bem',
  great: 'otimo',
}

export function mapEmotionalStateToMood(state: EmotionalState): GenerateCheckinInsightInput['mood'] {
  return MOOD_MAP[state]
}

// ── Funções de invocação ─────────────────────────────────────────

export async function callGenerateCheckinInsight(
  input: GenerateCheckinInsightInput
): Promise<CheckinInsightOutput> {
  const { data, error } = await supabase.functions.invoke<CheckinInsightOutput>('generate-checkin-insight', {
    body: input,
  })
  if (error) throw error
  if (!data) throw new Error('Empty response from generate-checkin-insight')
  return data
}

export async function callMemoryDailyInsight(): Promise<DailyInsightResponse> {
  const { data, error } = await supabase.functions.invoke<{
    id?: string | null
    insight_text?: string | null
    generated_at?: string | null
    content?: null
    mode?: string
    placeholder_key?: string
  }>('memory-daily-insight', { body: {} })

  if (error) throw error
  if (!data) throw new Error('Empty response from memory-daily-insight')

  // Free placeholder path
  if (data.mode === 'free_placeholder' && data.placeholder_key) {
    return { kind: 'free_placeholder', placeholderKey: data.placeholder_key }
  }

  // Fallback path (id null)
  if (!data.id) {
    return { kind: 'fallback', insightText: data.insight_text ?? 'Sua memória será atualizada em breve.' }
  }

  // Premium path
  return {
    kind: 'premium',
    id: data.id,
    insightText: data.insight_text ?? '',
    generatedAt: data.generated_at ?? new Date().toISOString(),
  }
}

// ── Queries de leitura (fallback secundário) ─────────────────────

export async function getLatestEducationalInsight(userId: string): Promise<CheckinInsightOutput | null> {
  const { data, error } = await supabase
    .from('educational_insights')
    .select('headline, body, disclaimer')
    .eq('user_id', userId)
    .eq('trigger_source', 'first_checkin')
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return { headline: data.headline, body: data.body, disclaimer: data.disclaimer }
}
```

### 2. Hook `useDailyInsight` — chamada on-Home-mount

```typescript
// hooks/useDailyInsight.ts
import { useQuery } from '@tanstack/react-query'
import { useSession } from './useSession'
import { callMemoryDailyInsight } from '@lib/supabase/queries/insights'

export function useDailyInsight() {
  const { session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['dailyInsight', userId],
    queryFn: callMemoryDailyInsight,
    enabled: !!userId,
    staleTime: 1000 * 60 * 60 * 12, // 12h client-side (cache da função é 24h)
    retry: 1,
  })
}
```

### 3. Modificar `useRegisterCheckin` — chamada do generate-checkin-insight no primeiro checkin

Em `hooks/useRegisterCheckin.ts`, modificar o `onSuccess` da mutation. Lógica:

```typescript
// Pseudocódigo da modificação
onSuccess: async (_data, variables) => {
  queryClient.invalidateQueries({ queryKey: ['diarioSummary', userId] })

  // Verifica se foi o PRIMEIRO check-in do user
  const { count } = await supabase
    .from('daily_checkins')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (count === 1) {
    // Primeiro checkin — chamar generate-checkin-insight
    try {
      const mood = mapEmotionalStateToMood(variables.input.emotionalState)
      const insight = await callGenerateCheckinInsight({
        medication: profile?.currentMedication ?? null,
        dose_mg: variables.ctx.currentDoseMg,
        treatment_week: variables.ctx.treatmentWeek,
        current_weight: profile?.currentWeight ?? null,
        initial_weight: profile?.initialWeight ?? null,
        goal_weight: profile?.goalWeight ?? null,
        mood,
        days_since_last_dose: variables.ctx.daysSinceLastDose,
      })
      // Retornar via callback ou estado externo pra a tela renderizar CheckinInsightView
      onFirstCheckinInsight?.(insight)
    } catch (err) {
      // Não bloqueia o success do checkin — log + segue normal
      console.warn('[useRegisterCheckin] generate-checkin-insight falhou:', err)
    }
  }
}
```

**Importante:** falha do `generate-checkin-insight` **NÃO** deve bloquear o sucesso do checkin. Checkin salva normalmente, insight é "extra". Se falhar, fechar modal normalmente.

**Atenção:** `useProfile` precisa expor `currentWeight`, `initialWeight`, `goalWeight` — verificar `lib/supabase/queries/profile.ts`. Se não tiver, adicionar (mudança cirúrgica).

### 4. Modal `app/diario/checkin.tsx` — renderiza CheckinInsightView inline se primeiro checkin

```typescript
// Estado adicional
const [pendingInsight, setPendingInsight] = useState<CheckinInsightOutput | null>(null)
const [waitingForInsight, setWaitingForInsight] = useState(false)

// No handleSubmit, após mutate sucesso:
//   - Se houver chance de ser primeiro checkin: setWaitingForInsight(true)
//   - useRegisterCheckin chama onFirstCheckinInsight(insight) → setPendingInsight(insight)
//   - Renderiza CheckinInsightView no lugar do form
//   - Botão "Fechar" → router.back()
```

**Se não for primeiro checkin OU generate-checkin-insight falhar/timeout:**
- Modal fecha imediatamente (`router.back()`) + toast de sucesso (comportamento atual mantido)

**Timeout máximo de espera:** 20 segundos. Após isso, fecha modal mesmo se insight não chegou (insight ainda fica salvo no `educational_insights` pra próxima sessão).

### 5. UI — `components/diario/CheckinInsightView.tsx`

Tela inline (substitui o form do modal, mantém SafeAreaView/header):

```
┌────────────────────────────────────┐
│ ✕                Insight do dia    │
├────────────────────────────────────┤
│                                    │
│ [InsightDisclaimer badge]          │  ← topo, sempre visível
│                                    │
│   [headline]                       │  ← typography.subtitle
│                                    │
│   [body]                           │  ← typography.body
│   [body continuação]               │
│                                    │
│                                    │
│   [Voltar]                         │  ← AuthButton secondary
└────────────────────────────────────┘
```

**Estados:**
- Loading (15-20s): `<ActivityIndicator size="large" color={colors.brand} />` + texto "Gerando seu insight do tratamento..."
- Success: render acima
- Timeout/erro: fecha modal silenciosamente, toast "Check-in registrado" normal

### 6. UI — `components/home/InsightCard.tsx` (modificar)

Substituir prop mocked por hook. Lógica de render baseada no `DailyInsightResponse`:

| Estado | Render |
|---|---|
| `isLoading` | ActivityIndicator pequeno no topo do card + skeleton de texto |
| `error` (network) | Card com texto "Acompanhamento do tratamento" (fallback genérico — opção 3b aprovada) |
| `data.kind === 'premium'` | Texto `insightText` + InsightDisclaimer badge |
| `data.kind === 'free_placeholder'` | Texto i18n da key `dashboard.insightToday.freePlaceholder` (criar entrada no locales se não existir — em pt-BR algo como "Insight do dia disponível com Premium. Comece sua jornada hoje.") |
| `data.kind === 'fallback'` | Texto `insightText` da fallback (sem disclaimer especial) |

### 7. UI — `components/ui/InsightDisclaimer.tsx`

Badge sempre visível. Reutilizável (Home + Modal pós-checkin):

```
┌──────────────────────────────────────────────────┐
│ ✨ Conteúdo educacional · Não substitui orientação│
│    médica. Converse com seu médico.              │
└──────────────────────────────────────────────────┘
```

Layout:
- Padding `xs` horizontal, `xxs` vertical
- bg `bgSurface` (sutil), border `0.5px rgba(255,255,255,0.06)`
- typography `caption`, color `textSecondary`
- Ícone `sparkle` (SF Symbol) à esquerda em `textSecondary` (não brand — sutil, não compete)
- Sempre **antes** do conteúdo do insight (topo)

### 8. i18n — adicionar key do placeholder Premium

Em `locales/pt-BR/dashboard.json` (ou similar — confirmar estrutura):

```json
{
  "insightToday": {
    "freePlaceholder": "Insight do dia disponível no Premium. Toque pra saber mais."
  }
}
```

**Sem CTA funcional no Prompt 16** — a string apenas existe. Paywall (que abre ao tap) entra no Prompt 19+.

---

## Skills obrigatórias

| Skill | Por quê |
|---|---|
| `react-native-best-practices` | Hooks, mutations, supabase.functions.invoke, timeout patterns |
| `supabase-postgres-best-practices` | RLS, `.maybeSingle()`, Edge Function auth |
| `claude-api` | Não chamamos Anthropic diretamente — função já está pronta. Mas vale ter contexto |
| `/impeccable craft` | Hierarquia visual de CheckinInsightView, InsightDisclaimer badge, transição loading→success |
| `/impeccable harden` | Edge cases: timeout, free user, network drop, Edge Function 500 |
| `superpowers:writing-plans` | **OBRIGATÓRIO** salvar plano em `docs/superpowers/plans/2026-05-18-conectar-ia-movimento-1.md` antes de tocar em código (regra 21) |

---

## Validação automatizada via `react-native-devtools-mcp`

### Bateria (15 testes)

| # | Ação | Tool | Critério |
|---|---|---|---|
| 1 | Cold start + signin Leonardo | `tap` + `type_text` | Home renderiza |
| 2 | InsightCard com data REAL (premium) | `screenshot` Home + `get_js_logs duration=10` | Card mostra texto vindo de `memory_daily_insights` (não mais mock) + disclaimer badge visível no topo |
| 3 | Validar via Supabase MCP | `execute_sql SELECT COUNT(*) FROM memory_daily_insights WHERE user_id=...` | Pelo menos 1 registro novo após o load da Home |
| 4 | A11y InsightCard | `get_view_hierarchy` | Disclaimer com role + texto. Card com accessibilityLabel agrupado |
| 5 | Limpar daily_checkins existentes (pra forçar "primeiro checkin") | `execute_sql DELETE FROM daily_checkins WHERE user_id=...` | Confirm count=0 |
| 6 | Navegar Diário | `tap` na tab Diário | Tela renderiza, CheckinCard com CTA "Fazer check-in" |
| 7 | Fazer check-in (vai ser o primeiro pós-DELETE) | abrir modal → selecionar humor → 1 sintoma → salvar | Modal NÃO fecha imediatamente — entra em loading "Gerando seu insight do tratamento..." |
| 8 | Screenshot modal loading | `screenshot` | ActivityIndicator visível, texto "Gerando..." |
| 9 | Aguardar insight | `get_js_logs duration=20` + screenshot | Após 5-15s, CheckinInsightView aparece com headline + body + disclaimer badge |
| 10 | Screenshot CheckinInsightView | `screenshot` | Layout: badge no topo, headline, body, "Voltar" |
| 11 | Validar via Supabase MCP | `execute_sql SELECT COUNT FROM educational_insights WHERE user_id=... AND trigger_source='first_checkin'` | 1 registro |
| 12 | Fechar via "Voltar" | `tap` | Volta pra tela Diário, toast "Check-in registrado" |
| 13 | Refazer check-in (agora é o SEGUNDO) — apagar daily_checkin de hoje e refazer | `execute_sql DELETE WHERE date=CURRENT_DATE` então fazer checkin | Modal fecha imediatamente (sem CheckinInsightView). Toast normal |
| 14 | Validar que generate-checkin-insight NÃO foi chamada de novo | `execute_sql SELECT count(*) FROM educational_insights WHERE user_id=...` | Continua 1 (UPSERT do segundo NÃO foi disparado porque count_daily_checkins > 1) |
| 15 | Restaurar fixtures de teste — deletar daily_checkins criados nos testes | `execute_sql DELETE` | Confirm volta pra estado inicial |

### Greps técnicos

```bash
npm run type-check    # 0 erros
npm run lint          # 0 erros novos

# Garantir que NÃO há chamadas diretas ao OpenAI no cliente (deve usar só Edge Functions)
grep -rn "openai\|OPENAI_API_KEY" hooks/ lib/ app/ components/
# Esperado: vazio

# Confirmar mapping EmotionalState→mood
grep -rn "mapEmotionalStateToMood\|MOOD_MAP" lib/supabase/queries/insights.ts
# Esperado: aparece

# Confirmar timeout no modal checkin
grep -rn "20.*[Ss]econd\|setTimeout.*20" app/diario/checkin.tsx
# Esperado: timeout de 20s presente
```

---

## Karpathy self-tests (declarar no plano antes do `ok`)

### Think Before Coding
- [ ] Assumptions explícitas declaradas? (mapping mood, primeiro-checkin via COUNT, timeout 20s, fallback genérico em erro)
- [ ] 3 alternativas para "quando chamar generate-checkin-insight" foram avaliadas? (primeiro checkin / a cada / nunca) — escolha justificada: constraint da função UPSERT

### Simplicity First
- [ ] "50 linhas resolveriam em 200?" — Sim: ~200 linhas total (3 queries + 2 hooks + 3 componentes pequenos). Sem abstrações especulativas.
- [ ] Sem retry logic no cliente (Edge Functions já têm fallback)? ✅
- [ ] Sem cache no cliente pra memory-daily-insight (função tem 24h nativo)? ✅

### Surgical Changes
- [ ] Lista exata de "modifica" e "não toca" no escopo acima? ✅
- [ ] Cada linha mudada traceia ao pedido? ✅
- [ ] Sem refactor adjacente em InsightCard além de trocar prop mock por hook? ✅

### Goal-Driven Execution
- [ ] Success criteria observáveis (bateria de 15 testes MCP)? ✅
- [ ] Validação verifica DB + UI + a11y? ✅

---

## Critérios de aceitação

- [ ] `lib/supabase/queries/insights.ts` criado com 3 funções (`callGenerateCheckinInsight`, `callMemoryDailyInsight`, `getLatestEducationalInsight`) + `mapEmotionalStateToMood`
- [ ] `hooks/useDailyInsight.ts` criado, staleTime 12h, retry 1
- [ ] `hooks/useRegisterCheckin.ts` modificado — chama generate-checkin-insight CONDICIONALMENTE (count daily_checkins === 1) sem bloquear sucesso do checkin
- [ ] `hooks/useProfile.ts` + `lib/supabase/queries/profile.ts` modificados se necessário pra expor `currentWeight`, `initialWeight`, `goalWeight`
- [ ] `app/diario/checkin.tsx` modificado — renderiza CheckinInsightView inline se primeiro checkin, com timeout 20s
- [ ] `components/diario/CheckinInsightView.tsx` criado
- [ ] `components/home/InsightCard.tsx` modificado — substitui mock por `useDailyInsight()`, render 4 estados (premium/free/fallback/error)
- [ ] `components/ui/InsightDisclaimer.tsx` criado (badge reutilizável)
- [ ] `lib/validation/diarioSchemas.ts` ganha export `EMOTIONAL_TO_MOOD_MAP` (ou função utilitária)
- [ ] `locales/pt-BR/...` adiciona key `dashboard.insightToday.freePlaceholder`
- [ ] Disclaimer badge visível no topo do InsightCard (Home) E no CheckinInsightView (modal pós-primeiro-checkin)
- [ ] Vital Mint Rarity preservado — brand color só no `sparkle` do badge? **Não — badge usa `textSecondary`.** Verificar que zero `colors.brand` novo aparece
- [ ] Zero `as any` / `// @ts-ignore`
- [ ] Zero `OPENAI_API_KEY` no cliente
- [ ] `npm run type-check` zero erros
- [ ] `npm run lint` zero erros novos
- [ ] Bateria de 15 testes MCP executada (output salvo no handoff)
- [ ] **5 screenshots REAIS** no PR (markdown `![desc](url)`):
  1. Home com InsightCard real (texto vindo de memory_daily_insights)
  2. Modal Diário loading durante geração de insight
  3. CheckinInsightView pós-primeiro-checkin (insight renderizado)
  4. InsightDisclaimer badge close-up (zoom no detalhe)
  5. Home com fallback "Acompanhamento do tratamento" (forçar erro de rede pra capturar)
- [ ] `/impeccable critique` ≥ 28/40, P1/P2 resolvidos
- [ ] `/impeccable harden` rodado (timeout, free user simulado, network drop)
- [ ] **Plano salvo em `docs/superpowers/plans/2026-05-18-conectar-ia-movimento-1.md` ANTES de executar** (regra 21)
- [ ] Fixtures de teste deletadas pós-validação (daily_checkins criados nos testes #5, #13)
- [ ] Commit: `feat(ia): conecta Movimento 1 — insight do dia + insight pós-primeiro-checkin`
- [ ] PR aberto via MCP github

---

## Restrições

- **Sem chamar OpenAI diretamente do cliente** — só via Edge Functions
- **Sem modificar Edge Functions** — `generate-checkin-insight` e `memory-daily-insight` ficam intactas (modificar prompt placeholder é follow-up fora deste prompt)
- **Sem `symptom_logs`** (V2)
- **Sem retry logic no cliente** — Edge Functions têm fallback nativo
- **Sem cache duplicado** — `memory-daily-insight` tem 24h nativo, cliente confia
- **Sem CTA Premium funcional** — placeholder free é STRING apenas (paywall vem em prompt futuro)
- **Sem mudanças em** `lib/theme/tokens.ts`, infra auth, navegação, Diário V1 timeline, Doses, Home (exceto InsightCard), `_layout.tsx`, schemas Zod do diário (apenas adicionar map)
- **Sem migrations no Supabase** — schema existe

---

## Antes de executar

1. Ler `CLAUDE.md` (regras 14 RTK, 20 screenshots reais, 21 salvar plano, 22 Karpathy)
2. Ler `docs/architecture.md` seções 14.x e 15 + aprendizados 20-29
3. Ler `lib/supabase/queries/profile.ts` (vai precisar expor `currentWeight`, `initialWeight`, `goalWeight`)
4. Ler `hooks/useRegisterCheckin.ts` (vai ser modificado — entender estrutura atual)
5. Ler `app/diario/checkin.tsx` (vai renderizar CheckinInsightView inline)
6. Ler `components/home/InsightCard.tsx` (vai substituir mock por hook)
7. Confirmar via `ping` que simulador está rodando
8. Confirmar via SQL que `user_subscriptions` tem registro ativo pro `leonardo@teste.com` (já criado)
9. Apresentar plano com self-tests Karpathy + aguardar `ok`

## Pós-execução

1. Rodar `/impeccable critique` da Home com InsightCard real + CheckinInsightView
2. Rodar `/impeccable harden` (timeout 20s, free user, network drop simulado via `js_eval`)
3. Resolver P1/P2 antes do commit
4. 5 screenshots reais via MCP + anexar PR
5. Atualizar `docs/architecture.md` seção "Aprendizados" com:
   - `generate-checkin-insight` é one-shot por design (UPSERT first_checkin)
   - `memory-daily-insight` tem cache 24h nativo + gate premium
   - Mapping `EmotionalState` → `mood` da Edge Function
   - Padrão "insight como bonus opcional" — falha não bloqueia ação principal
6. Atualizar `CLAUDE.md` tabela "Histórico"
7. Salvar `docs/handoff/HANDOFF-prompt-16.md` se sessão longa
8. PR description deve incluir:
   - "Primeira integração de IA — Movimento 1 conectado"
   - 5 screenshots reais
   - Padrões estabelecidos (1 chamada por primeiro-checkin, cache server-side, gate premium)
   - Follow-ups deferidos: system prompt placeholder do memory-daily-insight, paywall funcional no free placeholder
