---
target: app/(onboarding)/index.tsx + components/onboarding/OnboardingShell.tsx
total_score: 28
p0_count: 0
p1_count: 0
timestamp: 2026-05-20T14-12-04Z
slug: ndex-tsx-components-onboarding-onboardingshell-tsx
---
# Impeccable Critique — Onboarding Foundation 24a

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 3 | Progress is visible, but the placeholder has no action yet. |
| 2 | Match System / Real World | 3 | After copy adjustment, language fits DoseDay better. |
| 3 | User Control and Freedom | 2 | Shell supports back/close, but placeholder itself has no exit/action. |
| 4 | Consistency and Standards | 4 | Uses project tokens, native layout, no content glass. |
| 5 | Error Prevention | 3 | Shell has disabled/loading states; real form validation lands in 24b/24c. |
| 6 | Recognition Rather Than Recall | 3 | Progress text is clear; shell icons have labels but are visually icon-only. |
| 7 | Flexibility and Efficiency | 2 | Onboarding is intentionally linear; no skip/accelerators yet. |
| 8 | Aesthetic and Minimalist Design | 4 | Sparse, calm, clinical, no decorative clutter. |
| 9 | Error Recovery | 2 | Context preserves local state and toasts persistence errors; no user-facing recovery screen yet. |
| 10 | Help and Documentation | 2 | Placeholder copy guides enough for 24a; real step-level help still pending. |
| **Total** | | **28/40** | **Good foundation** |

## Anti-Patterns Verdict

**LLM assessment:** The initial placeholder had engineering-language leakage: "Onboarding" and "próximos prompts" made the screen feel internal rather than patient-facing. This was corrected to "Boas-vindas" and a direct product-voice line: "Vamos preparar sua memória do tratamento antes de entrar no app." The visual structure is restrained and does not read like AI slop: no gradient text, no card grid, no glass content, no decorative noise.

**Deterministic scan:** Attempted `node .agents/skills/impeccable/scripts/detect.mjs --json app/(onboarding) components/onboarding`. The installed skill package is missing the bundled detector implementation and returned `Error: bundled detector not found.` This is a tool packaging failure, not a UI finding.

**Visual evidence:** React Native MCP screenshot and hierarchy confirmed the screen renders cleanly on iPhone 17 with four accessible text elements and no warning overlay after dismissal.

## Overall Impression

The 24a surface is now appropriate for a foundation PR: quiet, native, token-driven and visibly within DoseDay's clinical design language. It should not pretend to be final onboarding, but it no longer leaks implementation detail to Mariana.

## What's Working

- **Clinical restraint:** bg-base, semantic info accent, and typography do the work without decorative glass or cards.
- **Foundation boundaries:** `OnboardingShell` provides progress, back/close, CTA loading/disabled states and content slots without forcing a particular step UI.
- **Voice alignment after adjustment:** copy is short, calm and product-specific.

## Priority Issues

**[P2] Placeholder had internal-language leakage**

Why it matters: Mariana should never see engineering language such as "próximos prompts"; it breaks trust in a clinical app.

Fix: Done. Replaced with patient-facing PT-BR copy.

Suggested command: `impeccable clarify`

**[P2] Empty foundation screen has no primary action**

Why it matters: Fine for 24a, but if this ships before 24b, a new user lands on a dead end.

Fix: Keep PR ordering strict: 24b must add the welcome/first step before release or gate this branch away from production.

Suggested command: `impeccable onboard`

**[P3] Shell icon buttons are visually icon-only**

Why it matters: Back/close are platform-familiar and accessible via labels, but PRODUCT.md prefers text before icon when possible.

Fix: Keep icon-only for nav chrome if space is tight; use text+icon for unfamiliar onboarding actions in 24b/24c.

Suggested command: `impeccable audit`

## Persona Red Flags

**Jordan (First-Timer):** The adjusted copy is clear, but until 24b lands there is no visible next action. Jordan will understand the purpose but cannot proceed.

**Casey (Distracted Mobile User):** The sparse screen is easy to parse one-handed. The future CTA belongs in the bottom footer shell, which is already implemented.

**Mariana (DoseDay primary):** The revised copy feels calmer and less technical. The screen should quickly move into value capture; Mariana will not tolerate a long preamble.

## Minor Observations

- `Passo 2 de 14` appears for the current test session because that profile already has some progress data; an entirely empty profile now remains on step 1.
- `OnboardingShell` is ready but not exercised by the placeholder yet; final visual scoring should be repeated after 24b uses the shell with real inputs.

## Questions to Consider

- Should the first real screen in 24b be reassuring ("por que pedimos isso") or action-first ("vamos começar")?
- Does every required step earn its place before the user sees app value?
- What is the minimum data Mariana must enter before DoseDay can feel useful?
