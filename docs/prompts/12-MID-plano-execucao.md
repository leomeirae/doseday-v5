# Prompt 12 — Plano de Execução (APROVADO)

**Status:** Plano aprovado em 2026-05-18 na sessão Cowork. Esta é a versão refinada que deve ser seguida à risca pelo Claude Code. Não re-planejar.

---

## Skills utilizadas

| Skill | Por quê |
|---|---|
| `react-native-best-practices` | Hooks React Query, type-safety, prop drilling correto |
| `supabase-postgres-best-practices` | `.maybeSingle()`, `.eq('user_id')` defensivo, RLS-aware |
| `/impeccable craft` | Loading/empty/error states com hierarquia visual |
| `/impeccable harden` | Edge cases: overdue, first-use, network drop, RLS block |

---

## Diagnóstico do estado atual

| Arquivo | Estado atual | O que muda |
|---|---|---|
| `app/_layout.tsx` | `QueryClientProvider` existe mas com `new QueryClient()` inline sem config | Importar `queryClient` de `lib/queryClient.ts` (2 linhas — menor mudança possível) |
| `components/home/GreetingHeader.tsx` | Hardcoded `homeMock.user.name` | Aceita prop `name: string` |
| `components/home/NextDoseCard.tsx` | Hardcoded `homeMock.nextDose` | Aceita props tipadas (`nextDose`, `isLoading`, `error`, `onRetry`) |
| `components/home/InsightCard.tsx` | Usa `homeMock.insight.text` | Sem mudança — continua mockado |
| `components/doses/DoseCard.tsx` | Props `Dose` com campo `time: string` (HH:mm) | Sem mudança — mapper na tela resolve |
| `app/(tabs)/index.tsx` | Monta `GreetingHeader/NextDoseCard` sem dados | Plugar `useProfile()` + `useDoseSummary()` |
| `app/(tabs)/doses.tsx` | Monta `mockNextDoses + mockHistoryDoses` | Plugar `useDoseSummary()` + mapper |

### Observação crítica 1 — DoseCard

O tipo `Dose` tem campo `time: string (HH:mm)` que **não existe** na tabela `medication_applications`. Solução V1: mapper no screen que passa `time: '--'` (sem tempo no DB). DoseCard não muda. Registrar como aprendizado.

### Observação crítica 2 — alias `@types/*`

**Aprendizado #8 do Prompt 09:** `@types/*` é namespace reservado pelo TypeScript (TS6137). O import do `types/database.ts` nos query files deve usar `@/types/database` (via alias `@/`) ou path relativo. **Nunca** `from '@types/database'`.

---

## Plano em 6 fases

### Fase 1 — Setup (pré-condições)

1. `mcp__react-native__ping` — confirmar simulador ativo
2. Criar `lib/queryClient.ts` com `staleTime: 5min`, `retry: 1`, `refetchOnWindowFocus: false`
3. Atualizar `app/_layout.tsx` — substituir `new QueryClient()` local por `import { queryClient } from '@lib/queryClient'`
4. Criar pasta `lib/supabase/queries/`

### Fase 2 — Queries Supabase (3 arquivos novos)

| Arquivo | Conteúdo |
|---|---|
| `lib/supabase/queries/errors.ts` | `mapQueryError(err)` → PT-BR (network / JWT / genérico) |
| `lib/supabase/queries/profile.ts` | `getProfile(userId)` tipado via `@/types/database` → `Profile` type |
| `lib/supabase/queries/doses.ts` | `getDoseSummary(userId)` com cálculo de próxima: `lastDate + daysUntilNextDose`, diff com hoje = `daysUntil`, `isOverdue = daysUntil < 0` |

**Cálculo próxima dose (único lugar de verdade):**

```typescript
nextDate = last.applicationDate + last.daysUntilNextDose
daysUntil = round((nextDate.midnight - today.midnight) / 86400000)
isOverdue = daysUntil < 0
```

O retorno de `daysUntil` para o card é `Math.max(daysUntil, 0)` no campo público; `isOverdue` sinaliza o estado vermelho.

### Fase 3 — Hooks React Query (2 arquivos novos)

| Hook | Chave | Guard |
|---|---|---|
| `hooks/useProfile.ts` | `['profile', userId]` | `enabled: !!userId` |
| `hooks/useDoseSummary.ts` | `['doseSummary', userId]` | `enabled: !!userId` |

Ambos consomem `useSession()` para obter `userId`.

### Fase 4 — Componentes refatorados (2 arquivos)

**`GreetingHeader`** — adicionar prop `name: string`:

```typescript
// antes: const greeting = getGreeting(homeMock.user.name)
// depois: aceita name como prop, HomeScreen passa firstName
interface Props { name: string }
```

**`NextDoseCard`** — substituir mock por props:

```typescript
interface Props {
  nextDose: NextDoseData | null
  isLoading: boolean
  error: string | null
  onRetry: () => void
}
```

**Variações visuais:**

- `isLoading` → `<ActivityIndicator size="small" color={colors.brand} />`
- `error` → texto PT-BR + botão "Tentar novamente"
- `!nextDose` (zero histórico) → empty state "Você ainda não registrou doses" + texto explicativo
- `nextDose.isOverdue` → número em `colors.semanticWarning` (não `colors.brand`), label "dias de atraso"
- Normal → igual ao atual mas com dados reais

### Fase 5 — Telas (2 arquivos modificados)

**`app/(tabs)/index.tsx`:**

