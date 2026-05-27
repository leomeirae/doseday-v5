# DoseDay V5 — Stack de Skills do Claude Code

**Data:** 14 de maio de 2026 (atualizado: adicionadas 4 skills Matt Pocock)
**Local canônico:** `/Users/leofrancaia/Desktop/dose-day-v5/docs/skills-stack.md`
**Status:** referência viva. Atualizar quando uma skill nova for instalada/removida.

---

## 1. Visão geral

O Claude Code do Léo tem **43 skills** instaladas. Este documento define **quando cada skill deve ser invocada**, **qual skill ganha quando duas competem**, e **como tudo encaixa no workflow do DoseDay V5**.

| Plugin/Origem | Skills | Papel no projeto |
|---|---|---|
| **superpowers** | 13 | Workflow (brainstorm, plans, TDD, debug, code review, parallel agents, git worktrees) |
| **impeccable** | 1 | Fonte primária de design (UI/UX) |
| **antigravity-bundle-expo-react-native** | 7 | Stack mobile (RN/Expo, EAS, ASO, CI/CD) |
| **liquid-glass** | 1 | Glass opcional em navegação (ADR 0007 — não é mais pilar) |
| **feature-dev** | 1 | Desenvolvimento guiado de feature ponta-a-ponta |
| **mattpocock/skills** | 4 | Alinhamento (`grill-me`, `grill-with-docs`), continuidade (`handoff`), arquitetura (`improve-codebase-architecture`) |
| **standalone** | 16 | UI/UX backup (ui-ux-pro-max), Supabase, Claude API, code review, utilitários |

---

## 2. Princípios de uso — quem ganha quando duas skills competem

| Decisão | Skill primária | Skill de consulta |
|---|---|---|
| **Design de tela do zero** | `impeccable:impeccable` (lê PRODUCT.md + DESIGN.md) | `ui-ux-pro-max` apenas se precisar consultar palette/type/chart específico |
| **Apple HIG iOS 26 / Liquid Glass** (opcional) | `liquid-glass:liquid-glass` — só se glass agregar ao contexto | `impeccable:impeccable` aplica a regra ao componente |
| **Animations React Native** | `react-native-best-practices` (New Architecture, Reanimated) | — |
| **Stack Expo + deploy** | `antigravity-bundle-expo-react-native:*` | `expo` oficial se faltar algo |
| **Planejamento de feature** | `feature-dev:feature-dev` OR `superpowers:writing-plans` | `superpowers:brainstorming` antes |
| **Implementar com testes** | `superpowers:test-driven-development` | — |
| **Bug / falha de teste** | `superpowers:systematic-debugging` | — |
| **Code review** | `review` + `security-review` + `impeccable:impeccable` | `simplify` no final |
| **Query Postgres / RLS** | `supabase-postgres-best-practices` | — |
| **Anthropic SDK** | `claude-api` | — |

### Regra anti-conflito

❌ **NUNCA** rodar `impeccable` e `ui-ux-pro-max` ao mesmo tempo gerando UI. Os vocabulários conflitam. A doc do Impeccable lista isso como anti-padrão explícito.

✅ **SIM** consultar `ui-ux-pro-max` como banco de referência (palette X, font pairing Y, chart Z) e levar o input pro Impeccable para integrar no design system.

---

## 3. Mapa por fase do trabalho

### Fase 0 — Setup inicial do projeto (executar UMA vez)

| Ordem | Skill | Por quê |
|---|---|---|
| 1 | `init` | Inicializa o repo com CLAUDE.md documentando o codebase |
| 2 | `impeccable:impeccable` (via `/impeccable teach`) | Cria PRODUCT.md + DESIGN.md — fonte única do design system |
| 3 | `react-native-best-practices` | Aplica New Architecture, Hermes, novos defaults |
| 4 | `update-config` + `fewer-permission-prompts` | Setup settings.json, hooks, permissões |

### Fase 1 — Planejamento de feature

| Quando | Skill | O que esperar |
|---|---|---|
| Ideia vaga | `superpowers:brainstorming` | Explora requisitos antes de implementar |
| **Plano com terminologia de domínio importante** | **`grill-with-docs`** | **Stress-test do plano contra CONTEXT.md + ADR inline** |
| **Stress-test puro de plano (sem domínio)** | **`grill-me`** | **Entrevista até alinhar 100%** |
| Feature com escopo claro | `feature-dev:feature-dev` | Fluxo guiado ponta-a-ponta |
| Tarefa multi-etapa complexa | `superpowers:writing-plans` | Plano estruturado com checkpoints |
| Várias tarefas independentes em paralelo | `superpowers:dispatching-parallel-agents` | Quebra em subagentes simultâneos |

