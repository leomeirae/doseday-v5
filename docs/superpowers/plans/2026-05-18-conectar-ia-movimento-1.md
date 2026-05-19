---
status: aguardando aprovação (Léo)
prompt: docs/prompts/16-MID-conectar-ia-movimento-1.md
branch alvo: feature/16-conectar-ia-movimento-1
data: 2026-05-18
---

# Prompt 16 — Conectar IA Movimento 1 (Insight do Dia + Insight pós-primeiro-checkin)

> Este plano está **pendente de aprovação**. Cowork → Léo → `ok` → Claude Code executa em modo inline.
> Persistência aqui (em vez de só `/Users/leofrancaia/.claude/plans/...`) por solicitação explícita do Léo pra revisão.

## TL;DR

Plugar duas Edge Functions já ATIVAS na V4 (`generate-checkin-insight` v4 + `memory-daily-insight` v4) no app V5 sem criar IA do zero. **Sem migrations.** Mudanças cirúrgicas em 10 arquivos (~280 linhas).

**3 frentes:**
1. Cliente Edge Function (`lib/supabase/queries/insights.ts`) + tipagem + mood map
2. Hook React Query (`useDailyInsight`) + orquestração inline no `app/diario/checkin.tsx` (decisão Léo: screen-based)
3. UI — `InsightCard` real (4 estados), `CheckinInsightView` (tela inline pós-primeiro-checkin), `InsightDisclaimer` (badge reutilizável)

**Out of scope:** modificar Edge Functions, paywall funcional, system prompt do `memory-daily-insight`, symptom_logs (V2).

---

## Context

InsightCard da Home está mockado desde o Prompt 06 (`homeMock.insight.text`). DoseDay V5 se posiciona como "memória inteligente do tratamento" — hora de conectar a IA real e fechar o **Movimento 1** (Insight do Dia + Insight pós-primeiro-checkin).

As 2 Edge Functions da V4 já estão ATIVAS no projeto Supabase `pjesgdczasumgjzqyzzk` (confirmado via MCP — `generate-checkin-insight` v4 e `memory-daily-insight` v4). Schema `user_profiles` já tem `current_weight`, `initial_weight`, `goal_weight` (nullable, numeric). Não há migration nova; é só **plugar**.

**Outcome esperado:**
- Home mostra insight diário REAL (cache 24h server-side, gate premium nativo)
- Modal Diário no PRIMEIRO check-in da vida do usuário renderiza `CheckinInsightView` inline antes de fechar
- Disclaimer educacional ("Conteúdo educacional · Não substitui orientação médica") sempre visível onde houver conteúdo de IA

---

## Skills a usar (na ordem)

| Skill | Quando |
|---|---|
| `superpowers:writing-plans` | **OBRIGATÓRIA** — este arquivo é o output da skill. Vale como evidência da regra 21 |
| `react-native-best-practices` | Hooks, mutations, `supabase.functions.invoke`, padrões de timeout, evitar re-renders no modal |
| `supabase-postgres-best-practices` | `.maybeSingle()`, autenticação JWT em Edge Functions, índice em `daily_checkins(user_id)` p/ COUNT |
| `claude-api` | Contexto sobre disclaimer/guardrails (não chamamos Claude direto — Edge Functions intermediam) |
| `/impeccable craft` | `CheckinInsightView` (hierarquia visual + transição loading→success) e `InsightDisclaimer` badge |
| `/impeccable harden` | Timeout 20s, free user, network drop, Edge Function 500, double-tap submit |

---

## Karpathy Self-Tests

### 1. Think Before Coding — Assumptions explícitas

