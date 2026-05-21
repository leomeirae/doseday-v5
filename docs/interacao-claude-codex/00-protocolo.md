# 00 — Protocolo de interação Codex App ↔ Cowork ↔ Léo

**Criado:** 20 de maio de 2026
**Status:** vigente
**Última revisão:** 20 de maio de 2026

---

## 1. Por que esse protocolo existe

A V5 deixou de ser "implementar próximo P1 técnico" e virou "tornar o app desejável o suficiente pra Léo aprovar visualmente e Mariana querer continuar usando". Isso muda o eixo de conversa:

- Antes: backlog técnico → prompt → PR → merge → próxima feature
- Agora: visão de produto → auditoria de craft → redesign coordenado → só então features novas

Esse protocolo organiza quem decide o quê, em que formato, e como evitar que decisões importantes morram no chat.

---

## 2. Papéis

| Papel | Quem | Função | Não-função |
|---|---|---|---|
| **PO / dono do produto** | Léo | Visão, UX final, priorização, aprovação visual no simulador / iPhone, decisões de mercado | Não escreve código, não escolhe stack, não desenha arquitetura técnica |
| **Parceiro estratégico A** | Codex App (web, via Léo como ponte) | Frontend North Star, auditoria de UI/UX como produto, sequência de redesign, debate crítico sobre decisões | Não executa código, não merge, não toca repo |
| **Parceiro estratégico B** | Cowork (Claude Desktop) | Arquitetura de prompts, leitura do codebase, diagnóstico técnico, ponte com Supabase/RevenueCat/Asana via MCP, validação de plano antes de Claude Code executar | Não decide visão de produto sozinho. Não executa prompt em Claude Code direto (delega via mensagem cola pra Léo) |
| **Executor 1** | Claude Code (CLI no terminal do Léo) | Implementa prompts MID/HIGH, abre PR, valida com `react-native-devtools-mcp` | Não decide escopo. Pede aprovação de plano antes de codar |
| **Executor 2** | Codex CLI (no terminal do Léo, sessões alternadas) | Implementa prompts LOW e algumas MID, abre PR | Mesma regra |

**Regra de ouro:** Codex App e Cowork conversam direto como parceiros — Léo é o canal mas não precisa traduzir cada turno. Quando há divergência entre Codex App e Cowork, Léo arbitra com PO judgment.

---

## 3. Formato das interações

### 3.1 O que vai no chat (Cowork ↔ Léo)

- **Resumo curto** (3-6 linhas): o que foi feito / proposto.
- **Caminho do arquivo** novo ou atualizado.
- **Próxima pergunta ou próximo passo** explícito.

Sem despejar conteúdo longo de Markdown no chat. Léo abre o arquivo.

### 3.2 O que vai em arquivo Markdown nessa pasta

- Visão estratégica (North Star, auditoria, plano)
- Decisões finais com contexto
- Perguntas que exigem PO judgment do Léo
- Debate entre Codex App e Cowork sobre uma decisão (até virar decisão consolidada)

### 3.3 O que vai em `docs/prompts/NN-XXX-...md`

- Prompt executável pra Claude Code ou Codex CLI
- Skills obrigatórias, plano, riscos, arquivos tocados, validação
- Saída final dessa fase estratégica → vira input pra execução

### 3.4 O que vai em `docs/adr/`

- Decisão arquitetural difícil de reverter, surpreendente sem contexto, ou trade-off real
- Criada via skill `grill-with-docs`

### 3.5 O que vai em `docs/learnings.md`

- Aprendizado novo (bug não-óbvio, padrão de Supabase, gotcha de Expo, decisão revertida)
- Numerado, com data e contexto

---

## 4. Fluxo padrão de uma rodada

```
1. Codex App levanta questão estratégica  →  arquivo em docs/interacao-claude-codex/
2. Léo lê, encaminha pra Cowork (ou Cowork lê direto via @file)
3. Cowork responde: ou debate no mesmo arquivo, ou cria arquivo novo, ou consolida decisão
4. Quando decisão amadurece → vai pra decisoes.md
5. Quando decisão vira execução → vira prompt em docs/prompts/
6. Léo cola prompt no Claude Code / Codex CLI
7. Executor implementa, abre PR, valida com devtools-mcp
8. Léo aprova merge
9. Cowork atualiza handoff + learnings
10. Volta ao 1 com a próxima questão
```

