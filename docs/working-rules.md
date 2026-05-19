# Working Rules — DoseDay V5

> Regras operacionais detalhadas. CLAUDE.md tem a versão resumida. Carregar (`@docs/working-rules.md`) quando precisar do detalhe operacional.

## Como conversar com Léo (regra permanente)

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

---

## Regra obrigatória — consultar aprendizados antes de escrever qualquer prompt ou comando

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

---

## Regra obrigatória — mensagem que Léo cola no Claude Code

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

## Screenshots em PRs — Fluxo (a/b/c)

**Critério:** Quando um prompt pede "N screenshots no PR", o resultado DEVE ser imagens reais (PNG), nunca descrição textual.

### Fluxo correto

**(a) Capturar via MCP:**
```bash
Claude Code: mcp__react-native__screenshot
Salva em:    .impeccable/critique/screenshots/<prompt>-<n>.png
```

**(b) Anexar ao PR:**
Opção 1 — via comentário:
```bash
gh pr comment <PR> --body "![desc](url)"
```
Opção 2 — mover pra repo:
```bash
assets/screenshots/  # copiar PNG aqui
```

**(c) Embedar no PR description:**
```markdown
![alt text](assets/screenshots/prompt-1.png)
```

### ⚠️ O que NÃO é screenshot (fake)

Texto descrevendo o conteúdo de uma screenshot:
```
❌ "A tela mostra um botão azul no canto superior esquerdo"
```

Causa: prejudica verificabilidade do PR e quebra a auditoria visual.

**Aprendizado:** Registrado no Prompt 13. Isso foi descoberto por experiência — screenshots fake passam em PR mas geram problemas em QA/produção quando código não corresponde à descrição.

---

## Repositório

- GitHub: `github.com/leomeirae/doseday-v5`
- Local principal: `/Users/leofrancaia/Desktop/dose-day-v5/` (Léo + revisão)
- Branch padrão: `main` (configurada como default no GitHub)
- Branches de feature: `feature/NN-area-curta` (criadas automaticamente pelo Agent View)
- Worktrees: `.claude/worktrees/` (criados automaticamente pelo Agent View, um por sessão)

---

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