### Fase 2 — Implementação

| Tarefa | Skill |
|---|---|
| Tela nova (UI from scratch) | `/impeccable craft` |
| Tela com fluxos complexos | `/impeccable shape` antes do `craft` |
| Onboarding / empty state / first-run | `/impeccable onboard` |
| Navegação / Dashboard cards | Tab bar removida (ADR 0007). Navegação via `router.push()` em cards. `liquid-glass` opcional se houver toolbar/header com glass. |
| Componentes Expo específicos | `antigravity-bundle-expo-react-native:react-native-architecture` |
| Rotas de API (se usar Expo API Routes) | `antigravity-bundle-expo-react-native:expo-api-routes` |
| Animation pesada / 120fps / Skia | `react-native-best-practices` |
| Query Supabase / RLS / migrations | `supabase-postgres-best-practices` |
| Edge Function com OpenAI / Anthropic | `claude-api` (estrutura Anthropic SDK) |
| Plano com testes desde o início | `superpowers:test-driven-development` |

### Fase 3 — Refinamento / iteração

| Sinal | Skill |
|---|---|
| Tela "está OK mas falta brilho" | `/impeccable polish` |
| Tela visualmente chata | `/impeccable bolder` |
| Tela visualmente carregada | `/impeccable quieter` ou `/impeccable distill` |
| Typography ruim | `/impeccable typeset` |
| Spacing / layout off | `/impeccable layout` |
| Falta cor estratégica | `/impeccable colorize` |
| Falta motion intencional | `/impeccable animate` |
| Copy fraca | `/impeccable clarify` |
| Não responde em telas pequenas | `/impeccable adapt` |

### Fase 4 — Pre-ship (gauntlet obrigatório)

| Ordem | Skill | Severidade do critério |
|---|---|---|
| 1 | `/impeccable audit` | A11y, performance, theming, responsive, anti-patterns |
| 2 | `/impeccable harden` | Edge cases, overflow, i18n, erro, offline |
| 3 | `review` | Code review estrutural |
| 4 | `security-review` | LGPD-critical pra app médico |
| 5 | `simplify` | Última passada removendo complexidade desnecessária |
| 6 | `/impeccable critique` | Persona-test final |

### Fase 5 — Deploy

| Tarefa | Skill |
|---|---|
| Build pra TestFlight | `antigravity-bundle-expo-react-native:expo-dev-client` |
| Deploy production | `antigravity-bundle-expo-react-native:expo-deployment` |
| CI/CD workflow YAML | `antigravity-bundle-expo-react-native:expo-cicd-workflows` |
| ASO (App Store listing, keywords, screenshots) | `antigravity-bundle-expo-react-native:app-store-optimization` |

### Fase 6 — Manutenção

| Tarefa | Skill |
|---|---|
| Bug em produção | `superpowers:systematic-debugging` |
| Refactor de tech debt | `superpowers:writing-plans` + `simplify` |
| **Identificar débito arquitetural antes de virar bola de barro** | **`improve-codebase-architecture`** (a cada janela rolante de progresso) |
| Atualização de dependência grande | `superpowers:using-git-worktrees` |
| Finalizar branch | `superpowers:finishing-a-development-branch` |
| Agendar relatório recorrente | `schedule` ou `loop` |

### Fase 7 — Continuidade entre sessões

| Quando | Skill |
|---|---|
| **Fim de sessão longa antes de fechar Claude Code** | **`handoff`** — salva HANDOFF.md em `docs/handoff/` |
| **Contexto chegando perto do limite de tokens** | **`handoff`** |
| **Antes de pausar projeto por dias** | **`handoff`** |
| **Léo retomando após pausa** | Claude Code lê `docs/handoff/HANDOFF.md` primeiro coisa |

---

## 4. Tabela mestre — skill por tipo de tarefa

Quando o Claude Code receber um prompt, ele deve consultar essa tabela pra escolher a skill correta. Em caso de múltiplas skills aplicáveis, seguir ordem da Fase aplicável.

