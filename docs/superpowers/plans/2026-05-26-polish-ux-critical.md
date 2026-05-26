# Plano — Prompt 39-MID-polish-ux-critical

**Data:** 2026-05-26
**Status:** ✅ **APROVADO por Léo** (2026-05-26 8:53 GMT-3) — execução em andamento
**Branch a criar:** `feature/39-polish-ux-critical`
**Worktree:** principal `~/Desktop/dose-day-v5/`
**Coordenação:** paralelo ao PR #76 Settings Hub (Aba 2, atualmente pausado em `1b95261`)
**Origem:** `docs/prompts/39-MID-polish-ux-critical.md`

---

## Sumário executivo

Polish UX cirúrgico aplicado em **8 arquivos** (~40-50 LOC efetivas) para resolver issues críticas identificadas via `/mobile-product-critic` pós-PR #75:

- **Affordance visual:** chevrons + press feedback em cards interativos (PRÓXIMA DOSE, PESO)
- **Microcopy:** label Peso ("Peso (kg)" + placeholder "ex: 87,2"), ghosts simplificados em Notas/Sintoma
- **Feedback haptic:** prop opcional `haptic?` no `AuthButton` compartilhado (DRY) propagada aos 5 sheets de registro
- **Sparkline:** dot endpoint 4pt → 6pt para destacar valor atual

**Excluído deste PR (D1=B aprovado):** documentar `colors.destructive` ou criar Named Rule "The Destructive Action Rule". Token foi criado em `SettingsRow` (commit `047d04c`) e fica 100% com PR #76 Settings Hub (etapa 15 via grill-with-docs). Razão: quem cria documenta.

**Fora do escopo (decisões cravadas):**
- ❌ Refactor sheets pra Centered Modal (D1=A: Form Sheet HIG-aprovado mantido)
- ❌ Mudar `colors.bgElevated` global (D2 revisada — blast radius confirmado em 44 arquivos)
- ❌ Tab bar / Gear Icon (D3=B: gate pro PR pós-Settings Hub)
- ❌ Gráficos novos (D4: PR separado Fase E)
- ❌ Dev build (D5: Fase F)

---

## 0) Pre-flight checks (rodados antes do plano)

### 0.1 Contexto obrigatório — estado de leitura

| # | Item | Estado |
|---|---|---|
| 1 | `CLAUDE.md` (regras 1-31) | ✅ carregado |
| 2 | `docs/karpathy.md` | ⚠️ **pendente** — ler antes da etapa 2 |
| 3 | `docs/frontend-app-store-roadmap.html` | ⚠️ **pendente** — ler antes da etapa 14 |
| 4 | `docs/HOME_DESIGN_DIRECTION.md` (§5, §5.4) | ✅ carregado |
| 5 | `docs/DESIGN.md` | ✅ carregado |
| 6 | `docs/PRODUCT_COHERENCE.md` (§11.3) | ✅ carregado (truncado em pg 420 — §11.3 caiu dentro) |
| 7 | `CONTEXT.md` | ✅ carregado |
| 8 | `lib/theme/tokens.ts` | ✅ carregado |
| 9 | `components/home/HomeV7Content.tsx` (950 linhas) | ✅ carregado |
| 10 | `app/peso/registrar.tsx` | ✅ carregado |
| 11 | `app/diario/anotar-memoria.tsx` | ✅ carregado |
| 12 | `app/diario/anotar-sintoma.tsx` | ✅ carregado |
| 13 | Memórias auto-injetadas | ✅ visíveis nos system-reminders |
| 14 | `npx claude-mem search "polish chevron contraste card press feedback"` | ✅ rodado (resultados §0.2) |

### 0.2 Output do `claude-mem search` — 5 memórias relevantes

