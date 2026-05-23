# Handoff — Frente 1 P0 IA/compliance

Data: 2026-05-23

## Status

**Frente 1 (local) concluída. Frente 2 (deploy via Cowork/MCP Supabase) EXECUTADA em 2026-05-23 19:53–19:56Z. P0 compliance vivo em produção FECHADO.** Drift entre prod (contenção) e main (v4/v27/v48) permanece até merge do PR #64.

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

## Frente 2 — Deploy via MCP (2026-05-23 19:53–19:56Z)

Deploy executado em produção via `mcp__supabase__deploy_edge_function`, sem Supabase CLI local, sem migration, sem cleanup.

| Função | Versão antes | Versão depois | `verify_jwt` antes → depois | Schema da resposta |
|---|---|---|---|---|
| `memory-summary` | v2 | **v3** | true → true | `memory_summary_containment_v1` |
| `memory-daily-insight` | v4 | **v5** | true → true | `memory_daily_containment_v1` |
| `generate-checkin-insight` | v4 | **v5** | **false → true** | `checkin_insight_containment_v1` |
| `generate-insights` | v27 | **v28** | true → true | `generate_insights_containment_v1` |
| `generate-report` | v48 | **v49** | true → true | `generate_report_containment_v1` |

**Validação pós-deploy:**
- `list_edge_functions` confirma todas as 5 EFs em versão nova com SHA256 diferente, `verify_jwt: true`
- Smoke sem JWT em todas as 5: **HTTP 401** (gateway gating ativo)
- Smoke com JWT positivo: não executável daqui (sem JWT real); substituído por inspeção de source + testes Node confirmando `assertSafePatientFacingPayload` aprova payloads hardcoded
- SQL em `educational_insights` pós-deploy: **0 rows criadas na última hora**, 5 antigas remanescentes intocadas

## Próximos passos

1. ✅ ~~Abrir PR com diff da Frente 1.~~ — PR #64 aberto antes do deploy.
2. ✅ ~~Revisar PR e decidir se a contenção das Edge Functions será deployada.~~ — Decisão tomada e deploy executado em 2026-05-23.
3. **Mergear PR #64** pra eliminar drift entre prod (contenção deployada) e main (v4/v27/v48 antigas). Sem merge, qualquer redeploy futuro a partir de main reintroduz risco.
4. Planejar cleanup das 5 rows antigas em `educational_insights` (IDs em `PRODUCT_COHERENCE.md` §13.2) — agora seguro porque torneira parou. Plano separado com backup e aprovação específica.
5. **Migration `dose_frequency_days` / `dose_frequency_source`** em `user_profiles` — pré-requisito técnico da memória do ciclo (decidida §6).
6. **Auditoria do source original de `generate-report` v48** — 91 relatórios já gerados antes da contenção, conteúdo não auditado. Necessária pra decidir reescrita real do relatório (§6 colocou como pilar).
7. **Reescrita da memória Pro** — `generate-insights` e `memory-daily-insight` precisam de versão real alinhada a §6 (Free sem IA, Pro com memória inteligente). Contenção atual é fallback "memória será atualizada em breve", não versão final.
