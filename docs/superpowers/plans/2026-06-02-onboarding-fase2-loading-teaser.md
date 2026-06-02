# Plano — Subfase 5: Loading premium + teaser Premium no result (onboarding ↔ paywall)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans para implementar este plano task-by-task. Steps usam checkbox (`- [ ]`).

**Data:** 2026-06-02
**Status:** ✅ IMPLEMENTADO E VALIDADO EM QA (2026-06-02). Aguardando ok do Léo pro PR.

> **Descoberta da QA que alterou o plano:**
> `router.push('/paywall')` de dentro do `(onboarding)` abria o paywall mas o **AuthGuard derrubava na hora**: a regra `session && !onboardingCompleted && !inOnboardingGroup → replace('/(onboarding)')` tratava o paywall como fuga do onboarding (no fluxo real, o result SEMPRE renderiza antes do `complete()`, então todo usuário free seria afetado). Fix mínimo em `app/_layout.tsx`: exceção `inPaywall` (`currentGroup === 'paywall'`) na condição do guard — 1 linha + comentário. Validado: paywall abre, fica aberto, e o dismiss volta limpo pro result dentro do onboarding.
**Branch:** `feature/onboarding-fase2-loading-teaser` (base `origin/main` = `bfcdef6`, inclui #102 e #103)
**Plano pai:** `docs/superpowers/plans/2026-06-01-release-readiness-paywall-freemium.md` (Subfase 5)

**Goal:** Fechar a costura onboarding ↔ paywall: (1) trocar a bolinha pulsante do loading por um anel de progresso determinado (premium/clínico), (2) adicionar teaser Premium no result com CTA suave pro paywall — sem bloquear a conclusão do onboarding.

**Arquitetura:** Camada visual apenas. A máquina de navegação do loading (piso 5s, `cacheHit`, `navigatedRef` — plano `2026-05-21-loading-piso-5s`) NÃO muda. O teaser usa `useEntitlements()` (fonte única) e as keys `gate.resultTeaser` já pré-criadas no #103.

## Karpathy

- **Assumptions:** keys `gate.resultTeaser` existem e nunca foram usadas (verificado); `PulseAnimation` é órfão fora do loading (verificado); `react-native-svg` 15.12.1 já é dependência (verificado).
- **Could 50 lines do this?** Não — 2 componentes novos + 2 telas editadas, mas cada peça é <80 linhas.
- **Success criteria:** type-check + lint limpos; simulador mostra anel preenchendo, teaser no result free, paywall abrindo de dentro do `(onboarding)`, e premium sem teaser.

## Tarefas

### Subfase 5a — Loading premium

- [x] Criar `components/onboarding/LoadingProgressRing.tsx`: anel SVG determinado (track + preenchimento mint), `useAnimatedProps` + `strokeDashoffset`, preenche por `stepIndex/5`. Mint SÓ no preenchimento (Vital Mint Rarity Rule). Reduced motion: salta pro valor sem animar.
- [x] `app/(onboarding)/loading.tsx`: substituir `PulseAnimation` pelo anel. Zero mudança na lógica de navegação/timing.
- [x] Deletar `components/onboarding/PulseAnimation.tsx` (órfão).

### Subfase 5b — Teaser Premium no result

- [x] Criar `components/onboarding/PremiumTeaserCard.tsx`: card discreto com copy `gate.resultTeaser` (subscription.json), CTA texto "Ver como funciona" → `router.push('/paywall')`. Auto-esconde se `isPremium` ou `isLoading` (sem flash). Container sem `accessible` (CTA precisa ser elemento de a11y próprio, ativável por VoiceOver).
- [x] `app/(onboarding)/result.tsx`: renderizar o teaser ANTES do `InsightDisclaimer`, nos 2 branches (insight da IA e fallback). CTA primário "Abrir meu tratamento" intacto.

### Subfase 5c — Fix do AuthGuard (descoberto na QA, fora do plano original)

- [x] `app/_layout.tsx`: exceção `inPaywall` no AuthGuard pra permitir o paywall por cima do onboarding incompleto. Sem isso, o CTA do teaser não funciona pra nenhum usuário no fluxo real.

### Validação

- [x] `npm run type-check` + `npx eslint` limpos nos arquivos alterados.
- [x] Simulador: anel de progresso animando no loading (frames a 20% e 80% extraídos de gravação de vídeo) + estado cache-hit (anel cheio) preservado.
- [x] Simulador: result free mostra teaser; tap no CTA abre paywall como sheet POR CIMA do result e o dismiss volta pro result (com o fix 5c).
- [x] Simulador: result premium (mock dev) NÃO mostra teaser.
- [x] Screenshots reais em `assets/screenshots/onboarding-fase2-loading-teaser/` (6 PNGs).
- [ ] Reduced motion: coberto por código (salto direto pro valor, mesmo padrão do checklist existente) — não validado visualmente no simulador.

### Git

- [x] `git add` por path explícito (3 telas + 2 componentes novos + 1 deletado + learnings.md + este plano + screenshots). Zero `graphify-out/`, zero `.codegraph/`, zero untracked não relacionado.
- [ ] PARAR antes do PR e mostrar screenshots pro Léo. ← **checkpoint atual**
