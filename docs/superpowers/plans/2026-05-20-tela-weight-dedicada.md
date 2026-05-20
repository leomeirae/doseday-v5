# Prompt 27: Tela de Peso Dedicada

## Summary

Implementar a tela dedicada de peso como gap P1 de paridade V4 para V5, com entrada exclusiva pelo card de peso em Relatorios, rota `app/peso/`, modal Stack para registrar ou editar, CRUD em `weight_logs`, swipe-to-delete e zero alteracao em Home ou onboarding 24c.

Pre-validacoes confirmadas:

- `WeightPoint` existe em `lib/supabase/queries/reports.ts` e sera reutilizado.
- `hooks/useWeightHistory.ts` e somente leitura e nao sera alterado.
- `locales/pt-BR/weight.json` cobre as labels necessarias se o empty CTA reutilizar `addModal.titleAdd`.
- `react-native-gesture-handler` nao esta instalado direto.
- UNIQUE `weight_logs_user_id_date_unique` esta ativo no Supabase.

## Key Changes

- Criar worktree isolada e branch `feature/27-tela-weight-dedicada`, sem merge.
- Antes de alterar `app/_layout.tsx`, rodar `git log origin/feature/24c-onboarding-telas-8-14-loading-ia -- app/_layout.tsx` e comparar `origin/main..origin/feature/24c-onboarding-telas-8-14-loading-ia`.
- Se `app/_layout.tsx` tiver mudancas no 24c, adicionar `GestureHandlerRootView` de forma cirurgica, apenas envelopando o conteudo existente, sem tocar listeners, auth guard ou bootstrap de notificacoes; documentar no PR.
- Instalar `react-native-gesture-handler` via Expo.

## Esclarecimentos Pre-execucao Aprovados

- Antes de envolver `app/_layout.tsx` com `GestureHandlerRootView`, verificar o historico da branch `origin/feature/24c-onboarding-telas-8-14-loading-ia`. Se houver delta no arquivo, aplicar somente o wrapper e documentar no PR. Na execucao, nao havia diff `origin/main..origin/feature/24c-onboarding-telas-8-14-loading-ia` para `app/_layout.tsx`.
- `WeightStatsCard` deve usar exatamente o fallback `const currentWeight = weightLogs[0]?.weight ?? userProfile.initialWeight ?? null`; se ambos forem `null`, mostrar empty state.
- Empty state do historico sem registros deve usar SF Symbol `scalemass`, texto `historyModal.empty` e CTA secundario com `addModal.titleAdd`. Nao criar copy nova; se o texto exato "Registrar primeiro peso" fosse obrigatorio, parar e reportar falta de key.

## Implementation

- Criar `lib/supabase/queries/weight.ts` com `getWeightLogs`, `addWeightLog` via `upsert(..., { onConflict: 'user_id,date' })`, `updateWeightLog` e `deleteWeightLog`; importar `WeightPoint` de `reports.ts`.
- Criar `hooks/useWeightLogs.ts` com query completa DESC, mutations, optimistic update, rollback e invalidacao de `['weightHistory', userId]` e `['profile', userId]`.
- Criar `lib/validation/weightSchemas.ts`: peso 30-300, date-only ate hoje, notes ate 500.
- Criar `app/peso/historico.tsx` e `app/peso/registrar.tsx`; registrar `peso/historico` e `peso/registrar` no Stack, com `peso/registrar` como modal.
- Criar `components/peso/WeightStatsCard.tsx` e `components/peso/WeightHistoryRow.tsx`; usar `Alert.alert` nativo para confirmar delete.
- Alterar apenas o envelope de `components/relatorios/WeightChartCard.tsx`: `Pressable`, chevron, `router.push('/peso/historico')`, `accessibilityRole="button"` e hint. Nao alterar logica do grafico.
- `WeightStatsCard` usa fallback explicito: `const currentWeight = weightLogs[0]?.weight ?? userProfile.initialWeight ?? null`. Se ambos forem `null`, mostra empty state.
- Empty state do historico: SF Symbol `scalemass`, texto `historyModal.empty`, CTA secundario com `addModal.titleAdd` abrindo `/peso/registrar`. Nao criar copy nova.

## Constraints

- Nao tocar `app/(tabs)/index.tsx`.
- Nao tocar `useWeightHistory.ts`, logica do grafico, `smart_weight_reminder`, `useWeightSentinel` ou fluxos do 24c.
- Nao usar `user_profiles.current_weight` como fonte do header.
- Zero glass em conteudo.
- Vital Mint so no botao primario e delta positivo de perda.
- Zero hex hardcoded nos novos arquivos de peso.
- Date-only sempre com parsing local ao meio-dia para display.

## Validation

- `npm run type-check`
- `npm run lint`
- MCP `execute_sql` pos-fluxo confirmando INSERT/UPSERT, UPDATE e DELETE em `weight_logs`.
- `/impeccable harden` cobrindo vazio, 1 registro, 3+ registros, data futura, peso fora da faixa, conflito por data e erro de rede.
- `/impeccable critique` com meta maior ou igual a 30/40.
- 6 screenshots reais em `assets/screenshots/prompt27/`: Relatorios tappable, historico vazio, historico com 3 registros, modal registrar, modal editar, alert delete.
- PR com 3 commits planejados: foundation; telas/componentes; entry point. Documentar no PR se `app/_layout.tsx` teve cuidado por possivel conflito com 24c.
