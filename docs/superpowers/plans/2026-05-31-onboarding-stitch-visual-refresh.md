# Onboarding Stitch Visual Refresh — Implementation Plan

> **For agentic workers:** This is a visual React Native refactor with NO UI test harness (jest is in the `test` script but not installed as a root dep; only util/edge-function tests exist). Therefore steps use **type-check + lint + real-simulator screenshots + `/impeccable critique`** as verification gates instead of TDD. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reimplement the DoseDay V5 onboarding with the approved Stitch graphite/dark visual direction AND a real reduction from 15 to 11 screens (8 counted question screens), without touching the AI insight payload, the consent/LGPD step, the weight-delta data, or Supabase.

**Architecture:** Keep the existing StyleSheet + `@lib/theme/tokens` (graphite is already dark) and the existing explicit per-screen `router.replace` navigation pattern. Reduce screens by (1) removing `personal-info`, (2) merging `dose`+`dose-frequency`, (3) merging `weight`+`goal-weight`, (4) merging `medical-support`+`doctor-name`. Centralize "Passo X de N" into a single `COUNTED_STEPS` source. Restyle every screen in the Stitch language. The AI insight hook (`useOnboardingInsight.ts`) is NOT edited — all 6 payload fields survive the merges under the same `OnboardingData` keys.

**Tech Stack:** Expo Router, React Native, react-hook-form + zod, react-i18next, `@lib/theme/tokens` (StyleSheet), expo-symbols.

**Branch:** `feature/onboarding-stitch-visual-refresh` (from `main`) · **PR target:** `main`

---

## Locked decisions (from PO, do not re-derive)

- **Guardrail resolved:** `age`, `biological_sex`, `full_name`, `height` are `| null` in `user_profiles` (Row + Insert); persistence uses `.update()` (writes only `!== undefined`). Removing `personal-info` is safe — **no migration**.
- **A — Lembretes:** folded INTO the Dose+Frequency screen. No new field, no schema. Reminder is driven by `dose_frequency_days`; specific time stays in `/configuracoes/lembretes` post-onboarding.
- **B — doctor-name:** merged as an optional field on the Medical-support screen.
- **C — concerns pre-selection:** NONE pre-selected (data/consent integrity). Re-evaluate at visual checkpoint; only turn on 2–3 defaults if the screen looks too empty.
- Insight payload: `useOnboardingInsight.ts` is **untouched**. `concerns` maps only to existing `CONCERN_OPTIONS`. No appointment schema/date.

## Reconciled screen architecture

| Counted # | Step key | Screen | Origin | Counts in "Passo X de N"? |
|---|---|---|---|---|
| — | `welcome` | Welcome (graphite intro) | keep | ❌ intro |
| 1 | `treatment-status` | Status do tratamento | keep | ✅ |
| 2 | `treatment-duration` | Há quanto tempo (skipped if `planning`) | keep | ✅ |
| 3 | `medication` | Medicação | keep | ✅ |
| 4 | `dose` | **Dose e frequência** | merge `dose` + `dose-frequency` | ✅ |
| 5 | `weight` | **Peso e meta** | merge `weight` + `goal-weight` | ✅ |
| 6 | `medical-support` | **Suporte médico / próxima consulta** | merge `medical-support` + `doctor-name` | ✅ |
| 7 | `concerns` | O que acompanhar | keep (restyle multi-select) | ✅ |
| 8 | `consent` | Consentimento | keep | ✅ |
| — | `loading` | Montando sua memória | keep | ❌ transition |
| — | `result` | Aha — memória pronta | keep (restyle) | ❌ reward |

**N = 8.** `welcome`/`loading`/`result` are NOT counted. `planning` users skip #2 (duration) — bar jumps; accepted as honest.

**New `ONBOARDING_STEPS` order:**
`['welcome','treatment-status','treatment-duration','medication','dose','weight','medical-support','concerns','consent','loading','result']`
Removed keys: `personal-info`, `goal-weight`, `dose-frequency`, `doctor-name`.

## Navigation rewiring map (explicit `router.replace` per screen)

