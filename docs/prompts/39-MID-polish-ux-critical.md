# DoseDay V5 — Prompt 39-MID-polish-ux-critical

**Instância de destino:** Aba 1 (worktree principal `~/Desktop/dose-day-v5/`)
**Branch a criar:** `feature/39-polish-ux-critical`
**Modelo:** Sonnet/Opus (MID — token global muda + múltiplos arquivos)
**Caveman:** N/A
**Coordenação:** Roda em paralelo com **PR Settings Hub** (Aba 2 worktree `/private/tmp/dose-day-v5-settings-76`). Zero overlap real — Fase A toca `HomeV7Content.tsx`, sheets de registro, e `tokens.ts`. Settings Hub toca `app/configuracoes/*` + `app/_layout.tsx` (registrations isoladas).

---

## Contexto obrigatório (leia ANTES de qualquer coisa, na ordem)

1. `CLAUDE.md` (raiz) — regras anti-pirraça 1–31
2. `@docs/karpathy.md` — escopo cirúrgico, assumptions explícitas
3. `@docs/frontend-app-store-roadmap.html` — **roadmap mestre desta fase**. Especial atenção: seção 2 (Critique 4 lentes), seção 3 (decisões cravadas D1-D5), seção 8 (próximo passo)
4. `@docs/HOME_DESIGN_DIRECTION.md` — §5 linguagem visual, §5.4 mint state rule
5. `@docs/DESIGN.md` — tokens canônicos, Named Rules
6. `@docs/PRODUCT_COHERENCE.md` — §11.3 vocabulário público
7. `@CONTEXT.md` — glossário
8. `lib/theme/tokens.ts` — **arquivo crítico** — vai mudar `colors.bgElevated`
9. `components/home/HomeV7Content.tsx` — refactor visual (chevron, press feedback, sparkline)
10. `app/peso/registrar.tsx` — label fix
11. `app/diario/anotar-memoria.tsx` — ghost simplificado
12. `app/diario/anotar-sintoma.tsx` — ghost simplificado
13. Memórias auto-injetadas (regra 30) — ler primeiro
14. Rodar `npx claude-mem search "polish chevron contraste card press feedback"` ANTES de planejar

---

## Objetivo desta tarefa

Resolver as **issues críticas de UX** identificadas via `/mobile-product-critic` aplicado nas 7 telas pós-PR #75, sem refactor estrutural. Foco em **affordance visual** (chevrons, press feedback), **contraste de cards** (bg-elevated mais alto), **microcopy** (label Peso, ghosts simplificados) e **feedback haptic** consistente.

Este PR NÃO refatora sheets pra Centered Modal (decisão D1=A — Form Sheet HIG-aprovado mantido). NÃO toca tab bar (decisão D3=B — gate pro PR Gear Icon após Settings Hub). NÃO adiciona gráficos (decisão D4=sim, mas é PR separado Fase E).

**Outcome esperado:** Home v7 + sheets de registro com affordance clara, contraste visual coerente, microcopy refinada. Pronto pra próximo round de validação visual no simulador antes de avançar pra Fase C/D/E.

---

## Critérios de aceitação

### Contraste — fix LOCAL primeiro (decisão D2 revisada pós-Codex review)

**Decisão revisada:** NÃO mudar `colors.bgElevated` global agora — risco de blast radius (token usado em inputs, sheets, empty states, Settings novos, Onboarding). Chevron + press feedback (próximas seções) já resolvem affordance dos cards interativos. Cards readonly ficam intencionalmente discretos (hierarquia visual natural).

- [ ] **NÃO tocar** `lib/theme/tokens.ts` neste PR
- [ ] Se após validação visual (no simulador, com chevrons + press feedback aplicados) a sensação de "margens invisíveis" persistir nos cards readonly (NOTAS RECENTES, OBSERVAÇÕES, CUSTOS, etc.) → abrir **PR 39B separado** que mexe no token global com screenshot tour prévio
- [ ] **Documentar `colors.destructive`** (`#FF453A`) no `DESIGN.md` — token foi adicionado em PR Settings Hub etapa 5b mas não foi documentado. Inclui Named Rule "The Destructive Action Rule": cor reservada exclusivamente para ações irreversíveis (excluir conta, sair de sessão crítica). Não usar pra erros não-destrutivos (usar `semanticError`/`warning`)

