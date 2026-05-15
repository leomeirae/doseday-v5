# DoseDay V5 — Pasta de Prompts

**Data:** 14 de maio de 2026
**Local canônico:** `/Users/leofrancaia/Desktop/dose-day-v5/docs/prompts/`

Toda execução técnica no DoseDay V5 acontece via **prompt versionado** colado no Claude Code. Este documento define:

1. O **template padrão** que TODO prompt deve seguir
2. A **sequência ordenada** dos prompts (00 → N)
3. As **regras anti-pirraça** que o Claude Code precisa seguir

---

## 1. Template padrão de prompt

Todo prompt entregue ao Claude Code segue este formato. **Sem exceção.**

```markdown
# DoseDay V5 — Prompt [NN-COMPLEXIDADE-AREA]

> Exemplo: `01-LOW-migrar-google-service-info` · `04-MID-tab-bar-com-5-abas` · `16-HIGH-edge-function-insight-do-dia`

**Instância de destino:** ☐ Aba 1 (principal) · ☐ Aba 2 · ☐ Aba 3
**Worktree:** `dose-day-v5/` (Aba 1 — principal) · `dose-day-v5-2/` · `dose-day-v5-3/` (criados após Prompt 02)
**Branch a criar:** `feature/[NN]-[area-curta]`
**Caveman:** N/A (decisão estratégica: não usar no projeto)

## Contexto obrigatório (leia antes de qualquer coisa)

- `/docs/plano-estrategico-v5.md` — fonte da estratégia
- `/docs/skills-stack.md` — quais skills usar e quando
- `/docs/PRODUCT.md` — quem é o usuário, tom, anti-references
- `/docs/DESIGN.md` — cores, tipografia, elevação, componentes
- `/docs/architecture.md` — estrutura do repo e dependências

## Objetivo desta tarefa

[Descrição clara em 2-3 frases. O QUE precisa ser feito, POR QUÊ importa pra V5.]

## Critérios de aceitação

- [ ] [critério 1 — observável e testável]
- [ ] [critério 2]
- [ ] [critério 3]

## Restrições explícitas

- [restrição técnica 1]
- [restrição de design 2]
- [restrição de compliance 3 — LGPD, App Store, etc.]

## Antes de executar, RETORNE:

### A) Skills que vai utilizar

| Fase | Skill | Por quê |
|---|---|---|
| Planejamento | [ex.: `superpowers:writing-plans`] | [razão] |
| Implementação | [ex.: `/impeccable craft` + `react-native-best-practices`] | [razão] |
| Validação | [ex.: `/impeccable critique` + `review`] | [razão] |

### B) Plano de execução

Lista numerada de etapas com checkpoints onde o Léo pode aprovar/pausar.

1. [etapa 1] — checkpoint: [o que validar]
2. [etapa 2] — checkpoint: [o que validar]
3. ...

### C) Riscos identificados

- [risco 1] — mitigação: [como evitar]
- [risco 2] — mitigação: ...

### D) Arquivos que vai criar/editar

| Arquivo | Ação | Resumo |
|---|---|---|
| `app/(tabs)/index.tsx` | criar | Tela Início com check-in 1-tap |
| `lib/supabase/client.ts` | editar | Adicionar cliente tipado |

### E) Como vai validar

- [ ] `tsc --noEmit` passa sem erros novos (via Bash, hook RTK comprime saída)
- [ ] [validação manual: o que o Léo precisa abrir/clicar pra ver]
- [ ] [testes que vão rodar, se aplicável]
- [ ] `/impeccable critique` aplicado se for UI

### F) Otimização de tokens

Se a tarefa envolve leitura de arquivos grandes (>300 linhas) ou busca extensa, listar quais comandos `rtk *` serão usados em vez de Read/Grep/Glob.

## ⏸️ Pause aqui e aguarde aprovação do Léo antes de executar.
```

---

## 2. Regras anti-pirraça pro Claude Code

O Claude Code DEVE seguir essas regras em todo prompt, sem exceção:

### 2.1 Nunca codar direto

❌ Recebeu prompt → cola código
✅ Recebeu prompt → retorna seções A-E → aguarda aprovação → executa

### 2.2 Sempre brainstorming, grill ou plano antes

