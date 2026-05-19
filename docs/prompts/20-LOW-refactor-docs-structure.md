# Prompt 20-LOW-refactor-docs-structure

**Branch:** `feature/20-refactor-docs-structure`
**Modelo recomendado:** Haiku 4.5 (operação mecânica, zero decisão arquitetural)
**Pré-requisito:** PR #23 (Relatórios V1) mergeado em `main`. Sem dependência de código.

---

## Contexto

Diagnóstico realizado pelo Cowork: Claude Code carrega ~47-52k tokens de docs base **a cada prompt**, sendo `docs/architecture.md` (895 linhas) sozinho responsável por ~25-30k tokens. Isso acelera o consumo de janela de contexto em prompts MID/HIGH e força `/clear` precoces.

**Estado atual:**

| Arquivo | Linhas | Conteúdo |
|---|---|---|
| `CLAUDE.md` | 357 | Instruções + 22 regras + stack + skills table + tabela histórico (18 prompts) + Karpathy |
| `AGENTS.md` | 72 | Entry-point pra Codex/Cursor |
| `docs/architecture.md` | **895** | Estrutura + stack + schema + 40 aprendizados + decisões + seções 1-16 |
| `docs/handoff/*.md` | 5+ arquivos | Handoffs 01, 02, 03, 04, 13... acumulados na raiz |

**Objetivo:** dividir `architecture.md` e `CLAUDE.md` em arquivos menores, mantendo o conteúdo intacto. Claude Code passa a ler só os arquivos enxutos por default, e consulta os arquivos detalhados sob demanda quando relevante.

---

## Tarefa

Operação **cirúrgica de split**. Zero reescrita. Mover blocos de conteúdo de origem pra destino, atualizar referências cruzadas, validar greps.

### Estado-alvo

| Arquivo | Linhas esperadas | Conteúdo |
|---|---|---|
| `CLAUDE.md` | ~200 | Quem é Léo, como conversar, 22 regras anti-pirraça, stack resumida, skills resumidas, **Karpathy Guidelines** (manter inline), próximo prompt, links pros docs auxiliares. **REMOVER:** tabela histórico inteira |
| `AGENTS.md` | 72 (inalterado) | — |
| `docs/architecture.md` | ~250 | Stack detalhada, estrutura de pastas, schema Supabase resumido, padrões de código, seções 1-16 originais (mantidas) **MENOS** os aprendizados |
| `docs/learnings.md` | **NOVO** ~500 | Aprendizados 1-40 (cortados de architecture.md). Mesmo formato `### Aprendizado N — título` |
| `docs/history.md` | **NOVO** ~50 | Tabela "Histórico" do CLAUDE.md (todos os prompts executados, data, resultado, commit) |
| `docs/handoff/archive/` | **NOVA pasta** | Mover `HANDOFF-prompt-01.md` até `HANDOFF-prompt-13.md` pra cá. **Manter no raiz** apenas os handoffs do Prompt 14 em diante |

### Passo a passo

1. **Confirmar baseline antes:**
   - `wc -l CLAUDE.md AGENTS.md docs/architecture.md` — registrar contagem original
   - `grep -rn "architecture.md" CLAUDE.md docs/ --include="*.md" | wc -l` — contar referências cruzadas atuais
   - `grep -rn "Aprendizado" docs/architecture.md | wc -l` — contar aprendizados pra mover

2. **Criar `docs/learnings.md`:**
   - Copiar do `docs/architecture.md` TODA a seção de aprendizados (procurar header `## Aprendizados` ou similar)
   - Adicionar header no topo: `# Aprendizados — DoseDay V5` + `> Aprendizados acumulados após cada prompt. Atualizar este arquivo (não architecture.md) quando registrar novos.`
   - Manter formato exato dos aprendizados — zero reescrita

3. **Criar `docs/history.md`:**
   - Copiar do `CLAUDE.md` a seção `## Histórico (a ser preenchido após cada prompt)` + tabela completa
   - Adicionar header: `# Histórico de Prompts Executados — DoseDay V5` + `> Atualizar este arquivo ao final de cada prompt mergeado.`

4. **Atualizar `docs/architecture.md`:**
   - Remover a seção de aprendizados inteira (já copiada pra `learnings.md`)
   - No lugar, inserir: `## Aprendizados\n\n> Aprendizados movidos para [`docs/learnings.md`](./learnings.md) para reduzir consumo de contexto. Atualizar lá quando registrar novos.`
   - **NÃO mexer em mais nada.** Seções 1-16 ficam inalteradas

5. **Atualizar `CLAUDE.md`:**
   - Remover a seção `## Histórico (a ser preenchido após cada prompt)` + tabela
   - No lugar, inserir: `## Histórico\n\n> Tabela de prompts executados movida para [`docs/history.md`](docs/history.md). Atualizar lá.`
   - Atualizar a seção `## ⚠️ Leia primeiro, sempre`:
     - Adicionar item: `8. **docs/learnings.md** — aprendizados acumulados. Ler ANTES de qualquer prompt MID/HIGH (regra obrigatória — ver "Regra obrigatória — consultar aprendizados" abaixo)`
   - **NÃO mexer em mais nada** (Karpathy fica inline, regras 1-22 ficam inline, stack fica inline)

