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
8. **`docs/learnings.md`** — aprendizados acumulados. Ler ANTES de qualquer prompt MID/HIGH (regra obrigatória — ver "Regra obrigatória — consultar aprendizados" abaixo)
9. **`docs/karpathy.md`** — Karpathy Guidelines completo (regra 22). Carregar em prompts MID/HIGH.
10. **`docs/working-rules.md`** — Regras operacionais detalhadas. Carregar quando precisar do detalhe operacional.

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

Léo é PO sênior mas **não tem background técnico**. Mantra: **didático sempre, calma > velocidade, guiar passo a passo, confirmar > assumir, sem jargão**. Detalhe completo em [`docs/working-rules.md`](docs/working-rules.md). Aplica-se a Cowork + Claude Code.

### Regra obrigatória — consultar aprendizados

Antes de prompts MID/HIGH, ler `docs/learnings.md`. Detalhe operacional em [`docs/working-rules.md`](docs/working-rules.md).

### Regra obrigatória — mensagem cola Claude Code

Toda mensagem pra colar no Claude Code DEVE conter: caminho do prompt, handoff anterior, skills obrigatórias, inputs principais. Template completo em [`docs/working-rules.md`](docs/working-rules.md).

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
14. **RTK calibrado por tipo de comando** (detalhe em [`~/.claude/RTK.md`](~/.claude/RTK.md)). Usar em: `rtk lint`, `rtk git commit/log/diff`, `npm install/test`, `eas build` (economia 60-97%). NÃO usar em: arquivos <200 linhas, grep com poucos hits. Recalibrar a cada 5-10 prompts: `rtk gain`
15. **MODO PADRÃO: Claude Code direto (`claude`) com 1 prompt por vez.** Sequencial, sem worktree, sem dashboard. Mais econômico e simples. Agent View (`claude agents`) fica reservado pra quando precisar paralelizar 2+ prompts em áreas distintas. Branchs criadas manualmente (`git checkout -b feature/NN-...`). Detalhes em `docs/architecture.md` seção 11.0
16. **Caveman NÃO É USADO no DoseDay V5.** Apesar de instalado, decisão estratégica: economia vem de RTK + boas práticas, sem perder clareza de respostas
17. **Modelo Haiku 4.5 em prompts LOW.** Sonnet/Opus reservado pra prompts MID/HIGH com decisão arquitetural. Antes de dispatchar prompt LOW no Agent View, trocar via `/model` pra Haiku
18. **Cleanup imediato** após merge: `Ctrl+X` 2× na sessão concluída do Agent View. Libera worktree e quota
19. **Peek antes de atachar.** `Space` mostra resumo da sessão. Só atachar (`Enter`) se realmente precisar interagir
20. **`react-native-devtools-mcp` instalado globalmente.** Claude Code usa as 16 ferramentas (`screenshot`, `js_eval`, `tap`, `scroll`, etc.) para validar, sem delegar ao Léo. **Screenshots no PR DEVEM ser imagens reais (PNG em `assets/screenshots/`), não descrições textuais.** Detalhe em [`docs/working-rules.md`](docs/working-rules.md) + `docs/architecture.md` seção 15
21. **SEMPRE salvar o plano em arquivo ANTES de executar.** Após Léo aprovar o plano de execução (Skills + Plano + Riscos + Arquivos + Validação), Claude Code DEVE usar a skill `superpowers:writing-plans` para persistir o plano em `docs/superpowers/plans/YYYY-MM-DD-<slug>.md` antes de tocar em código. Sem isso, `/clear` ou perda de sessão = re-planejamento divergente. Plano é fonte-de-verdade no repo, não memória da sessão
22. **Karpathy Guidelines aplicadas em TODA tarefa não-trivial** ([`docs/karpathy.md`](docs/karpathy.md)). No plano, declarar: (a) assumptions, (b) could 50 lines do this?, (c) cada linha traceia ao pedido, (d) success criteria verificáveis. Em PRs, diff cirúrgico — zero "drive-by refactoring"
23. **`/clear` ao trocar de tarefa.** Depois de mergear um PR, antes de dispatchar o próximo prompt, rodar `/clear` pra liberar messages acumuladas. Sessão nova começa com ~25k baseline em vez de acumular 80-100k. Crítico em prompts MID/HIGH.
24. **`/compact Focus on <tema>` a cada ~40 mensagens** dentro de uma tarefa longa. Exemplo: `/compact Focus on architectural decisions and current task state`. Preserva decisões, descarta fluff. Salvar o summary resultante em `docs/handoff/HANDOFF-prompt-NN.md` antes de continuar.
25. **`@file path/to/file.md`** no Claude Code em vez de paste de conteúdo. Carrega arquivo sob demanda, sai do contexto quando não precisa. Paste de arquivo grande no chat vira dead weight pelo resto da sessão. Aplica-se a outputs de bash > 50 linhas também — salvar em arquivo e referenciar.
26. **`/btw <pergunta>`** pra perguntas laterais durante execução de prompt. Roda em canal paralelo, não injeta resposta na conversa principal. Evita custo de interromper Claude Code no meio de uma tarefa multi-step.

