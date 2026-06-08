# Release Final QA & Store Readiness — Implementation Plan

> **For agentic workers:** Mechanical pre-submission QA task. ESCOPO TRAVADO — zero feature nova, zero redesign, zero refactor, zero mudança em IA/edge/paywall/RevenueCat/arquitetura. Single PR on `feature/release-final-qa` cut from `origin/main`.

**Goal:** Limpar bloqueios de pré-submissão e preparar a loja para a release 5.0.0 (build 12), num único PR.

**Architecture:** Correções cirúrgicas em regex de sintoma, patches de patch do Expo, higiene de git (graphify-out), bump de build number consistente nos 4 lugares (app.json + Info.plist + pbxproj×2), e documentação de release (QA manual + store prep). Nenhuma mudança de lógica de negócio.

**Tech Stack:** Expo SDK 54, React Native, TypeScript, Jest, App Store Connect MCP.

---

## Decisão travada (item 5 — Opção A)

Build number bumpado 11→12. **Correção descoberta na execução:** `ios/` e `android/` estão no `.gitignore` (Expo CNG / prebuild), então só o `app.json` é versionado no repo — os arquivos nativos são artefatos gerados a partir dele.
- `app.json` → `ios.buildNumber: "12"` — **versionado no repo** (fonte de verdade / CNG)
- `ios/DoseDay/Info.plist` → `CFBundleVersion 12` — gitignored, editado local p/ o archive imediato sair 12
- `ios/DoseDay.xcodeproj/project.pbxproj` → `CURRENT_PROJECT_VERSION = 12` (2 configs) — gitignored, idem

`version` / `CFBundleShortVersionString` segue **5.0.0**. Não precisa `expo prebuild`: o `ios/` local já está em 12.

---

## Task 0: Branch

- [ ] `git fetch origin && git checkout -b feature/release-final-qa origin/main`

## Task 1: Regex de gênero (item 1)

**Files:** Modify `lib/symptoms/extractType.ts:34-35`

- [ ] Linha 34: `severo` → `sever[ao]` (dentro do grupo intensidade 3)
- [ ] Linha 35: `fraco` → `frac[oa]` (dentro do grupo intensidade 1)
- [ ] NÃO mexer no default 2 nem na ordem dos patterns
- [ ] `npm test -- --runInBand lib/symptoms` → verde. NÃO editar o teste.

## Task 2: Patches Expo (item 2)

**Files:** `package.json` + `package-lock.json`

- [ ] `npx expo install --check`
- [ ] Aplicar **só** bumps de patch (expo 54.0.34→.35, expo-file-system, expo-font, expo-localization, expo-router)
- [ ] Se `--check` sugerir minor/major OU dep fora da lista esperada → **PARAR e reportar**, não aplicar

## Task 3: Destrackear graphify-out (item 3)

- [ ] `git rm -r --cached graphify-out/`
- [ ] `git checkout -- graphify-out/` (descarta mods locais; NÃO deletar do disco)
- [ ] Confirmar working tree limpo p/ graphify-out

## Task 4: EAS placeholder (item 4)

**Files:** Modify `app.json:45-49`

- [ ] Remover o bloco `extra.eas` (placeholder `<PREENCHER_COM_EAS_INIT>`)
- [ ] Registrar em `docs/release/` que build/upload é Xcode→TestFlight, não EAS
- [ ] NÃO rodar `eas init`

## Task 5: Build 12 (item 5 — Opção A)

**Files:** `app.json:19`, `ios/DoseDay/Info.plist:36`, `ios/DoseDay.xcodeproj/project.pbxproj:359,398`

- [ ] `app.json` ios.buildNumber `"11"` → `"12"`
- [ ] `Info.plist` CFBundleVersion `11` → `12`
- [ ] `pbxproj` `CURRENT_PROJECT_VERSION = 11` → `12` (2 ocorrências)
- [ ] `version`/`CFBundleShortVersionString` ficam 5.0.0

## Task 7: DEV toggle (item 7)

- [ ] Confirmar guard `__DEV__` em `app/configuracoes/conta.tsx:95`. NÃO editar. Citar trecho no PR.

## Task 8: QA manual checklist (item 8)

**Files:** Create `docs/release/2026-06-05-qa-manual-checklist.md`

- [ ] Fluxos: onboarding · cadastro/login · olhinho senha · registrar dose · registrar sintoma · Histórico · Memória do Tratamento (premium, −7,2kg + sintomas PT) · sair/entrar · cold start sem flash de gate (premium) · restaurar compras pós-reinstall · SEM toggle DEV no TestFlight · free vê gate / premium desbloqueia

## Task 9: Store prep (item 9)

**Files:** Create `docs/release/2026-06-08-store-submission-steps.md`

- [ ] Via MCP App Store Connect (verificar, **NÃO submeter**): versão 5.0.0 existe? IAP mensal_premium/anual_premium aprovados+linkados? Links Termos/Privacidade? App Privacy preenchido?
- [ ] Passo-a-passo p/ Léo: criar versão 5.0.0 → anexar build 12 → metadata/What's New → screenshots → submeter

## Task 6: Validação (item 6 — colar saída no PR)

- [ ] `npm run type-check`
- [ ] `npm run lint` (warning antigo de lib/i18n aceitável)
- [ ] `npm test -- --runInBand` (TODOS verdes)
- [ ] `npx expo-doctor` (PASS)

## Task 10: PR

- [ ] Commit cirúrgico, push, abrir PR. Colar validações + justificativa build 12 + trecho guard `__DEV__`. PARAR (Léo revisa o diff).
