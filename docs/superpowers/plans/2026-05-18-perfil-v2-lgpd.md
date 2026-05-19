# Plano — Prompt 18 MID — Perfil V2 com LGPD

Data: 2026-05-18
Branch: `feature/18-perfil-v2-lgpd`
Worktree: `/private/tmp/doseday-perfil-v2`

## Skills

| Skill | Uso |
|---|---|
| `react-native-best-practices` | Expo/RN, modal route, `Linking.openURL`, acessibilidade e validação no simulador |
| `supabase` | Auth, `supabase.functions.invoke`, segurança do delete por JWT |
| `supabase-postgres-best-practices` | Revisão do fluxo CASCADE/RLS sem migration |
| `impeccable` (`shape/craft/harden/critique`) | Brief visual, estados destrutivos, hardening e score final |
| `security-review` | Checklist LGPD/Auth/JWT/CASCADE, sem migration |
| `app-store-compliance` | Checklist Apple Guideline 5.1.1(v): exclusão acessível em ate 2 taps |
| `superpowers:writing-plans` | Plano persistido antes de tocar em código, regra 21 |

## Karpathy self-tests

| Disciplina | Decisão |
|---|---|
| Think Before Coding | URLs externas são placeholders. Delete real não será testado no `leonardo@teste.com`. Edge Function é one-shot e CASCADE-based. |
| Simplicity First | Tela direta, 1 modal, sem wizard, sem retry automático, sem cache. |
| Surgical Changes | Worktree separado; tocar só Perfil, modal, query/hook/schema, `AuthButton` aditivo e docs finais. |
| Goal-Driven | 12 testes MCP + simulação de success/error via mock, `type-check`, `lint`, screenshots reais no PR. |

## Shape Brief

| Item | Definição |
|---|---|
| Objetivo | Perfil V2 focado em compliance LGPD/App Store: conta, privacidade, suporte, sair e exclusão em ate 2 taps. |
| Usuária | Mariana, em contexto de confiança e controle, não explorando feature nova. |
| Direção visual | Registro `product`, restrained, Clinical Midnight, sem glass em conteúdo, destructive apenas com `semanticCritical`. |
| Hierarquia | Título simples, seções escaneáveis, AccountCard informativo, links em linhas previsíveis, delete separado visualmente. |
| Modal | Alto atrito proposital: consequência clara + lista do que será perdido + typed confirm `EXCLUIR`. |
| Copy | PT-BR direto, sem pânico, sem juridiquês, sem "tem certeza?" sozinho. |

## Plano, 12 checkpoints

| # | Checkpoint | Entrega |
|---|---|---|
| 1 | Criar worktree | `git worktree add /private/tmp/doseday-perfil-v2 origin/main -b feature/18-perfil-v2-lgpd` |
| 2 | Sincronizar insumos | Garantir Prompt 18 e este plano em `docs/superpowers/plans/2026-05-18-perfil-v2-lgpd.md` antes de código |
| 3 | Inventário local | Conferir aliases, i18n, typed routes, componentes UI e estado do worktree |
| 4 | Query LGPD | Criar `lib/supabase/queries/account.ts` com `deleteAccount()` via `supabase.functions.invoke` |
| 5 | Validação typed confirm | Criar `lib/validation/accountSchemas.ts` com Zod para `EXCLUIR` exato |
| 6 | Mutation | Criar `hooks/useDeleteAccount.ts`, loading/error/success sem retry automático |
| 7 | Componentes Perfil + AuthButton destructive | Criar `AccountCard`, `SectionLink`, `DeleteAccountModal`; adicionar `variant='destructive'` em `components/ui/AuthButton.tsx` de forma aditiva, mantendo `primary` e `secondary` intocados |
| 8 | Tela Perfil | Substituir `app/(tabs)/perfil.tsx`, manter `signOut`, links externos e ate 2 taps |
| 9 | Modal route | Criar `app/perfil/excluir.tsx` e adicionar `Stack.Screen` em `app/_layout.tsx` |
| 10 | Locales/docs | Criar `locales/pt-BR/perfil.json`; registrar aprendizados e pendências pre-ship |
| 11 | Validação técnica | `npm run type-check`, `npm run lint`, greps técnicos, MCP RN bateria |
| 12 | Fechamento | `/impeccable critique`, screenshots reais em `assets/screenshots/prompt18/`, commit, push e PR via GitHub MCP |

## Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Apagar usuário de teste | Não executar delete real. Success/error via mock/`js_eval` controlado. |
| URLs placeholder rejeitarem App Store | Registrar em `docs/architecture.md` como pendência pre-ship bloqueante. |
| Typed route quebrar `tsc` | Criar rota antes de referenciar e checar `.expo/types` se necessário. |
| Main está sujo por Prompt 16/15 | Worktree separado a partir de `origin/main`; não tocar no diretório principal. |
| Regressão em botões existentes | `AuthButton` recebe variant aditivo `destructive`; `primary` e `secondary` preservados. |
| MCP tap instável no iOS | Usar `open_deeplink`, screenshots e hierarchy; IDB para taps/texto quando necessário. |

## Bateria MCP

| # | Validação |
|---|---|
| 1 | Cold start + signin Leonardo |
| 2 | Abrir Perfil via deep link/tab |
| 3 | Screenshot Perfil V2 completo |
| 4 | A11y Perfil: links, botão destrutivo, hints |
| 5 | Política abre URL ou loga chamada |
| 6 | Abrir `/perfil/excluir` |
| 7 | Screenshot modal vazio |
| 8 | Botão delete disabled sem typed |
| 9 | `exclui` mantém disabled |
| 10 | `EXCLUIR` habilita botão |
| 11 | Cancelar fecha modal e volta ao Perfil |
| 12 | A11y modal: foco, `accessibilityViewIsModal`, hints |
| Extra | Mock success/error do delete, sem deletar `leonardo@teste.com` |

