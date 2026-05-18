# Plano — mover AuthLink para components/ui

Data: 2026-05-18
Tipo: LOW

## Skills

| Skill | Uso |
|---|---|
| `react-native-best-practices` | Aplicada por ser repo Expo/React Native; sem sub-skill específica, pois a mudança é organização de componente e imports. |

## Assumptions

| Assumption | Decisão |
|---|---|
| `AuthLink` é componente genérico de UI, como `AuthButton` já movido no PR #14. | Mover de `components/auth/` para `components/ui/`. |
| A tarefa deve ser cirúrgica. | Sem refactor, sem alteração visual, sem alteração de props. |
| Branch atual pode ter arquivos não rastreados de outras tarefas. | Ignorar mudanças não relacionadas e commitar apenas arquivos desta tarefa. |

## Plano

| Passo | Ação | Critério |
|---|---|---|
| 1 | Criar branch curta para o PR. | Branch separada de `main`. |
| 2 | Executar `git mv components/auth/AuthLink.tsx components/ui/AuthLink.tsx`. | Histórico preservado via git mv. |
| 3 | Atualizar imports de `@components/auth/AuthLink` para `@components/ui/AuthLink`. | Apenas `signin`, `signup`, `recover`. |
| 4 | Rodar grep pedido. | `components/auth/AuthLink` vazio em `app/ components/ lib/`. |
| 5 | Rodar `npm run type-check` e `npm run lint`. | Zero erros novos. |
| 6 | Capturar screenshots reais de signin, signup e recover. | PNGs versionados em `assets/screenshots/prompt-authlink-ui/`. |
| 7 | Commit e PR. | Commit `refactor(ui): move AuthLink de components/auth/ para components/ui/` e PR com checklist + screenshots reais. |

## Riscos

| Risco | Mitigação |
|---|---|
| Import antigo permanecer. | `rg`/grep direcionado antes do commit. |
| Screenshots pegarem tela errada por sessão ativa ou rota stale. | Usar deeplinks diretos para `/signin`, `/signup`, `/recover`; recapturar se necessário. |
| Worktree sujo por arquivos alheios. | Stage seletivo apenas do move, imports, plano e screenshots desta tarefa. |

## Arquivos

| Arquivo | Mudança |
|---|---|
| `components/auth/AuthLink.tsx` | Movido. |
| `components/ui/AuthLink.tsx` | Novo destino via git mv. |
| `app/(auth)/signin.tsx` | Import atualizado. |
| `app/(auth)/signup.tsx` | Import atualizado. |
| `app/(auth)/recover.tsx` | Import atualizado. |
| `assets/screenshots/prompt-authlink-ui/*.png` | Screenshots reais para PR. |
| `docs/superpowers/plans/2026-05-18-move-authlink-ui.md` | Plano salvo antes da edição. |

## Validação

| Comando/ação | Esperado |
|---|---|
| `grep -rn "components/auth/AuthLink" app/ components/ lib/` | Vazio. |
| `npm run type-check` | Passa. |
| `npm run lint` | Passa. |
| MCP/react-native screenshots | `signin`, `signup`, `recover` capturadas como imagens reais. |

## Karpathy

| Disciplina | Aplicação |
|---|---|
| Think Before Coding | Escopo fechado: move + imports + validação. |
| Simplicity First | Não há necessidade de abstração nova; menos de 50 linhas alteradas fora do plano/screenshots. |
| Surgical Changes | Cada linha alterada deve apontar para o novo path do `AuthLink`. |
| Goal-Driven Execution | Sucesso = grep vazio, type-check/lint limpos, 3 screenshots reais, commit e PR. |
