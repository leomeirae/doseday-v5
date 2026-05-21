# Plano — Prompt 31 Result IA Redesign

Data: 2026-05-21
Branch: `feature/31-result-ia-redesign`

## Assumptions

| Assumption | Decisão |
|---|---|
| Prompt 33 já entregou contrato estruturado | Não tocar em Edge Function, tipos, queries ou hook de insight |
| Result deve virar ativação curta | Cards Number-First antes de narrativa e contexto |
| CTA do `OnboardingShell` não é overlay absoluto | Manter footer atual; não criar dock novo |
| Disclaimer vem do contrato | `InsightDisclaimer` aceita `text` opcional e preserva default atual |

## Could 50 Lines Do This?

Não para o resultado final porque há 3 componentes novos pequenos, mas cada peça é curta e direta. O diff fica restrito ao step 14, componentes de apresentação, i18n e artefatos de validação.

## Plano

| Etapa | Ação |
|---|---|
| 1 | Criar `InsightStageCard` flat para `stageLabel` + `medicationLabel` |
| 2 | Criar `InsightGoalCard` Number-First usando `state.data.goal_weight` como número determinístico |
| 3 | Criar `ExpandableContextSection` com label "Como o DoseDay vai acompanhar", expand/collapse e Reduce Motion |
| 4 | Adaptar `InsightDisclaimer` com prop `text` opcional, mantendo default backward-compatible |
| 5 | Reordenar `app/(onboarding)/result.tsx`: cards, narrativa, expandível, disclaimer |
| 6 | Atualizar `locales/pt-BR/onboarding.json` com `goalCardLabel` e `contextSectionLabel` |
| 7 | Validar `type-check`, `lint`, grep anti-estudos e screenshots reais collapsed/expanded |
| 8 | Atualizar `docs/history.md`, commit final e abrir PR |

## Riscos

| Risco | Mitigação |
|---|---|
| `goal_weight` ausente | `InsightGoalCard` cai para `goalLabel` textual |
| Expand/collapse jankar | Usar animação leve e desativar com Reduce Motion |
| Disclaimer quebrar outras telas | Prop `text` opcional com default atual |
| Step 14 difícil de recapturar | Usar simulador com conta resetada ou estado atual já navegável |
| Ruído `graphify-out` entrar no PR | Restaurar/limpar antes de stage final |

## Arquivos

| Tipo | Arquivos |
|---|---|
| Criar | `components/onboarding/InsightStageCard.tsx` |
| Criar | `components/onboarding/InsightGoalCard.tsx` |
| Criar | `components/onboarding/ExpandableContextSection.tsx` |
| Editar | `app/(onboarding)/result.tsx` |
| Editar | `components/ui/InsightDisclaimer.tsx` |
| Editar | `locales/pt-BR/onboarding.json` |
| Editar | `docs/history.md` |
| Criar | `assets/screenshots/2026-05-20-fase-2-pr31/result-redesign.png` |
| Criar | `assets/screenshots/2026-05-20-fase-2-pr31/result-redesign-expanded.png` |
| Não tocar | `supabase/functions/`, `types/api.ts`, `lib/supabase/queries/insights.ts`, `hooks/useOnboardingInsight.ts`, Home, Loading, Welcome |

## Validação

| Check | Critério |
|---|---|
| TypeScript | `npm run type-check` passa |
| Lint | `npm run lint` passa |
| Anti-estudos | Grep `SURMOUNT|SURPASS|STEP|clinical trial|estudo clínico` sem hits de runtime nos arquivos do Result |
| UI | Cards aparecem antes da narrativa; disclaimer visível; CTA não cobre conteúdo |
| Screenshots | Collapsed + expanded salvos em `assets/screenshots/2026-05-20-fase-2-pr31/` |
| Escopo | Diff final sem `graphify-out/` e sem alterações em Home/Loading/Supabase |
