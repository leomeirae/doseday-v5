---
target: app/(tabs)/perfil.tsx app/perfil/account.tsx
total_score: 29
p0_count: 0
p1_count: 1
timestamp: 2026-05-20T19-36-33Z
slug: app-tabs-perfil-tsx-app-perfil-account-tsx
---
### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Save/loading states well-handled; toast confirms save. |
| 2 | Match System / Real World | 4 | Natural Portuguese throughout; icons semantically correct. |
| 3 | User Control and Freedom | 3 | Back + Alert cancel present; unsaved name edit lost silently on back. |
| 4 | Consistency and Standards | 3 | Consistent with app header pattern. |
| 5 | Error Prevention | 3 | Delete confirmation + min-length validation; no maxLength on name input. |
| 6 | Recognition Rather Than Recall | 3 | All rows labeled; chevron signals navigable vs. action. |
| 7 | Flexibility and Efficiency | 2 | onSubmitEditing for name save; no other accelerators. |
| 8 | Aesthetic and Minimalist Design | 3 | Clean sections; two placeholder blocks consume ~30% of visual space. |
| 9 | Error Recovery | 3 | Optimistic rollback; translated error messages. |
| 10 | Help and Documentation | 2 | Email readonly hint is good; no other contextual help. |
| **Total** | | **29/40** | **Good** |

### Anti-Patterns Verdict

Not obviously AI-generated. iOS native conventions followed correctly. Generic tell: Perfil headline is just the word "Perfil" with no user identity — looks scaffolded, not designed.

Deterministic scan: unavailable (bundled detector not compiled). Browser visualization: N/A (React Native).

### Overall Impression

Engineering is tight. UX gaps are in the product register: no user identity on Perfil screen, two dead placeholder sections, one-tap sign-out with no recovery path.

### What's Working

1. isDirty save button — Vital Mint only when dirty, correct Rarity Rule usage.
2. Delete card visual hierarchy — semtanicCritical 25% opacity border, description before button.
3. SettingsRow/SettingsSection primitives — isLast separator, accessibilityState, variant:destructive.

### Priority Issues

**[P1] Sign-out fires immediately with no confirmation** — accidental tap ends session. Fix: Alert.alert confirmation using existing account.signOut.* i18n keys.

**[P2] No user identity on Perfil screen** — "Perfil" headline only, no name/email. Mariana can't confirm this is her account. Fix: add profile?.fullName + email below headline.

**[P2] Two "Em breve" placeholder sections dominate fold** — PERFIL DE SAÚDE + SOBRE show blank cards. Fix: hide sections or replace with single-line coming-soon text without card wrapper.

**[P2] Name input has no maxLength** — unlimited input on full_name field. Fix: add maxLength={80}.

**[P3] Delete error message missing reassurance** — should confirm "Sua conta não foi apagada" on failure.

### Persona Red Flags

**Mariana**: No residual identity visible on Perfil after name update. Toast is transient; no persistent reflection of who she is.

**Casey**: Wide Sair row (full width, minHeight 44) + no confirmation = accidental sign-out risk while scrolling.

**Sam**: Main "Perfil" headline missing accessibilityRole="header".

### Minor Observations

- Separator marginLeft: spacing.md — correct iOS inset. ✓
- as Href cast — safe workaround, inert after Metro regenerates types. ✓
- isDirty trims whitespace correctly. ✓
- onSubmitEditing only fires when isDirty — smart. ✓
