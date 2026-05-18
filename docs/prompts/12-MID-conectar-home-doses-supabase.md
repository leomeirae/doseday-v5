# Prompt 12-MID-conectar-home-doses-supabase

**Branch:** `feature/12-conectar-home-doses-supabase`
**Modelo recomendado:** Sonnet (decisões arquiteturais de queries + estados loading/empty/error + React Query patterns)
**Pré-requisito:** Prompt 11 mergeado em `main`. Auth completo + simulador conectado + fixtures populadas no Supabase para o `leonardo@teste.com`.

---

## Contexto

Auth está fechado (Prompts 09, 10, 11). Mariana abre o app, faz signin com sua conta real do Supabase, é redirecionada pra Home — mas a Home **ainda mostra "Boa tarde, Mariana"** (mockado) e "2 dias até sua próxima dose" (mockado). Quebra de confiança imediata.

Este prompt **substitui mocks por dados reais** nas duas telas mais visíveis: Home e Doses. Fixtures já populadas no Supabase pro user `leonardo@teste.com`:

| Campo | Valor real (Supabase) |
|---|---|
| `user_profiles.full_name` | Leonardo |
| `user_profiles.current_medication` | Mounjaro (Tirzepatida) |
| `user_profiles.current_dose` | 5 |
| `medication_applications` (histórico) | 4 doses semanais, última em 2026-05-13 |
| **Próxima dose calculada** | 2026-05-20 (em 2 dias contados de hoje 2026-05-18) |

**Descoberta arquitetural crítica:** `medication_applications.application_date` tem CHECK constraint `<= now() + 1 hour`. Ou seja, a tabela só registra doses **já aplicadas (histórico)**. A "próxima dose" não é uma entrada futura — é **calculada** a partir da última aplicação + `days_until_next_dose`.

Persona-alvo: **Mariana** (mas Leonardo aqui é o teste). Veja `docs/PRODUCT.md`.

---

## Tarefa

Construir camada de **queries Supabase + React Query** e plugar nas telas Home e Doses. Manter o InsightCard mockado (entra com IA num prompt futuro). Loading/empty/error states robustos.

### 1. Queries Supabase

**`lib/supabase/queries/profile.ts`**

```typescript
import { supabase } from '@lib/supabase/client'
import type { Database } from '@/types/database'

type UserProfileRow = Database['public']['Tables']['user_profiles']['Row']

export type Profile = {
  id: string
  fullName: string | null
  currentMedication: string | null
  currentDose: number | null
  treatmentStartDate: string | null
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, full_name, current_medication, current_dose, treatment_start_date')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    id: data.id,
    fullName: data.full_name,
    currentMedication: data.current_medication,
    currentDose: data.current_dose ? Number(data.current_dose) : null,
    treatmentStartDate: data.treatment_start_date,
  }
}
```

**`lib/supabase/queries/doses.ts`**

```typescript
import { supabase } from '@lib/supabase/client'

export type DoseStatus = 'scheduled' | 'applied' | 'skipped'

export type DoseRecord = {
  id: string
  medicationName: string
  dose: number
  applicationDate: Date
  daysUntilNextDose: number
  status: DoseStatus
}

export type DoseSummary = {
  nextDose: {
    daysUntil: number       // pode ser 0 (hoje), 1 (amanhã), N (em N dias)
    isOverdue: boolean      // true se daysUntil < 0
    overdueBy: number       // dias de atraso (positivo se overdue)
    scheduledDate: Date     // data calculada da próxima
    medicationName: string  // herda da última aplicação ou null
    dose: number | null
  } | null
  history: DoseRecord[]
}

export async function getDoseSummary(userId: string): Promise<DoseSummary> {
  const { data, error } = await supabase
    .from('medication_applications')
    .select('id, medication_name, dose, application_date, days_until_next_dose')
    .eq('user_id', userId)
    .order('application_date', { ascending: false })
    .limit(20) // suficiente pra Home + Doses V1

  if (error) throw error
  if (!data || data.length === 0) {
    return { nextDose: null, history: [] }
  }

  const history: DoseRecord[] = data.map((row) => ({
    id: row.id,
    medicationName: row.medication_name,
    dose: Number(row.dose),
    applicationDate: new Date(row.application_date),
    daysUntilNextDose: row.days_until_next_dose,
    status: 'applied', // todas em medication_applications são aplicadas. status 'skipped' / 'scheduled' viriam de outras tabelas no futuro
  }))

  // Calcular próxima dose a partir da última aplicação
  const last = history[0]
  const nextDate = new Date(last.applicationDate)
  nextDate.setDate(nextDate.getDate() + last.daysUntilNextDose)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const nextDateMidnight = new Date(nextDate)
  nextDateMidnight.setHours(0, 0, 0, 0)
  const diffMs = nextDateMidnight.getTime() - today.getTime()
  const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24))

  return {
    nextDose: {
      daysUntil: Math.max(daysUntil, 0),
      isOverdue: daysUntil < 0,
      overdueBy: daysUntil < 0 ? Math.abs(daysUntil) : 0,
      scheduledDate: nextDate,
      medicationName: last.medicationName,
      dose: last.dose,
    },
    history,
  }
}
```

