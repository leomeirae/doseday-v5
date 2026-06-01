# Plano — QA fixes: notas no modal de peso + cache de custos

**Data:** 2026-06-01
**Branch:** `fix/qa-peso-notas-custos-cache`
**Aprovado por:** Léo (sessão 2026-06-01)

## Bug 1 — Modal de peso mostra "Notas (opcional)"

Peso deve ser registro rápido: peso + data + salvar. Campo de notas mistura peso com sintomas/memória.

**Decisão:** remover só o JSX do TextField de notas + chaves de locale. Manter estado `notes`,
hidratação e `toWeightLogInput` intactos — assim, editar um peso antigo que tinha nota **preserva**
a nota no banco (round-trip), em vez de apagar silenciosamente. Registros novos salvam `null`.
Sem migration. Coluna `notes` já é null-safe em `useWeightLogs.ts` e `lib/supabase/queries/weight.ts`.

| Arquivo | Mudança |
|---|---|
| `app/peso/registrar.tsx` | Remover JSX do TextField de notas (linhas 172-185) + comentário no estado retido |
| `locales/pt-BR/weight.json` | Remover `addModal.notesLabel` e `addModal.notesPlaceholder` |
| `locales/en/weight.json` | Idem |
| `locales/es/weight.json` | Idem |

**Não tocar:** `lib/supabase/queries/weight.ts`, `hooks/useWeightLogs.ts`, `WeightHistoryRow.tsx`,
`weightSchemas.ts` (já null-safe; mexer = scope creep).

## Bug 2 — Dashboard mostra custo, tela Custos mostra R$ 0

`useRegisterCost.onSuccess` invalida só `['purchaseSummary', userId]` (card do dashboard).
A tela Custos (`app/diario/custos.tsx`) e Memória (`app/memoria/index.tsx`) usam `usePurchases()`
com queryKey `['purchases', userId]` — nunca invalidada, cache fica vazio até `staleTime` (10 min) expirar.

| Arquivo | Mudança |
|---|---|
| `hooks/useRegisterCost.ts` | Adicionar invalidação de `['purchases', userId]` no `onSuccess` |

## Validação

1. `npx tsc --noEmit` + lint
2. Simulador: registrar peso → modal sem campo Notas → salva peso + data
3. Simulador: registrar custo R$ 1.500 → dashboard E tela Custos mostram R$ 1.500, lista preenchida, sem empty state

## Fora de escopo

Onboarding, Supabase migrations, paywall, auth, design geral, refactor do financeiro.
