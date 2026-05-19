# Cleanup Mocks Órfãos — Prompt 17

**Data:** 2026-05-19  
**Branch alvo:** `chore/cleanup-mocks-orfaos`  
**Commit:** `chore: remove mocks órfãos pós-conexão Supabase (Prompts 12, 15, 16)`

---

## Think Before Coding — Diagnóstico exaustivo por grep

### `lib/mocks/home.ts`
```
grep -rn "homeMock|from '@lib/mocks/home'" app/ components/ hooks/ lib/
```
**Resultado:** Apenas a própria linha `export const homeMock = {` dentro do arquivo.  
→ **ZERO consumidores. ÓRFÃO TOTAL. Deletar direto.**

### `lib/mocks/doses.ts`
```
grep -rn "mockNextDoses|mockHistoryDoses|from '@lib/mocks/doses'" app/ components/ hooks/ lib/
```
**Resultado:** 3 consumidores ATIVOS de **tipos** (não de dados mock):

| Arquivo | Import |
|---|---|
| `app/(tabs)/doses.tsx` | `import type { Dose } from '@lib/mocks/doses'` |
| `components/doses/StatusBadge.tsx` | `import type { DoseStatus } from '@lib/mocks/doses'` |
| `components/doses/DoseCard.tsx` | `import type { Dose } from '@lib/mocks/doses'` |

→ **NÃO é órfão.** Não pode ser deletado sem migrar os tipos primeiro.

---

## Análise de tipos

### `DoseStatus` (mocks vs. queries)
- **Mock (`lib/mocks/doses.ts:3`):** `'scheduled' | 'applied' | 'skipped'`
- **Canonical (`lib/supabase/queries/doses.ts:4`):** `'scheduled' | 'applied' | 'skipped'`
- **Idênticos.** Migração: trocar import path em `StatusBadge.tsx`.

### `Dose` interface (apenas no mock)
```typescript
// lib/mocks/doses.ts
export interface Dose {
  id: string
  date: Date
  medication: string
  dosage: string
  time: string
  status: DoseStatus
}
```
- **NÃO existe em `lib/supabase/queries/doses.ts`** — apenas `DoseRecord` (shape diferente: `medicationName`, `applicationDate`, `daysUntilNextDose`).
- `doses.tsx` usa `Dose` como tipo UI num adapter `toDoseCard(record: DoseRecord): Dose`.
- `DoseCard.tsx` usa `Dose` como tipo da prop.
- **Decisão:** mover `Dose` para `lib/supabase/queries/doses.ts` (já concentra os tipos de doses). Um `export type` a mais, zero refactor de lógica.

---

## Plano de execução (Simplicity + Surgical)

### Passo 1 — Deletar `home.ts` (zero risco)
```bash
git rm lib/mocks/home.ts
```

### Passo 2 — Migrar tipos de `doses.ts` (3 arquivos, cirúrgico)

**2a.** Adicionar `Dose` em `lib/supabase/queries/doses.ts` (após `DoseStatus`):
```typescript
export type Dose = {
  id: string
  date: Date
  medication: string
  dosage: string
  time: string
  status: DoseStatus
}
```

**2b.** Atualizar import em `app/(tabs)/doses.tsx`:
```diff
- import type { Dose } from '@lib/mocks/doses'
+ import type { Dose } from '@lib/supabase/queries/doses'
```

**2c.** Atualizar import em `components/doses/StatusBadge.tsx`:
```diff
- import type { DoseStatus } from '@lib/mocks/doses'
+ import type { DoseStatus } from '@lib/supabase/queries/doses'
```

**2d.** Atualizar import em `components/doses/DoseCard.tsx`:
```diff
- import type { Dose } from '@lib/mocks/doses'
+ import type { Dose } from '@lib/supabase/queries/doses'
```

### Passo 3 — Deletar `doses.ts` + pasta
```bash
git rm lib/mocks/doses.ts
rmdir lib/mocks   # só se vazia (vai ficar vazia)
```

### Passo 4 — Verificar
```bash
npm run type-check  # 0 erros
npm run lint        # 0 erros novos
grep -rn "from '@lib/mocks/" app/ components/ hooks/ lib/  # vazio
```

### Passo 5 — Commit + PR
```bash
git commit -m "chore: remove mocks órfãos pós-conexão Supabase (Prompts 12, 15, 16)"
gh pr create ...
```

---

## Karpathy Self-Tests

1. **Think Before Coding:** `home.ts` tem zero consumidores confirmados por grep. `doses.ts` tem 3 consumidores de tipos, identificados com causa (Prompt 08 criou DoseCard antes do Supabase real).
2. **Simplicity:** Adicionar 1 type export em `doses.ts` canonical é a mudança mínima. Sem abstração nova.
3. **Surgical:** Apenas 3 linhas de import alteradas nos consumidores. Nenhum código de lógica tocado.
4. **Goal-Driven:** Success = `grep "@lib/mocks" .` vazio + `type-check` 0 erros + `lint` 0 erros novos.

---

## Riscos

| Risco | Prob | Mitigação |
|---|---|---|
| `Dose` UI type divergir do `DoseRecord` real após migração | Baixa | `toDoseCard` adapter em `doses.tsx` já faz a conversão — tipo UI não muda |
| `lib/mocks/` ter outros arquivos não levantados | Baixa | `ls lib/mocks/` confirmou apenas `home.ts` e `doses.ts` |
| Conflito com PR #20 (Liquid Glass) | Zero | Codex toca apenas `app/(tabs)/_layout.tsx`, `TabBarBackground.tsx`, `package.json` — sem overlap |

---

## Critérios de aceitação

- [ ] `lib/mocks/home.ts` deletado
- [ ] `lib/mocks/doses.ts` deletado
- [ ] `lib/mocks/` pasta removida
- [ ] `Dose` type em `lib/supabase/queries/doses.ts`
- [ ] 3 imports atualizados (`doses.tsx`, `StatusBadge.tsx`, `DoseCard.tsx`)
- [ ] `grep -rn "from '@lib/mocks/" .` → vazio
- [ ] `npm run type-check` → 0 erros
- [ ] `npm run lint` → 0 erros novos
- [ ] PR criado com diff cirúrgico