---

## Auxiliares por tipo de tarefa (carregar com `@file`)

Tabela de referência rápida — quando começar uma tarefa, carregue os auxiliares apropriados via `@file` no Claude Code para ter acesso ao detalhe completo sem inflar CLAUDE.md.

| Tipo de tarefa | Carregar via `@file` + skills |
|---|---|
| Decisão técnica em prompt MID/HIGH | `@docs/karpathy.md`, `@docs/learnings.md`, handoff anterior |
| Schema Supabase / migration / RLS | `@docs/architecture.md`, `@docs/learnings.md`, skill `supabase-postgres-best-practices` |
| UI / tela nova / refazer tela | `@docs/DESIGN.md`, skill `/impeccable craft` ou `/impeccable distill` |
| Tab bar / toolbar / navegação | `@docs/DESIGN.md`, skill `liquid-glass:liquid-glass` |
| IA / Edge Function Anthropic SDK | `@docs/architecture.md` (seção IA), `@docs/learnings.md`, skill `claude-api` |
| Bash longo / leitura de arquivo grande | `@~/.claude/RTK.md` |
| Glossário do domínio (Mariana, Movimento 1/2/3, dose) | `@CONTEXT.md` |
| Plano multi-step persistido | `@docs/karpathy.md`, skill `superpowers:writing-plans` |
| Refresh "como conversar com Léo" | `@docs/working-rules.md` |
| Escolher skill apropriada | `@docs/skills-stack.md` |
| Refactor grande isolado | `@docs/working-rules.md` (Agent View + worktrees), skill `superpowers:using-git-worktrees` |
| Pre-ship a11y/performance | skill `/impeccable audit` |
| Pre-ship edge cases | skill `/impeccable harden` |
| Security/LGPD review | skill `security-review` |
| Fim de sessão / antes de pausar | skill `handoff` |

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

## Stack de skills do Claude Code

43 skills disponíveis — tabela mestre + uso por tipo de tarefa em [`docs/skills-stack.md`](docs/skills-stack.md).

---

## Pasta de referência (NÃO copiar)

`/Users/leofrancaia/Desktop/Dose-Day-Jules-1/` é o codebase da V4. Use **apenas como referência consciente** — schema de Supabase, padrões que funcionaram, ideias de componentes. **Não copy-paste.** Tudo é reescrito limpo no V5.

---

## Otimização de tokens — RTK

Hook global em `~/.claude/settings.json` comprime saída de Bash em 60-90%. Comandos explícitos `rtk read/grep/ls/diff/summary` pra leituras grandes. Detalhe + tabela de calibração em [`~/.claude/RTK.md`](~/.claude/RTK.md). Diagnóstico: `rtk gain`.

---

## Repositório + Paralelismo

Repo: `github.com/leomeirae/doseday-v5` (default branch `main`). Branches feature: `feature/NN-area-curta`. Paralelismo via Agent View (`claude agents`) — detalhe + cheatsheet em [`docs/working-rules.md`](docs/working-rules.md).

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

## Histórico

> Tabela de prompts executados movida para [`docs/history.md`](docs/history.md). Atualizar lá.

---

**Fim do CLAUDE.md.**