1. **"Primeiro checkin" = `count(daily_checkins WHERE user_id=X) === 1` lido APÓS o INSERT bem-sucedido.** Race condition de dois inserts simultâneos do mesmo user é improvável (modal único, mutation single-flight). Aceito.
2. **Mood mapping:** `terrible|bad → 'mal'`, `ok → 'ok'`, `good → 'bem'`, `great → 'otimo'`. Decisão: `bad` e `terrible` ambos viram `'mal'` (Edge Function só aceita 4 valores; agrupar negativos é semanticamente correto).
3. **Timeout do modal:** 20s. Após isso, fecha modal mesmo se insight não chegou. Insight ficará salvo em `educational_insights` p/ próxima sessão (UPSERT server-side independe do timeout no cliente).
4. **Fallback de erro no InsightCard:** texto genérico "Acompanhamento do tratamento" (não substituir por toast nem alert — manter card sempre visível com fallback narrativo).
5. **JWT:** `supabase.functions.invoke` forwarda o `access_token` automaticamente. `generate-checkin-insight` declara `verify_jwt:false` mas o body precisa do JWT (server-side reads `user_id`). Sem auth header explícito é OK — o helper inclui.
6. **Profile precisa de campos novos:** confirmado via MCP que `user_profiles.current_weight`, `initial_weight`, `goal_weight` existem (numeric, nullable). Mudança cirúrgica em 2 arquivos.

### 2. 3 Alternativas avaliadas para "quando chamar generate-checkin-insight"

| Alternativa | Veredito |
|---|---|
| A cada checkin | ❌ — Edge Function faz UPSERT por `(user_id, trigger_source='first_checkin')` — substituiria insight anterior. Custo gpt-5-mini × N |
| Primeiro checkin apenas | ✅ — alinhado com o design da função. One-shot, alto valor (aha-moment do tratamento) |
| Nunca (deixa a Home cobrir tudo) | ❌ — perde o momento de "primeira impressão de inteligência" no modal pós-checkin |

### 3. Simplicity First

- ~280 linhas totais. Sem retry no cliente (Edge Functions têm fallback nativo). Sem cache no cliente p/ `memory-daily-insight` (24h server-side).
- Orquestração do "first-checkin" mora **na screen**, não no hook. Razão: a screen já é o owner da UI state (form / loading / insight). Mover pro hook obrigaria callback prop + acoplar com `useProfile` dentro do hook (anti-pattern).
- `hooks/useRegisterCheckin.ts` permanece INTOCADO.

### 4. Surgical Changes — Arquivos

| Arquivo | Tipo | Razão |
|---|---|---|
| `lib/supabase/queries/profile.ts` | MODIFY | Expor `currentWeight/initialWeight/goalWeight` no select e no type `Profile` |
| `lib/supabase/queries/insights.ts` | NEW | 3 funções (`callGenerateCheckinInsight`, `callMemoryDailyInsight`, `getLatestEducationalInsight`) + tipos |
| `lib/validation/diarioSchemas.ts` | MODIFY | Adicionar `EMOTIONAL_TO_MOOD_MAP` constante + helper `emotionalStateToMood(state)` ao lado do enum `EmotionalState` |
| `hooks/useDailyInsight.ts` | NEW | Hook React Query (staleTime 12h, retry 1) |
| `hooks/useRegisterCheckin.ts` | **NO CHANGE** | Decisão Léo — orquestração fica na screen |
| `app/diario/checkin.tsx` | MODIFY | Adiciona phase state, COUNT pós-success, chamada generate-checkin-insight, timeout 20s, cleanup |
| `components/diario/CheckinInsightView.tsx` | NEW | Tela inline pós-primeiro-checkin (loading + success states) |
| `components/ui/InsightDisclaimer.tsx` | NEW | Badge reutilizável (Home + Modal) |
| `components/home/InsightCard.tsx` | MODIFY | Substitui mock por hook `useDailyInsight`; render 4 estados |
| `locales/pt-BR/dashboard.json` | MODIFY | + chave `insightToday.freePlaceholder` (decisão Léo: APENAS pt-BR) |

**NÃO toca:** Edge Functions, `tokens.ts`, navegação, Diário V1 timeline, Doses, Home (exceto InsightCard), `_layout.tsx`, schemas Zod (apenas adiciona constante), `lib/mocks/home.ts` (deixa o mock — apenas para de referenciar `homeMock.insight`).

