# Handoff — Frente 1 P0 IA/compliance

Data: 2026-05-23

## Status

Contenção local preparada. Nenhum deploy Supabase foi executado.

## O que mudou

- `app/diario/checkin.tsx`: removeu a geração de IA pós-primeiro-check-in. O fluxo agora salva, mostra toast e volta.
- `lib/supabase/queries/insights.ts`: `callGenerateCheckinInsight`, `callMemoryDailyInsight` e `getLatestEducationalInsight(first_checkin)` retornam fallback local seguro, sem invocar Edge Function.
- `supabase/functions/_shared/patient-facing-ai-safety.ts`: guardrail compartilhado contra nomes de trials/estudos, orientação médica, causalidade dose-sintoma e tom coach/motivacional.
- `supabase/functions/generate-checkin-insight/`: nova fonte local de contenção sem OpenAI.
- `supabase/functions/memory-daily-insight/`: nova fonte local de contenção sem OpenAI.
- `supabase/functions/memory-summary/`: nova fonte local de contenção sem OpenAI.
- `supabase/functions/generate-insights/index.ts`: substituída por contenção sem OpenAI.
- `supabase/functions/generate-report/index.ts`: substituída por contenção sem OpenAI.
- `docs/PRODUCT_COHERENCE.md` e `docs/handoff/P0-CONTENCAO-2026-05-22.md`: atualizados com status "PR/source preparado; deploy pendente".
- `docs/superpowers/plans/2026-05-23-p0-ai-compliance-containment.md`: plano obrigatório salvo.

## Validação executada

- `npm run type-check`: passou.
- `npm run lint`: passou com 1 warning preexistente em `lib/i18n/index.ts`.
- `npx -y deno-bin@latest test supabase/functions/_shared/patient-facing-ai-safety.test.ts`: 4/4 passou.
- `npx -y deno-bin@latest test handler.test.ts` em `supabase/functions/generate-onboarding-insight`: 7/7 passou.
- `rg` final em caminhos executáveis: nenhum match para OpenAI fora do onboarding hardenizado; nenhum match para termos proibidos fora dos guardrails/testes permitidos.

## Não feito

- Sem deploy de Edge Function.
- Sem migration.
- Sem cleanup das 5 rows antigas em `educational_insights`.
- Sem mudança visual.
- Sem alteração de paywall.

## Próximos passos

1. Abrir PR com diff da Frente 1.
2. Revisar PR e decidir se a contenção das Edge Functions será deployada.
3. Se deploy for autorizado, executar uma função por vez e validar runtime.
4. Só depois planejar cleanup das rows antigas com backup e aprovação específica.