| Tipo de tarefa | Skill primária | Skills auxiliares |
|---|---|---|
| **Nova tela visual** | `/impeccable craft` | `react-native-best-practices`, `expo-tailwind-setup` (NativeWind), `liquid-glass` se tiver glass em navegação |
| **Refazer uma tela** | `/impeccable distill` ou `bolder`/`quieter` | dependendo do diagnóstico |
| **Botão / componente único** | `/impeccable craft` | `liquid-glass` se for botão de navegação com glass (opcional) |
| **Fluxo de onboarding** | `/impeccable onboard` | `feature-dev` se for grande |
| **Empty state** | `/impeccable onboard` | — |
| **Error state** | `/impeccable harden` | — |
| **Paywall** | `/impeccable craft` + `/impeccable critique` (paywall psychology) | `app-store-optimization` reforça compliance |
| **Auth (Google/Apple/email)** | `feature-dev` + `react-native-best-practices` | `supabase-postgres-best-practices` |
| **Migration Postgres** | `supabase-postgres-best-practices` | — |
| **RLS policy nova** | `supabase-postgres-best-practices` | `security-review` no final |
| **Edge Function com IA** | `claude-api` | `supabase-postgres-best-practices` pro side server |
| **Animation Reanimated** | `react-native-best-practices` | `/impeccable animate` se quiser polir |
| **Tela com gráfico** | `/impeccable craft` consulta `ui-ux-pro-max` por chart type | — |
| **Acessibilidade** | `/impeccable audit` | — |
| **Performance ruim** | `/impeccable optimize` | `react-native-best-practices` (Hermes, fabric) |
| **i18n breakage** | `/impeccable harden` | — |
| **Bug que não reproduz** | `superpowers:systematic-debugging` | — |
| **Code review antes de merge** | `review` + `impeccable:impeccable` + `security-review` | `simplify` no final |
| **Screenshot App Store** | `app-store-optimization` | `/impeccable polish` aplicado nas telas reais primeiro |
| **Copy / textos do app** | `/impeccable clarify` | — |
| **Refatorar legado** | `simplify` + `superpowers:writing-plans` | — |
| **Multi-tarefas independentes** | `superpowers:dispatching-parallel-agents` | — |
| **Implementar com TDD** | `superpowers:test-driven-development` | — |

---

## 5. Detalhamento de cada skill

### 5.1 superpowers (13 skills — workflow)

| Skill | Gatilho |
|---|---|
| `superpowers:using-superpowers` | Quando o Claude Code precisar de orientação sobre quais superpowers usar |
| `superpowers:brainstorming` | Antes de qualquer feature nova com escopo aberto |
| `superpowers:writing-plans` | Quando a tarefa tiver 3+ etapas dependentes |
| `superpowers:executing-plans` | Para executar um plano já escrito com checkpoints |
| `superpowers:test-driven-development` | Antes de escrever lógica de negócio (sempre que possível em V5) |
| `superpowers:systematic-debugging` | Bug não-óbvio, falha de teste, divergência staging vs prod |
| `superpowers:dispatching-parallel-agents` | Várias tarefas independentes (ex.: gerar 5 telas que não dependem entre si) |
| `superpowers:subagent-driven-development` | Plano grande dividido em subagentes |
| `superpowers:using-git-worktrees` | Refactor grande que pode quebrar o main. Trabalhar em worktree isolada |
| `superpowers:finishing-a-development-branch` | Mergear branch concluída (review, squash, tag) |
| `superpowers:writing-skills` | Quando descobrir um padrão que merece virar skill custom |
| `superpowers:requesting-code-review` | Antes de mergear feature crítica |
| `superpowers:receiving-code-review` | Quando o code review chegar — aplica feedback de forma estruturada |

**Princípio:** o Claude Code deve **sempre** começar com `superpowers:brainstorming` (se vaga) ou `superpowers:writing-plans` (se clara) antes de codar. Para o DoseDay, "codar direto" não é aceito.

### 5.2 impeccable (1 skill — design language)

