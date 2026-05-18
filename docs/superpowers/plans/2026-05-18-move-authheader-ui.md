# Plano — mover AuthHeader para components/ui

Data: 2026-05-18
Tipo: LOW

## Skills

| Skill | Uso |
|---|---|
| `react-native-best-practices` | Aplicada por ser repo Expo/React Native; sem sub-skill específica, pois a mudança é organização de componente e imports. |
| `github:yeet` | Aplicada para commit, push e PR via fluxo GitHub. |

## Think Before Coding

| Checagem | Resultado |
|---|---|
| Consumidores confirmados via grep antes do plano | `app/(auth)/signin.tsx`, `app/(auth)/signup.tsx`, `app/(auth)/recover.tsx` |
| Arquivo origem | `components/auth/AuthHeader.tsx` |
| Escopo | Move + imports + histórico + screenshots reais + PR |

## Assumptions

| Assumption | Decisão |
|---|---|
| `AuthHeader` é componente visual compartilhável do fluxo auth, como `AuthButton` e `AuthLink`. | Mover de `components/auth/` para `components/ui/`. |
| A tarefa deve replicar os PRs #14 e #17. | Sem alterar props, estilos, texto ou comportamento. |
| Branch de trabalho original contém mudanças de outra tarefa. | Executar em worktree limpo a partir de `origin/main`. |
| `GITHUB_TOKEN` do ambiente pode estar inválido. | Usar MCP GitHub para PR e `env -u GITHUB_TOKEN` quando precisar de `gh`. |

## Plano

| Passo | Ação | Critério |
|---|---|---|
| 1 | `git mv components/auth/AuthHeader.tsx components/ui/AuthHeader.tsx`. | Histórico preservado via git mv. |
| 2 | Atualizar imports consumidores. | `signin`, `signup`, `recover` apontam para `@components/ui/AuthHeader`. |
| 3 | Greps de validação. | Zero referências a `components/auth/AuthHeader` e `@components/auth/AuthHeader`. |
| 4 | Rodar `npm run type-check` e `npm run lint`. | Zero erros novos. |
| 5 | Capturar screenshots reais via MCP das 3 telas auth. | PNGs em `assets/screenshots/prompt-authheader-ui/`. |
| 6 | Atualizar `CLAUDE.md` histórico. | Linha `LOW-mover-authheader-ui (Codex)`. |
| 7 | Commit. | `refactor(ui): move AuthHeader de components/auth/ para components/ui/`. |
| 8 | Abrir PR via MCP GitHub. | PR criado contra `main`. |

## Riscos

| Risco | Mitigação |
|---|---|
| Import antigo permanecer. | `rg` direcionado em `app components lib`. |
| Worktree sujo de outra tarefa entrar no commit. | Worktree separado em `/private/tmp/doseday-authheader-ui`. |
| Screenshots pegarem sessão/rota errada. | Abrir deeplinks de `signin`, `signup`, `/(auth)/recover` antes de capturar. |
| `gh` usar token inválido do ambiente. | Remover `GITHUB_TOKEN` para checks de `gh` e usar MCP para PR. |

## Arquivos

| Arquivo | Mudança |
|---|---|
| `components/auth/AuthHeader.tsx` | Movido. |
| `components/ui/AuthHeader.tsx` | Novo destino via git mv. |
| `app/(auth)/signin.tsx` | Import atualizado. |
| `app/(auth)/signup.tsx` | Import atualizado. |
| `app/(auth)/recover.tsx` | Import atualizado. |
| `assets/screenshots/prompt-authheader-ui/*.png` | Screenshots reais. |
| `docs/superpowers/plans/2026-05-18-move-authheader-ui.md` | Plano salvo antes da edição. |
| `CLAUDE.md` | Histórico atualizado. |

## Validação

| Comando/ação | Esperado |
|---|---|
| `rg "components/auth/AuthHeader|@components/auth/AuthHeader" app components lib` | Vazio. |
| `npm run type-check` | Passa. |
| `npm run lint` | Passa. |
| MCP screenshots | `signin`, `signup`, `recover` capturadas como imagens reais. |

## Karpathy

| Disciplina | Aplicação |
|---|---|
| Think Before Coding | Consumidores confirmados via grep antes do plano. |
| Simplicity First | Zero alteração além do path/imports e documentação obrigatória. |
| Surgical Changes | Cada linha de código mudada aponta para o novo import. |
| Goal-Driven Execution | Sucesso = grep vazio, build limpo, screenshots reais, PR aberto pelo MCP. |
