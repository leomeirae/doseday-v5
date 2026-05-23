# Supabase Edge Functions — Referência IaC

Este diretório contém o **código-fonte** das Edge Functions Deno usadas pelo DoseDay no Supabase project `pjesgdczasumgjzqyzzk`. Serve como **referência rastreável (Infrastructure-as-Code)**, não como pipeline de deploy.

## O que está aqui

Importadas da V4 (`/Dose-Day-Jules-1`) como ponto de partida histórico para a refatoração do V5:

| Função | Propósito/status |
|---|---|
| `delete-user-account` | Apaga conta do usuário + dados associados (LGPD Art. 18) |
| `generate-checkin-insight` | **Frente 1 2026-05-23:** contenção sem OpenAI para substituir v4 deployada com termos proibidos |
| `generate-insights` | **Frente 1 2026-05-23:** contenção sem OpenAI para remover tom incompatível da versão local |
| `generate-report` | **Frente 1 2026-05-23:** contenção sem OpenAI até novo contrato de relatório |
| `get-revenuecat-metrics` | Lê métricas do RevenueCat para dashboards internos |
| `memory-daily-insight` | **Frente 1 2026-05-23:** contenção sem OpenAI para substituir v4 com prompt placeholder |
| `memory-summary` | **Frente 1 2026-05-23:** contenção sem OpenAI para substituir v2 com prompt placeholder |
| `revenuecat-webhook` | Recebe eventos do RevenueCat (subscribe/cancel/renew) |
| `send-rich-notification` | Dispara push notification rica via Expo Notifications |
| `trigger-weekly-reports` | Cron semanal: dispara geração de relatório por usuário |

## Como o deploy real funciona

O deploy das Edge Functions **não é feito a partir deste diretório**. O fluxo canônico do V5 usa o MCP Supabase:

1. Edição/preparação local do código aqui.
2. Deploy via `mcp__claude_ai_Supabase__deploy_edge_function` (chamada do Claude Code) ou via dashboard Supabase para casos manuais.
3. Migrations de DB (quando a function depende de schema) via `mcp__claude_ai_Supabase__apply_migration` — **nunca** `supabase db push` (lição da V4.5; ver `docs/learnings.md`).

Esse diretório é **fonte de verdade legível**. O Supabase é a fonte de verdade **executável**. Se as duas divergirem, o Supabase prevalece em runtime — sincronize o diretório quando isso acontecer.

## Convenções

- **Não editar** arquivos importados da V4 sem antes abrir um prompt explícito de refatoração. O conteúdo atual é histórico, pode usar APIs depreciadas e referências que não existem mais no V5.
- **Não rodar** `supabase functions deploy` localmente. Esse comando bypass o controle do MCP e pode subir código sem migration associada.
- **Não commitar secrets**. Variáveis sensíveis (`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `REVENUECAT_API_KEY`, etc.) ficam **apenas** no painel Supabase → Edge Functions → Secrets. Se um arquivo aqui referenciar `Deno.env.get(...)`, o valor real só vive em produção.
- **Compliance**: Edge Functions que tocam PHI (peso, sintomas, dose) precisam de `security-review` antes de qualquer deploy. Ver regra 7 do `CLAUDE.md`.

## Próximos passos planejados (V5)

A reescrita por função vai acontecer em prompts dedicados. O esqueleto V4 fica aqui como referência até cada função ter sua versão V5 validada. Quando a versão V5 substituir a V4, este README deve ser atualizado pra indicar o status.