6. **Arquivar handoffs antigos:**
   - `mkdir -p docs/handoff/archive`
   - `mv docs/handoff/HANDOFF-prompt-01.md docs/handoff/HANDOFF-prompt-02.md docs/handoff/HANDOFF-prompt-03.md docs/handoff/HANDOFF-prompt-04.md docs/handoff/HANDOFF-prompt-13.md docs/handoff/archive/`
   - Conferir se há outros HANDOFF-prompt-NN com N < 14 e mover também

7. **Atualizar referências cruzadas:**
   - `grep -rn "architecture.md" CLAUDE.md docs/ --include="*.md"` — onde a seção de aprendizados era referenciada, agora aponta pra `learnings.md`
   - Procurar referências a "Aprendizado #N em architecture.md" — atualizar pra "Aprendizado #N em learnings.md"
   - **NÃO criar links novos.** Só atualizar os existentes

8. **Validação final:**
   - `wc -l CLAUDE.md docs/architecture.md docs/learnings.md docs/history.md` — confirmar contagens
   - `ls docs/handoff/` — deve mostrar só HANDOFF-prompt-14.md em diante + pasta `archive/`
   - `ls docs/handoff/archive/` — deve mostrar HANDOFF-prompt-01 a 13
   - `grep -rn "## Aprendizado" docs/architecture.md` — deve retornar 0 ou só o redirect line
   - `grep -rn "## Aprendizado" docs/learnings.md` — deve retornar ≥40

---

## Skills obrigatórias

Nenhuma skill técnica. Operação puramente mecânica de manipulação de markdown.

Skills opcionais:
- `superpowers:writing-plans` — **NÃO usar.** Regra 21 é pra MID/HIGH. Esse prompt é LOW e cirúrgico

---

## Karpathy checks (declarar no plano)

| Disciplina | Aplicação esperada |
|---|---|
| Assumptions | Nenhuma referência externa ao repo aponta pra seções específicas de `architecture.md`. Confirmar via grep antes de cortar |
| Could 50 lines do this? | Não. Refactor de ~1300 linhas distribuídas. Mas cada operação individual é trivial |
| Surgical changes | Zero reescrita. Apenas `cut/paste` + atualização de referências. Se for tentado simplificar conteúdo, parar e perguntar |
| Goal-driven | Sucesso = grep counts batem + linhas finais dentro do range esperado + nenhum link quebrado |

---

## Critérios de aceitação

- [ ] `docs/learnings.md` criado com aprendizados 1-40 (ou todos os registrados hoje)
- [ ] `docs/history.md` criado com tabela completa de prompts executados
- [ ] `docs/architecture.md` reduzido de 895 linhas para ~250 linhas
- [ ] `CLAUDE.md` reduzido de 357 linhas para ~200 linhas
- [ ] `docs/handoff/archive/` criada com handoffs 01-13 dentro
- [ ] `docs/handoff/` raiz contém apenas handoffs do prompt 14 em diante
- [ ] Referências cruzadas atualizadas (zero link quebrado)
- [ ] Grep `## Aprendizado` em `architecture.md` retorna 0 ou só line de redirect
- [ ] Grep `## Aprendizado` em `learnings.md` retorna ≥40
- [ ] Nenhum arquivo de código (`app/`, `components/`, `lib/`, `hooks/`) modificado
- [ ] `npm run type-check` PASS (não deve mudar — refactor é só docs)
- [ ] `npm run lint` PASS (mesma situação)
- [ ] Commit message: `docs: refactor estrutura de docs para reduzir consumo de contexto (-40k tokens/prompt)`
- [ ] PR + merge

---

## Restrições

- **Zero reescrita de conteúdo.** Mover ≠ rewrite. Se sentir vontade de "melhorar" um aprendizado ao mover, NÃO faça
- **Zero alteração em código-fonte.** Só toca `*.md` na raiz e em `docs/`
- **Zero alteração em `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, `CONTEXT.md`, `plano-estrategico-v5.md`, `skills-stack.md`, `docs/prompts/`, `docs/superpowers/plans/`**
- **Zero novos pacotes npm**
- Não deletar nenhum arquivo. Só mover/dividir
- Se encontrar algum aprendizado mal-formatado em `architecture.md`, **não corrigir** — mover como está. Correção é outro PR

---

## Riscos identificados

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Quebra de referência cruzada (CLAUDE.md aponta pra "arquitetura seção N" que mudou de número) | **Média** | Grep pré-refactor + atualização pós-corte. Seções 1-16 do architecture.md ficam intocadas (só aprendizados saem) |
| Claude Code "simplificar" conteúdo durante a mudança | **Média** | Restrição explícita acima + critério de aceitação verifica `wc -l` dos arquivos novos |
| Esquecer um handoff antigo na raiz | **Baixa** | `ls docs/handoff/` no fim valida que só sobrou ≥14 |
| Aprendizado #NN ser referenciado em prompts antigos | **Baixa** | Referências antigas continuam válidas — número do aprendizado não muda, só de arquivo |

---

## Plano esperado da resposta

Antes de executar, Claude Code deve apresentar:

1. **Baseline confirmado** — contagens de linha e grep counts
2. **Lista de referências cruzadas encontradas** que precisarão ser atualizadas
3. **Ordem de operações** (qual arquivo criar primeiro, qual cortar depois)
4. **Karpathy declarations** — 4 disciplinas, 1 frase cada
5. **Riscos adicionais não previstos** (se houver)

Depois do `ok` do Léo, executar em sequência, sem pular validações.
