# Plano executado — Prompt 24c: Onboarding telas 8-14 + Loading IA

**Branch:** `feature/24c-onboarding-telas-8-14-loading-ia` · **Data:** 2026-05-20

## Objetivo

Entregar as telas 8-14 do onboarding (dose, doctor-name, medical-support, concerns,
consent, loading IA, result), fechando o fluxo de captação iniciado em 24a/24b.

## Pré-validações (MCP)

- Edge Function **`generate-onboarding-insight`** já existe (ativa, v4) — usada no lugar
  de `memory-daily-insight` que o prompt original assumia. Sem bug `user_profiles.id`.
- Contrato EF: body `{medication, dose_mg, treatment_week, current_weight, initial_weight,
  goal_weight}` → retorno `{headline, body, disclaimer}`.
- `consent_history`: colunas `consent_type` (CHECK: terms/privacy/data_collection),
  `version`, `granted`.

## Entregue

**Telas** (`app/(onboarding)/`): dose, doctor-name, medical-support, concerns, consent,
loading, result.

**Componentes** (`components/onboarding/`): ConsentCheckbox, ConcernsChips,
LoadingStepIndicator, PulseAnimation, InsightCard.

**Hook**: `hooks/useOnboardingInsight.ts` — `useQuery` que invoca `generate-onboarding-insight`.
`treatment_week` derivado de `treatment_duration`. `enabled:false` se `treatment_status='planning'`
(paciente pré-tratamento não tem semana — pula a IA, result mostra só cards locais).

**Loading**: orquestração `Promise`-piso de 5s + timeout 15s; 5 steps animados; PulseAnimation
(único Vital Mint da tela); respeita `prefersReducedMotion`.

**Result**: InsightCard IA + 2-3 cards de fato local (`result.insightFallback`) + disclaimer fixo.

## Correções de bugs descobertos

1. **CONCERN_OPTIONS** (24a): 6 valores preliminares → alinhados aos 9 do i18n. Commit separado.
2. **`recordConsent`** (24a, `lib/supabase/queries/onboarding.ts`): usava `consent_type='onboarding_lgpd'`,
   valor que viola o CHECK `consent_history_consent_type_check` (aceita só terms/privacy/data_collection).
   **P0** — `complete()` falhava sempre que `consent_given=true`, impedindo concluir o onboarding.
   Corrigido: insere 2 linhas (`terms` + `privacy`, v1.0, granted).

## Validação E2E (MCP react-native + Supabase)

Fluxo completo telas 8-14 percorrido no simulador. Confirmado via `execute_sql`:
`onboarding_completed_at` populado + `consent_history` com linhas `terms`/`privacy`.
Redirect para `/(tabs)` funcionando. 8 screenshots em `assets/screenshots/prompt24c/`.
`type-check` e `lint` PASS.