### 2. React Query setup

Verificar se `QueryClientProvider` já está em `app/_layout.tsx` (deve estar — Prompt 09). Se não, criar `lib/queryClient.ts` com `QueryClient` configurado:

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5min — dados clínicos não mudam segundo a segundo
      refetchOnWindowFocus: false, // RN não tem janela como web
    },
  },
})
```

### 3. Hooks

**`hooks/useProfile.ts`**

```typescript
import { useQuery } from '@tanstack/react-query'
import { useSession } from './useSession'
import { getProfile } from '@lib/supabase/queries/profile'

export function useProfile() {
  const { session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => {
      if (!userId) throw new Error('No user')
      return getProfile(userId)
    },
    enabled: !!userId,
  })
}
```

**`hooks/useDoseSummary.ts`**

```typescript
import { useQuery } from '@tanstack/react-query'
import { useSession } from './useSession'
import { getDoseSummary } from '@lib/supabase/queries/doses'

export function useDoseSummary() {
  const { session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['doseSummary', userId],
    queryFn: () => {
      if (!userId) throw new Error('No user')
      return getDoseSummary(userId)
    },
    enabled: !!userId,
  })
}
```

### 4. Home Screen — `app/(tabs)/index.tsx`

Substituir o mock `homeMock` por:

- `const { data: profile, isLoading: profileLoading } = useProfile()`
- `const { data: dose, isLoading: doseLoading, error: doseError, refetch } = useDoseSummary()`
- Computar `firstName = profile?.fullName?.split(' ')[0] ?? 'você'` (greeting fallback se não tiver nome)

**GreetingHeader:**
- Greeting com primeiro nome real (ou fallback "você"): "Boa tarde, Leonardo" / "Boa tarde, você"
- Data atual do device (já está OK)

**NextDoseCard:**
- Se `doseLoading`: mostrar skeleton (ver detalhe abaixo) ou `<ActivityIndicator size="small" color={colors.brand} />` discreto
- Se `doseError`: erro inline + botão "Tentar novamente" chamando `refetch()`
- Se `!dose.nextDose` (zero histórico): empty state "Você ainda não registrou doses" + texto explicativo (sem CTA por enquanto — input vem em prompt futuro)
- Se `dose.nextDose.isOverdue`: variação visual — número em `semanticWarning` (não brand), label "dias de atraso" (mas mantendo Number-First)
- Caso normal: mesmo card de hoje mas com dados reais (`dose.nextDose.daysUntil` no número, `medicationName + dose + scheduledDate formatada` abaixo)
- Manter Vital Mint Rarity (brand SÓ no número quando não-overdue)

**InsightCard:**
- **Mantém mockado** por enquanto (texto fixo). Quando IA entrar, lê `educational_insights` ou `memory_daily_insights`. Não-bloqueante para este prompt.

### 5. Tela Doses — `app/(tabs)/doses.tsx`

Substituir `mockNextDoses` + `mockHistoryDoses` por dados de `useDoseSummary()`.

**Próximas (1 item — a próxima calculada):**
- Se há `dose.nextDose`: renderizar 1 DoseCard com `status: 'scheduled'`, data = `scheduledDate`, medicação e dose reais
- Se overdue: tag com `semanticWarning`
- Se zero histórico: empty state na seção "Próximas": "Sua próxima dose vai aparecer aqui depois do primeiro registro"

**Histórico:**
- Mapear `dose.history` em DoseCards com `status: 'applied'`
- Se vazio: empty state "Sem doses registradas ainda" (já coberto na seção próximas)

**Estados globais:**
- `isLoading` → spinner centralizado no meio da tela
- `error` → texto + botão "Tentar novamente"

### 6. Skeleton vs ActivityIndicator

Decisão pragmática V1: usar `<ActivityIndicator size="small" color={colors.brand} />` discreto onde cabe inline (NextDoseCard, header da Doses). Skeletons (componente custom) ficam pra prompt futuro de polish — não bloqueia este prompt.

### 7. Estrutura de arquivos

```
lib/
├── supabase/
│   ├── client.ts               (existe)
│   ├── auth.ts                 (existe)
│   └── queries/
│       ├── profile.ts          ← NOVO
│       └── doses.ts            ← NOVO
├── queryClient.ts              ← NOVO (se ainda não existir)
└── mocks/
    └── home.ts                 ← MANTER (InsightCard ainda usa)

