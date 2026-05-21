# PR 30 — Welcome Distill

## A) Skills

| Skill | Uso |
|---|---|
| `superpowers:writing-plans` | Salvar este plano antes de código |
| `impeccable` | Destilar Welcome e rodar critique antes de pronto |
| `react-native-best-practices` | Implementação Expo/RN com StyleSheet, acessibilidade e navegação segura |
| `liquid-glass` | Decidir `WelcomeActionDock`: glass real ou fallback tonal |
| `react-native-devtools-mcp` | Validar no simulador e gerar screenshot real |

## B) Plano

| Etapa | Ação |
|---|---|
| 0 | Sair para `main`, rodar `git pull`, criar `feature/30-welcome-distill` sem perder mudanças não relacionadas |
| 1 | Persistir o plano aprovado em `docs/superpowers/plans/2026-05-21-welcome-distill.md` antes de código |
| 2 | Medir LOC atual e inspecionar Welcome, imports e locale |
| 3 | Reescrever `app/(welcome)/index.tsx` como tela única, <150 LOC, sem slide state/swipe/paginação |
| 4 | Criar `WelcomeActionDock` com CTA primário Vital Mint e secundário ghost/subtle |
| 4.1 | Se `expo-glass-effect` renderizar com refração fraca sobre Clinical Midnight puro OU Reduce Transparency estiver ativo no iOS, fallback obrigatório é superfície tonal flat com border sutil. Documentar decisão no body do PR |
| 5 | Atualizar `locales/pt-BR/welcome.json` com headline/subtitle/CTAs e remover textos órfãos dos slides 2/3 |
| 6 | Antes de remover componentes, rodar `grep -r 'WelcomeSlide\|WelcomePageIndicator' app components`. Se houver consumer fora de `(welcome)/`, pausar e reportar |
| 7 | Deletar `WelcomeSlide` e `WelcomePageIndicator`; limpar apenas imports ligados a eles |
| 8 | Validar, salvar screenshot real, abrir PR com referência a `08 §2`, screenshot, score impeccable e LOC antes/depois |

## C) Riscos

| Risco | Mitigação |
|---|---|
| Worktree atual tem mudanças não relacionadas | Não sobrescrever nada; se checkout bloquear, pausar e reportar |
| Glass virar conteúdo/decorativo | Glass só no dock; fallback tonal se necessário |
| Reduce Transparency ativo no iOS torna glass opaco | Fallback tonal precisa funcionar visualmente sem quebrar hierarquia |
| Vital Mint passar de 10% da tela | Vital Mint apenas no botão primário |
| Quebrar AuthGuard ou fluxo auth | Não tocar `(auth)`, `(tabs)`, `(onboarding)`, root layout ou AuthGuard |
| Refactor oportunista | Cada linha do diff precisa traçar para remover carousel e simplificar Welcome |

## D) Arquivos

| Tipo | Arquivos |
|---|---|
| Criar | `components/welcome/WelcomeActionDock.tsx` |
| Editar | `app/(welcome)/index.tsx`, `locales/pt-BR/welcome.json`, `docs/history.md` |
| Deletar | `components/welcome/WelcomeSlide.tsx`, `components/welcome/WelcomePageIndicator.tsx` |
| Criar validação | `assets/screenshots/2026-05-20-fase-2-pr30/welcome-distill.png` |
| Criar plano | `docs/superpowers/plans/2026-05-21-welcome-distill.md` |
| Não tocar | `(auth)`, `(onboarding)`, `(tabs)`, `app/_layout.tsx`, `lib/i18n/index.ts` |

## E) Validação

| Check | Critério |
|---|---|
| LOC | `app/(welcome)/index.tsx` <150 LOC, PR mostra antes/depois |
| Grep | Sem `WelcomeSlide`, `WelcomePageIndicator`, slide state, swipe handler, PageIndicator |
| TypeScript | `npm run type-check` passa |
| Lint | `npm run lint` passa |
| UI critique | `/impeccable critique` >=32/40 |
| Simulador | Welcome abre direto com headline, subtítulo e CTAs visíveis |
| Reduce Transparency | Com Reduce Transparency ativo no simulador, dock continua legível e headline/CTAs preservam hierarquia |
| Navegação | `Criar conta` leva para cadastro; `Já tenho conta` leva para login |
| Screenshot | Imagem real salva em `assets/screenshots/2026-05-20-fase-2-pr30/welcome-distill.png` |

## Assumptions

- A decisão de produto é canônica: a Welcome vira uma tela única, sem carrossel.
- Não há mudança de autenticação neste PR.
- O fallback tonal é aceitável e preferível a glass fraco ou opaco.
- A skill `superpowers:writing-plans` não está instalada nesta sessão; o contrato dela foi cumprido pela persistência deste plano antes de código.
