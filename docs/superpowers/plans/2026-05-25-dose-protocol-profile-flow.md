# Plano — Protocolo de dose editavel

**Data:** 2026-05-25  
**Escopo:** transformar o CTA "Definir protocolo" da Home v7 em fluxo real para capturar/editar intervalo entre aplicacoes, sem inferir 7 dias.

## Skills

- `react-native-best-practices`: Expo/React Native.
- `impeccable`: UI de produto, copy e estados.

## Arquivos

- `lib/supabase/queries/profile.ts`
- `hooks/useUpdateProfile.ts`
- `lib/supabase/queries/doses.ts`
- `hooks/useRegisterDose.ts`
- `app/perfil/protocolo.tsx`
- `app/_layout.tsx`
- `app/(tabs)/perfil.tsx`
- `components/home/HomeV7Content.tsx`

## Implementacao

1. Mapear `dose_frequency_days` e `dose_frequency_source` no profile local.
2. Criar mutation para salvar protocolo com `dose_frequency_source='user_edited'`.
3. Fazer `getDoseSummary` usar a frequencia atual do perfil para calcular a proxima dose; o snapshot da ultima dose fica como fallback historico.
4. Fazer `registerDose` gravar `days_until_next_dose` com a frequencia confirmada, ou `null` quando ausente.
5. Criar tela `perfil/protocolo` com chips 1/7/10/14 dias e input livre 1-90.
6. Apontar Home v7 e Perfil para a tela de protocolo.

## Riscos

- Nao backfillar historico: doses antigas preservam snapshot antigo; calculo atual pode usar perfil para proxima dose.
- Evitar copy prescritiva: perguntar o intervalo que a pessoa segue, nao recomendar intervalo.
- Nao tocar Supabase: schema ja existe; sem migration nesta frente.

## Validacao

- `npm run type-check`
- `npm run lint` (warning preexistente em `lib/i18n/index.ts`)
- Simulador: abrir Home v7, tocar "Definir protocolo", salvar intervalo e verificar retorno visual.
- Screenshot real em `assets/screenshots/dose-protocol/`.

## Resultado

- `type-check`: PASS.
- `lint`: PASS, 0 errors, 1 warning preexistente em `lib/i18n/index.ts`.
- Simulador iPhone 17: rota `/perfil/protocolo` abriu, chips/input selecionam intervalo, salvamento voltou para Perfil, Home v7 recalculou proxima dose com protocolo de 10 dias.