hooks/
├── useSession.ts               (existe)
├── useProfile.ts               ← NOVO
└── useDoseSummary.ts           ← NOVO

app/(tabs)/
├── index.tsx                   ← MODIFICAR (usa hooks)
└── doses.tsx                   ← MODIFICAR (usa hooks)
```

### 8. Tratamento de erros

Mapear erros do Supabase pra mensagens em PT-BR (similar ao auth):

| Erro Supabase | Mensagem PT-BR |
|---|---|
| Network (fetch failed) | "Sem conexão. Verifique sua internet." |
| RLS bloqueando (sem sessão expirada) | "Sua sessão expirou. Faça login novamente." (não deveria acontecer se AuthGuard funciona, mas defensivo) |
| Outros | "Não foi possível carregar. Tente novamente." |

Helper sugerido em `lib/supabase/queries/errors.ts`:
```typescript
export function mapQueryError(err: unknown): string {
  if (err instanceof Error) {
    if (err.message.toLowerCase().includes('fetch') || err.message.includes('network')) {
      return 'Sem conexão. Verifique sua internet.'
    }
    if (err.message.toLowerCase().includes('jwt') || err.message.includes('401')) {
      return 'Sua sessão expirou. Faça login novamente.'
    }
  }
  return 'Não foi possível carregar. Tente novamente.'
}
```

---

## Skills obrigatórias

| Skill | Por quê |
|---|---|
| `react-native-best-practices` | Hooks, React Query patterns, type-safety com generated types do Supabase |
| `supabase-postgres-best-practices` | Queries RLS-aware, `.eq('user_id', ...)` redundante mas defensivo, `.maybeSingle()` vs `.single()` |
| `/impeccable craft` | Loading/empty/error states com hierarquia + consistência |
| `/impeccable harden` | Edge cases: overdue, primeira-dose, network flap, RLS bloqueando |

---

## Validação automatizada via `react-native-devtools-mcp`

### Pré-condição

Estado do user `leonardo@teste.com` (já populado via MCP):
- `user_profiles.full_name = 'Leonardo'`
- `current_medication = 'Mounjaro (Tirzepatida)'`, `current_dose = 5`
- 4 `medication_applications` (última em -5 dias)
- Próxima calculada: hoje + 2 dias

### Bateria de testes

| # | Ação | Tool | Critério de sucesso |
|---|---|---|---|
| 1 | Cold start + signin com leonardo@teste.com / 123456 | `tap` + `type_text` | Redirect pra Home |
| 2 | Screenshot Home com dados reais | `screenshot` | "Boa tarde, Leonardo" (não Mariana), "2" dias, Mounjaro 5mg, 20 de maio (terça) |
| 3 | Logs sem erros durante fetch | `get_js_logs duration=10 level=error` | Sem erros JS |
| 4 | Navegar pra Doses | `tap` na tab Doses | Tela Doses renderiza |
| 5 | Screenshot Doses | `screenshot` | Seção Próximas com 1 card (data 20/05, Mounjaro 5mg). Seção Histórico com 4 cards (todas Aplicada, datas decrescentes) |
| 6 | A11y nas telas | `get_view_hierarchy` em Home + Doses | accessibilityLabel nos cards com dados reais |
| 7 | Testar refetch ao voltar pra Home | tap em tab Início depois de Doses | Re-render funciona (cache do React Query) |
| 8 | Empty state — testar com user SEM doses | `js_eval` deslogando e logando como outro user (ou via SQL DELETE temporário em medication_applications, depois RESTAURAR) | Home mostra "Você ainda não registrou doses" + Doses mostra empty state correspondente |
| 9 | Restaurar fixtures após teste #8 | (Léo via MCP ou Claude Code via `mcp__supabase__execute_sql`) | Estado original restaurado |
| 10 | Cold start com sessão persistida + dados reais | Kill app + reabrir (Léo já no logged state) | Home renderiza dados reais direto, sem stale "Mariana" |

### Greps técnicos

```bash
npm run type-check          # 0 erros
npm run lint                # 0 erros novos

# Garantir que mocks foram desplugados das telas principais
grep -rn "homeMock" app/\(tabs\)/index.tsx
# Esperado: vazio (homeMock só pode aparecer importado pelo InsightCard se ainda for usado)

grep -rn "mockNextDoses\|mockHistoryDoses" app/\(tabs\)/doses.tsx
# Esperado: vazio

# Garantir uso dos hooks
grep -rn "useProfile\|useDoseSummary" app/\(tabs\)/
# Esperado: usado em index.tsx e doses.tsx

