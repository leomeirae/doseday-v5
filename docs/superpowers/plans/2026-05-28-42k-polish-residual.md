# Prompt 42k — Polish residual (Pressable callback-style + chips grid) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar 2 issues de polish residuais do ciclo 42 — converter as 13 ocorrências 🟡 BAIXO remanescentes do bug NativeWind v4 Pressable callback-style para o padrão `useState(pressed)+onPressIn/Out+array estático`, e reorganizar os chips "Local da aplicação" em grid 2 colunas.

**Architecture:** Mudança cirúrgica StyleSheet (não NativeWind). Aplica o padrão validado nos PRs #90/#91/#92. Zero refactor de hooks/queries/schemas. ~60-70 linhas em 13 arquivos.

**Tech Stack:** React Native + Expo SDK 54, StyleSheet, tokens existentes em `lib/theme/tokens.ts` (intocados).

---

## Confirmações empíricas (pré-execução)

- CodeGraph: 199 arquivos, 2274 nodes ✅
- `grep -rnE "style=\{\(\{[[:space:]]*pressed" app/ components/` → **13** (baseline)
- Variante `({pressed` (sem espaço) → **0**
- `app/dose/registrar.tsx`: Chip sem callback (`({ pressed` / `callback` → exit 1) — já corrigido
- Chip L261-283 usa `[styles.chip, selected && styles.chipSelected]` — intocado
- `spacing.xs = 8` → `48% × 2 = 96% + gap 8px` cabe

**13 ocorrências = 12 arquivos (lembretes tem 2) + 1 arquivo Escopo B (registrar) = 13 arquivos modificados.**

---

## File Structure

### Escopo A — converter callback → state (12 arquivos)

| Arquivo:linha | Caso | Tem `useState`? | State var | Style "pressed" |
|---|---|---|---|---|
| `app/peso/historico.tsx:76` | plusButton singleton | ❌ add import | `pressed` | inline `{opacity:0.7}` |
| `app/perfil/account.tsx:80` | backButton | ✅ | `backPressed` (novo) | `styles.backPressed` |
| `app/diario/anotar-custo.tsx:100` | "Salvar" header | ✅ | `savePressed` | `styles.saveHeaderButtonPressed` |
| `app/diario/custos.tsx:46` | plusButton | ❌ add import | `pressed` | inline `{opacity:0.7}` |
| `app/diario/notas.tsx:45` | plusButton | ❌ add import | `pressed` | inline `{opacity:0.7}` |
| `app/configuracoes/lembretes.tsx:159` | permission row | ✅ | `permissionPressed` | `styles.rowPressed` (mantém guard `!== 'granted'`) |
| `app/configuracoes/lembretes.tsx:211` | time row | ✅ | `timePressed` | `styles.rowPressed` |
| `app/configuracoes/tratamento/medico.tsx:211` | "Remover data" | ✅ | `clearPressed` (novo) | `styles.clearPressed` |
| `app/configuracoes/dados.tsx:213` | close (sub-comp ConsentHistoryModal) | ✅ (file) | `closePressed` | `styles.backPressed` |
| `components/settings/SettingsHeader.tsx:26` | backButton | ❌ add import | `pressed` | `styles.pressed` |
| `components/perfil/SettingsRow.tsx:41` | row reusável | ❌ add import | `pressed` | `styles.rowPressed` (mantém `!disabled`) |
| `components/onboarding/ConsentCheckbox.tsx:31` | row checkbox | ❌ add import (merge c/ `type ReactNode`) | `pressed` | `styles.pressed` |
| `components/onboarding/OnboardingShell.tsx:174` | IconButton sub-comp | ✅ (file) | `pressed` | `styles.iconPressed` |

> Todos singletons ou por-instância → `useState` ideal. Nenhum precisa dropar o branch `pressed`.
> **6 arquivos precisam adicionar `import { useState }`**: historico, custos, notas, SettingsHeader, perfil/SettingsRow, ConsentCheckbox.

### Escopo B — chips grid (1 arquivo)

`app/dose/registrar.tsx` — só `styles.chips` (L357) + `styles.chip` (L362). Chip L261-283, `chipSelected`, `chipPressed` (dead code pré-existente) intocados.

---

## Tasks

### Task 1: Persistir plano
- [x] Este arquivo.

### Task 2: Escopo A — 12 arquivos
- [ ] Para cada arquivo: adicionar state local + `onPressIn/onPressOut`, trocar `style={({ pressed }) => [...]}` por `style={[...]}`, adicionar `import { useState }` quando faltar. Preservar guards condicionais literais.
- [ ] Verificar: `grep -rnE "style=\{\(\{[[:space:]]*pressed" app/ components/` → **0**

### Task 3: Escopo B — chips
- [ ] `styles.chips` += `justifyContent: 'space-between'`
- [ ] `styles.chip` += `width: '48%'` + `alignItems: 'center'`

### Task 4: Validação
- [ ] `npm run type-check` passa
- [ ] `npm run lint` passa
- [ ] Ping simulador (MCP RN) → screenshots reais em `assets/screenshots/prompt42k/` (3-4)

### Task 5: Commit + PR
- [ ] `git status --short` (1ª vez) — procurar ` 2.`, `graphify-out/`, `.codegraph/`
- [ ] `git add` SÓ por path explícito (13 fontes + prompt + este plano + `assets/screenshots/prompt42k/`)
- [ ] `git status --short` (2ª vez)
- [ ] commit + push + PR via MCP GitHub

---

## Riscos

- 🔴 Contaminação git → `git add` por path explícito, sem diretórios, sem `docs/marketing/`; validar 2×.
- 🟡→🔴 style base não era layout → verificado: todas as bases são layout; reportar se surpreender.
- Grid estoura largura → fallback `47%`; se feio, parar e reportar.
- Simulador indisponível → pingar antes; reportar se cair.

## Success criteria
- grep regex → 0 · type-check ✅ · lint ✅ · chips com `space-between`+`width:48%`+`alignItems:center` · 3-4 PNGs · git status limpo 2×.
