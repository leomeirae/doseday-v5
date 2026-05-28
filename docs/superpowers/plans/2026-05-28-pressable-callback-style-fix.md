# Pressable callback-style fix (NativeWind v4) — Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar o bug estrutural em que `jsxImportSource: 'nativewind'` descarta `style={({pressed}) => [...]}` nos `Pressable`, colapsando ~30 componentes (botões/chips/cards) para conteúdo nu.

**Architecture:** Opção A (caso a caso), 2 sub-padrões. Sem novo componente/abstração. StyleSheet mantido. Escopo: só os 🔴 ALTO (~30 casos). Os 🟡 BAIXO ficam deferidos pra 42k.

**Tech Stack:** React Native 0.81 + Expo SDK 54 + NativeWind v4.2.4. StyleSheet, não NativeWind className.

---

## Causa raiz (confirmada)

`babel.config.js` → `presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel']`. Com isso, **todo** `Pressable` que usa `style` como função tem o retorno do callback descartado. O style base some → o componente colapsa pro conteúdo. Severidade visual depende de o base ter `backgroundColor`/`borderWidth`/dimensões (🔴) ou ser só layout (🟡).

## Os 2 sub-padrões de fix

### Sub-padrão 1 — Singletons interativos (botão/card/row/icon-button)
Restaura base **e** pressed:
```diff
+import { useState } from 'react'
+const [pressed, setPressed] = useState(false)
 <Pressable
   onPress={...}
+  onPressIn={() => setPressed(true)}
+  onPressOut={() => setPressed(false)}
-  style={({ pressed }) => [styles.base, cond && styles.x, pressed && styles.pressed]}
+  style={[styles.base, cond && styles.x, pressed && styles.pressed]}
 >
```

### Sub-padrão 2 — Selecionáveis dentro de `.map()` (chips/segmented)
Hook não pode rodar em loop. O `pressed` já está morto hoje (descartado) → dropar não é regressão. Mantém base + selected:
```diff
-  style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.chipPressed]}
+  style={[styles.chip, selected && styles.chipSelected]}
```
Remover do StyleSheet apenas o `chipPressed` órfão **se** ficar sem nenhum uso (Karpathy: limpar só o que o próprio fix orfana).

---

## Escopo — 🔴 ALTO a corrigir (Escopo 1 aprovado)

Singletons (sub-padrão 1):
- app/perfil/account.tsx:114 (saveButton), :148 (deleteButton)
- app/perfil/notificacoes.tsx:171 (card), :268 (testButton)
- app/configuracoes/tratamento/medico.tsx:179 (dateButton)
- app/configuracoes/dados.tsx:289 (secondaryButton), :303 (destructiveButton)
- components/home/EmptyDoseStateCard.tsx:62 (cta)
- components/home/HomeQuickActions.tsx:22 (primary), :37 (secondary)
- components/welcome/WelcomeActionDock.tsx:32 (primary), :49 (secondary)
- components/relatorios/WeightChartCard.tsx:37 (card)
- components/diario/CheckinCard.tsx:59 (ctaButton)
- components/notifications/PermissionDeniedBanner.tsx:54 (ctaButton)
- components/notifications/PermissionRequestModal.tsx:74 (btnPrimary), :83 (btnSecondary)
- components/onboarding/SelectionCard.tsx:31 (card)
- components/onboarding/OnboardingShell.tsx:117 (primary), :136 (secondary)

Selecionáveis em `.map()` (sub-padrão 2):
- app/configuracoes/tratamento/medico.tsx:136 (segmented) **— PRIORIDADE PO**
- app/perfil/protocolo.tsx:110 (chip)
- app/(onboarding)/dose.tsx:111 (chip)
- app/(onboarding)/dose-frequency.tsx:114 (chip)
- app/diario/anotar-sintoma.tsx:134 (chip)
- app/diario/quick-log.tsx:112 (chip)
- components/diario/SymptomsMultiSelect.tsx:35 (chip)
- components/diario/TriggersMultiSelect.tsx:35 (chip)
- components/diario/EmotionalStatePicker.tsx:31 (item)
- components/onboarding/ConcernsChips.tsx:25 (chip)

## Deferido pra 42k — 🟡 BAIXO (NÃO tocar)
medico.tsx:209 (clearButton/link), account.tsx:78 (back), anotar-custo.tsx:100 (saveHeader), custos.tsx:46 / notas.tsx:45 / historico.tsx:76 (plusButtons), lembretes.tsx:159/:211 (rows), dados.tsx:213 (xmark), SettingsHeader.tsx:26 (back), SettingsRow.tsx:41 (row), ConsentCheckbox.tsx:31 (row), OnboardingShell.tsx:168 (icon).

## NÃO tocar
AuthButton.tsx (já corrigido #91), tokens, hooks, queries, schemas, casos 🟡.

---

## Tasks

### Task 1: Validação empírica ANTES (baseline em main behavior)
- [ ] `npx expo start --clear` (simulador iOS já booted)
- [ ] Navegar e screenshot ANTES de: medico (segmented), onboarding dose (chips), home (quick actions/cards). Salvar em `assets/screenshots/prompt42i/` sufixo `-antes`.
- [ ] Reconfirmar severidade: se um 🔴 renderiza OK → reclassificar 🟡 e deferir (reportar). Se um 🟡 visível quebra → reportar e incluir.

### Task 2: Sub-padrão 2 (chips/segmented) — prioridade medico primeiro
- [ ] Para cada arquivo da lista "Selecionáveis em .map()": trocar `style={({pressed}) => [...]}` por array estático sem o branch `pressed`. Remover style `*Pressed` órfão do StyleSheet só se ficar sem uso.
- [ ] `npm run type-check` → PASS
- [ ] medico segmented: 3 chips com border/padding/label, selected destacado, clicável.

### Task 3: Sub-padrão 1 (singletons)
- [ ] Para cada arquivo da lista "Singletons": adicionar `useState` (import se faltar), `onPressIn/onPressOut`, e remover a arrow do `style` (array estático com `pressed && ...`).
- [ ] Atenção: componentes que já recebem `onPressIn/onPressOut` por prop — compor, não clob, e não duplicar import de `useState`.
- [ ] `npm run type-check` → PASS

### Task 4: Validação
- [ ] `npm run type-check` → PASS
- [ ] `npm run lint` → PASS
- [ ] `grep -rn "style={({ pressed }) => \[" app/ components/` → só restam os 🟡 deferidos (~13)
- [ ] Screenshots DEPOIS dos mesmos casos da Task 1, sufixo `-depois`. Mínimo 6 PNGs no total em `assets/screenshots/prompt42i/`.

### Task 5: Commit + PR (anti-contaminação)
- [ ] `git status --short` (VALIDAR — zero graphify-out/.codegraph)
- [ ] Se houver lixo staged: `git restore --staged graphify-out/ .codegraph/`
- [ ] `git add` apenas arquivos do fix + screenshots + este plano
- [ ] `git status --short` (VALIDAR DE NOVO)
- [ ] commit `fix(ui): Pressable callback-style — fix sistêmico do bug NativeWind v4 em ~30 componentes`
- [ ] `git push -u origin feature/42i-pressable-callback-style-fix`
- [ ] PR via gh, target `main`, com tabela de auditoria + decisão A + screenshots + deferidos 42k.

## Riscos
- Chips em `.map()` que dependiam de `pressed` pra um efeito além de selected → improvável (pressed já morto). Verificar visual.
- Componente que já passa `onPressIn/Out` → compor handlers.
- Contaminação git (3 PRs falharam: 42d/42f/42g) → checklist Task 5.