| Cenário | Skill |
|---|---|
| Prompt vago, ideia ainda formando | `superpowers:brainstorming` |
| Prompt claro, sem termos de domínio | `superpowers:writing-plans` |
| **Prompt complexo que toca domínio (Movimento IA, schema, fluxo clínico, tom)** | **`grill-with-docs`** — atualiza CONTEXT.md + ADR inline |
| Stress-test puro de plano (sem domínio) | `grill-me` |

### 2.3 Skills obrigatórias por tipo de tarefa

Consultar `/docs/skills-stack.md` seção 4 ("Tabela mestre"). Não inventar combinações novas — usar o que está documentado.

### 2.4 Critique antes de "pronto"

Toda UI nova passa por `/impeccable critique` antes de ser marcada como pronta. Sem exceção.

### 2.5 Security review pra qualquer dado de paciente

Edge function, migration, RLS policy, integração com OpenAI/Anthropic — passa por `security-review` antes de mergear.

### 2.6 Nada de `as any`, `// @ts-ignore`, `// eslint-disable`

Se cair nessa tentação, parar e justificar no plano. Léo decide se aceita.

### 2.7 Glass só na navegação

`liquid-glass:liquid-glass` aplicado APENAS em: tab bar, toolbars, botões de navegação, paywall, splash. **Nunca** em conteúdo de lista, texto corrido, cards de dado clínico, relatórios.

### 2.8 Sem Tailwind

V5 usa StyleSheet nativo + Liquid Glass. Skill `expo-tailwind-setup` é proibida no projeto.

### 2.9 Sem ui-ux-pro-max como gerador

`ui-ux-pro-max` é banco de consulta (paletas, fontes, charts). Geração de UI é exclusiva do Impeccable.

### 2.10 Commits descritivos

Format: `tipo(área): descrição curta`
Ex.: `feat(dashboard): adiciona check-in 1-tap com 5 estados emocionais`
Decisão técnica não-óbvia → linha extra explicando ou doc em `/docs/decisions/`.

### 2.11 RTK — preferir Bash pra leituras/buscas grandes

Hook RTK ativo no `~/.claude/settings.json`. **Toda chamada ao tool `Bash` é interceptada e comprimida automaticamente** (60-90% economia).

Os tools `Read`, `Grep`, `Glob` do Claude Code **bypass o RTK**. Pra arquivos grandes ou buscas extensas, **usar Bash com comandos `rtk *`**:

| Cenário | Tool errado | Tool certo |
|---|---|---|
| Ler arquivo >300 linhas | `Read file.ts` | `Bash: rtk read file.ts` ou `rtk read file.ts -l aggressive` |
| Buscar padrão em muitos arquivos | `Grep "pattern"` | `Bash: rtk grep "pattern" .` |
| Estrutura de pasta grande | `Glob "**"` | `Bash: rtk ls .` |
| Arquivo pequeno (<200 linhas) | `Read file.ts` | `Read file.ts` (segue OK) |
| Buscar 1 símbolo específico em poucos arquivos | `Grep "func"` | `Grep "func"` (OK pra casos pequenos) |

Pra diagnóstico: `Bash: rtk gain` mostra tokens economizados.

---

## 3. Roadmap ordenado de prompts

Ordem de execução. Não pular. Cada prompt destrava o próximo.

### Fase 0 — Setup já feito (Léo)

- [x] Repo `doseday-v5` criado no GitHub
- [x] Pasta `dose-day-v5` no Desktop
- [x] Plugins do Claude Code instalados (superpowers, impeccable, antigravity-bundle-expo-react-native, liquid-glass, feature-dev, standalone)
- [x] Plano estratégico V5 escrito
- [x] Skills-stack escrito

### Fase 1 — Bootstrap do projeto (Claude Code)

| Prompt | Descrição | Complexidade |
|---|---|---|
| **00-MID-bootstrap-projeto-expo** | Cria projeto Expo SDK 54+ do zero, TypeScript, Expo Router, dependências core, scripts de build | MID |
| **01-LOW-migrar-arquivos-sensiveis** | Copia GoogleService-Info.plist, app.json (bundle id), .env, locales/ da pasta antiga | LOW |
| **02-MID-criar-product-design-md** | Roda `/impeccable teach`, gera PRODUCT.md + DESIGN.md baseados no plano estratégico | MID |
| **03-MID-conectar-supabase-revenuecat** | Conecta cliente Supabase no MESMO projeto + RevenueCat SDK com trial 14d | MID |

### Fase 2 — Esqueleto navegável (Claude Code)

