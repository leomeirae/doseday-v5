# AGENTS.md — Instruções universais para agentes de IA

> Alguns agentes (Codex CLI, Cursor, Windsurf, Aider) leem `AGENTS.md` automaticamente. Claude Code lê `CLAUDE.md`. Esse arquivo redireciona — **fonte de verdade é `CLAUDE.md`**.

## Leia primeiro, na ordem

1. `CLAUDE.md` — working memory, **22 regras anti-pirraça**, histórico, stack
2. `docs/architecture.md` — schema, aprendizados (seções 14.x, 15)
3. `docs/PRODUCT.md` — persona Mariana, Voice & Tone
4. `docs/DESIGN.md` — Named Rules (Vital Mint Rarity, 30% Glass, Number-First)
5. `docs/prompts/README.md` — template + regras
6. `docs/prompts/NN-*.md` — prompt sendo executado

## Quem é Léo

Léo é PO/estrategista, **não dev**. Aprova/rejeita plano antes da execução. Testa no simulador. Espera PT-BR direto, tabelas > listas, sem enrolação.

## Regra única e imutável

Antes de tocar em código: **Skills + Plano + Riscos + Arquivos + Validação**. Aguardar `ok`.

## Regras críticas (resumo — detalhes no CLAUDE.md)

| Regra | Onde |
|---|---|
| Nunca codar direto | CLAUDE.md regra 1 |
| Sem `as any`, `// @ts-ignore`, `// eslint-disable` sem justificativa | regra 2 |
| Glass APENAS na navegação (nunca conteúdo) | regra 3 + DESIGN.md "30% Glass" |
| Vital Mint Rarity ≤10% | DESIGN.md |
| Number-First Rule | DESIGN.md |
| Migrations via MCP `apply_migration` (nunca `supabase db push`) | regra 8 |
| `/impeccable critique` antes de marcar UI como pronta | regra 6 |
| `security-review` em migration/edge function/PHI | regra 7 |
| Sem Tailwind | regra 4 |
| Validação via `react-native-devtools-mcp` (16 tools) | regra 20 |
| **Screenshots no PR = imagens reais (markdown `![](url)`), não descrições** | regra 20 cláusula |
| **Plano salvo em `docs/superpowers/plans/YYYY-MM-DD-<slug>.md` ANTES de executar** | regra 21 |
| **RTK calibrado por tipo de comando** (não força em arquivo pequeno) | regra 14 |
| **Karpathy Guidelines** — Think Before Coding / Simplicity First / Surgical Changes / Goal-Driven Execution | regra 22 + seção "Karpathy Guidelines" |

## Karpathy Guidelines (resumo de 4 linhas)

1. **Think Before Coding** — declare assumptions, pergunte se incerto, surface tradeoffs
2. **Simplicity First** — "50 linhas resolvem em vez de 200?" Se sim, reescreva
3. **Surgical Changes** — cada linha mudada DEVE traçar direto pro pedido. Zero drive-by refactor
4. **Goal-Driven Execution** — transforme tarefa em meta verificável (tests-first quando aplicável)

## Stack

Expo SDK 54 + React Native 0.81 + TS strict + Expo Router 6 + Supabase (`pjesgdczasumgjzqyzzk`, RLS habilitado) + RevenueCat (`proj521a5bc0`) + React Query + Zod + i18next (pt-BR padrão). Bundle ID `com.doseday.premium`.

## Credenciais de teste

`leonardo@teste.com` / `123456` · iPhone 17 Simulator booted · `ping` do MCP `react-native` confirma conexão

## MCPs disponíveis

- `react-native` — 16 tools (screenshot, tap, type_text, js_eval, get_view_hierarchy, etc)
- `supabase` — execute_sql, apply_migration, list_tables, get_advisors, generate_typescript_types
- `github` — pull_request_read, create_pull_request, list_branches, get_file_contents

## Ao final da tarefa

1. Atualizar `CLAUDE.md` tabela "Histórico" com linha do prompt
2. Atualizar `docs/architecture.md` seção "Aprendizados" se houver descoberta
3. Salvar handoff em `docs/handoff/HANDOFF-prompt-NN.md` se sessão longa
4. PR com checklist completo + screenshots REAIS
5. Reportar: link PR, score `/impeccable critique`, output `type-check` + `lint`, aprendizados

---

**Fim.** Detalhes em `CLAUDE.md`.
