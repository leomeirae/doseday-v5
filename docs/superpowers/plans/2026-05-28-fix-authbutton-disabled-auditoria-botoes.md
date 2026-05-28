# Fix AuthButton disabled + Auditoria de botões + Diagnóstico "Done" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Tornar o estado `disabled` do `AuthButton` visível como botão fantasma mint (hoje invisível contra `bgBase`), auditar todos os botões de salvar, e diagnosticar o "Done" inglês no `/peso/registrar`.

**Architecture:** Fix cirúrgico no componente central `AuthButton.tsx` (StyleSheet, não NativeWind) — propaga para 17 telas. Auditoria read-only. "Done" diagnosticado como localização iOS nativa faltante → fix deferido para 42i (exige prebuild).

**Tech Stack:** React Native + Expo SDK 54, StyleSheet, tokens canônicos (`colors.brand`, `colors.brandDim`), expo-router.

---

## Premissa corrigida (Karpathy "validate premises")

O prompt assumiu que `labelDisabled` NÃO existia e precisava ser criado + wired. **Errado:** já existe (`AuthButton.tsx:93-95`) e já é aplicado (`AuthButton.tsx:51`). Fix real = ~4 linhas, não 8-10.

## Auditoria (read-only, concluída)

- 17 telas consomem `AuthButton` → fix central propaga.
- 100% dos botões de *salvar* usam `AuthButton`.
- Único botão cru: "Remover data" (`medico.tsx:211`) — `Pressable+Text` com `colors.textSecondary`, link quieto **intencional e visível**. Fora de escopo (opcional p/ 42i).

## Diagnóstico "Done" (concluído)

- `/peso/registrar` usa `TextField` (`returnKeyType='done'` default + notas multiline).
- "Done" é return-key/accessory **nativo iOS**, localizado pela lista de localizações do app.
- `app.json` não declara `CFBundleLocalizations`/`CFBundleDevelopmentRegion`; `expo-localization` só lê locale em runtime. → fallback inglês.
- Fix real exige `expo prebuild --clean` + novo dev client → **deferido p/ 42i**.

---

### Task 1: Fix `styles.disabled` + `labelDisabled` (Opção A)

**Files:**
- Modify: `components/ui/AuthButton.tsx:77-80` (`styles.disabled`)
- Modify: `components/ui/AuthButton.tsx:93-95` (`styles.labelDisabled`)

- [ ] **Step 1: Aplicar Opção A**

```diff
   disabled: {
-    backgroundColor: colors.bgSurface,
-    borderColor: colors.bgSurface,
+    backgroundColor: colors.bgSurface,
+    borderWidth: 1,
+    borderColor: colors.brandDim,
+    opacity: 0.7,
   },
```
```diff
   labelDisabled: {
-    color: colors.textTertiary,
+    color: colors.brand,
   },
```

- [ ] **Step 2: type-check + lint**

Run: `npm run type-check && npm run lint`
Expected: PASS

- [ ] **Step 3: Validação visual empírica no simulador iOS**

Telas: `/perfil/protocolo` (disabled), `/peso/registrar` (disabled→primary), `/dose/registrar`.
Critério: botão disabled visível como fantasma mint, claramente desativado; após editar campo vira primary mint completo.
Se A não convencer → **Opção B** (`backgroundColor: 'rgba(0, 212, 170, 0.10)'`, border `colors.brandDim`, sem opacity) → **Opção C** (A com `opacity: 0.5` ou bg `colors.bgElevated`). Máx 2 tentativas extras.

### Task 2: Screenshots

- [ ] **Step 1: Capturar 6 PNGs em `assets/screenshots/prompt42h/`**

ANTES (de main): disabled invisível. DEPOIS: disabled visível (≥2 telas) + primary intacto + sheet /peso com "Done".

### Task 3: Commit + PR (anti-contaminação)

- [ ] **Step 1:** `git status --short` (validar 1×)
- [ ] **Step 2:** se houver `graphify-out/*` ou `.codegraph/*`: `git restore --staged`
- [ ] **Step 3:** `git add` arquivos esperados; `git status --short` (validar 2×)
- [ ] **Step 4:** `git status --short` (validar 3×) → commit → push
- [ ] **Step 5:** PR via gh/MCP, target `main`. Walkthrough: (a) opção final, (b) razão (contraste), (c) "git status validado 3× pré-commit", (d) diagnóstico Done + defer 42i.

## Critérios de sucesso

- [ ] `grep "colors.bgSurface" AuthButton.tsx` → match só em `styles.secondary` e `styles.disabled` bg (não border)
- [ ] disabled tem `brandDim` + identidade mint visível
- [ ] type-check + lint PASS
- [ ] 6 screenshots em `assets/screenshots/prompt42h/`
- [ ] `git status --short` ZERO `graphify-out/*`, `.codegraph/*`
- [ ] PR menciona "git status validado 3× pré-commit"