| Prompt | Descrição | Complexidade |
|---|---|---|
| **04-MID-tab-bar-5-abas** | Tab bar Início/Doses/Diário/Relatórios/Perfil com `liquid-glass` na navegação | MID |
| **05-LOW-rotas-vazias-com-estado** | Telas vazias de cada tab com estado de "primeiro uso" | LOW |
| **06-MID-auth-completo** | Email/senha + Google + Apple. Fluxo de cadastro + login + recuperação | MID |
| **07-LOW-perfil-config-assinatura** | Tela de Perfil com sub-páginas: conta, médico, assinatura, suporte | LOW |

### Fase 3 — Onboarding novo com aha-moment (Claude Code)

| Prompt | Descrição | Complexidade |
|---|---|---|
| **08-MID-onboarding-fluxo-completo** | Telas conceituais novas (sem mockup 3D), copy retrabalhada via `/design:ux-copy` | MID |
| **09-HIGH-primeiro-insight-ia-pre-cadastro** | Edge function + UI: gera insight com dados do onboarding ANTES de pedir cadastro | HIGH |

### Fase 4 — Dashboard e check-in 1-tap (Claude Code)

| Prompt | Descrição | Complexidade |
|---|---|---|
| **10-MID-dashboard-completo** | Header, banner premium, ação do dia, próxima dose, peso, próximo relatório | MID |
| **11-MID-check-in-1-tap** | Componente QuickMoodCheckin com 5 estados (péssimo/mal/ok/bem/ótimo) | MID |
| **12-MID-bloco-peso-progresso** | Card de peso com delta, label motivacional, gráfico mini | MID |

### Fase 5 — Doses, Diário, Relatórios (Claude Code)

| Prompt | Descrição | Complexidade |
|---|---|---|
| **13-MID-tela-doses-historico-proxima** | Lista, registrar nova, próxima, sub-seção custos | MID |
| **14-MID-diario-sintomas-perguntas** | Registro 1-tap de sintomas + perguntas pra consulta | MID |
| **15-HIGH-relatorios-lista-gerar** | Lista de relatórios + UI de "gerar novo" (chama Movimento 3) | HIGH |

### Fase 6 — IA backend (Edge Functions) — núcleo da V5

| Prompt | Descrição | Complexidade |
|---|---|---|
| **16-HIGH-edge-function-insight-do-dia** | Movimento 1: insight semanal contextualizado | HIGH |
| **17-HIGH-edge-function-memoria-perguntas** | Movimento 2: agrupa, prioriza, dedup. Gera checklist da consulta | HIGH |
| **18-HIGH-edge-function-relatorio-bilingue** | Movimento 3: PDF com versão paciente + versão médica | HIGH |

### Fase 7 — Paywall + monetização (Claude Code)

| Prompt | Descrição | Complexidade |
|---|---|---|
| **19-MID-paywall-novo-sem-dark-pattern** | Modal premium claro, valor antes do ask, trial 14d | MID |
| **20-MID-gatilhos-de-paywall-contextual** | Onde aparece o paywall (relatório, mais de 5 perguntas, etc.) | MID |

### Fase 8 — Features-stretch (ordem por prioridade)

Cada um é prompt MID ou HIGH:

- 21 — Notificações inteligentes (lembrete adaptativo de dose)
- 22 — Antecipação de efeitos por semana de tratamento
- 23 — Apple Health sync (peso, passos, FC repouso)
- 24 — Comparação com trials clínicos (SURPASS-2, STEP)
- 25 — Tradutor da consulta (áudio → resumo + glossário)
- 26 — Persona João (modo autônomo)
- 27 — Apple Watch (check-in 1-tap)
- 28 — i18n ativa (EN, ES)

### Fase 9 — Pre-ship gauntlet

| Prompt | Descrição | Complexidade |
|---|---|---|
| **29-MID-audit-completo** | `/impeccable audit` em todo o app | MID |
| **30-MID-harden-edge-cases** | i18n, overflow, offline, erro, dados reais | MID |
| **31-MID-security-review-lgpd** | LGPD compliance, RLS, secrets, logs limpos | MID |
| **32-MID-screenshots-app-store** | Skill `appstore-creative-designer` + `app-store-optimization` | MID |

### Fase 10 — Submissão

| Prompt | Descrição | Complexidade |
|---|---|---|
| **33-MID-build-eas-production** | EAS Build production iOS | MID |
| **34-LOW-submit-app-store-connect** | Submissão pra revisão Apple via Transporter ou EAS Submit | LOW |
| **35-LOW-monitorar-review** | Acompanhamento + resposta a issues do Review | LOW |

