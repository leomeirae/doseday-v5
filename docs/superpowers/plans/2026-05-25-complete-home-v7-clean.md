# Complete Home v7 Clean Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completar a Home v7 clean com `Observacoes` e `Para a consulta`, preservando memoria factual, estados honestos e o escopo autorizado da Camada 3.

**Architecture:** A Home continua composta localmente em `HomeV7Content.tsx`, com dois hooks adjacentes: um le somente o sintoma mais recente da tabela canonica `symptom_logs`; o outro define o contrato futuro de notas de consulta e retorna vazio na v1. Consultas existentes passam a expor carregamento/erro de forma compacta sem transformar falha ou carregamento em ausencia real de memoria.

**Tech Stack:** Expo SDK 54, React Native 0.81, TypeScript strict, React Query, Supabase com RLS, `date-fns`/`ptBR`, `expo-symbols`.

---

## Autorizacao E Baseline

- A execucao ocorre dentro da Camada 3 ativa da Regra de Foco #64, documentada em `docs/PRODUCT_COHERENCE.md` pelo PR #71 mesclado em 2026-05-25. Nao e excecao ao freeze: o freeze permanece para front-end legado e a Home v7 esta explicitamente autorizada.
- A passagem foi autorizada por Leo no chat de 2026-05-25, apos a decisao Opcao C de 2026-05-22.
- Alinhamento de 2026-05-25: `docs/HOME_DESIGN_DIRECTION.md` local atualiza a regra Vital Mint para dois papeis controlados. Este PR preserva `mintSoft` (`#A3E6D2`) no ponto final do sparkline de peso como indicador de estado atual, sem aplicar mint em `Observacoes` ou `Para a consulta`.
- Alinhamento de 2026-05-25: `docs/SETTINGS_DESIGN_DIRECTION.md` local define Configuracoes como hub futuro; a tab bar atual permanece provisoria e nao sera alterada nesta passagem.
- `/impeccable critique components/home/HomeV7Content.tsx` baseline: `24/40`.
- O detector do cache integro do Codex sera usado no final, pois a copia local de `.agents/skills/impeccable` falha com `Error: bundled detector not found.`

| Issue baseline | Severidade | Decisao nesta passagem | Arquivo |
|---|---:|---|---|
| Loading/erro confundido com ausencia de dado | P1 | Diferenciar estados de proxima dose, peso, memoria recente e sintomas; mostrar retry com erro mapeado | `components/home/HomeV7Content.tsx` |
| `Memoria adicionada.` oculta texto ja salvo em `quick_logs.notes` | P1 | Para log `other`, mostrar nota preenchida; manter confirmacao neutra sem nota | `components/home/HomeV7Content.tsx` |
| Alvo do controle de protocolo mede `32 x 32` | P2 baixo custo | Ampliar para no minimo `44 x 44 pt` | `components/home/HomeV7Content.tsx` |
| Timeline limita itens sem acesso ao historico completo | P2 | Follow-up; nenhuma rota ou CTA novo neste PR | Este plano |

## Escopo E Limites

| Tipo | Arquivos / decisao |
|---|---|
| Criar | `lib/supabase/queries/symptoms.ts`, `hooks/useSymptomMemory.ts`, `hooks/useConsultationNotes.ts` |
| Modificar | `components/home/HomeV7Content.tsx`, `docs/history.md` |
| Nao tocar | Home antiga `app/(tabs)/index.tsx`, Configuracoes, tab bar, migrations, Edge Functions, IA paciente-facing |
| Publicacao | Rebasear em `main` apos merge do PR #72 (`chore/fix-types-jest-lockfile-drift`) antes de abrir o PR da Home; nao alterar `package.json` ou `package-lock.json` nesta branch |
| Dados | Somente `symptom_type` e `symptom_date`; sem nota livre, intensidade, timing de dose ou check-in |
| Ordem visual | `Peso` -> `Memoria recente` -> `Observacoes` -> `Para a consulta` -> `Custos registrados` -> disclaimer |

### Task 1: Query Minima De Sintoma

**Files:**
- Create: `lib/supabase/queries/symptoms.ts`

- [x] **Step 1: Criar o contrato minimo e a leitura canonica**

