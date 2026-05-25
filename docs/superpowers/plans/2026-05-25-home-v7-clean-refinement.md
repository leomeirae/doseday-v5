# Plano — Home v7 clean refinement

**Data:** 2026-05-25  
**Fonte visual:** `/Users/leofrancaia/Downloads/High-Fidelity App Design Directions/src/app/DoseDayHome.tsx`

## Skills

- `react-native-best-practices`: Expo/React Native.
- `impeccable`: refinamento visual de produto.

## Escopo

1. Reduzir densidade da Home v7 para se aproximar do export novo: quick actions menores, menos espaco vertical e seções mais compactas.
2. Adicionar sparkline real de peso usando `weightLogs`, sem gráfico decorativo vazio.
3. Exibir custos na Home apenas se houver pelo menos 1 purchase registrada.
4. Manter copy dentro da regra de memória, sem orientação médica.

## Arquivos previstos

- `components/home/HomeV7Content.tsx`
- `lib/supabase/queries/purchases.ts`
- `hooks/usePurchaseSummary.ts`
- `hooks/useDoseSummary.ts`
- `hooks/useRegisterDose.ts`
- `docs/history.md`

## Execução

- Home compactada conforme export novo: actions maiores/limpas, separadores discretos, peso com sparkline real.
- Sparkline usa os últimos 8 registros reais de `weight_logs`; não renderiza com menos de 2 pontos.
- Custos aparecem apenas se `purchases.count > 0`.
- `doseSummary` ganhou query key versionada (`protocol-v2`) e refetch agressivo para não manter próxima dose stale depois da migration/protocolo.
- Supabase populado com cenário sintético realista de 90 dias em dois usuários de teste:
  - `leonardo@teste.com`
  - `teste-22-maio@teste.com` (usuário atualmente logado no simulador)

## Seed de teste

- 13 doses semanais de Mounjaro, 2.5mg nas 4 primeiras semanas e 5mg depois.
- 27 pesos em 90 dias, cerca de 2 registros por semana, com oscilações e delta final de -9.0kg.
- 8 sintomas estruturados em `symptom_logs`, sem causalidade dose-sintoma.
- 4 quick logs recentes para timeline.
- 4 compras/custos somando R$5.600.
- 1 visita médica registrada com próxima consulta em 2026-06-08.

## Validação

- `npm run type-check` — PASS.
- `npm run lint` — PASS com 1 warning preexistente em `lib/i18n/index.ts`.
- Supabase MCP — verificado: 13 doses, 27 pesos, 8 sintomas, 4 custos, próxima dose calculada em 2026-05-27.
- Screenshot real no iPhone 17: `assets/screenshots/home-v7-clean/01-seeded-realistic-90d.png`.
- `npx impeccable critique components/home/HomeV7Content.tsx` — tentou rodar, retornou `Warning: cannot access critique`.
