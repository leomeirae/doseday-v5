# Prompt 41 — NativeWind + React Native Reusables Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up NativeWind v4 + React Native Reusables as the DoseDay visual infrastructure without migrating existing screens.

**Architecture:** Keep StyleSheet-based screens working while adding the NativeWind compiler path, Tailwind tokens, and React Native Reusables copy-paste component foundation. The first runtime proof is a temporary smoke route, then real screen migration happens in a later prompt.

**Tech Stack:** Expo SDK 54, React Native 0.81, NativeWind 4.2.4, Tailwind CSS 3.4, React Native Reusables, TypeScript strict.

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] Install NativeWind v4 and React Native Reusables dependencies:

```bash
npm install nativewind@4.2.4 "tailwindcss@^3.4" react-native-css-interop tailwindcss-animate class-variance-authority clsx tailwind-merge @rn-primitives/portal
```

- [ ] Verify expected packages:

```bash
grep '"nativewind"' package.json
grep '"tailwindcss"' package.json
grep '"@rn-primitives/portal"' package.json
```

## Task 2: Configure NativeWind v4

**Files:**
- Modify: `babel.config.js`
- Modify: `metro.config.js`
- Modify: `app/_layout.tsx`
- Modify: `app.json`
- Create: `global.css`
- Create: `nativewind-env.d.ts`
- Create: `tailwind.config.js`

- [ ] Update Babel to use `jsxImportSource: 'nativewind'`, add `nativewind/babel`, preserve `module-resolver`, and do not add `react-native-reanimated/plugin`.
- [ ] Wrap Metro with `withNativeWind(config, { input: './global.css', inlineRem: 16, inlineVariables: false })` while preserving existing aliases.
- [ ] Add root `global.css` with Tailwind base/components/utilities directives.
- [ ] Add root `nativewind-env.d.ts` with the NativeWind type reference.
- [ ] Add `import '../global.css'` as the first import in `app/_layout.tsx`.
- [ ] Set `expo.web.bundler` to `metro` in `app.json`.
- [ ] Create `tailwind.config.js` with DoseDay color, spacing, and radius tokens and content globs for `app`, `components`, `lib`, `contexts`, and `hooks`.

## Task 3: Add React Native Reusables Foundation

**Files:**
- Create/modify: `components.json`
- Create: `lib/utils.ts`
- Create: `components/ui/button.tsx`
- Create: `components/ui/text.tsx`

- [ ] Run React Native Reusables init after NativeWind config exists:

```bash
npx @react-native-reusables/cli@latest init
```

- [ ] Add the initial primitives:

```bash
npx @react-native-reusables/cli@latest add button text --styling-library nativewind --yes
```

- [ ] Review generated diffs to ensure DoseDay Tailwind tokens and aliases remain intact.

## Task 4: Runtime Smoke Test

**Files:**
- Create temporarily: `app/smoke-nativewind.tsx`
- Create: `assets/screenshots/prompt41-smoke.png`

- [ ] Create a temporary Expo Router screen that renders a mint background using `className`, white text, and a Reusables button/text component.
- [ ] Start Expo with a clean cache if needed.
- [ ] Open `/smoke-nativewind` on the iPhone 17 simulator.
- [ ] Save a real screenshot to `assets/screenshots/prompt41-smoke.png`.
- [ ] Remove `app/smoke-nativewind.tsx` after screenshot evidence is captured.

## Task 5: Verification and Documentation

**Files:**
- Modify: `docs/learnings.md`

- [ ] Run static verification:

```bash
grep '"nativewind"' package.json
grep "withNativeWind" metro.config.js
grep "nativewind/babel" babel.config.js
! grep "react-native-reanimated/plugin" babel.config.js
ls tailwind.config.js global.css nativewind-env.d.ts components.json lib/utils.ts components/ui/button.tsx components/ui/text.tsx
```

- [ ] Run React Native Reusables doctor:

```bash
npx @react-native-reusables/cli@latest doctor --summary
```

- [ ] Run project checks:

```bash
npm run type-check
npm run lint
```

- [ ] Add a `docs/learnings.md` entry documenting that NativeWind Resources led to choosing React Native Reusables as the controlled copy-paste component path.

## Assumptions

- React Native Reusables is the chosen path from NativeWind Resources; NativewindUI and gluestack remain references only.
- NativeWind v4 stable remains the target; NativeWind v5 preview is not used in this prompt.
- `inlineVariables: false` is a conservative compatibility choice, not a statement that the current token file uses `PlatformColor`.
- Existing screens remain unmigrated.