```ts
import { supabase } from '@lib/supabase/client'

export type RecentSymptom = {
  type: string
  date: Date
}

export async function getRecentSymptom(userId: string): Promise<RecentSymptom | null> {
  const { data, error } = await supabase
    .from('symptom_logs')
    .select('symptom_type, symptom_date')
    .eq('user_id', userId)
    .order('symptom_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    type: data.symptom_type,
    date: new Date(`${data.symptom_date}T12:00:00`),
  }
}
```

- [x] **Step 2: Verificar minimizacao de PHI**

Run: `rg -n "select\\(|notes|intensity|days_since_dose|checkin_id" lib/supabase/queries/symptoms.ts`

Expected: o unico campo de `select(...)` e `symptom_type, symptom_date`; os campos excluidos nao aparecem.

### Task 2: Hooks Da Home

**Files:**
- Create: `hooks/useSymptomMemory.ts`
- Create: `hooks/useConsultationNotes.ts`

- [x] **Step 1: Criar query autenticada do sintoma mais recente**

```ts
import { useQuery } from '@tanstack/react-query'
import { useSession } from '@hooks/useSession'
import { getRecentSymptom } from '@lib/supabase/queries/symptoms'

export function useSymptomMemory() {
  const { user } = useSession()
  const userId = user?.id

  return useQuery({
    queryKey: ['symptomMemory', userId],
    queryFn: () => getRecentSymptom(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}
```

- [x] **Step 2: Criar contrato vazio de notas de consulta v1**

```ts
export type ConsultationNote = {
  id: string
  text: string
  completed: boolean
}

/** v1 placeholder; source pendente. */
export function useConsultationNotes() {
  return {
    data: [] as ConsultationNote[],
    isLoading: false,
    error: null,
  }
}
```

- [x] **Step 3: Confirmar ausencia de logging de PHI**

Run: `rg -n "console\\.(log|warn|error)" hooks/useSymptomMemory.ts`

Expected: zero matches.

### Task 3: Integracao Visual Factual

**Files:**
- Modify: `components/home/HomeV7Content.tsx`

- [x] **Step 1: Integrar hooks e estados seguros**

Adicionar `useSymptomMemory`, `useConsultationNotes` e `mapQueryError`; manter `data`, `isLoading`, `error` e `refetch` para proxima dose, peso, diario e sintoma. Um componente compacto de estado deve apresentar carregamento ou mensagem de `mapQueryError(error)` com botao `Tentar novamente`, em vez de renderizar ausencia falsa.

```tsx
function SectionReadState({
  isLoading,
  error,
  onRetry,
}: {
  isLoading: boolean
  error: string | null
  onRetry: () => void
}) {
  if (isLoading) return <ActivityIndicator color={colors.textSecondary} />
  if (!error) return null

  return (
    <View style={styles.readState}>
      <Text style={styles.readStateText}>{error}</Text>
      <Pressable onPress={onRetry} style={styles.retryButton} accessibilityRole="button">
        <Text style={styles.retryText}>Tentar novamente</Text>
      </Pressable>
    </View>
  )
}
```

- [x] **Step 2: Adicionar `ObservationMemoryCard` depois da memoria recente**

Renderizar `null` quando a leitura concluiu sem dado. Com dado, formatar `symptom_date` com `format(date, "d 'de' MMMM", { locale: ptBR })`; rótulos conhecidos produzem copy factual (`Náusea registrada em 22 de maio.`), e tipo desconhecido produz `Uma observação foi registrada em 22 de maio.`. Usar card neutro outlined e icone circular `semanticMuted`, sem mint ou glass; o uso ja existente de `mintSoft` no ponto final do sparkline permanece autorizado como indicador de estado atual.

- [x] **Step 3: Adicionar `ConsultationMemorySection` sem dados ficticios**

O componente recebe `ConsultationNote[]`, retorna `null` para array vazio e, quando houver source futura, exibe eyebrow, badge pluralizado (`1 item`/`N itens`) e linhas com `circle`/`checkmark.circle`, aplicando `textDecorationLine: 'line-through'` nas concluidas. Nao incluir botao de adicionar.

- [x] **Step 4: Corrigir os issues do baseline**

Alterar `formatQuickLogTitle` para retornar `log.notes.trim()` quando `log.logType === 'other'` e existir texto; manter `Memória adicionada.` quando vazio. Ampliar `styles.arrowButton` para `height: 44` e `width: 44`. Manter como follow-up o acesso ao historico completo da timeline.

