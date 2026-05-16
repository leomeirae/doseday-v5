# Guia do Léo — passo a passo de cada ação

**Quem usa este guia:** Léo (PO do projeto).
**Pra que serve:** evitar erro e perda de tempo. Toda vez que ficar em dúvida do que clicar/digitar, abre este guia.
**Princípio:** uma coisa de cada vez. Sem pressa. Sem decorar.

---

## Mapa do projeto — onde mora cada coisa

```
/Users/leofrancaia/Desktop/dose-day-v5/    ← Pasta principal do projeto. Tudo começa aqui
    ├── CLAUDE.md                          ← "Memória" que o Claude Code lê toda vez que abre
    ├── docs/
    │   ├── plano-estrategico-v5.md        ← Estratégia do produto (revisar quando mudar escopo)
    │   ├── skills-stack.md                ← Quais skills o Claude Code usa em cada caso
    │   ├── architecture.md                ← Estrutura técnica do app
    │   ├── design-system-preview.md       ← Cores, tipografia, regras visuais
    │   ├── guia-do-leo.md                 ← Este arquivo
    │   ├── PRODUCT.md                     ← (vai existir após Prompt 02)
    │   ├── DESIGN.md                      ← (vai existir após Prompt 02)
    │   └── prompts/
    │       ├── README.md                  ← Regras de como prompts funcionam
    │       └── NN-COMPLEXIDADE-area.md    ← Cada prompt em ordem
    └── CONTEXT.md                         ← Glossário do domínio (gerado conforme conversamos)

/Users/leofrancaia/Desktop/Dose-Day-Jules-1/    ← Pasta da V4 antiga. SÓ PRA CONSULTA. Não copiar.
```

---

## Conceitos básicos em 1 frase cada

| Conceito | Em 1 frase |
|---|---|
| **Cowork (este chat)** | Onde Léo e eu (Claude consultor) conversamos estratégia e preparamos prompts |
| **Claude Code** | Programa no terminal que recebe prompts e executa código. Não é o Cowork |
| **Prompt** | Texto estruturado que Léo cola no Claude Code. Cada prompt está em `docs/prompts/` |
| **Plano** | O Claude Code lê o prompt e devolve um plano antes de executar. Léo aprova |
| **Instância do Claude Code** | Uma aba do terminal rodando o Claude Code. Cada instância é independente |
| **Branch (Git)** | Linha paralela de mudanças no código. Permite trabalhar sem mexer no que está pronto |
| **Worktree (Git)** | Pasta física separada que aponta pro mesmo projeto. Permite ter 2+ instâncias sem conflito |
| **PRODUCT.md** | Documento gerado uma vez. Diz quem é o usuário, o tom, o que NÃO fazer |
| **DESIGN.md** | Documento gerado uma vez. Diz cores, fontes, espaçamento, componentes |
| **`/impeccable teach`** | Comando que cria PRODUCT.md e DESIGN.md a partir de entrevista guiada |
| **RTK** | Ferramenta que economiza tokens. Já instalada. Funciona sozinha |
| **Caveman** | Modo "respostas curtas" do Claude Code. Liga só em tarefas simples |

---

## O ciclo padrão de cada prompt

**Esta é a coreografia básica. Sempre igual. Memorize o ritmo:**

```
1. Léo pede a Claude Cowork: "preciso fazer X"
2. Cowork (este chat) cria um PROMPT estruturado em docs/prompts/NN-...md
3. Léo abre o Claude Code no terminal
4. Léo COLA o prompt no Claude Code
5. Claude Code lê o prompt + lê CLAUDE.md + lê os docs referenciados
6. Claude Code DEVOLVE um plano (não executa ainda)
7. Léo lê o plano
   ┌─ aprova? → "ok, pode executar"
   └─ tem dúvida? → cola o plano aqui no Cowork e me pergunta
8. Claude Code executa
9. Léo verifica resultado (testa no simulador, lê commits)
10. Próximo prompt
```

**Regra de ouro:** entre o passo 6 e o 8, NUNCA tem pressa. É o ponto de aprovação. Se você não entendeu o plano, NÃO aprova. Cola aqui comigo.

---

## Como evitar sobrescrita de código (o medo principal)

Sobrescrita acontece quando duas instâncias do Claude Code mexem no mesmo arquivo ao mesmo tempo. Pra nunca acontecer:

### Regras simples — leia toda vez antes de começar nova sessão

1. **Você é o único roteador.** Só você decide qual prompt vai pra qual instância. Claude Code não decide isso sozinho
2. **1 instância = 1 branch.** Nunca duas instâncias na mesma branch
3. **1 instância = 1 worktree (pasta física).** Garante isolamento total
4. **Antes de mandar prompt novo, faça o checklist:**
   - [ ] Qual instância vai receber? (LOW, MID, ou HIGH)
   - [ ] Essa instância está em qual branch?
   - [ ] Tem outra instância mexendo na mesma pasta/arquivo agora?
   - [ ] A última feature dessa instância foi mergeada em `main` ou ainda está pendente?
5. **Se duas tarefas tocam o mesmo arquivo, FAÇA UMA DE CADA VEZ.** Throughput perdido é melhor que conflito de merge

### Pra começar: trabalhe com 1 instância só

Pelos primeiros 3-4 prompts (bootstrap, migração de arquivos, conexão Supabase, geração do PRODUCT.md/DESIGN.md), use **apenas a instância principal**. Não abre worktrees ainda. Só após você estar confortável com o ciclo, escalamos pra 2-3 instâncias.

---

## Paralelismo via Agent View (`claude agents`)

**Substituiu o setup manual de worktrees.** Worktrees são criados **automaticamente** pelo Agent View. Você não cria nada à mão.

**Como abrir:**

