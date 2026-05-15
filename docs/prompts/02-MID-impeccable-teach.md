# DoseDay V5 — Prompt 02-MID-impeccable-teach

**Instância de destino:** ☑ Aba 1 (mesma dos Prompts 00 e 01)
**Worktree:** `dose-day-v5/` (pasta principal)
**Branch a criar:** `feature/02-impeccable-teach`
**Caveman:** N/A (decisão estratégica: não usar no projeto)

> **Importante:** este prompt só roda DEPOIS dos Prompts 00 e 01 terem sido concluídos e mergeados em `main`. Verifique que: (1) projeto Expo está rodando, (2) `.env` está configurado, (3) bundle ID está `com.doseday.premium`, (4) `locales/` está populado em 3 línguas.

## Contexto obrigatório (leia antes de qualquer coisa)

- `/Users/leofrancaia/Desktop/dose-day-v5/CLAUDE.md` — memória do projeto
- `/Users/leofrancaia/Desktop/dose-day-v5/docs/plano-estrategico-v5.md` — estratégia
- `/Users/leofrancaia/Desktop/dose-day-v5/docs/PRODUCT.md` — **rascunho v0.1 (input principal deste prompt)**
- `/Users/leofrancaia/Desktop/dose-day-v5/docs/design-system-preview.md` — preview do design system (input do DESIGN.md)
- `/Users/leofrancaia/Desktop/dose-day-v5/docs/skills-stack.md` — skills disponíveis (Impeccable seção 5.2)
- `/Users/leofrancaia/Desktop/dose-day-v5/docs/prompts/README.md` — regras anti-pirraça

## Objetivo desta tarefa

Rodar o comando `/impeccable teach` do plugin Impeccable. Esse comando:

1. **Lê o rascunho `PRODUCT.md` v0.1** já criado
2. **Lê o `design-system-preview.md`** já criado
3. **Faz uma entrevista curta** com o Léo pra confirmar pontos abertos
4. **Gera a versão final do `PRODUCT.md`** (substituindo o rascunho)
5. **Gera o `DESIGN.md`** no formato Impeccable 6-seções (Overview, Colors, Typography, Elevation, Components, Do's & Don'ts)

Após este prompt, todas as outras skills do Impeccable (`craft`, `polish`, `critique`, `audit`, `harden`, etc.) estarão prontas pra usar com contexto rico do projeto.

## Critérios de aceitação

- [ ] `docs/PRODUCT.md` final escrito pelo Impeccable, refinando o rascunho v0.1
- [ ] `docs/DESIGN.md` criado no formato Impeccable 6-seções
- [ ] `docs/PRODUCT.md` mantém TODAS as decisões já fixadas (persona Mariana, posicionamento âncora, anti-references, vocabulário-âncora, guardrails LGPD/Apple)
- [ ] `docs/DESIGN.md` reflete:
  - Paleta verde-menta `#00D4AA` + azul-grafite (sem violeta da V4)
  - Tipografia SF Pro com alias "system"
  - Regra dos 30% glass (navegação only)
  - Tab bar com ícone + texto
  - Splash com Liquid Glass leve
  - Dark mode only no MVP
- [ ] `docs/design-system-preview.md` arquivado ou referenciado como histórico
- [ ] Open Questions do PRODUCT.md rascunho discutidas/respondidas
- [ ] Léo aprova explicitamente a versão final antes de mergear
- [ ] Branch `feature/02-mid-impeccable-teach` mergeada em `main` via PR
- [ ] `tsc --noEmit` passa (não deveria afetar código, mas validar)

## Restrições explícitas

- **NÃO** descartar decisões já fixadas no rascunho v0.1. O Impeccable refina, não reseta
- **NÃO** introduzir cores ou estilos que contradigam o design-system-preview (glass em conteúdo, paleta violeta, etc.)
- **NÃO** mudar persona Mariana sem aprovação explícita do Léo
- **NÃO** assumir respostas das Open Questions sem perguntar
- **NÃO** rodar `/impeccable craft` ou qualquer outra skill geradora de UI neste prompt — só `teach`
- **NÃO** criar arquivos de código (apenas `.md` em `docs/`)
- Comunicar em PT-BR com Léo durante a entrevista

## Como o `/impeccable teach` deve operar

O Impeccable foi feito pra entrevistar o usuário em projeto vazio. Aqui ele NÃO está em projeto vazio — ele tem nosso rascunho. Portanto:

### Modo desejado: "refinamento, não criação"

1. **Carregar `docs/PRODUCT.md` v0.1 como contexto inicial**
2. **Carregar `docs/design-system-preview.md` como contexto de design**
3. **Identificar as Open Questions listadas** no PRODUCT.md (seção final)
4. **Perguntar APENAS sobre essas Open Questions ao Léo**, uma de cada vez
5. **Gerar versão final do PRODUCT.md** integrando as respostas
6. **Gerar DESIGN.md** no formato Impeccable 6-seções (Overview, Colors, Typography, Elevation, Components, Do's & Don'ts) com base no design-system-preview + PRODUCT final