### Task 4: Rastro E Validacao

**Files:**
- Modify: `docs/history.md`

- [x] **Step 1: Executar verificacoes estaticas e de copy**

Run:

```bash
npm run type-check
npm run lint
grep -E "24h|pós-dose|D\+[0-9]|causa[douas]+|esperad[oa]|ajuste de dose|100% ad|orienta[çc][ãa]o m|SURPASS|SURMOUNT|STEP|SUSTAIN|coach|motivacional|parabéns|jornada|wellness" components/home/HomeV7Content.tsx hooks/useSymptomMemory.ts hooks/useConsultationNotes.ts lib/supabase/queries/symptoms.ts
```

Expected: TypeScript PASS; lint PASS com apenas o warning preexistente em `lib/i18n/index.ts`; grep sem matches.

Executado antes do rebase final: `npm run type-check` PASS; `npm run lint` PASS com 1 warning preexistente em `lib/i18n/index.ts:127`; grep sem matches. Como o PR #72 ainda esta aberto para corrigir o drift do lockfile, as dependencias de validacao foram instaladas em `node_modules` com `npm install --package-lock=false --legacy-peer-deps`, sem modificar arquivos versionados.

- [ ] **Step 2: Executar security review objetivo**

| Verificacao | Evidencia exigida |
|---|---|
| RLS | Consultar `pg_policies` para `symptom_logs`; confirmar politica com `user_id = auth.uid()` |
| Campos lidos | `select('symptom_type, symptom_date')` e nenhum campo adicional na query nova |
| Logs | Zero `console.log`, `console.warn` ou `console.error` em `useSymptomMemory` |
| Erros | A UI recebe somente texto de `mapQueryError`, sem `userId` ou payload bruto |

- [ ] **Step 3: Rodar critique final com instalacao integra**

Run:

```bash
node /Users/leofrancaia/.codex/plugins/cache/impeccable/impeccable/3.1.1/skills/impeccable/scripts/detect.mjs --json components/home/HomeV7Content.tsx
```

Expected: detector executa sem falha; avaliacao final `/impeccable critique` registra score `>= 24/40`.

- [ ] **Step 4: Solicitar screenshot real a Leo**

Solicitar `assets/screenshots/home-v7-clean/02-observacoes-consulta.png` no iPhone 17 com pelo menos um `symptom_log`, `Observacoes` visivel e `Para a consulta` omitida. Nao capturar screenshot automaticamente nesta passagem.

- [ ] **Step 5: Atualizar historico e abrir PR somente quando completo**

Adicionar linha final em `docs/history.md` com feature, cold-start, ausencia de IA/causalidade/copy proibida, validacoes e `baseline 24/40 -> final Y/40`. O PR so sera aberto depois da validacao local e da imagem real fornecida.

- [x] **Step 6: Sincronizar dependencia documental antes da publicacao**

Confirmar que o PR #72 foi mesclado, rebasear a branch em `origin/main`, repetir `npm run type-check`, `npm run lint` e o grep proibido, e conferir que `package.json`/`package-lock.json` nao aparecem no diff.

Executado em 2026-05-25: PR #72 mesclado (`d55590b`), branch rebaseada sem conflitos, `npm run type-check` PASS, `npm run lint` PASS com 1 warning preexistente em `lib/i18n/index.ts:127`, grep sem matches e `package.json`/`package-lock.json` fora do diff. Observacao de infraestrutura: `npm ci --ignore-scripts` ainda falha no `main` com `Missing: react-dom@19.2.6 from lock file` e `Missing: scheduler@0.27.0 from lock file`; `npm ci --ignore-scripts --legacy-peer-deps` conclui e foi o setup usado para repetir a validacao.

## Self-Review

- Cobertura: o plano inclui os dois componentes, minimizacao PHI, ordem aprovada, quatro correcoes/decisoes do baseline, estados de cold-start, seguranca, critique e screenshot real.
- Consistencia de tipos: `RecentSymptom` expoe apenas `type`/`date`; `ConsultationNote` expoe `id`/`text`/`completed`; ambos correspondem aos componentes consumidores.
- Limites: nenhuma migration, tabela, seed, Edge Function, Home antiga, tab bar, Configuracoes ou IA paciente-facing e tocada.