Passo 1 — Abrir terminal e ir pra pasta do projeto:
```bash
cd /Users/leofrancaia/Desktop/dose-day-v5
```

Passo 2 — Abrir o Agent View:
```bash
claude agents
```

Pronto. Você vê o dashboard com todas as sessões em background numa tela só.

**Importante:** mantém uma **2ª aba** aberta na mesma pasta (sem `claude`), só pra `gh pr merge`, `git pull`, `rtk gain`, etc.

### Como dispatchar prompts

Dentro do Agent View, digita no input embaixo:

```
Leia docs/prompts/03-LOW-...md e me apresente o plano de execução. Aguardo aprovação.
```

Enter. Cria sessão background com worktree próprio em `.claude/worktrees/`.

### Como acompanhar sessões

| Estado (cor no dashboard) | O que fazer |
|---|---|
| **Working** (animado) | Aguardar |
| **Needs input** (amarelo) | `Space` (peek) → responde direto sem entrar |
| **Completed** (verde) | `Enter` (attach) → revisar e fazer PR |
| **Failed** (vermelho) | `Enter` → ver erro |

### Quando paralelizar vs sequencializar

| Cenário | Modo |
|---|---|
| 2 prompts no MESMO arquivo | Sequencial (1 de cada vez) |
| 2 prompts em áreas DIFERENTES (UI vs Edge Function) | Paralelo (dispatcha os 2 sem esperar) |
| Pre-ship (audit, harden, security) | Sempre sequencial |

**Máx 3 sessões paralelas no DoseDay V5.** Mais que isso, quota some rápido.

### Atalhos essenciais

| Atalho | Ação |
|---|---|
| `Space` | Peek (ver sessão sem entrar) |
| `Enter` | Attach (entrar na sessão) |
| `←` (em input vazio) | Detach (voltar pro dashboard) |
| `Ctrl+X` (1×) | Stop sessão |
| `Ctrl+X` (2× em 2s) | Delete sessão + worktree |
| `?` | Mostra todos os atalhos |

### Cheatsheet completo

Tudo em `docs/agent-view-cheatsheet.md` — atalhos, comandos, troubleshooting.

---

## Caveman — não usamos

**Decisão tomada:** Caveman foi instalado mas NÃO vamos usar no DoseDay V5.

Por quê: economia de tokens vem por outras vias (RTK + boas práticas). Caveman teria trade-off de perder clareza nas respostas. Como Léo é PO e precisa entender bem cada plano, clareza > economia extra.

Não precisa lembrar nem ativar nada.

---

## RTK — não precisa fazer nada

Já está instalado e rodando sozinho. Quando o Claude Code rodar `git status`, `npm test`, `tsc --noEmit`, etc., o RTK intercepta e comprime a saída automaticamente.

**O que você pode fazer pra confirmar que está funcionando:**

1. Abre uma aba qualquer do terminal
2. Vai pra pasta do projeto: `cd ~/Desktop/dose-day-v5`
3. Roda: `rtk gain`
4. Se aparecer estatística de tokens economizados, está OK.

(Faça isso ocasionalmente, sem pressa.)

---

## O que cada instância sabe fazer melhor

| Instância | Tipo de prompt que recebe | Exemplo no DoseDay V5 |
|---|---|---|
| **Code-LOW** | 1 arquivo, mudança cirúrgica | "Renomear `Endo` pra `Profissional` em todos os componentes" |
| **Code-MID** | Feature pequena, 3-5 arquivos | "Criar tela de Doses com lista + sub-seção Custos" |
| **Code-HIGH** | Lógica complexa, server-side, IA | "Edge Function que gera Insight do Dia via Claude API" |

**Léo, sua única decisão por prompt:** "isso é LOW, MID ou HIGH?" Se em dúvida, pergunta no Cowork e eu te ajudo a classificar.

---

## Quando algo der errado

Cenários comuns e o que fazer:

| Sinal | O que fazer |
|---|---|
| Claude Code começou a executar sem você aprovar | "Pare. Não aprovei. Mostra o plano primeiro." |
| Plano do Claude Code parece confuso | Cola aqui no Cowork. Eu te ajudo a entender |
| Vejo arquivo sumindo ou aparecendo coisa estranha | Não dê mais prompt. Roda `git status` e cola aqui |
| Duas instâncias mexendo no mesmo arquivo | Para tudo. Roda `git status` em ambas. Resolva o conflito antes de continuar |
| Tokens estourando rápido | Roda `/handoff` no Claude Code, fecha a aba, abre nova. Continua do HANDOFF.md |
| Não sei se uma feature está pronta | Roda no simulador. Se UI: `/impeccable critique` |
| Quero mudar o escopo de um prompt no meio | Cancela no Claude Code (Ctrl+C). Volta pro Cowork. Refazemos o prompt |

---

## Ritmo recomendado pro projeto

| Ritmo | Quando |
|---|---|
| **1 prompt por dia** | Fase de bootstrap (00-03) — calma é mais importante que velocidade |
| **2-3 prompts por dia** | Fase de esqueleto (04-07) — você ainda valida cada um com cuidado |
| **5+ prompts por dia** | Fase de features (08+) — já tem ritmo, instâncias paralelas funcionando |

**Sinal de alerta:** se você se sentir perdido, **pare imediatamente** e volta pro Cowork. Não tem urgência. Custo de fazer errado > custo de pausar e re-alinhar.

---

## Histórico de prompts executados

(Mantenha esta tabela atualizada manualmente, ou peça pro Claude Code atualizar ao fim de cada execução)

| Data | Prompt | Instância | Branch | Status | PR/Commit |
|---|---|---|---|---|---|
| — | — | — | — | — | — |

---

**Fim do guia. Atualizado conforme o projeto evolui.**
