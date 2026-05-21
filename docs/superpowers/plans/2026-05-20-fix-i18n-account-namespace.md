# Plano — Prompt 35 LOW fix i18n account namespace

## Objetivo

Corrigir o bug `BUG-i18n-Account`: a tela `/perfil/account` renderiza chaves cruas porque o namespace `account` existe em `locales/{pt-BR,en,es}/account.json`, mas nao esta registrado em `lib/i18n/index.ts`.

## Assumptions

| Item | Assumption |
|---|---|
| Escopo | Alterar somente o bootstrap i18n, sem tocar no consumer `app/perfil/account.tsx` |
| Arquivos de traducao | Os tres `account.json` existentes sao a fonte correta |
| Validacao visual | Screenshot real da tela Conta e suficiente para provar que `useTranslation('account')` resolveu as keys |
| Outros namespaces | Se existir outro namespace faltando, apenas relatar fora do diff deste PR |

## Skills e ferramentas

| Fase | Uso | Motivo |
|---|---|---|
| Planejamento | `react-native-best-practices` | Projeto Expo/React Native |
| Planejamento | plano manual persistido | `superpowers:writing-plans` nao esta disponivel nesta sessao |
| Validacao | `react-native-devtools-mcp` | Capturar evidencia real da tela |
| Validacao | `npm run type-check` e `npm run lint` | Confirmar que nao ha erro TS/ESLint novo |

## Diagnostico atual

| Arquivo | Estado |
|---|---|
| `lib/i18n/index.ts` | Tem 16 namespaces por idioma e nao inclui `account` |
| `app/perfil/account.tsx` | Usa `useTranslation('account')` e espera keys como `header.title`, `name.label`, `delete.label` |
| `locales/pt-BR/account.json` | Existe e contem "Conta", "Nome", "Apagar conta" |
| `locales/en/account.json` | Existe e contem a estrutura equivalente |
| `locales/es/account.json` | Existe e contem a estrutura equivalente |

## Plano de execucao

| Passo | Acao | Checkpoint |
|---|---|---|
| 1 | Criar branch `feature/35-fix-i18n-account-namespace` | Branch ativa sem stagear sujeira pre-existente |
| 2 | Registrar este plano | Arquivo salvo em `docs/superpowers/plans/2026-05-20-fix-i18n-account-namespace.md` |
| 3 | Editar `lib/i18n/index.ts` | Adicionar 3 imports e 3 entradas `account` em `resources` |
| 4 | Rodar validacao estatica | `npm run type-check` e `npm run lint` |
| 5 | Validar tela Conta | Screenshot real mostra texto traduzido, nao keys cruas |
| 6 | Commit e PR | Stage inclui apenas `lib/i18n/index.ts`, plano e screenshot deste prompt |

## Riscos e mitigacoes

| Risco | Mitigacao |
|---|---|
| Cache do Metro manter resources antigos | Recarregar app ou reiniciar Metro se a tela ainda mostrar keys cruas |
| Worktree com mudancas antigas | Stagear explicitamente apenas os tres caminhos deste prompt |
| Outro namespace ausente aparecer na investigacao | Nao corrigir neste PR; apenas mencionar fora do diff se necessario |

## Arquivos envolvidos

| Arquivo | Acao |
|---|---|
| `lib/i18n/index.ts` | Modificar |
| `docs/superpowers/plans/2026-05-20-fix-i18n-account-namespace.md` | Criar |
| `assets/screenshots/2026-05-20-fase-1-pr35/23b-perfil-account-fixed.png` | Criar |

## Validacao

| Check | Criterio |
|---|---|
| TypeScript | `npm run type-check` passa |
| Lint | `npm run lint` passa |
| Screenshot | Tela Conta mostra `Conta`, `Nome`, `E-mail`, `Apagar conta` e nao `header.title` |
| Escopo | `git diff --cached --name-only` contem somente os tres caminhos previstos |

## Commit alvo

`fix(i18n): registra namespace account no bootstrap`
