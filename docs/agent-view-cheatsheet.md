# Agent View — Cheatsheet do DoseDay V5

**Última atualização:** 15 de maio de 2026
**Requer:** Claude Code v2.1.139+
**Documentação oficial:** https://code.claude.com/docs/en/agent-view

---

## Comando único para abrir

```bash
cd /Users/leofrancaia/Desktop/dose-day-v5
claude agents
```

Abre o dashboard. Você vê todas as sessões em background numa tela só.

---

## Atalhos de teclado essenciais

| Atalho | O que faz |
|---|---|
| `↑` / `↓` | Mover entre sessões na lista |
| **Enter** (em sessão) | **Attach** — entra na sessão completa |
| **Space** | **Peek** — abre painel rápido com último output / pergunta pendente |
| **Type** + Enter | Responde direto no peek (sem entrar na sessão) |
| `→` (em sessão) | Attach (igual Enter) |
| `←` (em input vazio) | **Detach** — volta pro dashboard sem fechar sessão |
| `Esc` | Fecha peek panel · clear input · sair |
| `Tab` (input vazio) | Browse subagents disponíveis |
| `Ctrl+S` | Trocar grouping (estado ↔ diretório) |
| `Ctrl+T` | Pin / unpin sessão (vai pro topo) |
| `Ctrl+R` | Rename sessão |
| `Ctrl+X` | **Stop sessão** (1ª vez) · **delete sessão** (2ª vez em 2s) |
| `Shift+↑` / `Shift+↓` | Reordenar sessões |
| `Shift+Enter` | Dispatch + attach imediato |
| `?` | Mostra todos os atalhos contextualmente |

---

## Como dispatchar nova sessão

No input no rodapé do Agent View, digita o prompt e Enter.

| Exemplo de dispatch | Efeito |
|---|---|
| `Leia docs/prompts/03-LOW-X.md e me apresente o plano de execução. Aguardo aprovação.` | Cria sessão executando o prompt |
| `@security-reviewer audita /supabase/functions/insight-do-dia` | Dispatcha subagent custom como main agent |
| `Shift+Enter` (em vez de Enter) | Dispatch + attach imediato |

---

## Estados visuais — leitura rápida

| Cor / ícone | Significa |
|---|---|
| 🟢 **Verde** (Completed) | Tarefa terminou com sucesso. Revisar e aceitar |
| 🟡 **Amarelo** (Needs input) | Sessão esperando você (pergunta, escolha, aprovação) |
| ⚪ **Animado** (Working) | Claude Code está executando |
| ⚫ **Dimmed** (Idle) | Sem nada a fazer, esperando próximo prompt |
| 🔴 **Vermelho** (Failed) | Erro. Peek pra ver causa |
| ⬛ **Cinza** (Stopped) | Pausada via Ctrl+X (mas não deletada) |

### Bolinha colorida (status do PR)

| Cor | Estado |
|---|---|
| 🟡 Amarelo | PR aguardando checks ou review, ou checks falharam |
| 🟢 Verde | Checks passaram, PR pronto pra merge |
| 🟣 Roxo | PR mergeado |
| ⚪ Cinza | Draft ou closed |

---

## Filtros no input

| Filtro | Mostra |
|---|---|
| `a:<nome>` | Sessões rodando o agent nomeado |
| `s:<estado>` | Sessões nesse estado: `s:working`, `s:blocked`, `s:completed` |
| `#<numero>` ou URL de PR | Sessão trabalhando nesse PR |

---

## Comandos no shell (fora do Agent View)

| Comando | O que faz |
|---|---|
| `claude agents` | Abre o dashboard |
| `claude attach <id>` | Atacha numa sessão direto (sem abrir dashboard) |
| `claude logs <id>` | Mostra output recente de uma sessão |
| `claude stop <id>` | Para uma sessão |
| `claude respawn <id>` | Restart uma sessão parada (preserva conversa) |
| `claude respawn --all` | Restart todas as sessões paradas (use após o Mac dormir) |
| `claude rm <id>` | Remove sessão da lista (limpa worktree se não tiver mudanças não-commitadas) |
| `claude --bg "prompt"` | Dispatch direto do shell (sem abrir dashboard) |
| `claude --version` | Confirma versão (precisa ≥ 2.1.139) |

---

## Troubleshooting

### Agent View não abre, mostra lista de subagents e sai

Versão antiga ou ambiente não suportado.

