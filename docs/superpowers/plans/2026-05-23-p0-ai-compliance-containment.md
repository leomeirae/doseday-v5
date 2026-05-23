# Plano — Frente 1 P0 IA/compliance

Data: 2026-05-23

## Objetivo

Conter qualquer geração de IA paciente-facing que possa produzir:

- citações de trials/estudos ou siglas como SURPASS, SURMOUNT, STEP, SUSTAIN, SELECT;
- orientação médica, prescrição, ajuste de dose, dieta, hidratação ou conduta;
- causalidade entre dose e sintoma;
- tom coach, motivacional, celebratório, gamificado ou culpabilizante.

## Referências obrigatórias

- `docs/PRODUCT_COHERENCE.md`
- `docs/handoff/P0-CONTENCAO-2026-05-22.md`
- `docs/handoff/edge-functions-snapshot-2026-05-22/`

## Escopo permitido

- Versionar documentação necessária.
- Auditar callers e Edge Functions de check-in, memória e insight.
- Neutralizar insight pós-check-in incompatível com `PRODUCT_COHERENCE`.
- Garantir que Free não receba IA recorrente.
- Garantir que Pro só receba memória inteligente dentro das regras documentadas.
- Adicionar testes/validações contra trial names, orientação médica, causalidade dose-sintoma e tom coach.
- Rodar type-check, lint e testes relevantes.
- Abrir PR pequeno e auditável.

## Fora de escopo

- Tela única, redesign, Stitch, paywall, migrations, limpeza de dados de produção.
- Deploy de Edge Functions sem aprovação explícita separada.
- Mudança visual em Home, Relatórios, Onboarding ou Diário.

## Estratégia

1. Cortar o caller legado de IA pós-check-in no cliente. O check-in passa a registrar, confirmar e voltar.
2. Cortar a chamada recorrente para `memory-daily-insight` no cliente enquanto a função não estiver reescrita.
3. Versionar fontes de contenção para as Edge Functions vivas em produção e ausentes do repo:
   - `generate-checkin-insight`
   - `memory-daily-insight`
   - `memory-summary`
4. Ajustar funções versionadas já existentes com prompt incompatível:
   - `generate-insights`
   - `generate-report`
5. Adicionar testes/guardrails locais para provar que os textos e contratos seguros não contêm termos proibidos.
6. Atualizar docs com a distinção entre "PR preparado" e "deploy ainda não executado".

## Riscos

- Mudanças client-side não contêm builds antigos. Por isso as Edge Functions também precisam ser versionadas no PR.
- Sem deploy, produção continua dependendo da aprovação posterior para aplicar a contenção server-side.
- `generate-report` é uma função maior; se o ajuste extrapolar o diff pequeno, a estratégia é neutralizar geração insegura e documentar hardening completo como próxima etapa.
- Worktree já está suja. O PR deve stagear somente arquivos desta Frente 1.

## Arquivos previstos

- `app/diario/checkin.tsx`
- `lib/supabase/queries/insights.ts`
- `supabase/functions/generate-checkin-insight/index.ts`
- `supabase/functions/memory-daily-insight/index.ts`
- `supabase/functions/memory-summary/index.ts`
- `supabase/functions/generate-insights/index.ts`
- `supabase/functions/generate-report/index.ts`
- `supabase/functions/generate-onboarding-insight/handler.test.ts`
- `docs/PRODUCT_COHERENCE.md`
- `docs/handoff/P0-CONTENCAO-2026-05-22.md`

## Validação

- `npm run type-check`
- `npm run lint`
- testes Deno das Edge Functions relevantes
- busca final por padrões proibidos em prompts e outputs paciente-facing
- revisão do diff para confirmar ausência de mudanças visuais e ausência de deploy/migration