### 5. Goal-Driven Execution

15 testes MCP observáveis (DB + UI + a11y) — definidos na seção "Bateria MCP". Cada checkpoint do plano tem critério verificável.

---

## Shape Brief (Impeccable)

### `InsightDisclaimer` (badge sutil)

```
┌──────────────────────────────────────────────────────────┐
│ ✨ Conteúdo educacional · Não substitui orientação médica│
└──────────────────────────────────────────────────────────┘
```

- `padding`: `xs` horizontal · `xxs` vertical
- `bg`: `colors.bgSurface` · `border`: 0.5px `rgba(255,255,255,0.06)`
- `typography.caption` · `color: textSecondary`
- Ícone `sparkle` (SF Symbol, `expo-symbols`) à esquerda · tint `textSecondary` (NÃO brand — Vital Mint Rarity preservado)
- `accessibilityRole="text"` + `accessibilityLabel` agrupado

### `CheckinInsightView` (tela inline pós-primeiro-checkin)

```
┌────────────────────────────────────┐
│ ✕                Insight do dia    │ ← header igual ao form
├────────────────────────────────────┤
│ [InsightDisclaimer]                │
│                                    │
│ headline (typography.subtitle)     │
│                                    │
│ body (typography.body)             │
│ body continuação                   │
│                                    │
│ [Voltar] (AuthButton secondary)    │
└────────────────────────────────────┘
```

Loading state: `<ActivityIndicator size="large" color={colors.brand} />` + texto "Gerando seu insight do tratamento..."

### `CheckinScreen` — máquina de estado

```
phase: 'form' (default)
  → handleSubmit → mutate
    → onSuccess (mutation) → COUNT daily_checkins
      → if count === 1:
          phase = 'loading'
          start setTimeout(20s) → router.back() (silencioso)
          await callGenerateCheckinInsight()
            success: clearTimeout · setInsight · phase='insight'
            error:   clearTimeout · showSuccessToast · router.back()
      → else: showSuccessToast · router.back()
```

### `InsightCard` (Home) — 4 estados

| State | Render |
|---|---|
| `isLoading` | Skeleton de 2 linhas (`bgSurface`) + título visível |
| `error` (network) | Card com texto fallback "Acompanhamento do tratamento" (sem disclaimer) |
| `data.kind === 'premium'` | `insightText` + `InsightDisclaimer` no topo |
| `data.kind === 'free_placeholder'` | i18n string + `InsightDisclaimer` no topo |
| `data.kind === 'fallback'` | `insightText` (sem disclaimer especial) |

---

## Plano de execução (9 checkpoints)

### Checkpoint 0 — Persistir plano (regra 21)
- [x] Salvar plano em `docs/superpowers/plans/2026-05-18-conectar-ia-movimento-1.md` (este arquivo)
- [ ] Confirmar com Léo via `ok`

### Checkpoint 1 — Branch + housekeeping
- [ ] `git checkout main && git pull`
- [ ] `git checkout -b feature/16-conectar-ia-movimento-1`
- [ ] Verificar via SQL: `SELECT subscription_status FROM user_subscriptions WHERE user_id = (SELECT id FROM auth.users WHERE email='leonardo@teste.com')` → esperar `active`/`trial`
- [ ] Confirmar `ping` MCP retorna OK (iPhone 17 booted)

### Checkpoint 2 — Tipos + queries do servidor
- [ ] **MODIFY** `lib/supabase/queries/profile.ts`:
  - Adicionar `currentWeight: number | null`, `initialWeight: number | null`, `goalWeight: number | null` no type `Profile`
  - Estender select: `'..., current_weight, initial_weight, goal_weight'`
  - Mapear com `Number(...)` se não-null
