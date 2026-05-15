# Handoff — DoseDay V5 — Pós Prompt 02

**Data:** 2026-05-15
**Branch:** `feature/02-mid-impeccable-teach`
**Commits desta sessão:**
- `b4a79f1` — `docs(impeccable): finaliza PRODUCT.md v1.0 e gera DESIGN.md via /impeccable teach`
- plano em `docs/superpowers/plans/2026-05-15-impeccable-teach.md`
**PR:** [#2 — docs: PRODUCT.md v1.0 + DESIGN.md via /impeccable teach](https://github.com/leomeirae/doseday-v5/pull/2)
**Status:** PR aberto, pronto para merge em `main`.

---

## O que foi feito nesta sessão

### Prompt 02 — `/impeccable teach` (concluído)

Executado na íntegra. Ver plano completo em `docs/superpowers/plans/2026-05-15-impeccable-teach.md`.

**Entrevista com Léo — 5 Open Questions:**

| Q | Decisão |
|---|---|
| Q1 — Voz da IA tem nome? | Sem nome. Fala como "DoseDay" ou impessoal. |
| Q2 — Como referenciar a IA? | Impessoal/coletivo — "Padrão detectado", "70% das pessoas". Sem "Eu observei" ou "A IA detectou". |
| Q3 — Tom muda para João (V5.x)? | Não muda fundamentalmente. Adiciona camada didática (mais contexto, antecipação de efeitos, convite a buscar profissional). |
| Q4 — Push usa qual voz? | Segunda pessoa, sem sujeito — "Hora da sua dose semanal." Nunca primeira pessoa ou imperativo cobrança. |
| Q5 — Nível técnico do relatório médico? | Híbrido: seção paciente (linguagem clara) + seção profissional (clínica generalista). Termos OK: "adesão ao tratamento", "registro de eventos adversos". Termos proibidos: "farmacocinética", "comorbidades metabólicas". |

**Entrevista `/impeccable document` — 3 perguntas de design:**

| Q | Decisão |
|---|---|
| Q-A North Star | "The Clinical Memory" |
| Q-B Nomes de cor | Clinical Midnight (#050B12) + Vital Mint (#00D4AA) + Warm Amber (#FFB347) |
| Q-C Filosofia de elevação | Flat by default + camadas tonais + glass somente em navegação |

**Artefatos gerados (ver os arquivos, não duplicar aqui):**
- `docs/PRODUCT.md` — v1.0, 13 seções, todas as decisões finais de produto/copy/IA
- `docs/DESIGN.md` — Stitch 6-seções, YAML frontmatter com 19 tokens de cor, 12 roles tipográficos, 9 Named Rules, 6 componentes documentados
- `.impeccable/design.json` — sidecar v2: colorMeta com tonal ramps, shadows, motion, 6 componentes HTML/CSS auto-contidos, narrative completa
- `docs/archive/design-system-preview-v0.1.md` — preview histórico arquivado (header de arquivamento adicionado)
- `docs/archive/PRODUCT-v0.1-backup.md` — backup do rascunho v0.1

**`CLAUDE.md` atualizado:**
- Status: "Prompt 02 concluído. PRODUCT.md v1.0 + DESIGN.md finalizados. Aguardando Prompt 03."
- Item 5 da leitura obrigatória: `docs/DESIGN.md` (substituiu `docs/design-system-preview.md`)
- Histórico: linha do Prompt 02 adicionada

---

## Estado atual do repositório

| Item | Estado |
|---|---|
| Branch | `feature/02-mid-impeccable-teach` |
| PR #2 | Aberto, aguardando merge em `main` |
| `docs/PRODUCT.md` | v1.0, finalizado |
| `docs/DESIGN.md` | Criado, formato Stitch 6-seções |
| `.impeccable/design.json` | Criado, JSON válido |
| `docs/design-system-preview.md` | Arquivado em `docs/archive/` |
| `lib/theme/tokens.ts` | **Ainda com placeholders do Prompt 00** — precisa ser atualizado no Prompt 03 |
| TypeScript | Zero erros |
| App rodando | Sim (build do Prompt 00 ainda válido — nenhum código foi alterado neste prompt) |

---

## Próximas ações imediatas

1. **Fazer merge do PR #2** → `main` (se Léo ainda não fez)
2. **Confirmar em `main`** que `docs/DESIGN.md` e `docs/PRODUCT.md` estão presentes
3. **Iniciar Prompt 03** (sugestão abaixo)

---

## Prompt 03 sugerido — atualizar tokens.ts + tokens de design

O `lib/theme/tokens.ts` tem valores placeholder desde o bootstrap (`primary: '#00B37E'` em vez do canônico `#00D4AA`). Agora que o `DESIGN.md` é a fonte normativa, o próximo passo natural é:

1. Atualizar `lib/theme/tokens.ts` com todos os valores canônicos do DESIGN.md (cores, spacing, radius, typography)
2. Garantir que o app compile com os novos tokens
3. Criar `lib/theme/index.ts` se necessário para re-exportação limpa

Após isso, o ambiente está pronto para `/impeccable craft` na primeira tela real (Home / Dashboard).

---

## Skills para a próxima sessão

| Skill | Quando usar |
|---|---|
| `react-native-best-practices` | **Obrigatória** antes de qualquer código de componente |
| `impeccable:impeccable` (`craft`) | Para criar a primeira tela real com contexto rico do PRODUCT.md + DESIGN.md |
| `impeccable:impeccable` (`shape`) | Para o brief visual antes de codificar a tela |
| `superpowers:using-git-worktrees` | Se o próximo prompt for MID/HIGH e precisar de branch isolada |
| `superpowers:test-driven-development` | Para qualquer lógica de negócio (cálculo de próxima dose, etc.) |
| `feature-dev:feature-dev` | Para implementação estruturada de feature completa |
| `grill-with-docs` | Se o prompt tocar domínio GLP-1 / Movimentos IA / schema clínico |
| `simplify` | Após implementação de tokens.ts, pra garantir sem duplicação |

---

## Referências rápidas

| Documento | Propósito |
|---|---|
| `docs/PRODUCT.md` | Fonte de verdade de produto, tom, copy, compliance |
| `docs/DESIGN.md` | Fonte de verdade de design, tokens, componentes |
| `.impeccable/design.json` | Sidecar para painel Impeccable — componentes HTML/CSS |
| `docs/plano-estrategico-v5.md` | Estratégia, métricas, Movimentos 1/2/3 |
| `docs/architecture.md` | Stack, schema Supabase, múltiplas instâncias |
| `docs/skills-stack.md` | Qual skill usar para qual tarefa |
| `CLAUDE.md` | Working memory geral do projeto |
| `docs/archive/design-system-preview-v0.1.md` | Referência histórica (não usar como fonte normativa) |
| PR #2 | https://github.com/leomeirae/doseday-v5/pull/2 |
