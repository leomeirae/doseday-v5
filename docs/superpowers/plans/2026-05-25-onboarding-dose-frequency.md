# Plano — Frequencia de dose no onboarding

**Data:** 2026-05-25  
**Escopo:** capturar o intervalo entre aplicacoes no onboarding, logo apos a dose, sem assumir 7 dias.

## Skills

- `react-native-best-practices`: Expo/React Native.
- `impeccable`: UI de produto, copy e estados.

## Arquivos

- `lib/types/onboarding.ts`
- `lib/validation/onboardingSchemas.ts`
- `lib/supabase/queries/onboarding.ts`
- `app/(onboarding)/dose.tsx`
- `app/(onboarding)/dose-frequency.tsx`
- `app/(onboarding)/index.tsx`
- `app/(onboarding)/medical-support.tsx`
- `app/(onboarding)/doctor-name.tsx`
- `app/(onboarding)/concerns.tsx`
- `app/(onboarding)/consent.tsx`
- `app/(onboarding)/loading.tsx`
- `app/(onboarding)/result.tsx`
- `locales/*/onboarding.json`

## Implementacao

1. Adicionar step `dose-frequency` entre `dose` e `medical-support`.
2. Adicionar `dose_frequency_days` e `dose_frequency_source` ao payload de onboarding.
3. Persistir `dose_frequency_days` com `dose_frequency_source='user_confirmed'` quando salvo no onboarding.
4. Criar tela com chips 1/7/10/14 dias e input livre 1-90, usando copy de memoria, nao de recomendacao.
5. Atualizar ordem, rotas, numeros de progresso e back/next.
6. Atualizar traducoes PT/EN/ES.

## Riscos

- Nao recomendar protocolo: a tela deve perguntar o que a pessoa vai seguir.
- Nao tornar obrigatorio demais: deve permitir "Ainda nao sei" e deixar `null`.
- Usuarios antigos continuam cobertos pela tela de Perfil criada no PR #68.

## Validacao

- `npm run type-check`
- `npm run lint` (warning preexistente em `lib/i18n/index.ts`)
- Simulador: abrir onboarding em `dose-frequency`, selecionar intervalo, pular, voltar e conferir layout.
- Screenshots reais em `assets/screenshots/onboarding-dose-frequency/`.

## Resultado

- `type-check`: PASS.
- `lint`: PASS, 0 errors, 1 warning preexistente em `lib/i18n/index.ts`.
- Simulador iPhone 17: tela `dose-frequency` renderizada com bypass local temporario do AuthGuard para captura; bypass revertido antes do commit.
- Screenshot real: `assets/screenshots/onboarding-dose-frequency/01-selected-7.png`.