- [ ] **MODIFY** `lib/validation/diarioSchemas.ts`:
  - Adicionar constante `EMOTIONAL_TO_MOOD_MAP: Record<EmotionalState, 'mal'|'ok'|'bem'|'otimo'>` e helper `emotionalStateToMood(state)`
- [ ] **NEW** `lib/supabase/queries/insights.ts`:
  - Types: `GenerateCheckinInsightInput`, `CheckinInsightOutput`, `DailyInsightResponse` (discriminated union 3 kinds)
  - Funções: `callGenerateCheckinInsight(input)`, `callMemoryDailyInsight()`, `getLatestEducationalInsight(userId)`
  - Re-exporta `emotionalStateToMood` de `diarioSchemas` p/ ergonomia
- [ ] Verificar: `npm run type-check` zero erros

### Checkpoint 3 — Hook React Query
- [ ] **NEW** `hooks/useDailyInsight.ts`:
  - `useQuery({ queryKey: ['dailyInsight', userId], queryFn: callMemoryDailyInsight, enabled: !!userId, staleTime: 12*60*60*1000, retry: 1 })`
- [ ] Verificar: type-check passa

### Checkpoint 4 — UI primitivos
- [ ] **NEW** `components/ui/InsightDisclaimer.tsx`
- [ ] **NEW** `components/diario/CheckinInsightView.tsx` (estado loading + estado success; recebe `insight: CheckinInsightOutput | null`, `isLoading: boolean`, `onClose: () => void`)
- [ ] Verificar: type-check passa, sem `colors.brand` novo (grep)

### Checkpoint 5 — Home (InsightCard)
- [ ] **MODIFY** `components/home/InsightCard.tsx`:
  - Remove `homeMock.insight` import
  - Usa `useDailyInsight()`
  - Renderiza 4 estados via discriminated union
  - i18n para `freePlaceholder` via `useTranslation('dashboard')`
- [ ] **MODIFY** `locales/pt-BR/dashboard.json`: adiciona `"insightToday": { "freePlaceholder": "Insight do dia disponível no Premium. Toque pra saber mais." }`
- [ ] Verificar: type-check, lint
- [ ] Verificar visualmente via MCP: `screenshot` da Home mostra card com texto REAL

### Checkpoint 6 — Modal Diário (orquestração)
- [ ] **MODIFY** `app/diario/checkin.tsx`:
  - Adiciona `phase: 'form' | 'loading' | 'insight'` + `insight: CheckinInsightOutput | null` state
  - `onSuccess` da mutation: COUNT (`select id, count: 'exact', head: true`), se 1 → entra loading, dispara `callGenerateCheckinInsight` + setTimeout(20000)
  - `useRef` p/ guardar o timeout id (clear no unmount + clear no chegada do insight)
  - Render condicional: `phase === 'form'` → form atual; `phase === 'loading' || 'insight'` → CheckinInsightView
  - **Cleanup:** `useEffect` cleanup limpa timeout se modal desmontar antes
- [ ] Verificar: type-check, lint
- [ ] **NÃO modificar** `hooks/useRegisterCheckin.ts` (decisão registrada)

### Checkpoint 7 — Bateria MCP (15 testes — ver tabela abaixo)

### Checkpoint 8 — Impeccable
- [ ] `/impeccable critique` Home com InsightCard real
- [ ] `/impeccable critique` CheckinInsightView pós-primeiro-checkin
- [ ] `/impeccable harden`: timeout 20s, free user (simular via `js_eval` retornando `kind:'free_placeholder'`), network drop (`js_eval` força throw)
- [ ] Resolver P1/P2 — adiar P3 com TODO se necessário

### Checkpoint 9 — Limpar fixtures + screenshots + commit + PR
- [ ] DELETE daily_checkins de teste do user `leonardo@teste.com` via Supabase MCP
- [ ] Salvar 5 screenshots em `assets/screenshots/prompt16/` + espelhar `.impeccable/critique/screenshots/`
- [ ] Atualizar `docs/architecture.md` (aprendizados 36-39 do Prompt 16)
- [ ] Atualizar `CLAUDE.md` tabela Histórico
- [ ] Commit: `feat(ia): conecta Movimento 1 — insight do dia + insight pós-primeiro-checkin`
- [ ] PR via `gh pr create` com 5 screenshots embedadas em markdown `![desc](url)`

