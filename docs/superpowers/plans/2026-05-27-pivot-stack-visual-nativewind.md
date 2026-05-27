# Prompt 40 — Pivot Stack Visual (NativeWind + reusables) — Plano

> Documental cirúrgico. Zero código de produção. Branch: `chore/40-pivot-stack-visual-nativewind`.

---

## Contexto

Léo testou o app e percebeu que a estética "StyleSheet + Liquid Glass" não está entregando o "moderno + intuitivo" alvo. Em conversa Cowork 2026-05-27 ele tomou 3 decisões:

1. Tailwind/NativeWind liberado (regra anti-pirraça #4 do `CLAUDE.md` está obsoleta).
2. Tab bar foi removida — navegação acontece via cards do Dashboard (`router.push()`).
3. Liquid Glass deixa de ser pilar arquitetural. Stack visual nova: **NativeWind v4 + react-native-reusables**.

Este prompt **não toca em código** — só prepara a documentação para que os Prompts 41+ (setup técnico + migração progressiva) entrem com a premissa correta. A regra anti-pirraça #4 atual ainda bloqueia NativeWind, então sem este pivot documental o próximo prompt seria contraditório.

---

## Karpathy assumptions

- Decisão tomada por Léo, sem necessidade de re-litigar trade-offs.
- Stack escolhida: NativeWind v4 + react-native-reusables (não gluestack-ui, não nativewindui).
- Nada de código de produção neste PR. `package.json`, `babel.config.js`, `metro.config.js` intocados.
- Liquid Glass não é apagado — vira contexto histórico/opcional, alguém pode querer reler.

**Could 50 lines do this?** Não — 6 arquivos a tocar, ADR sozinho passa de 50. Mas cada edit é cirúrgico.

**Success criteria verificáveis:** `git diff --stat` mostra só `docs/` + `CLAUDE.md`; `npm run lint` + `type-check` passam; `grep -i "NUNCA usar Tailwind"` em `CLAUDE.md` retorna vazio.

---

## Tabela mestre (Skills + Plano + Riscos + Arquivos + Validação)

### Skills

| Skill | Uso |
|---|---|
| `karpathy-guidelines` | Assumptions explícitos, mudança cirúrgica, success criteria verificáveis (já carregada) |
| `superpowers:writing-plans` | Plano persistido em arquivo antes de executar (este documento) |

Nenhuma skill de UI/design necessária — é só documentação.

### Plano (sequência de tarefas)

| # | Tarefa | Output | Verificação |
|---|---|---|---|
| 1 | Criar `docs/adr/0007-pivot-stack-visual-nativewind-reusables.md` no padrão dos ADRs 0001/0006 | Arquivo novo seguindo header `# ADR NNNN — título` + seções Status/Contexto/Decisão/Consequências/Alternativas/Próximos passos | Arquivo existe; `head -1` mostra título correto |
| 2a | Reescrever regra anti-pirraça #3 em `CLAUDE.md`: de "NUNCA aplicar glass em conteúdo. Glass é exclusivo da camada de navegação" para "Glass é opcional, não pilar — usar só quando agregar (ver ADR 0007). Liquid Glass perdeu prioridade como pilar arquitetural" | Regra #3 atualizada | `grep "NUNCA aplicar glass" CLAUDE.md` retorna vazio |
| 2b | Reescrever regra anti-pirraça #4 em `CLAUDE.md` (linha ~83): de "NUNCA usar Tailwind/NativeWind" para "Stack visual: NativeWind v4 + react-native-reusables (ver ADR 0007). StyleSheet só em legado/edge cases (Reanimated complexo, PlatformColor)" | Regra #4 atualizada | `grep "NUNCA usar Tailwind" CLAUDE.md` retorna vazio; `grep "ADR 0007" CLAUDE.md` retorna 1+ |
| 3 | Atualizar tabela "Stack resumida" em `CLAUDE.md`: linha "UI nativa iOS" passa a citar NativeWind v4 + reusables como camada de styling; Liquid Glass vira opcional | Linha atualizada | Tabela mostra "NativeWind v4 + reusables" |
| 4 | Atualizar tabela "Auxiliares por tipo de tarefa" em `CLAUDE.md`: linha "UI / tela nova" cita NativeWind/reusables; linha "Tab bar / toolbar / navegação" marca como deprecada (tab bar removida) ou remete a Dashboard cards | Linhas atualizadas | Grep das linhas mostra novo conteúdo |
| 5 | Suavizar menção a Liquid Glass como pilar no parágrafo "Estado do produto" em `CLAUDE.md` | Parágrafo atualizado, preserva referência histórica | Diff mostra mudança apenas no parágrafo |
| 6 | Atualizar `docs/plano-estrategico-v5.md`: adicionar nota curta na seção stack (linhas ~480-500) registrando pivot; marcar seção 10 (tab bar — linha 327) como histórica, não ativa | Insert/edit cirúrgico, não rewrite | Grep "ADR 0007" em plano retorna 1+ |
| 7 | Atualizar `docs/DESIGN.md`: adicionar bloco no topo (após o front-matter YAML, antes do conteúdo descritivo, ~linha 165-170) avisando "Stack visual desde 2026-05-27: NativeWind + reusables (ADR 0007); Liquid Glass agora é opcional, não pilar" | Bloco markdown inserido; tokens existentes preservados | Linhas 165-180 incluem aviso |
| 8 | Atualizar `docs/skills-stack.md`: suavizar `liquid-glass:liquid-glass` como obrigatória (linhas 18, 30, 77, 147, 149, 459, 511, 512); remover linha 233/512 que veta `expo-tailwind-setup` | Edits cirúrgicos linha-a-linha; preservar estrutura de tabela | Grep "NÃO USAR" em skills-stack para tailwind retorna 0 |
| 9 | Adicionar entrada em `docs/learnings.md`: novo aprendizado 59 datado 2026-05-27 seguindo padrão `## 14.27 Aprendizado 59 — <título>` (mesma estrutura de Contexto/Achado/Solução/Princípio que os existentes 57/58) | Nova seção ao fim do arquivo | Tail mostra aprendizado 59 |
| 10 | Rodar `npm run lint` + `npm run type-check` (verificação) | Ambos passam (não deveriam mudar) | Saída 0 |
| 11 | Commit + abrir PR via MCP GitHub (regra 29) — PR description menciona "Prompt 40 — pivot documental, sem alteração de código" | PR aberto | URL do PR retornado |

### Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Editar Liquid Glass em DESIGN.md de forma agressiva e perder contexto histórico útil | Média | Adicionar **bloco no topo** com aviso ADR 0007 em vez de apagar trechos. Trade-off: doc fica com duas camadas (histórica + atual), aceitável. |
| Cair na tentação de "refatorar" CLAUDE.md inteiro pra "ficar mais limpo" | Alta (anti-pattern típico) | Plano declara explicitamente: só edits cirúrgicos nas regras/linhas afetadas. Comparar `git diff --stat` no final — só os 6 arquivos previstos. |
| ADR 0007 referenciar Prompts 41/42/43 cria dependência circular se nunca forem escritos | Baixa | Escrever como **roadmap**, não dependência ("Próximos passos: setup técnico em PR futuro"). Sem promessas hard de número de prompt. |
| Inventar política nova (ex: como dark mode em NativeWind) sem decisão do PO | Média | Pergunta aberta no ADR ("Em aberto: tratamento de dark mode, animações Reanimated, PlatformColor — decidir em Prompt 41"). Não inventar resposta. |
| Lint/type-check quebrar por algum import indireto que escapou | Muito baixa (zero código alterado) | Validar mesmo assim no passo 10. Se quebrar, é bug pré-existente — abrir issue, não fixar aqui. |
| `docs/DESIGN.md` ter 26KB e o usuário esperar revisão completa | Média (escopo creep) | Restrição explícita no prompt original: "fazer só o necessário e sinalizar o resto". Plano cumpre — só insere bloco no topo. Se PO quiser revisão completa de DESIGN.md, abrir prompt separado. |

### Arquivos

| Arquivo | Ação | Linhas estimadas (delta) |
|---|---|---|
| `docs/adr/0007-pivot-stack-visual-nativewind-reusables.md` | Criar | ~80-100 linhas (novo) |
| `CLAUDE.md` | Editar | 4 edits cirúrgicos (regra #4, parágrafo estado, tabela stack, tabela auxiliares) — delta ~15 linhas |
| `docs/plano-estrategico-v5.md` | Editar | 2-3 edits (seção stack + nota em seção 10 tab bar) — delta ~10 linhas |
| `docs/DESIGN.md` | Editar | 1 edit (bloco no topo após front-matter) — delta ~8 linhas |
| `docs/skills-stack.md` | Editar | 6-8 edits cirúrgicos linha-a-linha — delta ~12 linhas |
| `docs/learnings.md` | Editar | 1 append (aprendizado 59) — delta ~20 linhas |

**Zero alterações em:** `app/`, `components/`, `hooks/`, `lib/`, `package.json`, `babel.config.js`, `metro.config.js`. Confirmar via `git diff --stat` no fim.

### Validação

```
git diff --stat
# Esperado: 6 arquivos, todos em docs/ ou raiz CLAUDE.md

grep -i "NUNCA usar Tailwind" CLAUDE.md
# Esperado: vazio

grep "ADR 0007" CLAUDE.md docs/DESIGN.md docs/plano-estrategico-v5.md
# Esperado: ao menos 1 hit em cada

ls docs/adr/0007-pivot-stack-visual-nativewind-reusables.md
# Esperado: arquivo existe

tail -25 docs/learnings.md | grep "Aprendizado 59"
# Esperado: 1 hit

npm run lint
# Esperado: passa (sem warnings novos)

npm run type-check
# Esperado: passa
```

PR description menciona: "Prompt 40 — pivot documental, sem alteração de código. Ver ADR 0007 para racional."

---

## Próximos passos (fora deste PR)

- Prompt 41 (futuro): setup técnico — instalar `nativewind@v4`, `tailwindcss`, configurar `babel.config.js`, criar `tailwind.config.js` com tokens do `lib/theme/tokens.ts`, instalar `react-native-reusables`.
- Prompt 42 (futuro): identificar componentes "órfãos" que ainda precisam migrar, priorizar pelo retorno visual.
- Prompt 43+ (futuro): migração progressiva tela-a-tela.

Estes não são dependências hard — só roadmap. ADR 0007 menciona como "próximos passos" sem comprometer cronograma.