# Tokens (zero regressão visual)
grep -rE "#[0-9A-Fa-f]{6}" components/home/ components/doses/ app/\(tabs\)/index.tsx app/\(tabs\)/doses.tsx
# Esperado: vazio
```

---

## Critérios de aceitação

- [ ] `lib/supabase/queries/profile.ts` com `getProfile(userId)` tipado
- [ ] `lib/supabase/queries/doses.ts` com `getDoseSummary(userId)` tipado, calculando próxima dose a partir da última aplicação + `days_until_next_dose`
- [ ] `lib/supabase/queries/errors.ts` com `mapQueryError`
- [ ] `hooks/useProfile.ts` e `hooks/useDoseSummary.ts` com React Query
- [ ] `lib/queryClient.ts` se ainda não existir (configuração `staleTime: 5min`, `retry: 1`, `refetchOnWindowFocus: false`)
- [ ] Home Screen consome `useProfile()` + `useDoseSummary()`. InsightCard continua mockado (sem mudança)
- [ ] Tela Doses consome `useDoseSummary()`. Mocks removidos
- [ ] Greeting usa primeiro nome real (`profile.fullName.split(' ')[0]`) com fallback `'você'`
- [ ] Próxima dose calculada corretamente (`daysUntil`, `isOverdue`, `overdueBy`)
- [ ] Loading states com `ActivityIndicator` ou skeleton mínimo
- [ ] Empty states (zero histórico) com mensagem clara
- [ ] Error states com `mapQueryError` + botão "Tentar novamente" chamando `refetch()`
- [ ] Overdue state (dias negativos) com visual `semanticWarning` em vez de `brand`
- [ ] Zero `colors.brand` em estado overdue (só no caso normal de próxima dose)
- [ ] Zero `as any` / `// @ts-ignore`
- [ ] Zero hard-coded color/font/spacing
- [ ] `npm run type-check` zero erros
- [ ] `npm run lint` zero erros novos
- [ ] Bateria MCP executada (10 testes mínimos)
- [ ] **5 screenshots no PR**:
  1. Home com dados reais (Leonardo, 2 dias, Mounjaro 5mg, terça 20/05)
  2. Doses com Próximas + Histórico real (4 cards)
  3. Home empty state (Léo desloga ou usa outro user sem doses)
  4. Loading state (capturado durante fetch — pode ser tricky, anexar mesmo se ficar borrado)
  5. Error state (provocar via `js_eval` desconectando net OU mock temporário)
- [ ] `/impeccable critique` ≥ 28/40, P1/P2 resolvidos
- [ ] Commit: `feat(data): conecta Home e Doses ao Supabase via React Query`
- [ ] PR aberto

---

## Restrições

- **Sem migrations no Supabase.** Schema V4 está bom como está
- **Sem mudar fixtures populadas** durante a execução (a não ser pro teste #8/9, com restauração imediata)
- **Sem tocar em** `lib/supabase/client.ts`, `lib/supabase/auth.ts`, `contexts/AuthContext.tsx`, `hooks/useSession.ts`, `lib/theme/tokens.ts`, `app/_layout.tsx`, telas de auth, `components/auth/`, navegação
- **Sem CTA de ação** ("Registrar dose", "Editar") — input de dose entra em prompt futuro
- **InsightCard continua mockado** — não conectar com IA ainda
- **Sem RevenueCat / paywall** ainda
- **Sem onboarding** ainda

---

## Antes de executar

1. Ler `docs/architecture.md` seções 14.0, 14.1, 15 + qualquer 15.x adicional
2. Ler `docs/PRODUCT.md` Voice & Tone
3. Ler `lib/mocks/home.ts` (será removido das telas principais — mantém só pro InsightCard se ele usar)
4. Ler `components/home/NextDoseCard.tsx` e `components/doses/DoseCard.tsx` (props vão receber dados reais agora — talvez ajuste de tipos)
5. Ler `types/database.ts` (gerado no Prompt 09 — tipos do Supabase)
6. Confirmar via `ping` que simulador está rodando
7. Credenciais de teste: `leonardo@teste.com` / `123456`

## Pós-execução

1. Rodar `/impeccable critique` com screenshot Home + Doses real
2. Rodar `/impeccable harden` (overdue, empty, network drop)
3. Resolver P1/P2 antes do commit
4. Capturar 5 screenshots via MCP, anexar no PR
5. Atualizar `docs/architecture.md` seção "Aprendizados" com:
   - Decisão de `staleTime: 5min` pra dados clínicos
   - Padrão de `mapQueryError`
   - Como `getDoseSummary` calcula a próxima (única fonte de verdade no client)
6. Atualizar `CLAUDE.md` tabela "Histórico" com linha do Prompt 12
7. PR description deve incluir:
   - "Primeiro prompt com dados REAIS do Supabase"
   - Lista dos 5 screenshots
   - Detalhe do cálculo da próxima dose (não é entry no DB, é derivado)
   - Pendência: InsightCard ainda mockado (espera IA)