| Comando | Quando |
|---|---|
| `/impeccable teach` | UMA vez no setup. Cria PRODUCT.md + DESIGN.md |
| `/impeccable shape` | Brief visual antes de codar uma feature grande |
| `/impeccable craft` | Tela do zero, com código React Native saindo |
| `/impeccable critique` | Review de design antes de marcar como pronto |
| `/impeccable polish` | Última passada antes de produção |
| `/impeccable audit` | A11y + performance + anti-patterns deterministicamente |
| `/impeccable harden` | Estresse com dados reais (overflow, i18n, erro, offline) |
| `/impeccable onboard` | Onboarding, empty state, first-run experience |
| `/impeccable clarify` | Reescreve copy confusa |
| `/impeccable distill` | Strip de complexidade visual |
| `/impeccable quieter` | Tonifica design gritando |
| `/impeccable bolder` | Adiciona peso em design tímido |
| `/impeccable typeset` | Fix de tipografia genérica |
| `/impeccable layout` | Fix de spacing/rhythm |
| `/impeccable colorize` | Cor estratégica em monocromático |
| `/impeccable animate` | Motion que comunica estado (não decoração) |
| `/impeccable delight` | Personalidade pontual |
| `/impeccable overdrive` | Push pra cinemático (usar com cuidado em app médico — quase nunca) |
| `/impeccable adapt` | Responsive |
| `/impeccable optimize` | Performance UI (LCP, bundle) |
| `/impeccable extract` | Consolida drift do design system |
| `/impeccable document` | Re-captura DESIGN.md baseado no que existe |
| `/impeccable live` | Iteração em browser (não aplicável a RN, ignorar) |

**Princípio:** Impeccable é fonte primária. Sempre lê PRODUCT.md + DESIGN.md antes. Se o output não casar com o design system, o problema está no DESIGN.md, não no Impeccable — corrigir o DESIGN.md e re-rodar.

### 5.3 antigravity-bundle-expo-react-native (7 skills — stack mobile)

| Skill | Gatilho |
|---|---|
| `react-native-architecture` | Componente novo, decisão arquitetural RN |
| `expo-deployment` | Deploy production pra App Store |
| `expo-dev-client` | Build local ou TestFlight |
| `expo-api-routes` | Se decidir usar Expo Router API Routes em vez de Supabase Edge Functions |
| `expo-tailwind-setup` | ✅ USAR para setup NativeWind v4 + react-native-reusables (ADR 0007, pivot 2026-05-27) |
| `expo-cicd-workflows` | Setup do EAS workflow YAML |
| `app-store-optimization` | ASO, keywords, screenshots, listing |

**Princípio:** stack mobile é orquestrado por essas skills. Para deploy/CI/ASO, são fonte única.

### 5.4 liquid-glass (1 skill — glass opcional iOS 26+)

> **ADR 0007 (2026-05-27):** Liquid Glass não é mais pilar arquitetural. Tab bar foi removida. Glass é **opcional** — use quando agregar ao UX de navegação.

**Gatilho:** trabalho com `.glassEffect()`, `.buttonStyle(.glass)`, `GlassEffectContainer`, toolbars, headers com glass.

**Regra mantida:** Glass não vai em conteúdo (listas, tabelas, texto corrido, cards de dados clínicos, relatórios). Essa restrição continua válida — não é sobre frequência, é sobre onde glass pode aparecer.

Quando glass aparecer (ex: header de modal, toolbar), ele aparece em: header de navegação, botões CTA em paywall, splash. **Não aparece em:** cards de check-in, lista de doses, gráfico de peso, relatório clínico.

### 5.5 ui-ux-pro-max — uso disciplinado (NÃO é fonte primária)

**Tem 50+ estilos, 161 palettes, 57 font pairings, 161 product types, 99 UX guidelines, 25 chart types.**

**Papel autorizado em DoseDay V5:**

- ✅ Consultar paletas pra inspiração quando o DESIGN.md precisar evoluir
- ✅ Consultar font pairings se for explorar combinação nova
- ✅ Consultar chart types pra escolha de visualização (peso, adesão, sintomas)
- ✅ Consultar guidelines de acessibilidade

**Papel PROIBIDO:**

- ❌ Gerar UI direto (rodar a skill como geradora de design)
- ❌ Combinar com Impeccable na mesma sessão de geração
- ❌ Adotar "estilos" do plugin (glassmorphism, claymorphism, brutalism, etc.) — DoseDay é sobriedade clínica

**Comando mental:** "ui-ux-pro-max é Wikipedia, Impeccable é o autor."

### 5.6 feature-dev (1 skill — dev guiado de feature)

| Quando | Não usar |
|---|---|
| Feature ponta-a-ponta com escopo claro (auth, paywall, relatório IA) | Tarefas pequenas (1 tela) — usar `/impeccable craft` direto |
| Feature que precisa de UX + lógica + backend juntos | Bug fix — usar `systematic-debugging` |