---

## Bateria MCP (15 testes verificáveis)

| # | Ação | Tool | Critério |
|---|---|---|---|
| 1 | Cold start + signin Leonardo (`leonardo@teste.com` / `123456`) | `tap` (IDB fallback) + `type_text` em 3 fragmentos | Home renderiza, GreetingHeader "Bom dia, Leonardo" visível |
| 2 | InsightCard com data REAL (premium) | `screenshot` + `get_js_logs duration=10` | Card mostra texto de `memory_daily_insights` (NÃO `homeMock`). Disclaimer badge visível no topo |
| 3 | Validar DB pós-load | `execute_sql SELECT COUNT(*) FROM memory_daily_insights WHERE user_id=...` | ≥1 registro novo |
| 4 | A11y InsightCard | `get_view_hierarchy` | Disclaimer com role + texto. Card com `accessibilityLabel` agrupado |
| 5 | Limpar daily_checkins p/ forçar "primeiro" | `execute_sql DELETE FROM daily_checkins WHERE user_id=...` | count=0 confirmado |
| 6 | Navegar Diário | `open_deeplink doseday:///(tabs)/diario` | Tela renderiza, CheckinCard CTA "Fazer check-in" |
| 7 | Fazer check-in (primeiro pós-DELETE) | abrir modal → mood → 1 sintoma → salvar | Modal NÃO fecha — entra loading "Gerando seu insight do tratamento..." |
| 8 | Screenshot modal loading | `screenshot` | ActivityIndicator visível, texto "Gerando..." |
| 9 | Aguardar insight (5-15s) | `get_js_logs duration=20` + `screenshot` | CheckinInsightView aparece com headline + body + disclaimer |
| 10 | Screenshot CheckinInsightView | `screenshot` | Layout: badge no topo, headline, body, botão "Voltar" |
| 11 | Validar DB educational_insights | `execute_sql SELECT * FROM educational_insights WHERE user_id=... AND trigger_source='first_checkin'` | 1 registro |
| 12 | Fechar "Voltar" | `tap` | Volta pra tela Diário |
| 13 | Refazer check-in (segundo) | `execute_sql DELETE WHERE date=CURRENT_DATE` + novo checkin | Modal fecha imediatamente, sem CheckinInsightView, toast normal |
| 14 | Confirmar generate-checkin-insight NÃO foi chamada de novo | `execute_sql SELECT count(*) FROM educational_insights WHERE user_id=...` | Continua 1 |
| 15 | Cleanup fixtures | `execute_sql DELETE FROM daily_checkins WHERE user_id=...` | count restaurado |

### Greps técnicos pós-execução

```bash
npm run type-check                                                # 0 erros
npm run lint                                                      # 0 erros novos
grep -rn "openai\|OPENAI_API_KEY" hooks/ lib/ app/ components/    # vazio
grep -rn "emotionalStateToMood\|EMOTIONAL_TO_MOOD_MAP" lib/       # presente
grep -rn "20000\|setTimeout" app/diario/checkin.tsx               # timeout presente
grep -rn "colors\.brand" components/ui/InsightDisclaimer.tsx \
                        components/diario/CheckinInsightView.tsx \
                        components/home/InsightCard.tsx           # vazio (Vital Mint Rarity)
grep -rn "homeMock\.insight" .                                    # vazio (mock desconectado)
```

---