### Open Questions atuais (seção 11 do PRODUCT.md rascunho)

1. Voz da IA tem nome? ("Assistente"? "DoseDay"? Sem nome?)
2. Como referenciar a própria IA? ("Eu observei...", "A IA observou...", impessoal?)
3. Em modo "autônomo" (V5.x persona João), tom muda?
4. Comunicação por push: usa primeira pessoa?
5. Linguagem clínica do relatório (versão médica): qual nível técnico?

Para cada uma, o Impeccable deve sugerir uma resposta recomendada e perguntar ao Léo se aprova/ajusta.

### Princípio anti-pirraça do Impeccable nesta sessão

> Impeccable NÃO inventa. Quando em dúvida sobre algo do produto, ele PERGUNTA ao Léo antes de assumir. Refinamento é incremental.

## Antes de executar, RETORNE:

### A) Skills que vai utilizar

| Fase | Skill | Por quê |
|---|---|---|
| Discovery | `/impeccable teach` | Fluxo guiado de geração de PRODUCT/DESIGN |
| Discussão das Open Questions | `grill-with-docs` (opcional) | Se Impeccable não fizer perguntas suficientes, complementar com grilling |
| Documentação final | `/impeccable document` | Gera DESIGN.md no formato 6-seções |
| Validação | `/impeccable critique` (opcional) | Persona-test pra ver se o PRODUCT.md sobrevive |

### B) Plano de execução

Sugestão de etapas:

1. Verificar pré-requisitos (Prompts 00 e 01 concluídos, branches mergeadas)
2. Criar branch `feature/02-mid-impeccable-teach`
3. Carregar contexto: PRODUCT.md v0.1 + design-system-preview.md
4. Identificar Open Questions
5. Entrevistar Léo (uma pergunta por vez, com resposta recomendada)
6. Gerar PRODUCT.md final
7. Gerar DESIGN.md (formato 6-seções)
8. Mostrar diff entre rascunho v0.1 e versão final do PRODUCT.md ao Léo
9. Léo aprova
10. Mover design-system-preview.md pra `docs/archive/` (referência histórica) OU manter linkado como input
11. Commit: `docs(impeccable): gera PRODUCT.md e DESIGN.md finais via teach`
12. PR em `main`

### C) Riscos identificados

- Impeccable pode tentar "começar do zero" ignorando o rascunho — mitigar carregando explicitamente o rascunho como contexto inicial
- Open Questions podem virar 10 perguntas em vez de 5 — Léo é PO atarefado, manter foco nas 5
- DESIGN.md gerado pode introduzir glassmorphism em conteúdo (anti-padrão) — `/impeccable critique` pra validar antes de aprovar
- Conflito entre design-system-preview (verde-menta + azul-grafite) e algum default do Impeccable

### D) Arquivos que vai criar/editar

| Arquivo | Ação | Resumo |
|---|---|---|
| `docs/PRODUCT.md` | edit (rewrite) | Versão final substitui rascunho v0.1 |
| `docs/DESIGN.md` | criar | Formato Impeccable 6-seções |
| `docs/design-system-preview.md` | move/keep | Decidir com Léo: arquivar ou manter |
| `docs/PRODUCT-v0.1-backup.md` (opcional) | criar | Backup do rascunho antes do `teach` rodar |

### E) Como vai validar

- [ ] PRODUCT.md final tem todas as 8 seções do rascunho (Register, Target Users, Brand Personality, Anti-references, Design Principles, Voice & Tone, Vocabulário-âncora, Guardrails)
- [ ] DESIGN.md final tem as 6 seções Impeccable (Overview, Colors, Typography, Elevation, Components, Do's & Don'ts)
- [ ] Persona Mariana intacta
- [ ] Posicionamento âncora intacto: *"Tudo que você sente entre uma consulta e outra. Anotado."*
- [ ] Paleta confirmada: `#00D4AA` + azul-grafite, sem violeta
- [ ] Regra dos 30% glass documentada
- [ ] Disclaimer fixo IA presente
- [ ] Léo aprova explicitamente

### F) Otimização de tokens (RTK)

Esse prompt é leve em arquivos. Comandos `rtk *` específicos não são críticos, mas:
- `rtk read docs/PRODUCT.md` ao final pra Léo ler a versão compacta
- `rtk read docs/DESIGN.md` ao final pra Léo ler a versão compacta
- `rtk diff docs/PRODUCT-v0.1-backup.md docs/PRODUCT.md` pra ver o que mudou

## ⏸️ Pause aqui e aguarde aprovação do Léo antes de executar.

---

## Observação adicional

Este prompt é **conversacional** — vai envolver perguntas e respostas ao vivo entre Claude Code e Léo. Não esperar saída tipo "código pronto, commit e fim". Esperar fluxo: carrega contexto → pergunta 1 → resposta → pergunta 2 → resposta → ... → gera arquivos → mostra → Léo aprova → commit.

Caso o Léo queira interromper a entrevista no meio (sessão longa demais, dúvida não resolvida, etc.), salvar progresso parcial e usar `/handoff` pra retomar depois.