### Chevron em cards tapáveis

- [ ] `components/home/HomeV7Content.tsx` — adicionar `chevron.right` SF Symbol à direita dos cards interativos:
  - **PRÓXIMA DOSE** (já tem `Pressable` wrapping → `/perfil/protocolo`) — adicionar chevron
  - **PESO** (já tem `Pressable` wrapping → `/peso/historico`) — adicionar chevron
- [ ] Chevron deve usar `<SymbolView name="chevron.right" size={14} tintColor={colors.semanticMuted} />`
- [ ] Posicionamento: `marginLeft: 'auto'` (empurra pra direita) + `marginRight: spacing.md`
- [ ] **NÃO adicionar chevron** em cards read-only (MEMÓRIA RECENTE timeline, SINTOMAS readonly, OBSERVAÇÕES, CUSTOS) — só onde body tap navega
- [ ] O `+` icon (PR #75) continua à direita dos headers — chevron entra DENTRO do card, ao lado do conteúdo

### Press feedback em cards tapáveis

- [ ] `HomeV7Content.tsx` — cards PRÓXIMA DOSE e PESO ganham press feedback visual:
  - `style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}`
  - `cardPressed`: `transform: [{ scale: 0.98 }]` + `opacity: 0.85`
  - Pattern já existe no projeto em `styles.arrowButtonPressed` — replicar a abordagem
- [ ] **Sem haptics no card press** — apenas no submit final dos sheets (próximo critério). Tap em card é navegação leve, haptic seria intrusivo

### Label Peso (microcopy)

- [ ] `app/peso/registrar.tsx`:
  - **Antes:** label "Entre 30 e 300 kg" + input vazio
  - **Depois:** label "Peso (kg)" + placeholder ghost "ex: 87,2"
  - Validation continua 30-300 (não muda Zod schema, só copy)
  - Helper text discreto abaixo do input (opcional, se já existe): "Entre 30 e 300 kg"

### Ghost simplificado em Notas e Sintoma

- [ ] `app/diario/anotar-memoria.tsx`:
  - **Antes:** "ex: bati o pé pra não comer doce hoje · domingo foi difícil"
  - **Depois:** "ex: bati o pé pra não comer doce hoje"
- [ ] `app/diario/anotar-sintoma.tsx`:
  - **Antes:** "ex: náusea leve depois do almoço · azia ao deitar"
  - **Depois:** "ex: náusea leve depois do almoço"

### Sparkline endpoint maior

- [ ] `components/home/HomeV7Content.tsx` — componente `WeightSparkline` (interno):
  - Encontrar o `<SvgCircle>` ou similar que renderiza o ponto final
  - **Tamanho atual:** 4pt (raio 2pt provavelmente)
  - **Tamanho novo:** 6pt (raio 3pt)
  - Cor mintSoft (`#A3E6D2`) mantida — não mudar
  - Não mudar o ponto inicial (continua neutro, semanticMuted)

### Haptic via prop opcional no AuthButton (DRY — pós-Codex review)

**Decisão revisada:** em vez de duplicar `Haptics.impactAsync` em 5 telas, adicionar prop opcional `haptic` no `AuthButton` componente compartilhado. DRY + futura consistência.

- [ ] `components/ui/AuthButton.tsx` — adicionar prop opcional:
  ```tsx
  type AuthButtonProps = {
    label: string
    onPress: () => void
    loading?: boolean
    disabled?: boolean
    variant?: 'primary' | 'secondary'
    haptic?: 'light' | 'medium' | 'heavy'  // ← NOVA prop
  }
  ```
- [ ] Implementar: quando `haptic` definido, chamar `Haptics.impactAsync(Haptics.ImpactFeedbackStyle[capitalize(haptic)])` ANTES do `onPress` user-provided
- [ ] Atualizar os 5 sheets de registro para passar a prop:
  - `app/dose/registrar.tsx` — `<AuthButton ... haptic="medium" />`
  - `app/peso/registrar.tsx` — idem
  - `app/diario/anotar-memoria.tsx` — idem
  - `app/diario/anotar-sintoma.tsx` — idem
  - `app/diario/anotar-custo.tsx` — idem
- [ ] **NÃO refatorar** outros componentes que já têm Haptics próprios (quick-log.tsx etc.) — mantém escopo cirúrgico
- [ ] Validação no simulador: haptic não dispara em simulador iOS, mas tap no CTA deve continuar funcionando. Validação real fica pra TestFlight (Fase F)

### Atualização de doc

- [ ] `docs/DESIGN.md` — adicionar Named Rule "The Elevated Card Contrast Rule" (justifica mudança de `bgElevated`)
- [ ] `docs/HOME_DESIGN_DIRECTION.md` §5 — atualizar referência a `bgElevated` se houver
- [ ] `docs/history.md` — entry do Prompt 39
- [ ] `docs/frontend-app-store-roadmap.html` — atualizar status da Fase A para "em execução" / "concluído" via grill-with-docs ou edit direto

---

## Restrições explícitas

- **NÃO refatorar sheets** pra Centered Modal — decisão D1=A confirmada, Form Sheet HIG-aprovado mantido
- **NÃO tocar tab bar** ou `app/(tabs)/*` — decisão D3=B, gate pro PR Gear Icon
- **NÃO adicionar gráficos** — decisão D4=sim mas em PR separado (Fase E)
- **NÃO subir dev build** — decisão D5=Fase F
- **NÃO mexer em `app/configuracoes/*`** — escopo do PR Settings Hub em paralelo na Aba 2
- **NÃO mexer em `app/_layout.tsx`** — Settings Hub vai mexer; este PR não tem necessidade
- **NÃO mexer em rotas ou schemas Supabase** — zero migration
- **NÃO usar `as any`, `// @ts-ignore`, `// eslint-disable`** sem justificativa explícita
- **NÃO adicionar mint em Settings ou em qualquer lugar fora do escopo do mint state rule** — §5.4 HOME_DESIGN_DIRECTION
- **NÃO usar `expo-glass-effect`** — Liquid Glass entra na Fase F via dev build
- **PT-BR obrigatório** em todos os textos visíveis
- **Karpathy §3 cirúrgico** — cada linha alterada deve traçar a um critério acima. Zero drive-by refactor.
- **Touch target ≥ 44pt** mantido em todos os elementos interativos (não muda nada nesse PR, mas validar press feedback não diminui touch area)

---

## Antes de executar, RETORNE:

### A) Skills que vai utilizar

| Fase | Skill | Por quê |
|---|---|---|
| Pré-leitura | `karpathy-guidelines` | Assumptions explícitas, "could 50 lines do this?", success criteria verificáveis |
| Pré-leitura | `claude-mem:mem-search` | Trazer trabalho prévio sobre polish, chevron, contraste, press feedback |
| Planejamento | `superpowers:writing-plans` | Persistir plano em `docs/superpowers/plans/2026-05-26-polish-ux-critical.md` (regra 21) |
| Implementação | `impeccable polish` | Skill específica de pass final de qualidade — gate ideal pra polish UX |
| Implementação | `react-native-best-practices` | Pressable patterns, SymbolView usage, StyleSheet conventions |
| Validação | `design:accessibility-review` | WCAG 2.1 AA — contraste de cards, chevron contrast, touch targets mantidos |
| Validação | `impeccable critique` | Re-rodar critique após mudanças — score deve subir >= 33/40 |
| Sessão | `claude-mem` | Compactação automática session-end (regra 30) |

### B) Plano de execução revisado pós-Codex review (~2h efetivas)

| # | Etapa | Tempo | Checkpoint |
|---|---|---|---|
| 1 | Pré-leitura + mem-search | 5min | 3 memórias relevantes citadas |
| 2 | Salvar plano em `docs/superpowers/plans/2026-05-26-polish-ux-critical.md` (Karpathy §1-§4) | 10min | arquivo criado |
| 3 | `git checkout -b feature/39-polish-ux-critical` em main atualizado | 1min | branch ativa |
| 4 | `components/ui/AuthButton.tsx` — adicionar prop opcional `haptic?: 'light' \| 'medium' \| 'heavy'` + lógica de impactAsync antes do onPress | 15min | type-check PASS |
| 5 | Atualizar os 5 sheets de registro (`dose/registrar`, `peso/registrar`, `diario/anotar-memoria`, `diario/anotar-sintoma`, `diario/anotar-custo`) com `haptic="medium"` no AuthButton | 10min | grep confirma 5 sheets atualizados |
| 6 | `components/home/HomeV7Content.tsx` — adicionar chevron em PRÓXIMA DOSE + PESO | 15min | screenshot Home com chevrons |
| 7 | `HomeV7Content.tsx` — adicionar press feedback (scale 0.98 + opacity 0.85) nos cards interativos | 10min | screenshot do estado pressed (simulador) |
| 8 | `HomeV7Content.tsx` — aumentar dot endpoint do sparkline de 4pt → 6pt | 5min | screenshot sparkline |
| 9 | `app/peso/registrar.tsx` — fix label "Entre 30 e 300 kg" → "Peso (kg)" + placeholder "ex: 87,2" (atualizar `locales/pt-BR/weight.json` se aplicável) | 5min | screenshot sheet Peso |
| 10 | `app/diario/anotar-memoria.tsx` — ghost simplificado | 2min | screenshot |
| 11 | `app/diario/anotar-sintoma.tsx` — ghost simplificado | 2min | screenshot |
| 12 | Atualizar `docs/DESIGN.md` com Named Rule "The Destructive Action Rule" via grill-with-docs (documenta `colors.destructive` adicionado em PR Settings Hub etapa 5b) | 10min | doc atualizado |
| 13 | Atualizar `docs/history.md` com entry Prompt 39 | 3min | linha adicionada |
| 14 | Atualizar `docs/frontend-app-store-roadmap.html` — marcar Fase A como "concluído" no status; ajustar D2 pra "fix local + token global em PR 39B se necessário" | 5min | HTML atualizado |
| 15 | `npm run type-check` + `npm run lint` | 3min | 0 errors |
| 16 | `/impeccable critique components/home/HomeV7Content.tsx` — score deve ser >= 33/40 (vs ~28-30 baseline). Fallback critique manual | 10min | score documentado |
| 17 | `design:accessibility-review` em HomeV7Content + AuthButton refactor | 10min | 0 críticos |
| 18 | Validação visual no simulador: rodar app, screenshot tour de todas as telas pra confirmar que cards readonly não ficaram "indistinguíveis" do background. Se sim → flag pra abrir PR 39B (token global) | 15min | gate decisional pro PR 39B |
| 19 | Commit cirúrgico (mensagens descritivas, 3-4 commits incrementais) | 5min | history limpo |
| 20 | Push + abrir PR via `gh` | 5min | PR aberto |

**Total estimado:** ~2h (escopo reduzido vs original — sem token global, com refactor cirúrgico do AuthButton)

### C) Riscos identificados

| # | Risco | Mitigação |
|---|---|---|
| 1 | Refactor `AuthButton` afeta consumers existentes que NÃO usam `haptic` (onboarding, perfil, etc.) | Prop é OPCIONAL — `haptic?: ...`. Sem prop = comportamento atual. Validar via type-check + grep de `<AuthButton` no codebase pra ver consumers |
| 2 | Chevron pode visualmente conflitar com o `+` icon no header dos cards interativos (PRÓXIMA DOSE tem header com `+` desde PR #75) | Posicionamento: `+` no header (topo direito), chevron na linha do valor (centro direito). Não conflita se espaçados |
| 3 | Press feedback `scale: 0.98` pode interagir mal com card já tendo Pressable nested (e.g. card outer Pressable + `+` Pressable inner) | Validar manualmente: tap no `+` deve abrir sheet, tap no body deve navegar. Sem propagação ambígua |
| 4 | Ghost simplificado pode parecer "vazio demais" pra usuárias | Comparação A/B visual nos 2 sheets. Se feedback ruim em testes posteriores, voltar pra 2 exemplos |
| 5 | Haptics em simulador não dispara — pode dar falso negativo na validação | Documentar que validação real fica pra TestFlight (Fase F). Validar lógica no código (chamada presente, position correta) |
| 6 | `/impeccable critique` continua indisponível (blocker conhecido dos PRs #73/74/75) | Fallback: critique manual contra DESIGN.md + Named Rules + 4 lentes mobile-product-critic |
| 7 | Conflito com PR Settings Hub (Aba 2) — improvável já que escopos são disjuntos | Verificar antes de push: `app/_layout.tsx` NÃO foi tocado nesse PR. `AuthButton.tsx` é arquivo isolado. Conflito real só se Settings Hub também refatorar `AuthButton` (não está no plano dele) |
| 8 | Pós-validação visual (etapa 18), cards readonly continuam "indistinguíveis" — pressão pra abrir PR 39B (token global) imediatamente | Aceitável — PR 39B é caminho documentado. Não estende escopo deste PR |

### D) Arquivos que vai criar/editar

#### Criar (3)

| Arquivo | Resumo |
|---|---|
| `docs/superpowers/plans/2026-05-26-polish-ux-critical.md` | Plano persistido (regra 21) |
| `assets/screenshots/polish/` | Screenshots tour: contrast-pass/ + features/ |
| (opcional) `docs/learnings.md` entry sobre Named Rule criada | |

#### Editar (~8)

| Arquivo | Mudança |
|---|---|
| `components/ui/AuthButton.tsx` | +prop opcional `haptic?: 'light' \| 'medium' \| 'heavy'` + lógica `Haptics.impactAsync` |
| `components/home/HomeV7Content.tsx` | +chevron em 2 cards · press feedback · sparkline dot 4→6pt |
| `app/peso/registrar.tsx` | label "Entre 30 e 300 kg" → "Peso (kg)" + placeholder · pass `haptic="medium"` no AuthButton |
| `app/dose/registrar.tsx` | pass `haptic="medium"` no AuthButton |
| `app/diario/anotar-memoria.tsx` | ghost simplificado · pass `haptic="medium"` |
| `app/diario/anotar-sintoma.tsx` | ghost simplificado · pass `haptic="medium"` |
| `app/diario/anotar-custo.tsx` | pass `haptic="medium"` |
| `locales/pt-BR/weight.json` | label key se aplicável pra fix de microcopy |
| `docs/DESIGN.md` | +Named Rule "The Destructive Action Rule" via grill-with-docs (documenta `colors.destructive`) |
| `docs/history.md` | +1 entry Prompt 39 |
| `docs/frontend-app-store-roadmap.html` | status Fase A atualizado · D2 marcado como "fix local primeiro" |

**NÃO toca:** `lib/theme/tokens.ts` (decisão D2 revisada — local first); `app/_layout.tsx` (escopo Settings Hub paralelo); telas órfãs do `app/(tabs)/*` (escopo PR Gear Icon).

#### NÃO TOCAR

- `app/_layout.tsx` — Settings Hub está mexendo em paralelo
- `app/configuracoes/*` — escopo Settings Hub
- `app/(tabs)/*` — tab bar gated por PR Gear Icon
- Qualquer schema Supabase, Edge Function, ou rota
- Sheets de Sintoma/Notas/Custo além do ghost (escopo cirúrgico) — não tocar layout, comportamento, etc.
- `components/diario/QuickLogChips.tsx` — fora do escopo
- `useRegisterMemoryNote`, `useRegisterSymptom`, `useRegisterCost`, `useRegisterDose`, `useWeightLogs` — fora do escopo

### E) Como vai validar

- [ ] `npm run type-check` → 0 errors
- [ ] `npm run lint` → 0 errors (1 warning preexistente em i18n aceitável)
- [ ] **Token de contraste**:
  - [ ] `bgElevated` é `#131C2A` em `tokens.ts`
  - [ ] Screenshot tour de 10+ telas sem regressão visual
  - [ ] DESIGN.md tem Named Rule documentando a escolha
- [ ] **Cards tapáveis**:
  - [ ] Chevron visível à direita do conteúdo em PRÓXIMA DOSE e PESO
  - [ ] Tap no body navega (PRÓXIMA DOSE → /perfil/protocolo, PESO → /peso/historico)
  - [ ] Press feedback visível (scale + opacity)
  - [ ] `+` icon do header continua funcional sem conflito
- [ ] **Microcopy**:
  - [ ] Label Peso é "Peso (kg)" com placeholder "ex: 87,2"
  - [ ] Ghost Notas: "ex: bati o pé pra não comer doce hoje"
  - [ ] Ghost Sintoma: "ex: náusea leve depois do almoço"
- [ ] **Sparkline endpoint**:
  - [ ] Dot final visivelmente maior que o atual
  - [ ] Cor mintSoft mantida
- [ ] **Haptics**:
  - [ ] Todos os 5 sheets de submit têm `Haptics.impactAsync` no CTA
  - [ ] Posicionamento: imediatamente antes da mutation, dentro do handleSubmit
- [ ] **Critique manual ou /impeccable critique** em HomeV7Content + 2 sheets de exemplo:
  - [ ] Score >= 33/40 (vs ~28-30 baseline pré-fix)
- [ ] **Accessibility review**:
  - [ ] Chevrons têm `accessibilityHidden` ou `accessibilityRole="none"` (decorativos)
  - [ ] Cards tapáveis continuam com `accessibilityRole="button"`
  - [ ] Press feedback não afeta touch area (validar 44pt mantido)

### F) Otimização de tokens

- `rtk grep "bgElevated" --type ts` em vez de grep full (etapa 4)
- `rtk read` em `HomeV7Content.tsx` se > 200 linhas
- Outputs de `npm install` / `npm run *` salvos em `/tmp/*.log` referenciados via `@file`
- Plano salvo em arquivo (regra 21) — não despejar no chat
- Memória entre sessões via `claude-mem` (regra 30)
- Atualizações de doc via grill-with-docs — não duplicar conteúdo no chat

---

## Karpathy §1 — Assumptions explícitas

1. `bgElevated` é usado consistentemente em todo o app via tokens — não há hardcoded `#0E1620` solto (Codex já fez essa limpeza em PRs anteriores)
2. Pattern `Pressable` + `pressed && stylePressed` já existe no projeto (e.g. `arrowButtonPressed`) — replicar
3. SF Symbol `chevron.right` está disponível via `expo-symbols` já no projeto
4. `Haptics` (`expo-haptics`) já está instalado e usado em outros lugares — verificar antes de adicionar
5. Tela `/peso/registrar` tem label "Entre 30 e 300 kg" como observado no screenshot 2 que Léo enviou (07:18)
6. Sparkline tem 2 dots (início + fim) com cores diferentes — só mexer no fim
7. `bgBase` continua `#0B1017` — não mudar. Só `bgElevated` muda

## Karpathy §2 — Could 50 lines do this?

Quase. Cada fix individual é 2-15 linhas:
- Token: 1 linha
- Chevron x2: ~6 linhas
- Press feedback x2: ~10 linhas (StyleSheet + lógica)
- Sparkline dot: 2-3 linhas
- Label Peso: 3 linhas (label + placeholder + opcional helper)
- Ghosts x2: 2 linhas cada
- Haptics x5: 5 linhas cada

**Total novo:** ~40-60 LOC efetivas. **Edits:** ~30 LOC. Cirúrgico ✅.

## Karpathy §3 — Cirurgia

Tabela D declara escopo. Lista NÃO TOCAR explícita. Zero drive-by refactor. Diff esperado: ~8 arquivos editados, ~3 criados, zero arquivos surpresa.

## Karpathy §4 — Sucesso verificável

Seção E é checklist binário. Score >= 33/40 é gate quantitativo.

---

## ⏸️ Pause aqui e aguarde aprovação do Léo antes de executar.

Retorno esperado do Claude Code:

1. Confirmação de leitura dos 14 itens do "Contexto obrigatório"
2. Output curto de `npx claude-mem search "polish chevron contraste card press feedback"`
3. Output do **grep prévio** de `bgElevated` no codebase (etapa 4) — count + arquivos afetados
4. Tabela A (Skills) preenchida
5. Plano B com tempos confirmados
6. Riscos C com mitigações concretas
7. Tabela D (arquivos) preenchida
8. Checklist E confirmado
9. Nota F de otimização

**Sem código.** Sem screenshots ainda. Sem PR. Só plano.

Léo aprova → Claude Code executa etapas 5–23 em sequência, com checkpoints onde pausar se algo divergir.

**Manual approve recomendado** — token global muda + múltiplos arquivos. Cada edit merece revisão.

**Coordenação com PR Settings Hub:** rodando em paralelo na Aba 2 (worktree). Zero overlap esperado. Se conflito surgir, este PR mergeia primeiro (mais curto) e Settings Hub rebaseia em main atualizado.
