# Handoff — DoseDay V5 — Pós Prompt 01

**Data:** 2026-05-15
**Branch atual:** `feature/01-low-migrar-arquivos-sensiveis`
**Último commit:** `9cf80c1` — chore(migration): migra .env, GSI, eas.json, locales e ícone da V4
**Status:** Prompt 01 executado e commitado. Falta abrir PR e fazer merge em `main`.

---

## O que foi feito nesta sessão

### Prompt 00 — Bootstrap (concluído em sessão anterior)
- Expo SDK 54, TypeScript strict, Expo Router, New Architecture habilitada
- App rodando no simulador iOS 26 com "DoseDay / V5 — Inicializando"
- Decisões chave registradas em `docs/architecture.md` seção 14
- Commit: `4dc0c1e` + vários fix commits
- Branch `feature/00-bootstrap` publicada; `main` criada e publicada

### Prompt 01 — Migração de arquivos sensíveis da V4 (concluído agora)

**Checkpoint 1 — `.env`**
- `.env` criado com valores reais da V4 (não commitado — `.gitignore` bloqueia)
- Variáveis: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_REVENUECAT_IOS_KEY` (renomeada da V4: `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS_PROD`)
- Placeholders: `EXPO_PUBLIC_POSTHOG_KEY`, `EXPO_PUBLIC_SENTRY_DSN`
- **Regra permanente:** `ANTHROPIC_API_KEY` e `OPENAI_API_KEY` NUNCA em `EXPO_PUBLIC_*` — só server-side em Edge Functions

**Checkpoint 2 — Arquivos de configuração**
- `GoogleService-Info.plist` copiado de `~/Desktop/Dose-Day-Jules-1/`
- `eas.json` atualizado: `appleId: "leonardo@darwinai.com.br"`, `appleTeamId: "563PT8W429"`, `appVersionSource: "local"`, perfil `development-device` adicionado

**Checkpoint 3 — Locales e ícone**
- 42 arquivos de locale copiados (14 namespaces × 3 idiomas: pt-BR/en/es)
  - Namespaces: auth, checkin, common, dashboard, finances, insights, medication, onboarding, profile, quickLog, report, settings, subscription, weight
- `lib/i18n/index.ts` atualizado para carregar todos os 14 namespaces (antes só carregava `common`)
- Ícone de produção copiado de `assets/welcome/icone-correto.png` → `assets/images/icon.png` + `adaptive-icon.png` (1.2MB)

**Checkpoint 4 — `app.json`**
- Verificado: sem alterações necessárias. `bundleIdentifier: com.doseday.premium`, `newArchEnabled: true`, `scheme: doseday`, `userInterfaceStyle: dark` — tudo correto.

**Checkpoint 5 — Validação**
- `tsc --noEmit` → zero erros (antes e depois da atualização do i18n)
- Commit `9cf80c1` criado com 47 arquivos

---

## Estado atual do repositório

| Item | Estado |
|---|---|
| Branch | `feature/01-low-migrar-arquivos-sensiveis` |
| PR para `main` | **não criado ainda** |
| `.env` | criado localmente, não commitado |
| `GoogleService-Info.plist` | commitado |
| `eas.json` | commitado com dados reais |
| Locales | 42 arquivos commitados |
| Ícone | commitado (1.2MB) |
| TypeScript | zero erros |
| App rodando | sim (do Prompt 00 — build nativo ainda válido) |

---

## Próximas ações imediatas

1. **Abrir PR** `feature/01-low-migrar-arquivos-sensiveis` → `main` (se ainda não foi aberto)
2. **Fazer merge** após revisão do Léo
3. **Próximo prompt:** `02-MID-impeccable-teach` ou equivalente — define design system definitivo via `/impeccable teach` (substituirá `lib/theme/tokens.ts` com tokens reais, criará `docs/PRODUCT.md` e `docs/DESIGN.md`)

---

## Decisões e contexto importantes

- **Nome da chave RevenueCat:** V5 usa `EXPO_PUBLIC_REVENUECAT_IOS_KEY` (simplificado). O valor veio de `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS_PROD` da V4.
- **i18n namespaces:** todos os 14 namespaces da V4 foram preservados. Traduções em pt-BR são as canônicas; en/es são traduções aproximadas que podem precisar de revisão antes do lançamento.
- **Ícone:** arquivo original é grande (1.2MB). Antes do primeiro build de produção, otimizar com `expo-image-utils` ou similar.
- **`profile.json`:** em todos os 3 idiomas contém só `{}` (2 bytes). Normal — funcionalidade de perfil não estava implementada na V4.
- **`.env` não commitado:** se a máquina mudar ou o projeto for clonado em outro lugar, será necessário recriar o `.env` manualmente com os valores do 1Password/Vault da V4.

---

## Referências

- Prompt 00 detalhado: `docs/superpowers/plans/2026-05-15-bootstrap-expo.md`
- Arquitetura + aprendizados: `docs/architecture.md` seção 14
- Estratégia produto: `docs/plano-estrategico-v5.md`
- Design preview: `docs/design-system-preview.md`
- Stack de skills: `docs/skills-stack.md`
- Source V4 (referência somente): `~/Desktop/Dose-Day-Jules-1/`

---

## Skills sugeridas para a próxima sessão

| Skill | Quando usar |
|---|---|
| `/impeccable teach` | Prompt 02 — ensinar design system, gerar tokens definitivos, `docs/PRODUCT.md` + `docs/DESIGN.md` |
| `react-native-best-practices` | Para qualquer tela nova após o design system estar definido |
| `grill-with-docs` | Se o próximo prompt tocar domínio GLP-1 / Movimentos / schema clínico |
| `superpowers:writing-plans` | Qualquer prompt MID ou HIGH que exija plano estruturado |
