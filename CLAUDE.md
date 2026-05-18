# CLAUDE.md — Working Memory do DoseDay V5

**Última atualização:** 15 de maio de 2026
**Status do projeto:** Prompt 02 concluído. PRODUCT.md v1.0 + DESIGN.md finalizados. Aguardando Prompt 03.

---

## ⚠️ Leia primeiro, sempre

Antes de QUALQUER tarefa, você (Claude Code) DEVE ler estes documentos NA ORDEM:

1. **`docs/plano-estrategico-v5.md`** — estratégia, decisões, métricas, persona, posicionamento
2. **`docs/skills-stack.md`** — quais das 43 skills usar e quando. Tem tabela mestre por tipo de tarefa
3. **`docs/architecture.md`** — estrutura de pastas, stack, schema Supabase, RevenueCat, LGPD
4. **`docs/prompts/README.md`** — template padrão de prompt + regras anti-pirraça
5. **`docs/DESIGN.md`** — cores, tipografia, elevação, componentes no formato Impeccable 6-seções (Stitch)
6. **`CONTEXT.md`** (na raiz do repo) — glossário do domínio. Termos como "memória do tratamento", "Movimento 1/2/3", "dose", "persona Mariana". Lido por `grill-with-docs` e `improve-codebase-architecture`
7. **`docs/handoff/HANDOFF.md`** (se existir) — última sessão. Estado, decisões, próximos passos

`docs/PRODUCT.md` e `docs/DESIGN.md` existem e estão finalizados (Prompt 02 — `/impeccable teach`). `docs/archive/design-system-preview-v0.1.md` é o histórico arquivado.

ADRs (Architecture Decision Records) ficam em **`docs/adr/`**. Criados sob demanda pelo `grill-with-docs` quando uma decisão é (1) difícil de reverter, (2) surpreendente sem contexto, (3) resultado de trade-off real.

---

## Quem é o Léo

Léo é PO/estrategista — **não escreve código**. Toda execução técnica é delegada via prompts versionados que você (Claude Code) executa. Léo:

- Visão, UX, estratégia, priorização
- Aprova/rejeita planos antes da execução
- Testa no simulador / device
- Preferências: PT-BR direto, tabelas > listas, sem enrolação, formato executivo

### Como conversar com Léo (regra permanente)

Léo é PO sênior mas **não tem background técnico em desenvolvimento**. Conceitos como Git worktree, hooks, branches paralelas, edge functions, RLS — são novos pra ele.

| Princípio | Como aplicar |
|---|---|
| **Didático sempre** | Antes de ação técnica nova, explicar 1 frase: "isso significa X. Serve pra Y." |
| **Calma > velocidade** | Uma coisa de cada vez. Sem rajadas de 5 tarefas paralelas |
| **Guiar passo a passo** | Toda ação que Léo precisa fazer no terminal/IDE vem com checklist numerado |
| **Anti-sobrescrita explícita** | Cada vez que algo pode gerar conflito de código, parar e avisar antes |
| **Por que > Como** | Sempre explicar o porquê da decisão antes do como executar |
| **Confirmação > suposição** | Quando estiver em dúvida, perguntar a Léo antes de assumir |
| **Sem jargão sem tradução** | Termo técnico novo? 1 frase explicando |

Aplica-se tanto a este chat (Cowork) quanto a respostas do Claude Code (IDE).

### Regra obrigatória — consultar aprendizados antes de escrever qualquer prompt ou comando

Antes de:
- Escrever escopo de qualquer prompt novo (`docs/prompts/NN-...md`)
- Sugerir comando shell ao Léo
- Definir lista de arquivos de uma feature

Cowork DEVE:

1. **Ler `docs/architecture.md` seção "Aprendizados"** (registrada após cada prompt executado)
2. **Fazer `rtk grep` ou `Grep`** procurando imports do que vai ser modificado (descobrir arquivos afetados que não estavam óbvios no escopo)
3. **Consultar `docs/handoff/HANDOFF-prompt-XX.md`** mais recente

