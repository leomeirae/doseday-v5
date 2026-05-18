---
target: auth screens (recover, perfil, SplashView, signin, _layout)
total_score: 31
p0_count: 0
p1_count: 1
timestamp: 2026-05-18T10-49-09Z
slug: app-auth-recover-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2→3 | SplashView had no loading indicator (fixed: ActivityIndicator added) |
| 2 | Match System / Real World | 4 | PT-BR natural language throughout |
| 3 | User Control and Freedom | 3 | router.push for recover → back works; sent state has explicit back link |
| 4 | Consistency and Standards | 3 | AuthLink identical weight fixed via dim prop |
| 5 | Error Prevention | 3 | Zod validation + disabled={!email}; AuthButton handles loading internally |
| 6 | Recognition Rather than Recall | 3 | Links now have hierarchy (dim variant for secondary action) |
| 7 | Flexibility and Efficiency | 3 | returnKeyType + onSubmitEditing throughout |
| 8 | Aesthetic and Minimalist Design | 3 | Clinical-calm palette maintained, no glass on content |
| 9 | Error Recovery | 4 | Specific PT-BR errors, field-level + general, clear on retry |
| 10 | Help and Documentation | 1 | perfil.tsx lacks LGPD/support links (deferred to later prompt) |
| **Total** | | **31/40** | **Good** |

## Anti-Patterns Verdict

No AI slop patterns detected. Automated scan: 0 findings. No gradient text, no side-stripe borders, no glassmorphism on content, no hero metric templates. Vital Mint Rarity rule maintained (brand color only on logo lettermark and sentEmail inline text for semantic contrast).

## Overall Impression

Solid auth cycle implementation. Clinical and calm tone maintained. The biggest opportunity is perfil.tsx — currently just email + sign-out, which undersells DoseDay's LGPD positioning.

## What's Working

1. Error handling in recover.tsx — security-correct sent state + network-only errors leaked, Zod fires before API call.
2. Keyboard/submission flow — all forms keyboard-navigable, returnKeyType + onSubmitEditing present.
3. Token discipline — no color breaks, no NativeWind, no glass on content.

## Priority Issues (post-fix status)

### P1 — SplashView ActivityIndicator ✅ FIXED
Added ActivityIndicator with colors.textSecondary below logo placeholder.

### P1 — recover.tsx sent state success affordance ✅ FIXED
Added email echo + timeframe + spam hint copy. sentEmail style adds textPrimary for the address.

### P2 — signin.tsx link visual hierarchy ✅ FIXED
dim prop added to AuthLink. "Não tem conta? Cadastre-se" is now caption + no underline, demoting it below "Esqueci minha senha".

### P1 (deferred) — perfil.tsx LGPD/support path
perfil.tsx V1 scope is email + logout only. LGPD data controls deferred to a dedicated Perfil V2 prompt.