```bash
claude --version   # confere
claude update      # atualiza se necessário
```

### Sessões aparecem como "Failed" depois do Mac acordar

Sessões não sobrevivem a sleep/shutdown. Restart todas:

```bash
claude respawn --all
```

### Sessão lenta depois de attach

Após 1h idle, supervisor para o processo. Atachar inicia novo processo a partir do estado salvo. Demora alguns segundos. Sessões `Working` ou `Needs input` nunca param.

### `.claude/worktrees/` enchendo

Worktrees são removidos quando você deleta a sessão (`Ctrl+X` 2×). Se sobrou lixo:

```bash
git worktree list
git worktree remove <path>   # pra cada órfão
```

### Cannot open agents — N background task(s) running

A sessão atual tem trabalho em background (subagent, monitor, comando shell rodando). Roda `/tasks` na sessão pra ver o que está rodando. `/bg` confirma backgrounding e abandona o trabalho.

### `/bg` não funciona dentro da sessão

Algumas configurações em conflito. Tente `claude agents` direto numa aba nova.

---

## Permission mode — atenção crítica

Sessões em background herdam permission mode do diretório. Modos `auto` ou `bypassPermissions` **são proibidos** no DoseDay V5 — o Léo precisa aprovar cada plano. Default deve ser `default` ou `plan`.

Verificar com:

```bash
cat ~/.claude/settings.json | grep -i defaultMode
```

Override por sessão:

```bash
claude agents --permission-mode plan
```

---

## Quando ATACHAR vs PEEK

| Situação | Ação |
|---|---|
| Sessão diz "Needs input" e você sabe a resposta | **Space** (peek) + digita resposta direto |
| Sessão diz "Needs input" mas precisa discutir o plano com Cowork primeiro | **Space** (peek), copia o plano, cola no Cowork |
| Sessão diz "Working" há muito tempo (>10 min sem progresso) | **Enter** (attach) pra ver detalhes |
| Sessão diz "Completed" | **Enter** (attach) pra revisar e fazer commit/PR |
| Sessão diz "Failed" | **Enter** (attach) pra ver erro e decidir se retry ou deletar |
| Curiosidade rápida do que tá acontecendo | **Space** (peek) sempre primeiro |

---

## Workflow padrão do DoseDay V5 com Agent View

```
1. Léo: cd ~/Desktop/dose-day-v5 && claude agents
2. Léo digita: "Leia docs/prompts/03-LOW-...md e me apresente o plano. Aguardo aprovação."
3. Agent View cria sessão "Working"
4. Status muda pra "Needs input" (amarelo)
5. Léo: Space → peek → vê plano
6. Léo cola plano no Cowork (este chat) → valida com Claude
7. Léo volta no Agent View, no peek input → "Aprovado, pode executar"
8. Status volta pra "Working"
9. Quando finaliza: status "Completed" + bolinha amarela (checks rodando)
10. Léo: Enter → attach → vê resumo → roda /handoff
11. Léo: ← detach
12. Léo (Aba 4): gh pr merge --squash --delete-branch
13. Status do PR vira roxo (merged)
14. Léo: Ctrl+X 2× → deleta sessão + worktree
15. Pronto pro próximo prompt
```

---

## Diferença de modelos de trabalho

| Modo | Quando |
|---|---|
| **1 sessão sequencial** | Bootstrap, pre-ship, mudanças estruturais |
| **2 sessões paralelas** | LOW + MID em áreas distintas (microcopy + tela) |
| **3 sessões paralelas** | LOW + MID + HIGH (UI + tela + edge function) |

Limite recomendado: **3 sessões simultâneas no DoseDay V5**. Mais que isso, quota some rápido.

---

## Coexistência com outros workflows

| Funcionalidade | Como usar com Agent View |
|---|---|
| **RTK (hook PreToolUse)** | Funciona normal em toda sessão. `rtk gain` continua mostrando estatística global |
| **Skills (Impeccable, superpowers, etc.)** | Funcionam normal dentro de cada sessão. Lê PRODUCT.md + DESIGN.md + CLAUDE.md |
| **Subagents internos** | Skill `superpowers:dispatching-parallel-agents` ativa quando precisa. Subagents NÃO aparecem como linhas separadas no Agent View |
| **Agent Teams** | **Não usamos.** Experimental + complexo + caro |

---

**Fim do cheatsheet.**