**Cadência esperada:** 1-3 rodadas por dia, dependendo do escopo. Frontend North Star + auditoria deve consumir 1-2 dias antes de virar prompts.

### 4.1 Regra de espera Codex App ↔ Cowork

Quando Codex App enviar ao Cowork uma tarefa que exige leitura longa, raciocínio estratégico, avaliação visual, criação de Markdown, revisão de screenshots, plano de execução ou prompt complexo, **aguardar no mínimo 2 minutos antes de consultar a interface do Claude de novo**.

Objetivo: reduzir chamadas desnecessárias de Computer Use e dar tempo real para o Cowork pensar/escrever sem polling ansioso.

Fluxo operacional:

1. Enviar a mensagem curta ao Cowork.
2. Esperar 120 segundos sem `get_app_state`, `click`, `scroll` ou nova mensagem.
3. Se o pedido envolve criação de arquivo, checar primeiro o filesystem (`ls`, `stat`, `sed`) antes de consultar a UI.
4. Só usar Computer Use após os 2 minutos, ou antes disso se Léo pedir status imediato / intervenção manual.
5. Se o arquivo já existe e termina com marcador de fechamento, considerar o artefato útil pronto mesmo que a UI ainda mostre "Trabalhando"; não interromper o Cowork sem necessidade.

Tarefas simples, como confirmar se uma aba está aberta, ler um botão ou destravar um popup, não precisam dessa espera.

---

## 5. Estrutura dessa pasta

| Arquivo | Função | Quem mantém |
|---|---|---|
| `00-protocolo.md` | Esse documento. Papéis, formato, fluxo | Cowork + Codex App (consenso) |
| `01-frontend-north-star.md` | Visão de UI/UX V5 como produto desejável, não só funcional | Cowork escreve v1, Codex App debate, Léo aprova |
| `02-auditoria-frontend-atual.md` | Avaliação tela-a-tela das 16 telas V5 contra North Star + DESIGN.md + PRODUCT.md | Cowork escreve v1, Codex App valida no codebase, Léo testa no simulador |
| `03-plano-redesign-frontend.md` | Sequência de prompts antes de qualquer feature nova. Ordem, dependências, critérios de pronto | Cowork escreve, Codex App e Léo aprovam |
| `decisoes.md` | Log de decisões consolidadas com data + contexto + quem decidiu | Cowork mantém, Codex App pode editar |
| `perguntas-para-leo.md` | Dúvidas que travam decisão. Léo responde inline. Quando respondida, vira decisão e migra | Cowork e Codex App pendem perguntas |

---

## 6. Regras anti-pirraça aplicadas a essa pasta

- **Nunca codar antes de ter North Star + auditoria aprovados.** Mesmo prompt pronto fica em standby.
- **Nunca despejar conteúdo desses arquivos no chat.** Léo abre o arquivo.
- **Decisão sem dono na `decisoes.md` é decisão fantasma.** Sempre marcar quem decidiu.
- **Pergunta no `perguntas-para-leo.md` sem deadline morre.** Marcar urgência: bloqueia próximo prompt / bloqueia só long-term / pode ficar em standby.
- **Auditoria atualizada após cada redesign.** Não deixa o doc envelhecer.

---

## 7. Vocabulário compartilhado (mini-glossário)

| Termo | Significado |
|---|---|
| **Frontend como produto** | UI/UX não é polish — é parte da estratégia de retenção, conversão e confiança clínica. Tratamos como feature. |
| **Craft** | Cuidado visual + interação + microcopy. "Esse fluxo tem craft" = sente-se que alguém pensou cada detalhe. |
| **Liquid Glass restrito** | Apenas em camada de navegação (tab bar, headers semi-transparentes). Nunca em conteúdo. Regra DESIGN.md. |
| **Sobriedade clínica** | Anti-Noom, anti-Duolingo, anti-hype. Sem confetes, sem badges, sem "Parabéns!!". |
| **Primeiros 3 minutos** | Janela de decisão do usuário sobre confiar no app. Welcome → onboarding step 3 → primeira sensação de "isso vai me ajudar". |
| **Desejo de uso** | O quanto Mariana volta ao app SEM precisar de push notification. |
| **Mariana real ≠ mock** | Não inventamos prova social, não inflamos estatísticas, não criamos pacientes fake. |

---

**Fim do 00-protocolo.md.**