| Screen | back (prev) | continue (next) |
|---|---|---|
| `welcome` | — | `treatment-status` |
| `treatment-status` | `welcome` | `planning` → `medication` (submits `duration:null`); else `treatment-duration` |
| `treatment-duration` | `treatment-status` | `medication` |
| `medication` | `planning` → `treatment-status`; else `treatment-duration` | `dose` |
| `dose` (merged) | `medication` | `weight` |
| `weight` (merged) | `dose` | `medical-support` |
| `medical-support` (merged) | `weight` | `concerns` |
| `concerns` | `medical-support` | `consent` |
| `consent` | `concerns` | `loading` |
| `loading` | — | `result` |

---

## Phase A — Visual system + progress header + screens 1–3 → CHECKPOINT (stop, await ok)

### Task A1: Step model surgery (types first — `satisfies` is the type-check guard)

**Files:**
- Modify: `lib/types/onboarding.ts`
- Modify: `lib/validation/onboardingSchemas.ts`
- Modify: `contexts/OnboardingContext.tsx`
- Modify: `app/(onboarding)/index.tsx`

- [ ] **Step 1 — `lib/types/onboarding.ts`:** Remove `personal-info`, `goal-weight`, `dose-frequency`, `doctor-name` from the `OnboardingStep` union. Reorder `ONBOARDING_STEPS` to the new order above. Update `REQUIRED_STEPS` to `{ treatment-status, weight, medication, dose, medical-support, consent }` (drop `personal-info`, `goal-weight`, `dose-frequency`). Update `OPTIONAL_STEPS` to `{ concerns }` (drop `doctor-name`). Add:
```ts
export const COUNTED_STEPS: OnboardingStep[] = [
  'treatment-status',
  'treatment-duration',
  'medication',
  'dose',
  'weight',
  'medical-support',
  'concerns',
  'consent',
]
```
Leave `OnboardingData` interface untouched (age/sex/full_name stay in the type, just not collected).

- [ ] **Step 2 — `lib/validation/onboardingSchemas.ts`:** Remove `personal-info`, `goal-weight`, `dose-frequency`, `doctor-name` keys from `ONBOARDING_STEP_SCHEMAS`. Add merged schemas used by the merged screens (compose existing ones, same field rules):
```ts
export const weightWithGoalSchema = z.object({
  initial_weight: z.coerce.number().min(30,'Mínimo 30 kg').max(300,'Máximo 300 kg'),
  current_weight: z.coerce.number().min(30,'Mínimo 30 kg').max(300,'Máximo 300 kg'),
  height: z.coerce.number().int('Use centímetros').min(120,'Mínimo 120 cm').max(220,'Máximo 220 cm'),
  goal_weight: z.coerce.number().min(30,'Mínimo 30 kg').max(300,'Máximo 300 kg'),
}).refine((d)=>Math.abs(d.initial_weight-d.current_weight)<=120,{message:'Confira os pesos informados',path:['current_weight']})
export type WeightWithGoalInput = z.infer<typeof weightWithGoalSchema>
```
Map `weight` → `weightWithGoalSchema` in `ONBOARDING_STEP_SCHEMAS`. (Dose+freq and support+doctor keep their own field-level schemas inside the screen; the step map entry for `dose` stays `doseSchema`, `medical-support` stays `medicalSupportSchema` — frequency/doctor are optional sub-fields validated locally.) Add a progress helper:
```ts
import { COUNTED_STEPS } from '@lib/types/onboarding'
export function getCountedStepNumber(step: OnboardingStep): number {
  return COUNTED_STEPS.indexOf(step) + 1 // 0 (→ falsy) for non-counted steps
}
export const COUNTED_STEPS_TOTAL = COUNTED_STEPS.length
```

- [ ] **Step 3 — `contexts/OnboardingContext.tsx` `inferCompletedSteps`:** Remove the `personal-info`, `goal-weight`, `dose-frequency`, `doctor-name` predicates. Update merged predicates: `weight` completes when `initial_weight && current_weight && height && goal_weight`; `dose` completes when `current_dose !== undefined`; `medical-support` completes when `has_medical_support`. Keep `treatment-duration` completing on `treatment_status === 'planning' || treatment_duration`.

