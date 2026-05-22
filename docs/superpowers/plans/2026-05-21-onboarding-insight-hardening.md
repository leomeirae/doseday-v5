# Plano — Prompt 33b Onboarding Insight Hardening

Data: 2026-05-21
Branch: `codex/33b-onboarding-insight-hardening`
Origem: `docs/prompts/33b-HIGH-onboarding-insight-contract-hardening.md`

## Objetivo

Fechar os dois P1 identificados no contrato do insight de onboarding:

1. Adicionar `schemaVersion: 'onboarding_insight_v2'` ao payload canônico retornado pela Edge Function e lido pelo app.
2. Trocar falhas LLM-side da Edge Function de `500` para `200` com contrato fallback determinístico, preservando `401` para auth e `400` para input inválido.

## Escopo

Arquivos de código:

- `types/api.ts`
- `supabase/functions/generate-onboarding-insight/index.ts`
- `supabase/functions/generate-onboarding-insight/handler.ts`
- `supabase/functions/generate-onboarding-insight/handler.test.ts`
- `lib/supabase/queries/insights.ts`

Documentação:

- `docs/adr/0002-persistencia-hibrida-educational-insights.md`
- `docs/adr/0004-fallback-seguro-edge-onboarding-insight.md`
- `docs/learnings.md`

Fora de escopo:

- Deploy Supabase.
- Mudança visual em Result/Home.
- Migration ou alteração de RLS.
- Alteração de `OPENAI_API_KEY` ou qualquer secret de produção.

## Riscos

| Risco                                                 | Mitigação                                                                                                            |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Insights antigos sem `schemaVersion` serem rejeitados | Reader retorna `null`, e a Home já tem fallback estático seguro                                                      |
| `schemaVersion` vindo errado do LLM quebrar parse     | Destructuring explícito remove o campo antes do raw parse                                                            |
| Teste importar `index.ts` e disparar `Deno.serve`     | Testes importam apenas `handler.ts`                                                                                  |
| Teste depender de Supabase Auth real                  | `HandlerDeps.resolveUserId` permite mock                                                                             |
| Fallback vazar PHI em log                             | Logs usam apenas razão categórica, sem input/output completos                                                        |
| Upsert falhar                                         | Caminho success retorna contrato real; fallback retorna contrato fallback; ambos logam erro de DB sem quebrar client |

## Validação Local

- `npm run type-check`
- `npm run lint`
- `deno check --config supabase/functions/generate-onboarding-insight/deno.json supabase/functions/generate-onboarding-insight/index.ts`
- `deno check --config supabase/functions/generate-onboarding-insight/deno.json supabase/functions/generate-onboarding-insight/handler.ts`
- `deno test --config supabase/functions/generate-onboarding-insight/deno.json supabase/functions/generate-onboarding-insight/handler.test.ts`
- Validação anti-citação focada em `SYSTEM_PROMPT`, fallback strings e outputs dos testes, sem grepar a blocklist inteira.

## Critério de Parada

Parar antes de qualquer deploy de Edge Function ou alteração remota no Supabase.
