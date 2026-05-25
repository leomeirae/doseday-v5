# Plano — Home v7 rota experimental

**Data:** 2026-05-24  
**Escopo:** criar uma rota experimental `/home-v7` baseada na direcao Figma Make v7 e ligar a aba Inicio a essa versao por flag local de codigo, preservando a Home antiga como rollback.

## Skills

- `react-native-best-practices`: projeto Expo/React Native.
- `impeccable`: direcao de UI/product surface.

## Arquivos

- Criar `app/home-v7.tsx`.
- Alterar `app/(tabs)/index.tsx` com `ENABLE_HOME_V7 = true` e manter a Home antiga em `LegacyHomeScreen`.
- Nao alterar Supabase, migrations, Edge Functions ou dados.

## Implementacao executada

1. Montar tela single-scroll com SafeArea e fundo graphite local.
2. Adicionar header de memoria, acoes rapidas, proxima dose, peso, memoria recente e disclaimer.
3. Conectar dados existentes:
   - `useDoseSummary` para proxima dose e ultimo registro de dose.
   - `useWeightLogs` + `useProfile` para peso atual e delta.
4. Manter custos/consulta/observacoes condicionais ou ausentes se nao houver fonte segura.

## Riscos

- Divergencia de tokens v7 vs tokens atuais: usar aliases locais nesta rota experimental.
- UI ficar fora do shell real: aceitavel para rota experimental.
- Timeline vaga: cada item deve dizer fato especifico.

## Validacao executada

- `npm run type-check`
- `npm run lint`
- Simulador iPhone 17 via Expo Go (`exp://192.168.15.6:8081`)
- Screenshot real salvo em `assets/screenshots/home-v7/01-home-v7-first-fold.png`
- Screenshot real da aba Inicio salvo em `assets/screenshots/home-v7/02-home-v7-tab-real.png`
- Screenshot real mais recente salvo em `assets/screenshots/home-v7/03-home-v7-latest.png`
- Screenshot real pos-refactor salvo em `assets/screenshots/home-v7/04-home-v7-post-refactor.png`
- `npx impeccable critique assets/screenshots/home-v7/02-home-v7-tab-real.png` tentou rodar, mas retornou `Warning: cannot access critique`; critica automatica nao ficou disponivel nesta sessao.