---

## 4. Skills de continuidade — `handoff` e `improve-codebase-architecture`

Duas skills do Matt Pocock entram em pontos específicos do fluxo, fora dos prompts numerados:

### `/handoff` — fim de sessão

Sempre que:
- A sessão durou mais de 2-3 horas
- Tokens estão chegando perto do limite
- Léo vai pausar o projeto por dias

→ Antes de fechar, rodar `/handoff`. Salva em `docs/handoff/HANDOFF.md` com 5 seções:
1. Estado atual
2. Decisões tomadas
3. Próximos passos
4. Riscos identificados
5. Links relevantes

Na próxima sessão, o Claude Code lê esse arquivo PRIMEIRA coisa. Resolve o problema da V4 (perda de contexto por pane do computador).

### `/improve-codebase-architecture` — auditoria periódica

Rodar a cada janela rolante de 5-10 prompts implementados. Identifica módulos rasos, oportunidades de "deepening", débito arquitetural antes de virar bola de barro.

**Não confundir** com `simplify` (corta gordura linha-a-linha). Esse opera no nível de módulo + interface.

## 5. CONTEXT.md — glossário do domínio

Criado lazily pelo `grill-with-docs` na primeira vez que um termo do domínio for resolvido. Documenta:
- Termos do domínio (memória do tratamento, Movimento 1/2/3, dose, persona Mariana, paciente acompanhado, etc.)
- Definições precisas pra evitar drift
- Glossário usado por todas as skills Matt Pocock + Impeccable

Toda decisão sobre terminologia é registrada lá. Toda violação do glossário deve ser sinalizada pelo Claude Code.

## 6. ADRs — `docs/adr/`

Architecture Decision Records. Criados pelo `grill-with-docs` ou pelo `improve-codebase-architecture` quando uma decisão satisfaz os 3 critérios:

1. **Difícil de reverter**
2. **Surpreendente sem contexto** (futuro leitor vai perguntar "por que fizeram assim?")
3. **Trade-off real** (havia alternativas)

Se 1 dos 3 falta, NÃO criar ADR. Ruído > sinal.

Formato segue o [ADR-FORMAT do Matt Pocock](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/ADR-FORMAT.md).

## 7. Múltiplas instâncias do Claude Code

DoseDay V5 opera com **até 3 instâncias paralelas** do Claude Code (uma por nível de complexidade). Cada prompt declara explicitamente sua **instância de destino** no topo.

### Como Léo distribui prompts

```
Prompt NN-LOW-X  → Code-LOW  (Caveman ON, worktree dose-day-v5-low/)
Prompt NN-MID-Y  → Code-MID  (Caveman OFF, worktree dose-day-v5-mid/)
Prompt NN-HIGH-Z → Code-HIGH (Caveman OFF, worktree dose-day-v5-high/)
```

### Anti-conflito

Antes de mandar prompt pra qualquer instância, Léo verifica:

- [ ] A branch alvo já existe ou precisa criar?
- [ ] Alguma outra instância está mexendo na mesma pasta/arquivo?
- [ ] Há `HANDOFF-*.md` recente da instância destino que precisa ser lido?
- [ ] A última mudança na branch já foi rebaseada em `main`?

Em caso de sobreposição: **espera. Faz uma de cada vez.** Throughput perdido > caos de merge.

### Cada instância mantém seu HANDOFF

Ao fim de sessão longa de uma instância:

```bash
# Dentro da pasta da instância (ex.: dose-day-v5-low/)
/handoff  # do skill Matt Pocock
# Salva em ../dose-day-v5/docs/handoff/HANDOFF-low.md (caminho relativo via worktree)
```

Na próxima sessão dessa instância, primeiro coisa que faz é ler o próprio HANDOFF.

## 8. Princípio anti-pirraça final

**Toda mudança no escopo da V5 atualiza ANTES o `/docs/plano-estrategico-v5.md`.**

Se o Léo decidir mudar algo no meio do caminho (vai acontecer), o plano vira primeiro. Depois o prompt afetado é re-escrito. Nunca o contrário.

Isso evita o cenário "perdi tudo" que aconteceu na V4.

E pra reforçar: `/handoff` ao fim de cada sessão longa = backup de contexto. Plano + skills-stack + design-system + CONTEXT.md + HANDOFF.md = memória completa do projeto.

---

**Fim do documento.**