- [ ] **Step 4 — `app/(onboarding)/index.tsx`:** Remove the 4 deleted keys from `IMPLEMENTED_ROUTES`. Replace its "Passo X de N" display (currently `getOnboardingStepNumber` + `ONBOARDING_STEPS.length`) with `getCountedStepNumber` + `COUNTED_STEPS_TOTAL` (hide the kicker entirely for non-counted steps).

- [ ] **Step 5 — Verify:** `npm run type-check`. Expected: PASS. The `satisfies Record<OnboardingStep, …>` will flag any missed reference to a removed key. Fix until clean. Then `grep -rn "'/(onboarding)/personal-info\|/(onboarding)/goal-weight\|/(onboarding)/dose-frequency\|/(onboarding)/doctor-name" app components` → expected: ZERO hits after screens rewired (will be non-zero until A3/B done; note which remain).

### Task A2: OnboardingShell + shared components restyle

**Files:** Modify `components/onboarding/OnboardingShell.tsx`, `ConcernsChips.tsx`, `SelectionCard.tsx`, `NumericInput.tsx`, `ConsentCheckbox.tsx`.

- [ ] **Step 1 — Shell progress:** Add a visible "Passo X de N" text label adjacent to the 2px bar (header area). Shell already takes `stepNumber`/`totalSteps` props; render `t('progress.step', { current, total })` above the bar.
- [ ] **Step 2 — Shell disabled CTA legibility:** Change `disabled` opacity 0.5 → **0.65**, keep label text visible. Add optional `primaryCTA.requirementHint?: string` rendered as small muted microcopy under the button when disabled.
- [ ] **Step 3 — ConcernsChips:** Selected state = subtle mint fill + brand border + checkmark (`SymbolView name="checkmark"`); unselected = elevated/muted. Touch target ≥44.
- [ ] **Step 4 — SelectionCard / NumericInput / ConsentCheckbox:** Light restyle to match Stitch (borders, selected mint). No API changes.
- [ ] **Step 5 — Verify:** `npm run type-check && npm run lint`. Expected: PASS.

### Task A3: Screens 1–3 (treatment-status, treatment-duration, medication) — restyle + rewire nav + centralized progress

**Files:** Modify `app/(onboarding)/treatment-status.tsx`, `treatment-duration.tsx`, `medication.tsx`, `welcome.tsx`.

- [ ] **Step 1:** Replace each screen's hardcoded `stepNumber={N} totalSteps={N}` with `stepNumber={getCountedStepNumber('<step>')} totalSteps={COUNTED_STEPS_TOTAL}`.
- [ ] **Step 2:** Rewire `router.replace` prev/next per the navigation map. `treatment-status`: keep `planning` branch (submit `treatment-duration:{treatment_duration:null}` then → `medication`); else → `treatment-duration`. `medication` back: `planning` → `treatment-status`, else → `treatment-duration`. `welcome` next → `treatment-status`.
- [ ] **Step 3:** Restyle copy/visuals in Stitch language (graphite cards, brand action). `welcome` becomes a coherent dark intro (Stitch 01 adapted from white → graphite).
- [ ] **Step 4 — Verify:** `npm run type-check && npm run lint`. Expected: PASS.
- [ ] **Step 5 — CHECKPOINT:** Launch simulator, capture real screenshots (react-native-devtools-mcp; fallback computer-use, report method) of welcome + screens 1–3, INCLUDING starting the `planning` path to confirm duration is skipped. **STOP and await PO "ok" before Phase B.**

---

## Phase B — Merged screens 4–6 + concerns + consent (after checkpoint ok)

### Task B1: `dose` merged with `dose-frequency`
**Files:** Modify `app/(onboarding)/dose.tsx`; Delete `app/(onboarding)/dose-frequency.tsx`.
- [ ] Add the frequency section (interval chips 1/7/10/14 + custom days input, from `dose-frequency.tsx`) below the dose field. Copy uses "lembrete da dose". Submit both fields in one `submitStep('dose', { current_dose, dose_frequency_days })`. Dose optional skip and frequency optional skip preserved. Next → `weight`, back → `medication`. "dose atual" copy, never "recomendada". Verify type-check + lint.