### 5.7 react-native-best-practices

**Gatilho:** qualquer decisão técnica RN. Especialmente:

- New Architecture (Fabric, TurboModules)
- Hermes
- Animations (Reanimated 4, Skia, layout animations)
- Performance (lista virtualizada, memoization)
- Gesture Handler

### 5.8 supabase-postgres-best-practices

**Gatilho:**

- Schema design (criar tabela nova)
- Query lenta (otimização)
- Connection pooling
- RLS policy
- Migration (criar / aplicar via MCP)

**Atenção LGPD:** dado de saúde é sensível (Art. 11). Toda nova tabela com dado de paciente passa por essa skill + `security-review`.

### 5.9 claude-api

**Gatilho:**

- Configurar Anthropic SDK em Edge Function Supabase
- Streaming
- Tool use
- System prompt engineering pros 3 movimentos de IA (Insight do Dia, Memória de Perguntas, Relatório Bilíngue)

### 5.10 review / security-review / simplify

**Ordem no pre-ship:**

1. `review` — estrutural, padrões, bugs óbvios
2. `security-review` — LGPD-critical pra V5. Vaza dado de saúde? Falta criptografia? RLS frouxa? Tokens em log?
3. `simplify` — remove o que não ganha o seu lugar

### 5.11 Utilitários (uso pontual)

| Skill | Quando |
|---|---|
| `init` | Setup inicial do repo |
| `update-config` | Ajustar settings.json, hooks, permissões |
| `keybindings-help` | Customizar atalhos |
| `fewer-permission-prompts` | Reduzir fricção no fluxo |
| `loop` | Tarefa recorrente in-session |
| `schedule` | Cron de agente remoto (relatório semanal, sync de métrica) |
| `find-skills` | Descobrir skill nova que ainda não está instalada |

### 5.12 Matt Pocock skills (4 skills — alinhamento + continuidade + arquitetura)