## Riscos + Mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| `memory-daily-insight` retorna fallback (não premium) mesmo com subscription ativa | Média | Confirmar via SQL no Checkpoint 1; testes #2/#3 detectam |
| Timeout 20s muito curto p/ gpt-5-mini | Baixa-Média | gpt-5-mini fica em 5-15s na maioria. Plano B: subir p/ 30s (mudança de 1 número) |
| `count` race-condition (dois inserts simultâneos) | Muito baixa | Modal single-instance, mutation single-flight. Aceito |
| Free user path nunca testado (Leonardo é premium) | Média | `/impeccable harden` simula via `js_eval` injetando resposta mockada |
| `idb ui text` truncar inputs com `@` (aprendizado #19/#33) | Alta no teste #1 | Pré-quebrar em 3 fragmentos `"leonardo"`+`"@teste."`+`"com"` |
| Metro stale após criar arquivos novos (aprendizado #31) | Média | `xcrun simctl terminate booted com.doseday.premium` + reabrir via `open_deeplink` se "Requiring unknown module" |
| `dashboard.json` en/es sem a key | Aceito | Decisão Léo: opt-in. Follow-up |
| Disclaimer aparecer em estados de erro/fallback | Baixa | Regra: disclaimer SÓ quando há conteúdo de IA |

---

## Critérios de aceitação

- [ ] `lib/supabase/queries/insights.ts` criado com 3 funções
- [ ] `lib/validation/diarioSchemas.ts` ganha `EMOTIONAL_TO_MOOD_MAP` + `emotionalStateToMood`
- [ ] `hooks/useDailyInsight.ts` criado, staleTime 12h, retry 1
- [ ] `lib/supabase/queries/profile.ts` expõe `currentWeight/initialWeight/goalWeight`
- [ ] `hooks/useRegisterCheckin.ts` INTOCADO (decisão consciente)
- [ ] `app/diario/checkin.tsx` orquestra phase form→loading→insight com timeout 20s e cleanup
- [ ] `components/diario/CheckinInsightView.tsx` criado
- [ ] `components/home/InsightCard.tsx` substitui mock por hook (4 estados)
- [ ] `components/ui/InsightDisclaimer.tsx` criado (badge reutilizável, `sparkle` em `textSecondary`)
- [ ] `locales/pt-BR/dashboard.json` ganha key `insightToday.freePlaceholder`
- [ ] Zero `colors.brand` novo (Vital Mint Rarity)
- [ ] Zero `as any` / `// @ts-ignore`
- [ ] Zero `OPENAI_API_KEY` no cliente
- [ ] `npm run type-check` zero erros, `npm run lint` zero erros novos
- [ ] 15 testes MCP executados (output no handoff)
- [ ] 5 screenshots REAIS embedadas no PR (markdown `![desc](url)`):
  1. Home com InsightCard real
  2. Modal Diário loading
  3. CheckinInsightView pós-primeiro-checkin
  4. InsightDisclaimer close-up
  5. Home com fallback "Acompanhamento do tratamento"
- [ ] `/impeccable critique` ≥ 28/40, P1/P2 resolvidos
- [ ] `/impeccable harden` rodado
- [ ] Plano persistido aqui ANTES de tocar em código
- [ ] Fixtures de teste DELETADAS pós-validação
- [ ] Commit + PR

---

## Decisões confirmadas com Léo (este turno)

1. ✅ **Orquestração do "first checkin": SCREEN.** `app/diario/checkin.tsx` faz COUNT + chama `callGenerateCheckinInsight` no `onSuccess` da mutation. `hooks/useRegisterCheckin.ts` INTOCADO.
2. ✅ **i18n: apenas pt-BR.** Segue regra CLAUDE.md "pt-BR padrão, en/es opt-in". Pendência de tradução fica como follow-up futuro.
3. ✅ **Plan B `memory-daily-insight` falhar / retornar fallback:** aceitar fallback "Acompanhamento do tratamento" no InsightCard. Issue de investigação como follow-up se persistir.

---

## Próxima ação esperada

Léo lê este plano → responde `ok` (ou pede ajustes) → Cowork sai do plan mode → Claude Code executa em modo inline seguindo os 9 checkpoints.
