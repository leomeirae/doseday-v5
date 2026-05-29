# Dashboard "Memória recente" — dots coloridos por tipo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** No card "Memória recente" do dashboard, colorir as bolinhas da timeline POR TIPO de evento (dose/peso/nota/sintoma/registro), com paridade total à tela cheia `app/memoria/index.tsx`. Hoje são coloridas por posição (primeiro=branco, resto=cinza).

**Architecture:** Extrair a fonte-de-verdade de classificação + cores para `lib/memory/source.ts` (módulo de domínio, compõe `@lib/theme/tokens` + `@lib/validation/diarioSchemas`). Tela cheia e dashboard passam a importar do mesmo módulo → zero divergência. StyleSheet/NativeWind intocados.

**Tech Stack:** React Native + Expo SDK 54, TypeScript, tokens existentes.

---

## Premissas provadas (grep)

- `SOURCE_COLORS`: 1 def em `app/memoria/index.tsx` (L27).
- Tokens: `clinicalDose #5BA8D9`, `mintSoft #A3E6D2`, `semanticWarning #FFB347`, `semanticMuted #5C6878`.
- `getQuickLogSource` (memoria L403-407): 3 saídas — `other`→nota; symptom conhecido→sintoma; resto→registro. `alcohol`/`feeling_good` → registro (cinza). **Ternário binário divergia — descartado.**
- `symptomQuickLogTypes` (memoria L45-53): usado SÓ dentro de `getQuickLogSource` → removível de memoria após extração.
- `TimelineItem` (HomeV7Content L30): `{id,date,title}`, sem source.
- `colors` usado 11× em HomeV7Content (import não fica órfão); `index` reusado no conector L443.
- `@lib/*` → `./lib/*`; `lib/memory/` é novo.

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `lib/memory/source.ts` **(novo)** | Fonte-de-verdade: `MemorySource`, `SOURCE_COLORS`, `symptomQuickLogTypes`, `getQuickLogSource` (4 exports) |
| `app/memoria/index.tsx` | Importa os 4 do shared; remove defs locais de SOURCE_COLORS, symptomQuickLogTypes, getQuickLogSource. Comportamento idêntico |
| `components/home/HomeV7Content.tsx` | `TimelineItem += source`; buildTimeline seta source (quickLog via `getQuickLogSource`); dot usa `SOURCE_COLORS[item.source]`; comentário L442 atualizado |

---

## Tasks

### Task 1: branch + plano + shared
- [x] branch `feat/dashboard-memoria-dots-coloridos`
- [x] `lib/memory/source.ts` com 4 exports (lógica verbatim do atual)
- [x] este plano

### Task 2: app/memoria/index.tsx
- [ ] import `{ SOURCE_COLORS, getQuickLogSource } from '@lib/memory/source'`
- [ ] remove SOURCE_COLORS local, symptomQuickLogTypes local, getQuickLogSource local
- [ ] Verificar: render idêntico; type-check

### Task 3: components/home/HomeV7Content.tsx
- [ ] import `{ SOURCE_COLORS, getQuickLogSource, type MemorySource } from '@lib/memory/source'`
- [ ] `TimelineItem += source: MemorySource`
- [ ] buildTimeline: 3 maps `: TimelineItem` + `source` (dose/'dose', weight/'peso', quickLog/`getQuickLogSource(log.logType)`)
- [ ] dot L440 → `SOURCE_COLORS[item.source]`; comentário L442 atualizado

### Task 4: Validação
- [ ] `npm run type-check` exit 0
- [ ] `npm run lint` exit 0
- [ ] grep: dot usa `SOURCE_COLORS[item.source]`, zero `index > 0` no dot; `getQuickLogSource`/`symptomQuickLogTypes` 1 def cada (shared)
- [ ] Screenshots dashboard + /memoria em `assets/screenshots/dashboard-dots/` (inspecionar dados live antes; não prometer N cores fixas; não semear dado falso)

### Task 5: Commit + PR
- [ ] `git status --short` (1ª) — procurar ` 2.`, `graphify-out/`, `.codegraph/`
- [ ] `git add` por path explícito: lib/memory/source.ts, app/memoria/index.tsx, components/home/HomeV7Content.tsx, docs/superpowers/plans/2026-05-28-dashboard-memoria-dots-coloridos.md, assets/screenshots/dashboard-dots/
- [ ] `git status --short` (2ª)
- [ ] commit + push + PR (base main)

---

## Riscos
- 🔴 Contaminação git → add por path explícito, validar 2×. (graphify rebuild ativo no branch switch.)
- MÉDIO widening `source: 'x'`→string → anotar 3 maps `: TimelineItem`; type-check é o gate.
- MÉDIO dados live <4 cores → prova = cor-por-tipo (vs branco/cinza) + paridade /memoria; sem dado falso.
- BAIXO comentário L442 enganoso → atualizado.

## Success criteria
- TimelineItem tem source; buildTimeline seta 3 grupos (quickLog via getQuickLogSource, NÃO ternário).
- dot usa `SOURCE_COLORS[item.source]`; zero `index > 0` no dot.
- SOURCE_COLORS/getQuickLogSource/symptomQuickLogTypes: 1 def cada, em lib/memory/source.ts.
- type-check ✅ · lint ✅ · screenshots dashboard + /memoria · git limpo 2×.