| Obs ID | Quando | Relevância |
|---|---|---|
| **#1272** | 2026-05-26 8:01 | `lib/theme/tokens.ts Aligned with DESIGN.md but Awaiting Phase A Contrast Decision (D2)` — D2 era pendente, agora cravada |
| **#1275** | 2026-05-26 8:02 | `Fase A Implementation Readiness: 80% of Refactor Scaffolding Already in Place` — infra pronta, só falta polish |
| **#1190 + #1193 + #1219** | 2026-05-25 20:03-20:32 | SettingsRow + SettingsSectionHeader + decisões. **Confirma: `colors.destructive` planejado em PR #76 (paused), NÃO está em `main`** |
| **#1064** | 2026-05-25 16:25 | `Primary action button styling implementation details` — pattern `arrowButtonPressed` existe pra replicar press feedback |
| **#1268** | 2026-05-26 7:58 | `DoseDay V5 Frontend Roadmap — 7-Phase Implementation Plan` — este prompt = Fase A |

### 0.3 Grep `bgElevated` — blast radius confirmado

| Métrica | Valor |
|---|---|
| **Arquivos afetados** | **44** (29 components + 15 app + tokens.ts) |
| **Ocorrências totais** | ~57 |
| **Top consumers** | `app/dose/registrar.tsx` (3), `app/perfil/account.tsx` (2), `HomeV7Content.tsx` (2), `WeightChartCard.tsx` (2), `AdherenceRingCard.tsx` (2) |
| **Conclusão** | Mudança global = blast radius em inputs, sheets, charts, onboarding, perfil. **D2 revisão confirmada: NÃO tocar token global neste PR** |

### 0.4 Grep `AuthButton` — consumers do refactor

14 consumers (`grep -l "AuthButton" components app`):

```
app/(auth)/recover.tsx          app/diario/anotar-memoria.tsx   app/peso/historico.tsx
app/(auth)/signin.tsx           app/diario/anotar-sintoma.tsx   app/peso/registrar.tsx
app/(auth)/signup.tsx           app/diario/checkin.tsx          components/diario/CheckinInsightView.tsx
app/diario/anotar-custo.tsx     app/diario/quick-log.tsx        components/ui/AuthButton.tsx
app/dose/registrar.tsx          app/perfil/protocolo.tsx
```

**Garantia:** prop `haptic?` opcional → sem prop = comportamento original. 9 consumers que não passam haptic continuam idênticos.

---

## 1) Decisões aprovadas (Léo 2026-05-26 8:53 GMT-3)

### D1 = **B** — Polish NÃO toca `colors.destructive`

- Trabalho 100% no PR #76 Settings Hub (etapa 15 via grill-with-docs)
- Token foi criado lá (commit `047d04c` em `SettingsRow`) — **quem cria documenta**
- Polish não precisa do token; se Polish mergear antes do Settings, `main` ainda não tem o token e está OK
- **Removido deste plano:** etapa 12 do execution plan, linha condicional em §5 Arquivos, linha condicional em §7 Validação, risco 9

### D2 = **Sim** — Remover menção stale a `#131C2A`

- Decisão de contraste foi revisada (D2 = local first via chevron + press feedback)
- Token global `bgElevated` NÃO entra neste PR
- Limpar qualquer menção stale a `#131C2A` em validation/riscos/etapas

### D3 = **Sim** — Critique manual