### Task B2: `weight` merged with `goal-weight`
**Files:** Modify `app/(onboarding)/weight.tsx`; Delete `app/(onboarding)/goal-weight.tsx`.
- [ ] Add `goal_weight` numeric field. Use `weightWithGoalSchema`. Submit `{ initial_weight, current_weight, height, goal_weight }` in one `submitStep('weight', …)`. Next → `medical-support`, back → `dose`. Verify type-check + lint.

### Task B3: `medical-support` merged with `doctor-name`
**Files:** Modify `app/(onboarding)/medical-support.tsx`; Delete `app/(onboarding)/doctor-name.tsx`.
- [ ] Keep `has_medical_support` selection (required). Reveal an optional `doctor_name` text field (from `doctor-name.tsx`) when support is `yes`/`sometimes`. Visual = Stitch 07 "próxima consulta" card, clearly optional with "Pular por enquanto". NO appointment date/schema. Submit `{ has_medical_support, doctor_name? }`. Next → `concerns`, back → `weight`. Verify type-check + lint.

### Task B4: `concerns` restyle + `consent` rewire
**Files:** Modify `app/(onboarding)/concerns.tsx`, `consent.tsx`.
- [ ] `concerns`: restyle to "O que acompanhar" multi-select (mint+check via ConcernsChips), NO pre-selection, maps only to `CONCERN_OPTIONS`. Back → `medical-support`, next → `consent`. `consent`: back → `concerns`. Verify type-check + lint.

---

## Phase C — welcome polish + loading + result (aha)

### Task C1: `result` aha moment
**Files:** Modify `app/(onboarding)/result.tsx`, `loading.tsx`.
- [ ] Restyle result as "sua memória de tratamento está pronta", surfacing status, medication/dose (if present), next dose cadence, reminder, monitored items, doctor/consulta prep (if filled) — using ONLY existing data. `loading` restyle "montando sua memória". No payload change. Verify type-check + lint.

### Task C2: Copy pass + locale
**Files:** Modify `locales/pt-BR/onboarding.json`.
- [ ] Add/adjust keys: merged headlines, "dose atual", "lembrete da dose", "pular por enquanto", aha copy, `progress.step`. Remove now-unused `personal-info`/`goal-weight`/`dose-frequency`/`doctor-name` keys only if cleanly unused (else leave). Verify type-check + lint.

---

## Final validation
1. `npm run type-check` → PASS
2. `npm run lint` → PASS
3. No UI test harness (state plainly).
4. Real simulator screenshots (react-native-devtools-mcp; fallback computer-use, report method) walking the FULL flow including `planning`.
5. Visual compare vs the 10 Stitch PNGs in `/Users/leofrancaia/Desktop/doseday-v5-onboarding-stitch-refinado/images/`.
6. `/impeccable critique` vs `docs/DESIGN.md`.
7. `git status --short` before/after; `git add` by explicit path only; zero `graphify-out/`, `.codegraph/`, `" 2."` duplicates; report "git status validado, zero contaminação".

## Risks
- **Type cascade** removing 4 steps → edit types/arrays/schema map first, type-check (satisfies catches misses).
- **Orphan route strings** → grep `'/(onboarding)/` for deleted targets before running.
- **`planning` regression** → walk planning path in screenshots.
- **Insight payload** → none; hook untouched, 6 fields preserved.

## Self-review notes
- Spec coverage: all 7 "Ajustes obrigatórios vs Stitch" mapped (01 graphite=A3; progress=A2; dose atual=B1; próxima consulta optional=B3; lembrete da dose=B1; multi-select mint+check=A2/B4; aha=C1).
- No fabricated tests (no harness).
- Type consistency: `getCountedStepNumber`/`COUNTED_STEPS_TOTAL`/`weightWithGoalSchema` defined in A1 and referenced consistently after.
