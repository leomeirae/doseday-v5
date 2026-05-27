# Handoff — Prompt 42a: Recuperar Telas Órfãs e Entrypoints

**Data:** 2026-05-27  
**Branch:** `feature/42a-recuperar-telas-orfas`  
**Status:** implementação e validação concluídas. PR #84 aberto.

---

## Escopo entregue

- **Extração seletiva do Stash:** 
  - Telas criadas: `app/memoria/index.tsx`, `app/diario/custos.tsx`, `app/diario/notas.tsx`.
  - Hooks criados: `hooks/useMemoryNotes.ts`, `hooks/usePurchases.ts`, `hooks/useSymptoms.ts`.
- **Mescla de Queries (Supabase):**
  - Adicionadas funções `getMemoryNotes` em `diario.ts`, `getPurchases` em `purchases.ts` e `getSymptoms` em `symptoms.ts`.
- **Consistência de UX no Dashboard (`HomeV7Content.tsx`):**
  - **Próxima Dose:** Card `onPressBody` redireciona para `/(tabs)/doses` e o botão `+` abre `/dose/registrar`.
  - **Peso:** Card `onPressBody` redireciona para `/peso/historico` e o botão `+` abre `/peso/registrar`.
  - **Memória Recente (Notas):** Card `onPressBody` redireciona para `/memoria` e o botão `+` abre `/diario/anotar-memoria`.
  - **Custos Registrados:** Card `onPressBody` redireciona para `/diario/custos` e o botão `+` abre `/diario/anotar-custo` (removida condicional, card é exibido sempre).
  - **Acesso ao Settings Hub:** Adicionado o botão de engrenagem (`SymbolView name="gearshape"`) no topo direito de `HeaderMemory` apontando para `/configuracoes`.
  - **Affordances:** Adicionados chevrons de affordance visual (`chevron.right`) em todos os cards interativos.

---

## Decisões preservadas

- **Visual e Estilização:** Toda a interface e as telas recuperadas mantiveram o estilo baseado em `StyleSheet` e tokens clássicos (`lib/theme/tokens.ts`). Nenhuma migração para NativeWind ou redesenho visual foi realizado neste PR (ficam sob responsabilidade do Prompt 42b).
- **Sem Scope Creep:** Modificações cirúrgicas restritas ao Dashboard, novas queries e telas do stash.

---

## Validação

- `npm run type-check`: **PASS** (corrigidos erros herdados de propriedade `haptic` em `<AuthButton />`).
- `npm run lint`: **PASS** com 1 warning preexistente em `lib/i18n/index.ts`.
- **Limpeza do Staging:** Validamos via `git status --short` que nenhum arquivo de tooling (como `graphify-out/*` ou `.codegraph/*`) ou screenshots antigas foi incluído no commit. O hook automático `graphify` executou o rebuild pós-commit e manteve a integridade do repositório local.

---

## Próximos Passos (Prompt 42b)

- Redesenhar a tela de Memória (`app/memoria/index.tsx`) com input inline de sintoma com chips de sintomas frequentes, lista de custos inline e área de protocolo.
- Migrar o Dashboard (`HomeV7Content.tsx`) e a tela de Memória para NativeWind v4 e react-native-reusables.