- `/impeccable critique` continua indisponível (blocker dos PRs #73/74/75)
- Critique manual contra:
  - `docs/DESIGN.md` — tokens canônicos + Named Rules existentes
  - `docs/HOME_DESIGN_DIRECTION.md` §5.4 mint state rule
  - 4 lentes mobile-product-critic (UX Designer + Writer + PM + Researcher)
- Documenta score estimado em comentário do commit/PR

### Cadência

- **Manual approve em cada edit** (aprovado por Léo)
- **Pausa em qualquer checkpoint se algo divergir**

---

## 2) Karpathy guidelines (regra 22)

### §1 — Assumptions explícitas

1. `bgElevated` é usado consistentemente via tokens — **confirmado:** 44 arquivos sem hardcoded `#0E1620` solto
2. Pattern `Pressable` + `pressed && stylePressed` já existe (`sectionBodyPressed` em `HomeV7Content.tsx:747-749`)
3. SF Symbol `chevron.right` disponível via `expo-symbols` (já usado em `WeightChartCard`, `SettingsRow`, etc.)
4. `expo-haptics` instalado (verificado em `package.json:34`); usado em `TabBarButton`, `quick-log.tsx`, `dose/registrar.tsx`
5. Tela `/peso/registrar` usa i18n key `addModal.weightHint` — atualizar `locales/pt-BR/weight.json`, não hardcoded
6. Sparkline tem 2 dots (linha 346 inicial `r={1.7}` + linha 347 final `r={2.2}`) — só mexer no final
7. `bgBase` continua `#050B12` — não mudar. Token global `bgElevated` também não muda

### §2 — Could 50 lines do this?

| Fix | LOC |
|---|---|
| Token `destructive` (cond.) | 1 |
| Chevron x2 | ~6 |
| Press feedback x2 | ~6 |
| Sparkline dot | 1 |
| Label Peso | 2-3 |
| Ghosts x2 | 2 |
| Haptic prop AuthButton + propagar 5 sheets | ~12 + 5 |
| Docs (DESIGN.md Named Rule + history + roadmap) | ~18 |

**Total edits:** ~40-55 LOC efetivas. **Cirúrgico ✅**

### §3 — Cirurgia

Tabela D declara escopo. Lista "NÃO TOCAR" explícita (§5 abaixo). Zero drive-by refactor. Diff esperado: ~8 arquivos editados, ~2 criados, zero surpresas.

### §4 — Sucesso verificável

Checklist binário na seção 7 + gate quantitativo `critique ≥ 33/40`.

---

## 3) Skills

| Fase | Skill | Por quê |
|---|---|---|
| Pré-leitura | `karpathy-guidelines` (manual via `@docs/karpathy.md`) | Assumptions + cirurgia + sucesso verificável |
| Pré-leitura | `claude-mem:mem-search` | Trabalho prévio (rodado em §0.2) |
| Planejamento | `superpowers:writing-plans` | Este arquivo (regra 21) — promovido a fonte-de-verdade após aprovação |
| Implementação | `impeccable polish` | Pass final de qualidade UX |
| Implementação | `react-native-best-practices` | Pressable patterns, SymbolView, StyleSheet conventions |
| Validação | Critique manual (DESIGN.md Named Rules + WCAG 2.1 AA) | Substitui `design:accessibility-review` ausente |
| Validação | `impeccable critique` (se disponível) | Fallback: critique manual 4-lentes |
| Sessão | `claude-mem` | Compactação session-end automática (regra 30) |

---

## 4) Plano de execução (~2h efetivas)

| # | Etapa | Tempo | Checkpoint verificável |
|---|---|---|---|
| 0a | Ler `@docs/karpathy.md` + `@docs/frontend-app-store-roadmap.html` | ✅ feito | Sumário absorvido |
| 1 | **D1=B, D2=Sim, D3=Sim** cravados por Léo | ✅ feito | Decisões registradas em §1 |
| 2 | Promover plano a fonte-de-verdade — status `✅ APROVADO` | ✅ feito | Status atualizado |
| 3 | `git checkout -b feature/39-polish-ux-critical` partindo de `main` (limpo) | 1min | Branch ativa |
| 4 | **`components/ui/AuthButton.tsx`** — `+prop haptic?: 'light' \| 'medium' \| 'heavy'` + import `expo-haptics` + chamada antes do `onPress` | 15min | `tsc --noEmit` PASS; consumers sem prop = sem mudança |
| 5 | Propagar `haptic="medium"` em 5 sheets: `app/dose/registrar.tsx`, `app/peso/registrar.tsx`, `app/diario/anotar-{memoria,sintoma,custo}.tsx` | 10min | `grep -l 'haptic="medium"'` retorna 5 arquivos |
| 6 | **`components/home/HomeV7Content.tsx`** — `<SymbolView name="chevron.right" size={14} tintColor={colors.semanticMuted} />` dentro do `sectionBody` em PRÓXIMA DOSE (linha 254-264) + PESO (linha 310-322); `marginLeft: 'auto'` | 15min | Screenshot Home com 2 chevrons visíveis |
| 7 | `HomeV7Content.tsx` — adicionar `transform: [{ scale: 0.98 }]` + ajustar `opacity: 0.85` em `sectionBodyPressed` (linha 747-749) | 10min | Screenshot pressed state simulador |
| 8 | `HomeV7Content.tsx` — `SvgCircle` final do sparkline (linha 347) `r={2.2}` → `r={3}`. Início (linha 346, `r={1.7}`) mantido | 5min | Screenshot sparkline antes/depois |
| 9 | `locales/pt-BR/weight.json` — `addModal.weightHint`: "Entre 30 e 300 kg" → "Peso (kg)"; adicionar/ajustar `addModal.weightPlaceholder`: "ex: 87,2". `app/peso/registrar.tsx` — passar `placeholder` no TextField | 8min | Screenshot sheet Peso novo |
| 10 | `app/diario/anotar-memoria.tsx` linha 85 — `placeholder` simplificado para "ex: bati o pé pra não comer doce hoje" | 2min | Screenshot |
| 11 | `app/diario/anotar-sintoma.tsx` linha 113 — `placeholder` simplificado para "ex: náusea leve depois do almoço" | 2min | Screenshot |
| 12 | ~~Token `destructive` + Named Rule~~ — **D1=B aprovado: skip** (escopo PR #76) | ⏭️ skip | — |
| 13 | `docs/history.md` — entry Prompt 39 | 3min | Linha adicionada |
| 14 | `docs/frontend-app-store-roadmap.html` — status Fase A → "concluído"; D2 → "fix local; PR 39B se persistir"; remover menção stale a `#131C2A` da validação | 5min | HTML atualizado |
| 15 | `npm run type-check` + `npm run lint` | 3min | 0 errors (1 i18n warning pre-existente aceitável) |
| 16 | Critique manual contra DESIGN.md Named Rules + 4-lentes mobile-product-critic em HomeV7Content + 2 sheets | 10min | Score documentado ≥ 33/40 |
| 17 | A11y manual: chevrons `accessibilityElementsHidden`; cards `accessibilityRole="button"`; touch targets 44pt mantidos | 8min | 0 críticos |
| 18 | **🚧 Gate decisional pro PR 39B:** validação visual no simulador (screenshot tour cards readonly: NOTAS RECENTES, SINTOMAS, OBSERVAÇÕES, CUSTOS). Se "indistinguíveis do bg" → flag → não escala neste PR | 15min | Decisão registrada (skip ou flag-para-39B) |
| 19 | Commits cirúrgicos (3-4 commits incrementais: AuthButton+sheets / HomeV7 / microcopy / docs) | 5min | History limpo |
| 20 | Push + `gh pr create` | 5min | PR aberto |

**Total estimado:** ~1h50min efetivas (D1=B skipou 10min da etapa 12)

---

## 5) Arquivos

### Criar (2-3)

| Arquivo | Conteúdo |
|---|---|
| `docs/superpowers/plans/2026-05-26-polish-ux-critical.md` | Este plano *(já criado para análise)* |
| `assets/screenshots/polish/` | Tour pós-validação simulador (~10 PNGs após etapa 18) |
| `docs/learnings.md` entry (opcional) | Lição sobre prop opcional vs duplicação |

### Editar (8-10)

| Arquivo | Mudança | LOC |
|---|---|---|
| `components/ui/AuthButton.tsx` | +prop `haptic?` + import `expo-haptics` + chamada antes do `onPress` | +12 |
| `components/home/HomeV7Content.tsx` | +chevron x2 + press feedback x2 + sparkline `r={3}` | +15 |
| `app/peso/registrar.tsx` | +`haptic="medium"` no AuthButton + placeholder no TextField | +2 |
| `app/dose/registrar.tsx` | +`haptic="medium"` no AuthButton | +1 |
| `app/diario/anotar-memoria.tsx` | +`haptic="medium"` + ghost simplificado | +2 |
| `app/diario/anotar-sintoma.tsx` | +`haptic="medium"` + ghost simplificado | +2 |
| `app/diario/anotar-custo.tsx` | +`haptic="medium"` | +1 |
| `locales/pt-BR/weight.json` | `addModal.weightHint` → "Peso (kg)"; `+addModal.weightPlaceholder` "ex: 87,2" | +2 |
| `docs/history.md` | +1 entry Prompt 39 | +1 |
| `docs/frontend-app-store-roadmap.html` | Status Fase A + D2 atualizada + remover menção stale a `#131C2A` | +5 |

**Excluído (D1=B):** ~~`lib/theme/tokens.ts`~~ + ~~`docs/DESIGN.md` Named Rule~~ — escopo PR #76.

**Total edits:** ~40 LOC efetivas (Karpathy §2 confirmado cirúrgico)

### NÃO TOCAR (explícito)

| Item | Razão |
|---|---|
| `lib/theme/tokens.ts` | D2 revisada — blast radius 44 arquivos. D1=B: token `destructive` é escopo PR #76 |
| `docs/DESIGN.md` Named Rule "Destructive Action" | D1=B aprovado: escopo PR #76 (quem cria documenta) |
| `app/_layout.tsx` | Escopo PR #76 paralelo (Settings Hub) |
| `app/configuracoes/*` | Não existe ainda localmente — escopo Settings Hub |
| `app/(tabs)/*` | PR Gear Icon futuro (D3=B) |
| Schemas Supabase, Edge Functions, rotas | Zero migration neste PR |
| `useRegister*` hooks | Fora do escopo cirúrgico |
| `QuickLogChips.tsx` | Fora do escopo |
| Sheets layout/comportamento (além do ghost) | Cirúrgico — só microcopy |
| `WeightHistoryRow`, `WeightStatsCard`, charts em Relatórios | Fora do escopo |
| Outros componentes com Haptics próprios (`quick-log.tsx`, `TabBarButton`) | Mantém escopo cirúrgico — não duplicar refactor |

---

## 6) Riscos com mitigação concreta

| # | Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|---|
| 1 | Refactor `AuthButton` afeta 14 consumers sem prop `haptic` | Baixa | Médio | Prop opcional. **Verificado:** 14 consumers. Sem prop = sem mudança. Type-check valida |
| 2 | Chevron conflita visualmente com `+` no header | Baixa | Baixo | `+` em `sectionHeaderRow` (topo); chevron em `sectionBody` (linha do valor). Espaçados. Sem overlap |
| 3 | Press feedback `scale: 0.98` interage mal com nested Pressable (body outer + `+` inner) | Média | Médio | `SectionHeaderRow` já tem Pressable próprio. Nested OK em RN — `onPress` não bubblea. Validar manualmente etapa 18 |
| 4 | Ghost simplificado parece "vazio demais" | Baixa | Baixo | Aceitar — feedback real (TestFlight Fase F) decide se reverter |
| 5 | Haptics não dispara em simulador iOS | Alta | Baixo | Validar lógica (chamada presente, posição correta). Validação real em TestFlight Fase F |
| 6 | `/impeccable critique` indisponível (blocker dos PRs #73/74/75) | Alta | Baixo | Critique manual contra DESIGN.md Named Rules + 4-lentes |
| 7 | Conflito com PR #76 Settings Hub (paralelo Aba 2) | Baixa | Baixo | Escopos disjuntos: este PR não toca `app/_layout.tsx` nem `app/configuracoes/*`. `AuthButton.tsx` isolado |
| 8 | Cards readonly continuam indistinguíveis pós-fix | Média | Baixo | Aceitável — flag pra PR 39B (documentado). Etapa 18 é gate decisional |
| 9 | ~~D1: `colors.destructive` não existe em main~~ | — | — | ✅ Resolvido: D1=B aprovado, skip do critério neste PR |
| 10 | `addModal.weightPlaceholder` pode não existir no JSON atual | Média | Baixo | Verificar e adicionar se ausente — operação trivial |

---

## 7) Como vou validar

- [ ] `npm run type-check` → 0 errors
- [ ] `npm run lint` → 0 errors (1 warning i18n pre-existente OK)
- [ ] **AuthButton refactor**: 14 consumers compilam sem mudança; 5 sheets passam `haptic="medium"`
- [ ] **Chevrons**: visíveis em PRÓXIMA DOSE + PESO; ausentes em readonly (NOTAS, SINTOMAS, OBSERVAÇÕES, CUSTOS)
- [ ] **Press feedback**: tap visível em cards interativos; nested `+` continua funcional
- [ ] **Sparkline**: dot final ~50% maior (r 2.2 → 3); cor `mintSoft` mantida
- [ ] **Microcopy**:
  - [ ] Label Peso = "Peso (kg)"
  - [ ] Placeholder Peso = "ex: 87,2"
  - [ ] Ghost Notas = "ex: bati o pé pra não comer doce hoje"
  - [ ] Ghost Sintoma = "ex: náusea leve depois do almoço"
- [ ] **Critique manual**: score ≥ 33/40 (vs 28-30 baseline)
- [ ] **A11y manual**:
  - [ ] Chevrons decorativos (`accessibilityElementsHidden` ou ausentes do tree)
  - [ ] Cards `accessibilityRole="button"`
  - [ ] Touch targets 44pt mantidos
- [ ] **Validação visual (etapa 18)**: cards readonly OK ou flag pra PR 39B
- [ ] **D2 stale removida**: validação não menciona `bgElevated #131C2A` em `tokens.ts` (este plano + `roadmap.html`)
- [ ] **Doc updates**: `history.md` + `roadmap.html` (`DESIGN.md` skip — escopo PR #76)

---

## 8) Otimização de tokens

- `rtk grep` para próximas buscas (`bgElevated`, `AuthButton`, `haptic`, `chevron`)
- `rtk read` para `HomeV7Content.tsx` (950 linhas) — usar Read com `offset`/`limit` nos hunks específicos
- Outputs `npm run *` → `/tmp/*.log` referenciados via `@file`
- Plano salvo em arquivo (regra 21) — sem despejo no chat
- Doc updates via Edit direto, não via grill-with-docs (escopo cirúrgico)
- Sem `tsc --watch` ou Metro dev server polling — só validações pontuais
- Caveman desabilitado (regra 16)

---

## 9) Coordenação com PR #76 Settings Hub

| Item | Estado |
|---|---|
| PR #76 Settings Hub | **Pausado** em `1b95261` (worktree `/private/tmp/dose-day-v5-settings-76`) |
| Conflito esperado | Nenhum — escopos disjuntos |
| `app/_layout.tsx` | Settings Hub vai mexer; este PR **não** mexe |
| `AuthButton.tsx` | Este PR refatora (+prop); Settings Hub **não** mexe |
| `colors.destructive` | Settings Hub planejou adicionar e **documenta** (etapa 15 via grill-with-docs). **D1=B aprovado:** Polish não toca |
| Estratégia de merge | Este PR mergeia primeiro (mais curto); Settings Hub rebaseia em `main` atualizado quando despausar |

---

## ✅ Decisões cravadas por Léo (2026-05-26 8:53 GMT-3)

| # | Decisão | Implicação |
|---|---|---|
| **D1** | **B** — Polish NÃO toca `colors.destructive` | Skip etapa 12; escopo PR #76 |
| **D2** | **Sim** — Remover menção stale a `#131C2A` | Limpar este plano + `roadmap.html` |
| **D3** | **Sim** — Critique manual | Substitui skill ausente |
| **Cadência** | Manual approve em cada edit; pausa em qualquer checkpoint se algo divergir | Cada Edit/Write pede aprovação |

**Status:** plano aprovado, execução em andamento etapas 3-20.

---

**Fim do plano.**