Razão: erros recorrentes detectados —
- Sugerido `npx expo start --ios` em vez de `npx expo run:ios` (aprendizado #2 do Prompt 00 já registrado em architecture.md)
- Esqueci `app/_layout.tsx` no escopo do Prompt 03 (Claude Code pegou por grep)

**Esses erros são evitáveis se Cowork ler os aprendizados antes de instruir Léo ou Claude Code.**

### Regra obrigatória — mensagem que Léo cola no Claude Code

Toda vez que Cowork sugerir uma mensagem pra Léo colar no Claude Code, a mensagem DEVE conter, no mínimo:

1. **Caminho do prompt principal** (ex.: `docs/prompts/NN-...md`)
2. **Caminho do handoff anterior**, se houver (ex.: `docs/handoff/HANDOFF-prompt-XX.md`)
3. **Skills obrigatórias** pra esse prompt (lista explícita, não confiar só na seção A do arquivo)
4. **Inputs principais** (rascunhos, previews, contextos a serem carregados)
5. **Instrução de "refinar, não recriar"** quando há rascunho pré-existente

Razão: sem reforço explícito, o Claude Code pode ignorar skills, perder contexto do handoff, ou tentar começar do zero. Cole isso na cara dele.

Exemplo correto:

```
Leia docs/prompts/NN-...md e me apresente o plano de execução.

Antes, leia docs/handoff/HANDOFF-prompt-XX.md.

Use obrigatoriamente:
- skill A (motivo)
- skill B (motivo)

Carregue como input principal: docs/Y.md. Refine, não recrie do zero.
```

**Modus operandi do projeto:** Prompt Factory.
- Cada feature/área = um prompt versionado em `docs/prompts/`
- Você (Claude Code) sempre retorna **plano + skills + riscos + arquivos + validação** ANTES de executar
- Léo aprova
- Você executa
- `/impeccable critique` antes de marcar como pronto

---

## Estado do produto (1 parágrafo)

DoseDay V5 é a refatoração completa do app DoseDay (atualmente v4.0.1 em produção). A V4 falhou por baixa retenção (D7 ~6%, 1 pagante em 96 cadastros). V5 reposiciona o produto como **memória inteligente do tratamento com canetas emagrecedoras (GLP-1)** para paciente e médico. Stack: Expo SDK 54+ React Native + Liquid Glass iOS 26+, Supabase mantido, RevenueCat com trial 14d configurado em produção, IA via Edge Functions Anthropic SDK. Bundle ID `com.doseday.premium` preservado. App Store listing também.

---

## Regras anti-pirraça (não-negociáveis)

1. **NUNCA codar direto.** Prompt → plano + skills + riscos → aguarda aprovação → executa
2. **NUNCA usar `as any`, `// @ts-ignore`, `// eslint-disable`** sem justificativa explícita no plano
3. **NUNCA aplicar glass em conteúdo.** Glass é exclusivo da camada de navegação (regra liquid-glass + DESIGN.md)
4. **NUNCA usar Tailwind/NativeWind.** V5 é StyleSheet nativo
5. **NUNCA rodar `impeccable` e `ui-ux-pro-max` ao mesmo tempo gerando UI.** Conflito de vocabulário
6. **SEMPRE `/impeccable critique`** antes de marcar UI como pronta
7. **SEMPRE `security-review`** em qualquer migration, edge function ou tabela com PHI
8. **SEMPRE migrations via MCP `apply_migration`**, nunca `supabase db push` (lição da V4.5)
9. **SEMPRE consultar `docs/skills-stack.md` seção 4** antes de escolher skills
10. **SEMPRE atualizar `docs/plano-estrategico-v5.md`** ANTES de qualquer mudança de escopo
11. **SEMPRE rodar `/grill-with-docs`** antes de prompts MID/HIGH que toquem domínio (Movimentos IA, schema, fluxo clínico)
12. **SEMPRE rodar `/handoff`** ao fim de sessão longa ou antes de pausar — salva em `docs/handoff/HANDOFF.md`
13. **SEMPRE rodar `/improve-codebase-architecture`** a cada janela rolante de 5-10 prompts implementados
14. **SEMPRE preferir Bash + `rtk` pra arquivos grandes (>300 linhas) e buscas extensas.** Tools `Read`, `Grep`, `Glob` bypass o RTK e gastam mais tokens. Pra arquivos pequenos, `Read` segue OK
15. **MODO PADRÃO: Claude Code direto (`claude`) com 1 prompt por vez.** Sequencial, sem worktree, sem dashboard. Mais econômico e simples. Agent View (`claude agents`) fica reservado pra quando precisar paralelizar 2+ prompts em áreas distintas. Branchs criadas manualmente (`git checkout -b feature/NN-...`). Detalhes em `docs/architecture.md` seção 11.0
16. **Caveman NÃO É USADO no DoseDay V5.** Apesar de instalado, decisão estratégica: economia vem de RTK + boas práticas, sem perder clareza de respostas
17. **Modelo Haiku 4.5 em prompts LOW.** Sonnet/Opus reservado pra prompts MID/HIGH com decisão arquitetural. Antes de dispatchar prompt LOW no Agent View, trocar via `/model` pra Haiku
18. **Cleanup imediato** após merge: `Ctrl+X` 2× na sessão concluída do Agent View. Libera worktree e quota
19. **Peek antes de atachar.** `Space` mostra resumo da sessão. Só atachar (`Enter`) se realmente precisar interagir
20. **`react-native-devtools-mcp` instalado globalmente.** Claude Code NUNCA delega validação manual repetitiva ao Léo (descomentar linhas, observar logs do Metro, fazer screenshot manual). Usa as 16 ferramentas do MCP `react-native`: `screenshot`, `js_eval`, `get_js_logs`, `tap`, `type_text`, `scroll`, `get_view_hierarchy` etc. Léo só revisa o resultado final no PR. Detalhes em `docs/architecture.md` seção 15

---

## Stack resumida

| Camada | Escolha |
|---|---|
| App | React Native + Expo SDK 54+ |
| Linguagem | TypeScript estrito |
| Routing | Expo Router (file-based) |
| UI nativa iOS | `@expo/ui` + Liquid Glass (iOS 26+) |
| Estado servidor | React Query |
| Estado cliente | Context API |
| Validação | Zod |
| Backend | Supabase (project `pjesgdczasumgjzqyzzk`) |
| IA | Anthropic SDK via Edge Function Deno |
| Pagamento | RevenueCat (project `proj521a5bc0`, trial 14d) |
| Push | Expo Notifications |
| i18n | i18next (pt-BR padrão, en/es opt-in) |
| Analytics | PostHog |
| Crash | Sentry (entra antes do beta) |

---

## Stack de skills do Claude Code (43 skills)

Detalhe completo em `docs/skills-stack.md`. Resumo de quem usar para o quê:

| Tipo de tarefa | Skill primária |
|---|---|
| Brainstorm de feature | `superpowers:brainstorming` |
| **Alinhar plano com domínio + atualizar docs** | **`grill-with-docs`** (Matt Pocock) |
| Stress-test puro de plano | `grill-me` (Matt Pocock) |
| Plano multi-etapa | `superpowers:writing-plans` |
| Implementar feature ponta-a-ponta | `feature-dev:feature-dev` |
| UI nova / refazer tela | `/impeccable craft` ou `/impeccable distill` |
| Brief visual antes de codar | `/impeccable shape` |
| Onboarding / empty state | `/impeccable onboard` |
| Tab bar / toolbar / navegação | `liquid-glass:liquid-glass` |
| RN best practices | `react-native-best-practices` |
| Query / RLS / migration | `supabase-postgres-best-practices` |
| Anthropic SDK | `claude-api` |
| TDD | `superpowers:test-driven-development` |
| Bug não-óbvio | `superpowers:systematic-debugging` |
| Refactor grande isolado | `superpowers:using-git-worktrees` |
| **Identificar débito arquitetural** | **`improve-codebase-architecture`** (Matt Pocock, a cada janela rolante) |
| Várias tarefas paralelas | `superpowers:dispatching-parallel-agents` |
| Pre-ship: a11y/perf | `/impeccable audit` |
| Pre-ship: edge cases | `/impeccable harden` |
| Code review estrutural | `review` |
| Security/LGPD | `security-review` |
| Cortar gordura | `simplify` |
| Build/Deploy/CI-CD | `antigravity-bundle-expo-react-native:*` |
| ASO | `antigravity-bundle-expo-react-native:app-store-optimization` |
| **Fim de sessão / antes de pausar** | **`handoff`** (Matt Pocock) — salva em `docs/handoff/HANDOFF.md` |

---

## Pasta de referência (NÃO copiar)

`/Users/leofrancaia/Desktop/Dose-Day-Jules-1/` é o codebase da V4. Use **apenas como referência consciente** — schema de Supabase, padrões que funcionaram, ideias de componentes. **Não copy-paste.** Tudo é reescrito limpo no V5.

---

## Otimização de tokens — RTK (Rust Token Killer)

Hook global instalado em `~/.claude/settings.json` que intercepta toda chamada ao tool `Bash` e comprime a saída em 60-90% antes de chegar no contexto.

**Comandos do nosso stack que RTK otimiza automaticamente (via hook):**

| Comando | Economia esperada |
|---|---|
| `git status`, `git diff`, `git log`, `git add/commit/push` | -75 a -92% |
| `tsc --noEmit` | -80% |
| `eslint`, `prettier` | -80% |
| `npm install`, `npm test`, `jest` | -90% |
| `npx expo start`, `eas build`, `eas submit` | -80 a -90% |
| `supabase migration list`, `supabase functions list` | -80% |

**Comandos explícitos `rtk *` quando os tools Read/Grep/Glob seriam caros:**

| Tarefa | Em vez de | Usar |
|---|---|---|
| Ler arquivo grande (>300 linhas) | `Read` | `rtk read path/to/file.ts` ou `rtk read file.ts -l aggressive` (signatures only) |
| Buscar padrão em código extenso | `Grep` | `rtk grep "padrão" .` |
| Listar árvore de diretório | `Glob`/`LS` | `rtk ls .` |
| Diff entre 2 arquivos | leitura manual | `rtk diff file1 file2` |
| Resumir comando longo | leitura manual | `rtk summary <command>` |

**Diagnóstico:** rodar `rtk gain` periodicamente pra ver tokens economizados na sessão.

**Anti-padrão:** usar `Read` pra arquivo de 2000 linhas quando `rtk read file.ts -l aggressive` retorna só signatures. Custo de tokens é real.

---

## Repositório

- GitHub: `github.com/leomeirae/doseday-v5`
- Local principal: `/Users/leofrancaia/Desktop/dose-day-v5/` (Léo + revisão)
- Branch padrão: `main` (configurada como default no GitHub)
- Branches de feature: `feature/NN-area-curta` (criadas automaticamente pelo Agent View)
- Worktrees: `.claude/worktrees/` (criados automaticamente pelo Agent View, um por sessão)

## Paralelismo via Agent View (`claude agents`)

Substitui o setup manual de worktrees. Dashboard único pra gerenciar várias sessões em background.

| Regra | Aplicação |
|---|---|
| 1 aba do terminal só | `claude agents` — todas as sessões aparecem nessa tela |
| Worktrees automáticos | Cada sessão dispatcheada cria worktree próprio em `.claude/worktrees/` |
| Léo é o único roteador | Léo decide qual prompt vai pra qual sessão (dispatch via input do Agent View) |
| Áreas não-sobrepostas | Sessões paralelas só se editam arquivos distintos |
| Máx 3 sessões em paralelo no início | Quota some rápido se exagerar |
| Handoff próprio | `/handoff` dentro de cada sessão salva em `docs/handoff/HANDOFF-<nome-sessao>.md` |
| Skills obrigatórias | `superpowers:dispatching-parallel-agents` (orquestração) |
| Cheatsheet | `docs/agent-view-cheatsheet.md` — atalhos + comandos |

---

## Próximo prompt a executar

**`docs/prompts/00-MID-bootstrap-projeto-expo.md`** — bootstrapar projeto Expo do zero.

Quando Léo colar esse prompt aqui, siga o template:
1. Retorne tabela de Skills + Plano + Riscos + Arquivos + Validação
2. Pause
3. Aguarde "ok" do Léo
4. Execute
5. Sugira rodar `/init` skill no final pra atualizar este CLAUDE.md com a estrutura real do código bootstrappado

---

## Histórico (a ser preenchido após cada prompt)

| Data | Prompt executado | Resultado | Commit |
|---|---|---|---|
| 2026-05-15 | `00-MID-bootstrap-projeto-expo` | ✅ App rodando no simulador iOS 26. Expo SDK 54, TypeScript strict, Expo Router, i18next, React Query, Zod, date-fns. Bundle ID `com.doseday.premium` confirmado. | `4dc0c1e` + fixes em `9fd3d74` |
| 2026-05-15 | `01-LOW-migrar-arquivos-sensiveis` | ✅ `.env`, GSI, `eas.json`, 42 locales (14 namespaces × 3 idiomas), ícone de produção migrados da V4. | `144e10b` (PR #1) |
| 2026-05-15 | `02-MID-impeccable-teach` | ✅ `docs/PRODUCT.md` v1.0 (5 Open Questions respondidas, Product Purpose, Accessibility & Inclusion). `docs/DESIGN.md` 6-seções Stitch + `.impeccable/design.json` sidecar. North Star "The Clinical Memory". | `e4782c3` (PR #2 cherry-picked) + `4b46ca0` (handoff) |
| 2026-05-15 | Recovery git | ✅ PR #2 foi mergeado na branch errada (`feature/00-bootstrap`). Cherry-pick recuperou commits pra `main`. Default branch corrigida para `main` no GitHub. | `64b0c5e` (.DS_Store ignored) |
| 2026-05-16 | `03-LOW-aplicar-tokens-design` | ✅ Tokens canônicos aplicados em `lib/theme/tokens.ts`. 5 namespaces: colors (20), typography (12), spacing (8), radius (6), elevation (4). | (PR #3) |
| 2026-05-16 | `04-MID-tab-bar-5-abas` | ✅ Tab bar com 5 abas (Início, Doses, Diário, Relatórios, Perfil). Glass via `expo-blur` BlurView, SF Symbols via `expo-symbols`, scale 0.96 + haptic no tap. | `a9a420c` (PR #4) |
| 2026-05-17 | `05-LOW-remover-fontfamily-system` | ✅ Removido `fontFamily: 'system'` de 11 tokens em `lib/theme/tokens.ts`. Warning de RN sumiu. `monoData` preservado. | `c65d595` (PR #5) |
| 2026-05-17 | `06-MID-home-screen` | ✅ Home Screen V1: GreetingHeader + NextDoseCard (Number-First, Vital Mint só no número) + InsightCard (border Card Default spec). Mocks em `lib/mocks/home.ts`. `/impeccable critique` 28/40, A11y aplicada (P2). P1/P3 adiados. | `cfeaf36` (PR #6) |
| 2026-05-17 | `07-LOW-eslint-flat-config` | ✅ Migrado de `.eslintrc.js` legacy pra `eslint.config.js` flat config. `react.version` pinado em `'18.0.0'` (eslint-plugin-react@7.x quebra com 'detect' em ESLint v10). Aprendizados 5-7 registrados em `architecture.md`. | (PR #7) |
| 2026-05-17 | `08-MID-tela-doses` | ✅ Tela Doses V1: 4 próximas + 4 histórico (mocked), com 1 dose "Pulada" (semanticWarning). `DoseCard`, `StatusBadge` (dot + label + cor — regra cor não-comunicativa), `SectionHeader` reutilizável. `/impeccable critique` 28/40, P2 (a11y + dose urgente) resolvidos pré-commit. Vital Mint Rarity preservado (zero `colors.brand` na tela). | (PR #8) |
| 2026-05-17 | `09-MID-supabase-client-session` | ✅ `@supabase/supabase-js` v2 instalado. `lib/supabase/client.ts` (SecureStore adapter), `lib/supabase/auth.ts` (6 helpers), `contexts/AuthContext.tsx`, `hooks/useSession.ts`, `types/database.ts` (schema V4). Alias `@contexts` adicionado. 5 cenários de validação via CDP inspector passaram (signIn, signOut, SecureStore persistência). | `86b71f0` (PR #9) |
| 2026-05-17 | Adoção `react-native-devtools-mcp` | ✅ MCP global instalado em `~/react-native-devtools-mcp`. 16 tools (`screenshot`, `js_eval`, `get_view_hierarchy`, etc) disponíveis a partir do Prompt 10. Regra anti-pirraça 20 adicionada ao CLAUDE.md. Seção 15 em `architecture.md`. | (sem PR) |
| 2026-05-17 | `10-MID-telas-signin-signup` | ✅ Telas SignIn + SignUp com Zod (min 6/8 chars), mapeamento erros Supabase → PT-BR, TextField reutilizável (focus state, error state, maxLength), KeyboardAvoidingView iOS, [DEV] link na Home. `/impeccable critique` 28/40, P2 resolvidos. `/impeccable harden` aplicado (maxLength, generalError clear). 14 testes MCP. Aprendizados 10-14 em `architecture.md`. | (PR #10) |
| 2026-05-18 | `11-MID-session-guard-recover` | ✅ AuthGuard global com `useRootNavigationState` (race-condition-safe). SplashView com ActivityIndicator. `recover.tsx`: fluxo de recuperação (segurança: sempre sent mesmo email inexistente, só erro de rede exibido). `perfil.tsx` V1: card email + Sair (guard faz redirect). `AuthLink.dim` prop cria hierarquia visual em signin. `/impeccable critique` 31/40; harden: maxLength 254, numberOfLines 1. 15 testes MCP. Aprendizados 15-19 em `architecture.md`. | `6552d73` (PR #11) |

(Atualize esta tabela ao final de cada execução bem-sucedida.)

---

**Fim do CLAUDE.md.**
