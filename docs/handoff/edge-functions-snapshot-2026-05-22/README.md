# Snapshot Edge Functions órfãs — 2026-05-22

**Status:** snapshot **untracked**, fora de `supabase/functions/`. Não mover para lá sem decisão explícita do Léo.
**Origem:** Supabase MCP `get_edge_function` em modo read-only contra projeto `pjesgdczasumgjzqyzzk`.
**Motivo:** 3 EFs estavam ativas em prod sem source no repo (ver `docs/PRODUCT_COHERENCE.md` §13.3 e `docs/handoff/P0-CONTENCAO-2026-05-22.md` Opção 3).

## Arquivos

| Slug | Arquivo | Versão | sha256 |
|---|---|---|---|
| `generate-checkin-insight` | `generate-checkin-insight.index.ts` | v4 | `0706390435279aa182727c6b7ffc1f22c5319685cc0b7ceb93e8768f9d66518c` |
| `memory-daily-insight` | `memory-daily-insight.index.ts` | v4 | `b11cb0098c12d0ed0215b2d0159cc122a4d583b7c39aa3df0efffedc27d10a83` |
| `memory-summary` | `memory-summary.index.ts` | v2 | `150c3c00ee66bf9ea0d770bfc68d63f20f4ae2cc5e160c0e6e3ac82ee7d7f8e2` |

## O que NÃO fazer

- Não copiar estes arquivos para `supabase/functions/<slug>/index.ts` sem autorização explícita.
- Não rodar `supabase functions deploy` a partir destes arquivos.
- Não rodar `apply_migration` ou `deploy_edge_function` via MCP.
- Não confiar nestes arquivos como "fonte canônica" enquanto não houver decisão de oficializar.

## Próximo passo

Aguardar análise (relatório no chat) e decisão do Léo sobre se este snapshot vira o source canônico em `supabase/functions/` (via PR de IaC) ou se deve ser descartado.