```typescript
const { data: profile, isLoading: profileLoading } = useProfile()
const { data: dose, isLoading: doseLoading, error: doseError, refetch } = useDoseSummary()

const firstName = profile?.fullName?.split(' ')[0] ?? 'você'
const errorMessage = doseError ? mapQueryError(doseError) : null

// Passa props para GreetingHeader e NextDoseCard
```

**`app/(tabs)/doses.tsx`:**

```typescript
const { data: dose, isLoading, error, refetch } = useDoseSummary()

// Mapper DoseRecord → Dose (resolve incompatibilidade de tipo)
function toDoseCard(record: DoseRecord): Dose {
  return {
    id: record.id,
    date: record.applicationDate,
    medication: record.medicationName,
    dosage: `${record.dose}mg`,
    time: '--',       // sem campo time no DB — V1
    status: record.status,
  }
}
```

- Loading → spinner central
- Error → texto + "Tentar novamente"
- Próximas: 1 item (`nextDose` calculado) ou empty state "Sua próxima dose vai aparecer aqui depois do primeiro registro"
- Histórico: `dose.history.map(toDoseCard)` — sem overdue aqui (todas são `applied`)

### Fase 6 — Validação

**Greps de sanidade:**

```bash
grep -rn "homeMock" app/\(tabs\)/index.tsx      # esperado: vazio
grep -rn "mockNextDoses\|mockHistoryDoses" app/\(tabs\)/doses.tsx  # esperado: vazio
npm run type-check                              # 0 erros
npm run lint                                    # 0 erros novos
```

---

## Bateria de 10 testes MCP

| # | Ação | Tool | Critério |
|---|---|---|---|
| 1 | Cold start + signin `leonardo@teste.com` / `123456` (email em 2 fragmentos por Aprendizado #19) | `tap` + `type_text × 2` | Redirect pra Home |
| 2 | Screenshot Home dados reais | `screenshot` | "Boa tarde, Leonardo", "2" dias, Mounjaro 5mg, "20 de maio" |
| 3 | Logs durante fetch | `get_js_logs duration=10 level=error` | Sem erros JS |
| 4 | Navegar para Doses | `tap` na tab Doses | Tela renderiza |
| 5 | Screenshot Doses | `screenshot` | Próximas: 1 card 20/05 scheduled; Histórico: 4 cards applied |
| 6 | A11y Home + Doses | `get_view_hierarchy` nas duas telas | accessibilityLabel com dados reais nos cards |
| 7 | Refetch ao voltar pra Home | `tap` tab Início | Re-render sem erro (cache RQ) |
| 8 | Empty state — DELETE fixtures temporário | `mcp__claude_ai_Supabase__execute_sql DELETE` + screenshot | Home mostra "Você ainda não registrou doses" |
| 9 | Restaurar fixtures | `mcp__claude_ai_Supabase__execute_sql INSERT` das 4 doses | Estado original restaurado, screenshot de confirmação |
| 10 | Cold start com sessão persistida | Kill + reabrir app | Home mostra dados reais direto, sem "Mariana" |

---

## 5 screenshots no PR

1. Home — dados reais (Leonardo, 2 dias, Mounjaro 5mg, 20/05)
2. Doses — Próximas (1 card) + Histórico (4 cards)
3. Home — empty state (zero histórico)
4. Loading state (capturado durante fetch inicial)
5. Error state (provocado via js_eval sintético ou mock temporário)

---

## Riscos identificados

| Risco | Probabilidade | Mitigação |
|---|---|---|
| `@types/*` alias → TS6137 | ALTA | Usar `@/types/database` (alias `@/`) — nunca `@types/database` |
| `_layout.tsx` na lista "não tocar" mas precisa de 1 import | BAIXA | Mudança mínima: só substituir a instância inline do `QueryClient` |
| Email truncado no IDB (Aprendizado #19) | CERTA | Dividir `leonardo@teste.com` em 2 fragmentos: `leonardo@teste.` + `com` |
| `js_eval` não suporta async (Aprendizado #13) | CERTA | Teste #8 usa `execute_sql` via MCP Supabase — nunca `js_eval` para DELETE/INSERT |
| `noUnusedLocals: true` no tsconfig | MÉDIA | Garantir que `homeMock` não fique importado sem uso em arquivos modificados |
| `DoseCard.time` sem equivalente no DB | CERTA | Mapper passa `'--'` (temporário, registrar em Aprendizados) |
| Próxima dose overdue — `Math.max(0)` esconde info real | BAIXA | `daysUntil` retorna o valor real; `isOverdue` é o flag para UI |

---

## Arquivos envolvidos

### Criados (6)

- `lib/queryClient.ts`
- `lib/supabase/queries/errors.ts`
- `lib/supabase/queries/profile.ts`
- `lib/supabase/queries/doses.ts`
- `hooks/useProfile.ts`
- `hooks/useDoseSummary.ts`

### Modificados (5)

- `app/_layout.tsx` — 2 linhas (importar queryClient configurado)
- `components/home/GreetingHeader.tsx` — prop `name`
- `components/home/NextDoseCard.tsx` — props completas
- `app/(tabs)/index.tsx` — hooks + dados reais
- `app/(tabs)/doses.tsx` — hooks + mapper + dados reais

### Intocados

- `lib/mocks/home.ts` — InsightCard ainda usa
- `lib/mocks/doses.ts` — DoseCard ainda importa `Dose` type
- `components/home/InsightCard.tsx`
- `components/doses/DoseCard.tsx`
- `lib/supabase/client.ts`, `auth.ts`, `contexts/AuthContext.tsx`, `hooks/useSession.ts`

---

## Commit alvo

```
feat(data): conecta Home e Doses ao Supabase via React Query
```
