# Plano de Execução — Prompt 02-MID-impeccable-teach

**Data:** 2026-05-15
**Branch a criar:** `feature/02-mid-impeccable-teach`
**Instância:** Aba 1 (mesma dos Prompts 00 e 01)
**Tipo de saída:** docs apenas (`.md`). Zero código.

---

## 1. Contexto

A V5 do DoseDay tem PRODUCT.md v0.1 escrito como rascunho (decisões fixadas pela estratégia) e `design-system-preview.md` com o sistema de design pré-definido (paleta verde-menta + azul-grafite, glass restrito a navegação, SF Pro, dark-only). Faltam dois deliverables-âncora antes que qualquer skill geradora de UI (`/impeccable craft`, `polish`, `audit`, etc.) possa rodar com contexto rico:

1. **PRODUCT.md final** — refinado, sem "rascunho v0.1", com as 5 Open Questions respondidas e seções faltantes (Product Purpose, Accessibility & Inclusion) preenchidas.
2. **DESIGN.md** — novo arquivo no formato Impeccable 6-seções com YAML frontmatter normativo, derivado do `design-system-preview.md`.

Este prompt é **conversacional**. Vai envolver 5 perguntas ao Léo (uma por vez, com resposta recomendada) + 2-3 perguntas qualitativas durante `/impeccable document` (North Star criativo, nomes descritivos de cores).