Quatro skills do repo [mattpocock/skills](https://github.com/mattpocock/skills) (82k★) que entram no fluxo do DoseDay V5 com papel específico.

#### `grill-me`

| | |
|---|---|
| **O que faz** | Entrevista o Léo relentlessly até alinhar 100% num plano/decisão. Caminha pela árvore de decisões. Pra cada pergunta, fornece resposta recomendada |
| **Quando usar** | Antes de qualquer prompt MID ou HIGH onde o escopo ainda tem ambiguidade. Stress-test do plano antes de mandar pro Claude Code |
| **Quando NÃO usar** | Tarefas LOW (cirúrgicas). Tarefas onde Léo já sabe exatamente o que quer |
| **Saída esperada** | Resumo do que foi discutido + decisões alinhadas |

#### `grill-with-docs`

| | |
|---|---|
| **O que faz** | Igual ao `grill-me`, mas: (1) cruza com `CONTEXT.md` (glossário do domínio), (2) propõe ADRs quando uma decisão for irreversível + surpreendente + trade-off real, (3) atualiza docs inline conforme decisões se cristalizam |
| **Quando usar** | Feature complexa que toca conceitos do domínio (ex.: Movimento 1 da IA, schema de relatório, modelo de dose). Toda vez que terminologia importa |
| **Quando NÃO usar** | Decisões puramente técnicas sem impacto no domínio (escolha de lib, ajuste de config) |
| **Saída esperada** | `CONTEXT.md` atualizado + ADRs novos em `docs/adr/` se aplicável |

#### `handoff`

| | |
|---|---|
| **O que faz** | Compacta a sessão atual num documento estruturado pra outra sessão (ou outro agente) continuar sem perda de contexto. Salva em `docs/handoff/HANDOFF.md` |
| **Quando usar** | (1) Fim de sessão longa antes de fechar Claude Code, (2) Quando contexto chegou perto do limite, (3) Antes de pausar projeto por dias |
| **Quando NÃO usar** | Sessões curtas onde o estado cabe num commit normal |
| **Saída esperada** | Briefing em 5 seções (estado, decisões, próximos passos, riscos, links) |
| **Importância especial pro DoseDay** | Resolve o que aconteceu na V4 — Léo perdeu sessão por pane do computador. Com `/handoff` regular, isso fica reproduzível |

#### `improve-codebase-architecture`

| | |
|---|---|
| **O que faz** | Audita o codebase procurando "deepening opportunities" — refactors que tornam módulos rasos em profundos. Usa terminologia rigorosa (Module/Interface/Implementation/Seam/Adapter/Depth/Leverage/Locality). Aplica o **deletion test**: se deletar X, complexidade volta concentrada (bom) ou some (ruim — era pass-through). |
| **Quando usar** | A cada janela rolante de progresso (depois de 5-10 prompts implementados). Quando sentir "ball of mud". Antes de adicionar feature grande nova |
| **Quando NÃO usar** | Codebase muito novo (sem código pra refatorar). Logo após bootstrap |
| **Saída esperada** | Lista numerada de candidatos a refactor com Files + Problem + Solution + Benefits. Léo escolhe qual aprofundar. Drop em grilling depois |
| **Pré-requisito** | `CONTEXT.md` + `docs/adr/` populados pra qualidade alta |

### 5.12.1 Workflow Matt Pocock pro DoseDay

```
Antes de qualquer feature complexa:
  /grill-with-docs          → alinha plano + atualiza CONTEXT.md/ADR

Durante sessão longa:
  /handoff                  → ao perceber que vai pausar ou contexto cheio

A cada janela rolante de progresso:
  /improve-codebase-architecture → identifica débito antes de virar bola de barro
```

### 5.12.1.5 RTK (Rust Token Killer) — ferramenta de otimização, não skill

Não é skill, mas afeta como TODAS as skills operam. Hook `PreToolUse` interpreta toda chamada `Bash` e comprime a saída em 60-90% antes de chegar no contexto.

**Como cada categoria de tool se comporta com RTK:**

| Tool do Claude Code | Passa pelo RTK? | Recomendação |
|---|---|---|
| `Bash` | ✅ sim, automático | Usar pra TODA operação de shell. Hook reescreve `git status` → `rtk git status` transparente |
| `Read` | ❌ não | Pra arquivos pequenos (<200 linhas), OK. Pra arquivos grandes (>300), preferir `Bash: rtk read file.ts -l aggressive` |
| `Grep` | ❌ não | Pra busca pontual, OK. Pra busca extensa, preferir `Bash: rtk grep "pattern" .` |
| `Glob` / `LS` | ❌ não | Pra estrutura grande, preferir `Bash: rtk ls .` |
| `Edit` / `Write` | ❌ não | Não há razão pra otimizar — operações de escrita curtas |
| Skills (`/impeccable craft`, `/grill-with-docs`, etc.) | ❌ não | Skills operam no contexto direto. Mas se a skill chamar Bash internamente, esse Bash passa pelo RTK |

**Diagnóstico:**
- `Bash: rtk gain` → economia da sessão
- `Bash: rtk gain --graph` → ASCII graph dos últimos 30 dias
- `Bash: rtk discover` → oportunidades perdidas (comandos que poderiam ter usado RTK)

**Quando o Claude Code recebe um prompt MID ou HIGH que envolve:**
- Leitura de um arquivo de relatório clínico longo? → `rtk read`
- Busca por uso de um componente em todo o app? → `rtk grep`
- Lista de migrations Supabase? → `rtk ls` no diretório
- Diff entre 2 versões de schema? → `rtk diff`
- Logs do EAS Build? → `rtk err` ou `rtk log`
- TypeScript check após edit massivo? → Bash `tsc --noEmit` (hook RTK já comprime)
- Jest após mudança em hook? → Bash `npm test` (hook RTK já comprime)

### 5.12.2 Outras skills do Matt Pocock

#### Instaladas mas NÃO usadas

| Skill | Status | Razão de não usar |
|---|---|---|
| `caveman` | Instalada, **DESATIVADA** por decisão | Modo ultra-comprimido (-75% tokens nas respostas). Trade-off ruim pra projeto onde Léo (PO) precisa entender cada plano com clareza. Economia vem via RTK em vez disso |

#### NÃO instaladas (vale considerar depois)

| Skill | Por que pode entrar depois |
|---|---|
| `diagnose` | Debug loop disciplinado: reproduce → minimise → hypothesise → instrument → fix → regression-test. Substitui `superpowers:systematic-debugging` em alguns casos |
| `tdd` | Red-green-refactor mais rigoroso que `superpowers:test-driven-development` |
| `triage` | Triagem de issues via state machine. Útil quando backlog crescer |
| `to-prd` / `to-issues` | Conversão de conversa → PRD → GitHub issues. Útil quando V5 estiver rodando |
| `zoom-out` | Contexto amplo sobre código desconhecido |
| `prototype` | Throwaway prototype pra explorar design antes de codar produção |
| `write-a-skill` | Criar skill nova (já temos `superpowers:writing-skills`, mas dá pra comparar) |

#### Quando instalar mais skills do Matt

| Sinal | Skill |
|---|---|
| Vou debugar bug crítico complexo | `diagnose` |
| Vou começar TDD sério (Movimentos IA) | `tdd` |
| Tenho 10+ issues no backlog | `triage` |
| Conversa virou bagunça e preciso PRD | `to-prd` |
| Estou perdendo o panorama do código | `zoom-out` |
| Sessão muito longa, quero economizar tokens | `caveman` |

---

## 6. Workflow padrão pra V5 — ordem das skills numa sessão típica

### Cenário A — Implementar uma tela nova (ex.: tela de Dashboard)

```
1. superpowers:brainstorming         (se ainda houver dúvida sobre o que entrar na tela)
2. /impeccable shape                  (brief visual antes de codar)
3. superpowers:writing-plans          (plano com checkpoints)
4. /impeccable craft                  (código sai aqui)
5. react-native-best-practices        (aplicado durante o craft)
6. liquid-glass:liquid-glass          (opcional — se a tela tiver glass em header/toolbar; tab bar foi removida)
7. /impeccable critique               (review antes de marcar como pronto)
8. /impeccable polish                 (última passada)
9. review                             (estrutural)
10. simplify                          (corta gordura)
```

### Cenário B — Implementar lógica de IA (ex.: Insight do Dia)

```
1. superpowers:brainstorming         (definir prompt e guardrails)
2. claude-api                         (estrutura SDK)
3. supabase-postgres-best-practices   (schema, RLS, edge function)
4. superpowers:test-driven-development (testes da edge function)
5. /impeccable craft                  (UI de exibição do insight)
6. /impeccable harden                 (estados de erro, sem dados, timeout)
7. security-review                    (LGPD-critical: dado vai pra OpenAI)
8. review
```

### Cenário C — Pre-ship pra App Store

```
1. /impeccable audit                  (a11y + perf + anti-patterns)
2. /impeccable harden                 (i18n, overflow, offline, erro)
3. review                             (estrutural)
4. security-review                    (LGPD, secrets, RLS)
5. simplify                           (corta gordura final)
6. /impeccable critique               (persona-test final)
7. app-store-optimization             (listing, keywords, What's New)
8. expo-deployment                    (build production)
```

### Cenário D — Bug em produção

```
1. superpowers:systematic-debugging   (reproduz, isola, diagnostica)
2. superpowers:using-git-worktrees    (se for fix complexo)
3. superpowers:test-driven-development (regression test)
4. review
5. expo-dev-client                    (TestFlight pra validar)
6. expo-deployment                    (subir)
```

---

## 7. Anti-padrões

| ❌ Não fazer | Por quê |
|---|---|
| Rodar `impeccable` e `ui-ux-pro-max` ao mesmo tempo gerando UI | Conflito de vocabulário, output Frankenstein |
| Pular `/impeccable critique` antes de marcar como pronto | Perde a checagem de design system |
| Aplicar glass em conteúdo (lista, texto, card de dado) | Quebra a regra central — glass só em navegação/header/paywall |
| Usar `expo-tailwind-setup` sem ler ADR 0007 | Setup requer configuração específica de tokens — ler ADR 0007 + Prompt 41 antes |
| Skippar `security-review` numa edge function que recebe dado de paciente | LGPD Art. 11. Vazamento = fim do app |
| Codar sem `superpowers:brainstorming` ou `superpowers:writing-plans` | Patterns ruins entram cedo, sai caro depois |
| Usar `/impeccable overdrive` em tela clínica | Cinematic não combina com app médico |

---

## 8. Próximos passos

| Ordem | Ação | Quem |
|---|---|---|
| 1 | Léo confirma que esse doc reflete o que ele tem instalado | Léo |
| 2 | Esse doc fica versionado no repo `doseday-v5` | Claude Code (no kickoff) |
| 3 | PRODUCT.md + DESIGN.md são criados via `/impeccable teach` | Claude Code |
| 4 | Prompt 00-kickoff orienta o Claude Code a sempre consultar esse doc | Claude (este chat) |

---

**Fim do documento.**