Pré-requisitos verificados:
- `main` está em `144e10b` (PR #1 mergeado — Prompt 01 concluído)
- `docs/PRODUCT.md` existe (v0.1, 11 seções + 5 Open Questions)
- `docs/design-system-preview.md` existe (sistema completo, 10 seções)
- `lib/theme/tokens.ts` existe (placeholders — não será editado neste prompt)
- `docs/DESIGN.md` **não** existe

---

## 2. Skills usadas

| Fase | Skill | Função |
|---|---|---|
| 1 | `superpowers:writing-plans` | Este plano |
| 2-3 | `impeccable:impeccable` (sub-comando `teach`) | Carrega contexto, conduz entrevista das Open Questions, refina PRODUCT.md |
| 4 | `impeccable:impeccable` (sub-comando `document`) | Gera DESIGN.md 6-seções + sidecar `.impeccable/design.json` |
| Opcional | `grill-with-docs` | Só se surgir conflito de domínio durante entrevista (ex: Movimentos IA, vocabulário-âncora) |
| 5 | (manual) | Arquivar `design-system-preview.md` |
| 6 | (Bash) | `tsc --noEmit`, commit, PR |

**Não vai usar:** `feature-dev`, `craft`, `polish`, `bolder`, `quieter`, qualquer skill geradora de UI ou de código.

---

## 3. Arquivos afetados

| Arquivo | Ação | Tamanho esperado |
|---|---|---|
| `docs/PRODUCT.md` | edit (rewrite preservando todo o conteúdo + integrando respostas) | ~25-30 KB |
| `docs/DESIGN.md` | criar | ~12-18 KB |
| `.impeccable/design.json` | criar | ~6-10 KB |
| `docs/archive/design-system-preview-v0.1.md` | move from `docs/design-system-preview.md` | (sem mudança de conteúdo) |
| `docs/archive/PRODUCT-v0.1-backup.md` | criar (backup antes do rewrite) | ~22 KB |
| `CLAUDE.md` | edit (atualizar status + histórico) | +2 linhas |

**Não toca:** nada em `app/`, `lib/`, `components/`, `assets/`, `package.json`, nenhum `.ts/.tsx`.

---

## 4. Tasks (em ordem)

### Task 1 — Preparação

- [ ] **1.1** `git checkout main && git pull` — sincronizar com remote
- [ ] **1.2** `git checkout -b feature/02-mid-impeccable-teach` — criar branch isolada
- [ ] **1.3** `cp docs/PRODUCT.md docs/archive/PRODUCT-v0.1-backup.md` (após criar `docs/archive/`) — backup antes de mexer
- [ ] **1.4** Rodar `node .claude/skills/impeccable/scripts/load-context.mjs` (ou path equivalente do plugin) para Impeccable identificar que PRODUCT.md já existe e DESIGN.md está ausente. Esperado no JSON: `productExists: true, designExists: false`.

---

### Task 2 — Entrevista das Open Questions (interativo com Léo)

Apresentar **uma pergunta por vez** via `AskUserQuestion`. Para cada uma, oferecer a **opção recomendada como primeira** (com "(Recomendada)" no label), 2-3 alternativas, e Léo pode escolher "Other" pra texto livre.

#### Q1 — Voz da IA tem nome?

> **Recomendação:** Sem nome próprio. Referenciar como "DoseDay" (produto) ou impessoal. Evita "Assistente" (genérico) e impede criar persona-AI que compete com a marca.
>
> **Justificativa:** Persona Mariana odeia coaching scriptado (anti-Noom). Nomear a IA cria sensação de "amigo virtual" que conflita com tom clínico. "DoseDay" como sujeito impessoal funciona: *"DoseDay observou que..."* ou *"Você está na semana 3..."* (sem sujeito).

Opções:
1. Sem nome — IA fala impessoal ou como "DoseDay" (**recomendada**)
2. "Assistente DoseDay" — nome funcional, não-humano
3. Nome próprio (a definir) — tem persona explícita

#### Q2 — Como referenciar a própria IA?

> **Recomendação:** **Impessoal** ou **terceira pessoa coletiva**. Sem "Eu observei" (cria persona-humana). Sem "A IA observou" (ressalta tech vs. produto).
>
> Exemplos:
> - ✅ *"Você está na semana 3 do Mounjaro 2.5mg. 70% das pessoas relatam pico de náusea agora."*
> - ✅ *"Padrão detectado: náusea apareceu nas 24h após cada dose nas últimas 3 semanas."*
> - ❌ *"Eu observei que você teve náusea..."* (humanização errada)
> - ❌ *"A IA detectou padrão..."* (tech em vez de cuidado)

Opções:
1. Impessoal + coletivo (**recomendada**) — "Padrão detectado", "70% das pessoas"
2. Primeira pessoa ("Eu observei...") — humanizada
3. Terceira pessoa explícita ("A IA observou...") — tech-forward

#### Q3 — Tom muda no modo "autônomo" (persona João, V5.x)?

> **Recomendação:** Tom **não muda fundamentalmente** (calmo, direto, cuidadoso, sério). Adiciona **camada didática**: mais contexto sobre o que é esperado, mais "antecipação de efeitos comuns", mais convite a procurar profissional caso sintoma escale.
>
> **Justificativa:** João não tem médico mas ainda é adulto que merece informação clara. Mudar pra coaching motivacional aqui quebraria coerência de marca. Manter tom e adicionar didatismo respeita o usuário.

Opções:
1. Não muda + camada didática extra (**recomendada**)
2. Tom mais empático/acolhedor (João está sozinho)
3. Tom mais "alerta" (João sem médico = mais risco)
4. Decisão adiada pra V5.x (não definir agora)

#### Q4 — Comunicação por push: usa primeira pessoa?

> **Recomendação:** **Segunda pessoa, sem sujeito**. Push é um momento delicado: usuário não pediu pra ouvir. Imitar primeira pessoa ("Eu lembrei que...") é invasivo. Imperativo seco ("Registre sua dose") é cobrança.
>
> Exemplos:
> - ✅ *"Hora da sua dose semanal."* (factual)
> - ✅ *"Como você está hoje?"* (convite)
> - ✅ *"Sua próxima dose é amanhã."* (informativo)
> - ❌ *"Eu lembrei: hora da dose"* (primeira pessoa)
> - ❌ *"Não esqueça sua dose!"* (cobrança/culpa)

Opções:
1. Segunda pessoa, sem sujeito (**recomendada**) — "Hora da sua dose"
2. Primeira pessoa ("Eu lembrei...") — humanizada
3. Impessoal puro ("Dose programada para hoje") — frio

#### Q5 — Nível técnico do relatório (versão médica)?

> **Recomendação:** **Técnico mas legível por clínico generalista**, não apenas endocrinologista. Termos como "registro de eventos adversos", "aderência ao tratamento", "cronologia de doses e sintomas". **Evita jargão de especialidade** (não diz "iatrogenia", "perfil farmacocinético", "comorbidades metabólicas") porque o relatório pode ir pra nutrólogo, clínico, nutricionista, não só endo.
>
> **Justificativa:** Vocabulário-âncora do PRODUCT.md já diz "evite endo em copy genérico — exclui nutrólogo, clínico, nutri". Aplica-se ao relatório também. Linguagem clínica generalista = inclusão de toda a equipe possível.

Opções:
1. Clínica generalista (**recomendada**) — qualquer profissional habilitado entende
2. Especializada (endo/nutro avançado) — máximo de precisão técnica
3. Híbrida (sumário leigo + dados técnicos em anexo)

---

### Task 3 — Reescrever `docs/PRODUCT.md` final

- [ ] **3.1** Preservar **todas** as 11 seções existentes (Register, Target Users, Brand Personality, Anti-references, Design Principles, Voice & Tone, Vocabulário-âncora, Decisões de copy, Disclaimer IA, Guardrails, Anti-pirraça).
- [ ] **3.2** Remover do header: `**Versão:** 0.1 (rascunho — será refinado pelo /impeccable teach no Prompt 02)`. Substituir por `**Versão:** 1.0 (finalizado via /impeccable teach — Prompt 02)` e `**Status:** documento-âncora ativo`.
- [ ] **3.3** Adicionar nova seção `## Product Purpose` (logo após `## Register`) consolidando o que está disperso no plano-estratégico: *"DoseDay é a memória inteligente do tratamento entre uma consulta e outra. Captura como o paciente se sente, quando, e em que dose. Devolve isso como insight pro paciente e relatório bilíngue pra equipe de saúde. Sucesso = paciente prepara consulta sem esforço; profissional vê 30 dias de tratamento em 2 minutos."*
- [ ] **3.4** Adicionar nova seção `## Accessibility & Inclusion` (após Design Principles) com: WCAG AA mínimo / AAA quando possível, suporte Dynamic Type até accessibility5, VoiceOver completo, Reduce Motion, contraste 4.5:1, idioma `pt-BR` por padrão, EN/ES como opt-in V5.x.
- [ ] **3.5** Integrar respostas Q1-Q4 na seção `## Voice & Tone`, criando subseção `### Voz da IA` com as decisões finais (referência impessoal, sem nome próprio, push em 2ª pessoa, etc.).
- [ ] **3.6** Integrar resposta Q5 na seção `## Vocabulário-âncora` ou em nova subseção `### Linguagem do relatório bilíngue` (versão paciente vs. versão clínica generalista).
- [ ] **3.7** Remover seção `## Open Questions` (todas respondidas). Substituir por nota: *"Open Questions iniciais foram fechadas via /impeccable teach em 2026-05-15."*
- [ ] **3.8** Mostrar ao Léo: `rtk diff docs/archive/PRODUCT-v0.1-backup.md docs/PRODUCT.md`. Léo aprova explicitamente.

---

### Task 4 — Gerar `docs/DESIGN.md` via `/impeccable document` em modo scan-com-preview

**Premissa:** `lib/theme/tokens.ts` existe mas com placeholders (`primary: '#00B37E'` em vez do canônico `#00D4AA`). O `design-system-preview.md` tem o sistema **canônico**. Usar o preview como fonte primária e ignorar placeholders do tokens.ts (que serão atualizados em prompt futuro).

- [ ] **4.1** Carregar `docs/design-system-preview.md` como source-of-truth de tokens.
- [ ] **4.2** Stage do YAML frontmatter (Stitch format) com:
  - `name: DoseDay V5`
  - `description: Memória inteligente do tratamento com canetinhas emagrecedoras (GLP-1)`
  - `colors:` — extrair de `design-system-preview.md` seção 2.1 (bg.base, bg.elevated, brand.primary, semantic.*, text.*, clinical.*). Hex puro (não OKLCH) pra compliance com linter Stitch.
  - `typography:` — extrair seção 2.2 (display, h1-h3, body, body-clinical, caption, label-button, label-tab, number-large, number-medium, mono-data).
  - `rounded:` — extrair seção 2.4 (xs, sm, md, lg, xl, full).
  - `spacing:` — extrair seção 2.3 (xxs, xs, sm, md, lg, xl, xxl, xxxl).
  - `components:` — 5-10 componentes-chave (button-primary, button-primary-glass, button-secondary, button-ghost, card-default, card-clinical, input-text, glass-bar). Refs `{colors.X}`, `{rounded.Y}`.
- [ ] **4.3** Perguntar ao Léo (1 round, agrupado via `AskUserQuestion`):
  - **Q-A: Creative North Star** — 3 opções:
    1. *"The Clinical Memory"* — base instrumental, glamour pontual em navegação (**recomendada**)
    2. *"The Calm Companion"* — calmo, presença leve
    3. *"The Quiet Logbook"* — minimal, diário sóbrio
  - **Q-B: Nomes descritivos de cores** — sugerir para confirmação:
    - `bg.base #050B12` → "Graphite Night" / "Deep Slate" / "Clinical Midnight"
    - `brand.primary #00D4AA` → "Mint Pulse" / "Vital Mint" / "DoseDay Mint"
    - `semantic.warning #FFB347` → "Warm Amber" / "Caution Honey"
  - **Q-C: Elevation philosophy** — confirmar: "Flat by default + glass APENAS em navegação. Shadows reais (`elevation.1-3`) só em cards de dado clínico e modal".
- [ ] **4.4** Escrever `docs/DESIGN.md` em **formato Stitch 6-seções** (ordem fixa):
  1. `## 1. Overview` — Creative North Star + 3 parágrafos + Key Characteristics bullet list
  2. `## 2. Colors` — Primary / Semantic / Neutral / Clinical Data + Named Rules ("The 30% Glass Rule", "The Brand-Primary Rarity Rule")
  3. `## 3. Typography` — SF Pro (alias `system`) + hierarquia display→mono-data + Named Rule ("The Number-First Rule" pra dados clínicos)
  4. `## 4. Elevation` — flat por padrão + shadow vocabulary + Named Rule ("The Flat-By-Default Rule", "The Glass-Navigation-Only Rule")
  5. `## 5. Components` — Buttons / Cards / Inputs / Navigation / Signature (GlassBar)
  6. `## 6. Do's and Don'ts` — citar **literalmente** os anti-patterns do PRODUCT.md (gradiente violeta, glass em conteúdo, mockup 3D, copy "Ação necessária", streak/gamificação, "diagnóstico/prescrição")
- [ ] **4.5** Escrever `.impeccable/design.json` (sidecar) com:
  - `colorMeta` (canonical OKLCH se preferir, displayName, tonalRamp 8-step pra cada cor-chave)
  - `shadows` (elevation.1, elevation.2, elevation.3)
  - `motion` (instant, quick, standard, slow, spring)
  - `breakpoints` (iPhone padrão; tablet entra V5.x)
  - `components[]` com HTML+CSS auto-contidos (button-primary, glass-bar, card-clinical, mood-checkin-grid) — 5-7 componentes
  - `narrative` (northStar, overview, keyCharacteristics, rules[], dos[], donts[])
- [ ] **4.6** Rodar `load-context.mjs` novamente para refresh do cache da sessão.
- [ ] **4.7** Mostrar `rtk read docs/DESIGN.md` ao Léo. Léo aprova ou pede ajuste pontual.

---

### Task 5 — Arquivar `design-system-preview.md`

- [ ] **5.1** `mkdir -p docs/archive/`
- [ ] **5.2** `git mv docs/design-system-preview.md docs/archive/design-system-preview-v0.1.md`
- [ ] **5.3** Adicionar header no topo do arquivo movido: `> **ARQUIVADO em 2026-05-15.** Sistema canônico vive em /docs/DESIGN.md. Este arquivo é referência histórica da decisão tomada em 14/mai/2026.`
- [ ] **5.4** Atualizar referência em `CLAUDE.md` seção "Leia primeiro, sempre" — trocar item 5 de `docs/design-system-preview.md` para `docs/DESIGN.md`.

---

### Task 6 — Validação + commit + PR

- [ ] **6.1** Rodar `npx tsc --noEmit` — esperado: zero erros (não toca código)
- [ ] **6.2** Checklist de aceitação (verificar manualmente):
  - PRODUCT.md tem `## Register`, `## Product Purpose`, `## Target Users`, `## Brand Personality`, `## Anti-references`, `## Design Principles`, `## Accessibility & Inclusion`, `## Voice & Tone`, `## Vocabulário-âncora`, `## Decisões de copy fixadas`, `## Disclaimer fixo da IA`, `## Guardrails de compliance`, `## Princípios anti-pirraça`
  - Persona Mariana intacta (idade 38, R$1.500-2.500/mês, etc.)
  - Posicionamento âncora intacto: *"Tudo que você sente entre uma consulta e outra. Anotado."*
  - DESIGN.md tem as **6 seções exatas** (Overview, Colors, Typography, Elevation, Components, Do's and Don'ts), nessa ordem, com headers exatos
  - Paleta confirmada: `#00D4AA` + azul-grafite, **sem violeta**
  - "Regra dos 30% glass" documentada como Named Rule
  - Disclaimer fixo IA presente no PRODUCT.md
  - `.impeccable/design.json` parsea como JSON válido
  - `design-system-preview.md` está em `docs/archive/`
- [ ] **6.3** `git add docs/ .impeccable/ CLAUDE.md`
- [ ] **6.4** Commit com mensagem:
  ```
  docs(impeccable): finaliza PRODUCT.md e gera DESIGN.md via /impeccable teach

  - Responde 5 Open Questions (voz IA, push, relatório clínico)
  - Adiciona Product Purpose e Accessibility & Inclusion
  - Gera DESIGN.md 6-seções com tokens canônicos do design-system-preview
  - Cria .impeccable/design.json sidecar (tonal ramps, shadows, motion)
  - Arquiva design-system-preview.md como histórico

  Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
  ```
- [ ] **6.5** `git push -u origin feature/02-mid-impeccable-teach`
- [ ] **6.6** `gh pr create --title "docs: PRODUCT.md final + DESIGN.md via /impeccable teach (Prompt 02)" --body <heredoc>` com:
  - Summary (3 bullets)
  - Test plan (validações da 6.2)
  - Footnote 🤖 Generated with Claude Code
- [ ] **6.7** Atualizar `CLAUDE.md` tabela de Histórico (adicionar linha do Prompt 02)

---

## 5. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Impeccable `teach` tenta resetar PRODUCT.md em vez de refinar | Step 1 da teach reference diz "PRODUCT.md exists → skip to Step 5". Forçar modo "merge into existing content" carregando explicitamente o conteúdo atual antes de qualquer write. |
| Impeccable `document` em scan mode pega placeholders do `tokens.ts` (`#00B37E`) em vez do canônico (`#00D4AA`) | Tarefa 4.1 carrega `design-system-preview.md` ANTES de scan do código. Documentar no DESIGN.md que tokens.ts será atualizado em prompt futuro. |
| Impeccable `document` adiciona seções fora das 6 canônicas (Layout, Motion, Responsive) | Step 4.4 obriga 6 seções exatas. Folding de Motion → Overview ou Components. |
| Léo discorda da recomendação de Q1-Q5 e a sessão fica longa demais (>1h) | Léo pode parar a qualquer momento. Se interromper, rodar `/handoff` salvando estado em `docs/handoff/HANDOFF-prompt-02.md` e retomar em sessão futura. |
| `.impeccable/design.json` quebra parser do Stitch | Validar com `cat .impeccable/design.json | jq .` antes do commit. |
| Conflito de design entre `design-system-preview.md` (verde-menta) e algum default do Impeccable | Tarefa 4.2 fixa tokens via frontmatter ANTES da etapa de qualitative input. Defaults do Impeccable só preenchem campos vazios. |

---

## 6. Como vou validar antes de declarar pronto

1. **PRODUCT.md** preserva todas as decisões fixadas (persona, posicionamento, anti-references, vocabulário, guardrails).
2. **DESIGN.md** tem as 6 seções na ordem exata, com YAML frontmatter parseável.
3. **`.impeccable/design.json`** parsea (`jq . .impeccable/design.json` retorna 0).
4. **`tsc --noEmit`** passa (sanity — não deve afetar TS mas valida que nada quebrou).
5. **Diff PRODUCT.md** mostrado ao Léo antes do commit.
6. **Léo aprova** explicitamente PRODUCT.md e DESIGN.md antes do PR.

---

## 7. O que NÃO entra neste prompt

- Atualizar `lib/theme/tokens.ts` com valores canônicos do DESIGN.md (próximo prompt, código)
- Criar componentes UI (Button, Card, GlassBar — próximos prompts)
- Refatorar telas existentes
- Migrar locales para vocabulário-âncora final
- Implementar Movimentos IA, schema Supabase, edge functions
- `/impeccable craft`, `polish`, `audit`, `harden`, `critique` — só `teach` + `document` neste prompt

---

## 8. Resumo executivo (TL;DR)

3 deliverables, ~1h de execução interativa (5 perguntas de produto + 3 perguntas de design), zero linha de código, 1 PR.

Output: `docs/PRODUCT.md` v1.0 + `docs/DESIGN.md` (Stitch 6-seções) + `.impeccable/design.json` (sidecar). Depois disso, qualquer skill geradora de UI (`craft`, `polish`, etc.) roda com contexto rico do projeto.
