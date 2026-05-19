# Push Notifications V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar fluxo completo de notificações V1 no DoseDay (permission flow contextual, agendamento local offline-safe, deeplink no tap, tela de settings) — sem o qual o produto perde sua razão de existir (lembrar dose semanal GLP-1).

**Architecture:** Local notifications via `expo-notifications` ancoradas em `useDoseSummary().nextDose`. Token push salvo em `user_profiles.exp_push_token` mas **Edge Function backup adiada V2** (decisão consciente). Trigger de modal de permissão controlado por nova coluna determinística `user_profiles.has_seen_push_permission_modal`. Horário lido de fonte única `user_settings.notification_time` (default 20:00).

**Tech Stack:** Expo SDK 54+ · `expo-notifications` ^0.32.17 · React Native · TypeScript estrito · Supabase (project `pjesgdczasumgjzqyzzk`) · React Query · Expo Router (typed routes) · i18next.

**Branch:** `feature/23-push-notifications-v1`
**Prompt-fonte:** `docs/prompts/23-HIGH-push-notifications-v1.md`
**Pre-req:** PR #25 mergeado em `main` (Codex Edge Functions IaC) — ✅ feito.

---

## Context

DoseDay é app de tracking de canetas GLP-1. O **diferencial clínico é lembrar a dose semanal** — sem notificações o produto perde razão de existir. Persona Mariana (PRODUCT.md) esquece dose semanal porque é só 1x/semana, fácil perder.

O Prompt 23 implementa fluxo completo de Push V1: permission flow contextual, agendamento local (offline-safe), tela de settings, deeplink no tap. iOS-only em V1.

**Outcome:** 6 screenshots reais validando permission flow + local notif + cancelamento + token salvo + `/impeccable critique` ≥30/40. PR aberto, NÃO mergeado (Léo valida).

---

## Baseline confirmado (MCP + Explore)

### Schema Supabase (MCP `list_tables`)

| Achado | Impacto |
|---|---|
| Coluna **`exp_push_token`** já existe em `user_profiles` (TEXT, nullable). Comment: *"Expo Push Token for this device"* | **Sem migration necessária pra token.** Usar nome existente, não `expo_push_token` como o prompt assumia |
| `user_settings.notifications_enabled` (bool, default `true`) já existe | Reaproveitar pro master switch |
| `user_settings.notification_time` (time, default `'20:00:00'`) já existe | **Fonte ÚNICA do horário** (sem cascata) — Decisão #4 |
| **`medication_applications` NÃO tem coluna `scheduled_for`** | Doses futuras NÃO existem como linhas. `nextDate = last.application_date + days_until_next_dose` é calculada client-side (aprendizado #21) |
| Tabela de doses é `medication_applications`, não `doses` | `lib/supabase/queries/doses.ts:84-99` faz `INSERT INTO medication_applications` |
| **`user_settings` tem 0 rows hoje** | Primeiro UPDATE/scheduling pra qualquer user precisa criar row via `upsert` |

### Edge Function `send-rich-notification` (MCP `get_edge_function`)

Payload real:
```ts
{
  userId?: string,        // se passar, busca .eq('id', userId) em user_profiles
  pushToken?: string,     // alternativa direta
  title: string,
  body: string,
  mediaUrl?: string,
  data?: Record<string, unknown>
}
```

⚠ **BUG LATENTE:** a function busca `user_profiles.exp_push_token` filtrando por `eq('id', userId)` — `id` é a PK do **profile**, NÃO `auth.users.id`. Se chamarmos com `auth.users.id`, retorna 404. **V1 não chama essa function** (Decisão #5). Bug fica como follow-up V2.

### Estrutura de pastas (Explore)

| Item | Status |
|---|---|
| `app/(perfil)/` | ❌ **NÃO EXISTE.** Estrutura real: `app/(auth)/`, `app/(tabs)/`, `app/diario/`, `app/dose/`, `app/_layout.tsx` |
| `app/(tabs)/perfil.tsx` | Existe (~115 linhas). Tela simples: email + botão Sair. **Sem estrutura de rows/sections** estilo iOS Settings |
| `app/dose/registrar.tsx` | Modal de registro (declarado em `app/_layout.tsx:53-56` com `presentation: 'modal'`). Chama `useRegisterDose()` |
| `hooks/useDoseSummary.ts` | Fonte de verdade (queryKey `['doseSummary', userId]`). Calcula `nextDose` via `last.application_date + days_until_next_dose` |
| `hooks/useRegisterDose.ts` | Mutation. `onSuccess` invalida `['doseSummary']` |
| `lib/supabase/queries/doses.ts` | Apenas 2 funções: `getDoseSummary()` e `registerDose()`. **Não existem** `updateDose`, `deleteDose`, `markDoseAsApplied` (contraria assumption do prompt) |
| `app/_layout.tsx` | 72 linhas. AuthGuard + Stack com modals. Greenfield para notification listeners |
| Código `expo-notifications` no V5 hoje | ❌ Zero matches. Greenfield |
| `assets/images/notification-icon.png` | ❌ Não existe. Decisão: omitir `icon` do plugin config (Expo fallback) + follow-up |

### i18n (`locales/pt-BR/settings.json`)

Strings existentes relevantes:
- `preferences.notifications: "Notificações"`
- `preferences.notificationsDisabled: "Desativados"`
- `preferences.smartWeightReminders: "Lembretes Inteligentes de Peso"`

**Faltam strings:** modal de permissão, banner denied, cards da tela settings. **Decisão:** novo namespace `locales/pt-BR/notifications.json` (~15 strings) — separação de domínio é mais escalável. **Só pt-BR em V1** (en/es entram em V2).

### Tokens (DESIGN.md / `lib/theme/tokens.ts`)

- Accent: `colors.semanticInfo` = `#5BA8D9` (Clinical Blue)
- **NÃO usar** `colors.brand` (Vital Mint Rarity Rule)
- **NÃO aplicar** Liquid Glass em PermissionRequestModal/Banner/cards (regra 3)

---

## Decisões TRAVADAS (citadas com [TRAVADO])

Todas listadas no prompt seção "Decisões de produto". Sem inventar alternativas.

| # | Decisão | Status |
|---|---|---|
| 1 | Permissão pedida via modal contextual quando user salva a 1ª dose | [TRAVADO] |
| 2 | V1: 1 notif no horário + 1 lembrete 30min depois SE não houver confirmação | [TRAVADO + AJUSTE — só T0 em V1, ver Decisão #1] |
| 3 | Timing fixo em V1. Settings só toggle on/off | [TRAVADO] |
| 4 | Push token em `user_profiles.exp_push_token` | [TRAVADO + AJUSTE — coluna já existe] |
| 5 | Registrar token após permission GRANTED + login válido. Re-registrar em foreground se token mudou | [TRAVADO] |
| 6 | Permission denied → banner na tela Doses + `Linking.openSettings()` | [TRAVADO] |
| 7 | Tap notif abre Doses com dose destacada via deeplink `doseday://doses/<dose_id>` | [TRAVADO] |
| 8 | Híbrido: local notification (offline-safe) + push backup via Edge Function | [TRAVADO + AJUSTE — Edge Function adiada V2, ver Decisão #5] |
| 9 | iOS-only | [TRAVADO] |
| 10 | Tela settings em `app/(perfil)/notifications.tsx` | [TRAVADO + AJUSTE — route group não existe, usar `app/perfil/notificacoes.tsx`, ver Decisão #2] |
| 11 | i18n pt-BR primário | [TRAVADO] |
| 12 | Sem quiet hours em V1 | [TRAVADO] |

---

## Decisões resolvidas (Léo via AskUserQuestion + ajustes pré-execução)

### Decisão #1 — Modelo de notificação: SÓ T0 em V1

**Resolução:** **Apenas 1 notificação local no horário (T0).** Lembrete 30min depois fica pra V2 quando tivermos tracking separado de "abriu mas não registrou". Mais cirúrgico, sem dívida técnica.

**Implicações:**
- `lib/notifications.ts`: `scheduleLocalNotification(dose)` agenda **1 trigger** (não 2). Função `scheduleReminderNotification` NÃO entra em V1.
- `useScheduleDoseNotifications` ainda precisa cancelar a notif T0 do ciclo anterior quando user registra dose cedo (nextDate muda). 1 cancel + 1 schedule por mudança em `doseSummary`.
- Copy da notif T0: *"Hora da sua dose semanal."* (Voice & Tone matrix do PRODUCT.md — push).
- Registrar em `docs/learnings.md` pós-merge: "Lembrete 30min depois adiado pra V2 — requer tracking de `markAsApplied` separado."

### Decisão #2 — Localização tela settings: Stack route fora de tabs

**Resolução:** **`app/perfil/notificacoes.tsx`** como rota Stack (segue padrão existente `app/diario/`, `app/dose/`).

**Implicações:**
- Criar diretório novo `app/perfil/` com `notificacoes.tsx` dentro.
- Declarar `<Stack.Screen name="perfil/notificacoes" />` em `app/_layout.tsx` (igual `diario/checkin`).
- Em `app/(tabs)/perfil.tsx`: adicionar UMA row/link "Notificações" → `router.push('/perfil/notificacoes')`. Cirúrgico (~10 linhas).
- **NÃO refatorar** perfil.tsx em menu de rows — mantém escopo enxuto. Se virar menu no futuro, fica V2.
- Atualizar `.expo/types/router.d.ts` se necessário (aprendizado #11 — tipos não regeneram offline).

### Decisão #3 — Trigger PermissionRequestModal: nova coluna `has_seen_push_permission_modal`

**Resolução:** **Criar coluna `user_profiles.has_seen_push_permission_modal` (BOOLEAN, default false, NOT NULL)** via MCP `apply_migration`. Modal dispara só se `has_seen === false AND history.length === 1`. Após qualquer click (Ativar ou Agora não), UPDATE para `true`.

**Implicações:**
- Migration mínima (~3 linhas SQL) via MCP `apply_migration` — primeira migration desta feature.
- Trigger determinístico, não depende de heurísticas frágeis (`history.length` sozinho seria re-disparado se user deletasse dose 1).
- `PermissionRequestModal` recebe callback que faz UPDATE no DB + invalida `['userProfile', userId]`.
- Default `false` para usuários existentes garante que TODOS verão o modal na próxima dose (não só novos usuários).

### Decisão #4 — Horário da notif: fonte única `user_settings.notification_time`

**Resolução:** **`user_settings.notification_time` é fonte única, default 20:00.** Sem cascata de fallback.

**Implicações:**
- `useScheduleDoseNotifications` lê APENAS `user_settings.notification_time`.
- `user_settings` tem **0 rows hoje** → primeiro UPDATE/scheduling pra qualquer user precisa criar row via `upsert`. Hook `usePushTokenRegistration` faz upsert da row default (`notifications_enabled=true`, `notification_time='20:00:00'`) quando permission granted.
- Tela settings `app/perfil/notificacoes.tsx`: toggle master = `user_settings.notifications_enabled`. Horário = display-only em V1 (V2 traz time picker editável).
- Sem `preferred_time` de `user_profiles`. Sem hardcode 09:00.

### Decisão #5 — Push backup Edge Function: ADIADO V2 (decisão consciente)

**Resolução:** **Edge Function `send-rich-notification` NÃO é chamada em V1.** V1 entrega valor apenas com local notifications (offline-safe). Push backup pra device offline fica pra V2.

**Implicações:**
- **Decisão consciente, NÃO esquecimento.** Documentar em `docs/learnings.md` como decisão deliberada.
- `usePushTokenRegistration` AINDA salva o `exp_push_token` no Supabase (necessário pra V2 ter o token disponível).
- Bug latente da Edge Function (busca por `user_profiles.id` em vez de `user_id`) fica como pendência V2 — preciso corrigir antes de ativar push backup.
- V2 follow-up: (a) corrigir Edge Function pra usar `pushToken` direto OR `user_id`; (b) criar trigger Supabase pra invocar 30min antes da `nextDate` se device offline.

---

## File Structure

Arquivos criados/modificados, agrupados por responsabilidade.

### Criar
- `lib/notifications.ts` (~150 linhas) — utilitário core: request permissions, register token, schedule/cancel local notif, handle response.
- `hooks/useNotifications.ts` (~120 linhas) — estado de permission, listeners (received/responseReceived), foreground re-check.
- `hooks/usePushTokenRegistration.ts` (~100 linhas) — pega token e salva em `user_profiles.exp_push_token` + upsert defaults em `user_settings`.
- `hooks/useScheduleDoseNotifications.ts` (~100 linhas) — consume `useDoseSummary().nextDose` + `user_settings.notification_time`, agenda/cancela notif T0.
- `components/notifications/PermissionRequestModal.tsx` (~120 linhas) — modal contextual disparado após 1ª dose (gate: `has_seen=false AND history.length===1`).
- `components/notifications/PermissionDeniedBanner.tsx` (~80 linhas) — banner no topo de `(tabs)/doses.tsx` quando permission denied.
- `app/perfil/notificacoes.tsx` (~180 linhas) — tela settings: status + master toggle + próximas notifs + botão testar.
- `locales/pt-BR/notifications.json` (~15 strings) — novo namespace i18n.

### Modificar (cirúrgico)
- `app.json` — expandir plugin `expo-notifications` para `["expo-notifications", { color: "#5BA8D9", sounds: [] }]`. Omitir `icon` (asset não existe).
- `app/_layout.tsx` (+30 linhas) — mount `useNotifications` no AuthGuard, tap handler com deeplink, `<Stack.Screen name="perfil/notificacoes" />`.
- `app/dose/registrar.tsx` (+10 linhas) — após `useRegisterDose.onSuccess`: trigger modal se 1ª dose, agendar se granted.
- `hooks/useRegisterDose.ts` (+10 linhas) — `onSuccess`: cancel notif T0 ciclo antigo + reschedule baseado em nextDose recalculada.
- `app/(tabs)/doses.tsx` (+5 linhas) — render `PermissionDeniedBanner` se denied, highlight dose se `?highlight=<id>`.
- `app/(tabs)/perfil.tsx` (+10 linhas) — adicionar row "Notificações" → `router.push('/perfil/notificacoes')`. Sem refactor.
- `lib/i18n.ts` (+1 linha) — registrar namespace `notifications`.

### Migration (via MCP `apply_migration`, regra 8)
- `add_has_seen_push_permission_modal_to_user_profiles` — ALTER TABLE + COMMENT (SQL exato abaixo).

### Não tocar
- `useDoseSummary` (fonte de verdade — só consumir).
- `lib/supabase/queries/doses.ts` (zero refactor — só adicionar cancel/schedule em `useRegisterDose.onSuccess`).
- Estilo/copy de qualquer tela existente fora dos arquivos listados.

---

## Migration SQL

✅ **1 migration necessária** (Decisão #3).

**Comando MCP `apply_migration`:**

```sql
-- name: add_has_seen_push_permission_modal_to_user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN has_seen_push_permission_modal BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.user_profiles.has_seen_push_permission_modal IS
  'Flag determinístico para apresentar PermissionRequestModal apenas uma vez por usuário. Set para true após qualquer click no modal (Ativar ou Agora não).';
```

**Validações pós-migration via MCP `execute_sql`:**
```sql
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles' AND column_name = 'has_seen_push_permission_modal';
-- Esperado: column_name=has_seen_push_permission_modal, data_type=boolean, default=false, nullable=NO
```

**RLS:** `user_profiles` já tem RLS habilitado. Validar via MCP `get_advisors` que UPDATE no campo está coberto pela policy existente (`auth.uid() = user_id`). Se não estiver, adicionar policy específica nesta mesma migration.

**Não migrações:**
- `exp_push_token` ✅ já existe (skip)
- `user_settings.notifications_enabled` ✅ existe (reaproveitar para master switch)
- `user_settings.notification_time` ✅ existe (fonte única do horário)

Regra 8 obrigatória: MCP `apply_migration`, nunca `supabase db push`.

---

## Plano (4 fases)

### Fase 0 — Setup

**Files:**
- Create: `docs/superpowers/plans/2026-05-19-push-notifications-v1.md` (este arquivo)
- Branch: `feature/23-push-notifications-v1`

- [ ] **Step 1: Salvar plano no repositório** (regra 21) — feito como pré-condição.
- [ ] **Step 2: Criar branch a partir de `main`**

```bash
git checkout main && git pull origin main
git checkout -b feature/23-push-notifications-v1
```

- [ ] **Step 3: Confirmar pre-req PR #25 mergeado**

```bash
git log --oneline -5 | grep -i "edge functions iac"
# Esperado: commit a691a37 ou similar mencionando "importa Edge Functions V4 como IaC"
```

### Fase 1 — Foundation

| Arquivo | Ação | Detalhe |
|---|---|---|
| **Migration `has_seen_push_permission_modal`** (Decisão #3) | Via MCP `apply_migration` | `ALTER TABLE user_profiles ADD COLUMN has_seen_push_permission_modal BOOLEAN NOT NULL DEFAULT false;`. RLS existente em `user_profiles` cobre UPDATE no próprio registro (validar via MCP `get_advisors`) |
| Migration `expo_push_token` | ❌ SKIP | Coluna `exp_push_token` já existe |
| `app.json` | Modificar | Expandir plugin `expo-notifications` para objeto com `{ color: "#5BA8D9", sounds: [] }`. Omitir `icon` (asset não existe — follow-up) |
| `lib/notifications.ts` | Criar (~150 linhas) | 6 funções: `requestPermissions`, `registerForPushNotificationsAsync`, `scheduleLocalNotification(dose, options)`, `cancelScheduledNotification(doseId)`, `handleNotificationResponse`, `getNotificationSettings`. Logging `console.log('[notifications]', ...)` |
| `locales/pt-BR/notifications.json` | Criar | ~15 strings novas (modal, banner, cards). Registrar namespace em `lib/i18n.ts`. **Só pt-BR em V1** |

### Fase 2 — Hooks

| Arquivo | Linhas | Responsabilidade |
|---|---|---|
| `hooks/useNotifications.ts` | ~120 | Estado permission, listeners (received/responseReceived), cleanup. Re-check permission em foreground |
| `hooks/usePushTokenRegistration.ts` | ~100 | Pega token via `registerForPushNotificationsAsync` → UPDATE em `user_profiles.exp_push_token` (filtrando por `user_id = auth.user.id`). **Também faz `upsert` em `user_settings` com defaults (`notifications_enabled=true, notification_time='20:00:00'`) se row não existe** (Decisão #4). Query key `['push-token', userId]` |
| `hooks/useScheduleDoseNotifications.ts` | ~100 | Consume `useDoseSummary().nextDose` + `user_settings.notification_time` (Decisão #4 — fonte única). Se `nextDate` no futuro E `notifications_enabled=true`: agenda 1 notif local T0 no horário configurado. Cancela notif do ciclo anterior antes de agendar nova |

### Fase 3 — UI (skill `/impeccable craft`)

| Arquivo | Linhas | Detalhe |
|---|---|---|
| `components/notifications/PermissionRequestModal.tsx` | ~120 | Trigger quando `user_profiles.has_seen_push_permission_modal === false AND useDoseSummary().history.length === 1` (Decisão #3). Copy clínica, 2 botões. **Qualquer click** (Ativar OU Agora não) → UPDATE `has_seen_push_permission_modal=true` + invalida `['userProfile', userId]`. Accent: `colors.semanticInfo`. SEM glass |
| `components/notifications/PermissionDeniedBanner.tsx` | ~80 | No topo de `app/(tabs)/doses.tsx`. CTA → `Linking.openSettings()`. Dismissable com `AsyncStorage` |
| `app/perfil/notificacoes.tsx` (Decisão #2) | ~180 | 4 cards: status, toggle master (`user_settings.notifications_enabled`), próximas notifs agendadas (em V1 apenas 1), botão testar (5s) |

### Fase 4 — Wire-up

| Arquivo | Ação | Detalhe |
|---|---|---|
| `app/_layout.tsx` | Modificar +30 linhas | Mount `useNotifications` global no AuthGuard (após session). Tap handler: extrair `dose_id` do payload, `router.push('/(tabs)/doses?highlight=<id>')`. Foreground handler: in-app banner sutil. Adicionar `<Stack.Screen name="perfil/notificacoes" />` |
| `app/dose/registrar.tsx` | Modificar +10 linhas | Após `useRegisterDose.onSuccess`: se 1ª dose + permission undetermined → abrir `PermissionRequestModal`. Se granted → `scheduleLocalNotification(dose)` |
| `hooks/useRegisterDose.ts` | Modificar +10 linhas | `onSuccess`: cancelar notif T0 do ciclo passado + agendar nova baseada em `nextDose` recalculada |
| `app/(tabs)/doses.tsx` | Modificar +5 linhas | Renderizar `PermissionDeniedBanner` se `permission === 'denied'`. Highlight dose se `?highlight=<id>` |
| `app/(tabs)/perfil.tsx` | Modificar +10 linhas | Adicionar 1 row "Notificações" abaixo do card de email → `router.push('/perfil/notificacoes')`. Sem refactor do resto |

### Fase 5 — Edge Function backup (REMOVIDA — decisão consciente Decisão #5)

V1 NÃO implementa push backup via Edge Function. Documentar em `docs/learnings.md` como **decisão consciente** (não esquecimento). Pendências V2:
- (a) Corrigir Edge Function `send-rich-notification` — busca por `user_profiles.id` em vez de `user_id` (bug V4)
- (b) Criar trigger Supabase que invoca a Edge Function 30min antes de `nextDate` se device offline
- (c) Em V1 já salvamos `exp_push_token` no Supabase — V2 já tem o token disponível, só falta o caminho de invocação

Justificativa: V1 entrega valor com local notification + permission flow. Push real não testável em simulador. Adiar evita scope creep e mantém escopo enxuto.

---

## Skills declaradas (com motivo)

| Skill | Motivo | Aplicação |
|---|---|---|
| `react-native-best-practices` | Padrões Expo SDK 54 + hooks RN | Carregar `references/animations/SKILL.md` para spring animation no modal (dampingRatio 0.8) e shake/slide do banner |
| `supabase-postgres-best-practices` | Validar RLS (UPDATE só no próprio token) | `references/security-*.md` se houver issue de policy |
| `superpowers:writing-plans` | Salvar plano em `docs/superpowers/plans/` (regra 21) | ✅ feito (este arquivo) |
| `/impeccable craft` | UI dos 3 componentes (modal, banner, tela settings) | Register=product. Shape antes de implementar cada componente |
| `/impeccable harden` | Edge cases: permission revoked durante uso, app force-quit, token expirado, schedule no passado, sem internet | Pós-implementação, pré-merge |
| `/impeccable critique` | Target ≥30/40 pré-merge | Última etapa antes do PR |

**Não usar:** `ui-ux-pro-max` (conflito de vocabulário com `impeccable` — regra 5).

---

## Karpathy declarations (regra 22)

### (a) Assumptions explícitas

1. **`user_profiles.exp_push_token` é a coluna canônica** (não `expo_push_token`). CONFIRMADO via MCP `list_tables`.
2. **Push real não testável em simulador iOS** — validação V1 cobre apenas: permission flow, local notifications, token salvo no DB, deeplink no tap.
3. **Edge Function `send-rich-notification` NÃO chamada em V1** (Decisão #5). Push backup adiado pra V2 como decisão consciente. Bug latente da function (busca por `user_profiles.id`) documentado pra V2 corrigir.
4. **`scheduled_for` não existe em `medication_applications`** — agendamento usa `nextDate = last.application_date + days_until_next_dose` calculado em `useDoseSummary`. Cada usuário tem APENAS 1 nextDose, não múltiplas doses futuras.
5. **Horário da notif = `user_settings.notification_time`** (default `20:00`). Fonte ÚNICA, sem cascata (Decisão #4). `user_settings` tem 0 rows hoje → `usePushTokenRegistration` faz upsert da row default quando permission granted.
6. **Trigger PermissionRequestModal** controlado por nova coluna `user_profiles.has_seen_push_permission_modal` (Decisão #3), não por heurística `history.length === 1` sozinha.
7. **Sem `notification-icon.png`** em `assets/images/` — omitir `icon` do plugin (Expo gera fallback). Follow-up em `docs/learnings.md`.
8. **i18n só pt-BR em V1.** en/es entram quando internacionalizar (decisão Léo).

### (b) Could 50 lines do this?

Não no total (~1000 LOC distribuídos), mas **cada arquivo isolado ≤200 linhas**:
- `lib/notifications.ts`: ~150
- Cada hook: 80-150
- `PermissionRequestModal`: ~120
- `PermissionDeniedBanner`: ~80
- Tela settings: ~180

Se algum hook passar de 200, simplificar. PermissionRequestModal não pode passar de 120.

### (c) Surgical changes

**Não tocar:**
- `useDoseSummary` (fonte de verdade — só consumir)
- `getDoseSummary` em `lib/supabase/queries/doses.ts` (só ADICIONAR notif cancel/schedule no `useRegisterDose.onSuccess`)
- `perfil.tsx` estilo/copy fora da row adicionada
- Estilo/copy de qualquer tela existente fora dos arquivos listados

**Apenas modificar:**
- `app/_layout.tsx` (+30 linhas, listener)
- `app/dose/registrar.tsx` (+10 linhas, trigger modal + schedule)
- `hooks/useRegisterDose.ts` (+10 linhas, onSuccess)
- `app/(tabs)/doses.tsx` (+5 linhas, banner + highlight)
- `app/(tabs)/perfil.tsx` (+10 linhas, row Notificações)
- `app.json` (plugin config)

### (d) Goal-driven (success criteria verificáveis)

- [ ] 6 screenshots reais em `assets/screenshots/prompt23/` (PNG, não descrições)
- [ ] Permission flow: modal aparece após 1ª dose, granted/denied capturados
- [ ] Local notification agendada → captura via background app
- [ ] Tap deeplink → tela Doses com dose highlight
- [ ] Token salvo em `user_profiles.exp_push_token` validado via MCP `execute_sql`
- [ ] Cancel funciona: registrar dose nova → notif do ciclo passado é cancelada
- [ ] Banner denied funciona: `Linking.openSettings()` abre Settings iOS
- [ ] `npm run type-check` PASS
- [ ] `npm run lint` PASS
- [ ] `/impeccable critique` ≥ 30/40
- [ ] PR aberto via gh CLI, **NÃO mergeado**

---

## Riscos identificados (adicionais ao prompt)

| Risco | Probab. | Mitigação |
|---|---|---|
| Stack route `app/perfil/notificacoes.tsx` precisa declaração em `_layout.tsx` (Decisão #2) | **Certa** | Adicionar `<Stack.Screen name="perfil/notificacoes" />` no Stack do `app/_layout.tsx`. Verificar conflito de path entre `app/(tabs)/perfil.tsx` (tab) e `app/perfil/notificacoes.tsx` (stack nested) |
| Schema sem `scheduled_for` → modelo de scheduling diferente do prompt | **Certa** | Documentado como assumption #4. Agendar pra `nextDate` calculada |
| `useRegisterDose` não tem `onSuccess` que cancela notif T0 do ciclo passado hoje | **Alta** | Adicionar cancel + reschedule no `onSuccess` (~10 linhas) |
| Expo Router typed routes podem reclamar de `/perfil/notificacoes` na primeira referência (aprendizado #11) | **Média** | Criar arquivo placeholder `app/perfil/notificacoes.tsx` antes de qualquer `router.push` que o referencie. Atualizar `.expo/types/router.d.ts` manualmente se `tsc --noEmit` falhar offline |
| Edge Function busca por `user_profiles.id`, não `auth.users.id` (bug V4) | **Média** | V1 não usa Edge Function (Decisão #5). Documentar como follow-up V2 em `docs/learnings.md` |
| `notification-icon.png` ausente | **Baixa** | Omitir do plugin config, follow-up. Expo usa fallback |
| Notif disparada antes do token registrado (race condition) | **Média** | Em `usePushTokenRegistration`, marcar `isReady` só após permission granted + token salvo. Hook de schedule espera `isReady` |
| Background fetch limitations no iOS (notif não chega se app killed por muito tempo) | **Média** | Documentar. Local notif funciona offline; backup via push backup é V2 |

---

## Verification

### Validação obrigatória via MCP `react-native`

1. **Permission flow (granted + denied)** — 2 screenshots
   - Trigger: registrar 1ª dose via `app/dose/registrar.tsx`
   - Capturar modal aparecendo, tap em "Ativar" → permissão system iOS
   - Capturar modal aparecendo, tap em "Agora não" → fechar modal
   - Validar via MCP `execute_sql`: `SELECT has_seen_push_permission_modal FROM user_profiles WHERE user_id = '<test-uuid>'` → deve ser `true` em ambos casos
2. **Settings com testar notif local** — 1 screenshot
   - Navegar `(tabs)/perfil` → row "Notificações" → `/perfil/notificacoes`
   - Tap em botão "Testar notificação" → notif local aparece em 5s
3. **Banner denied → `Linking.openSettings()`** — 1 screenshot
   - Forçar permission=denied via simulador
   - Capturar banner na tela `(tabs)/doses`
   - Tap → confirmar abertura de Settings iOS
4. **Schedule + tap → highlight** — 2 screenshots
   - Agendar notif local pra 5s no futuro (botão de teste)
   - Mover app pra background
   - Tap na notif → app abre em `(tabs)/doses?highlight=<id>` com dose destacada
5. **Token registrado em DB**
   - Após permission granted, validar via MCP `execute_sql`: `SELECT exp_push_token FROM user_profiles WHERE user_id = '<test-uuid>'` → deve retornar `ExponentPushToken[...]`

**Total: mínimo 6 screenshots PNG em `assets/screenshots/prompt23/`** (regra a/b/c de `docs/working-rules.md`).

### Type-check e lint

```bash
npm run type-check
npm run lint
```

Ambos devem passar com zero erros novos.

### Pré-merge

- `/impeccable harden` — edge cases (permission revoked durante uso, app force-quit, token expirado, schedule no passado, sem internet).
- `/impeccable critique` — target ≥30/40.

---

## Pós-merge (não V1) — atualizar `docs/learnings.md`

**Aprendizados técnicos:**
1. Coluna real é `exp_push_token`, não `expo_push_token`. Adicionar à tabela de aprendizados.
2. Edge Function `send-rich-notification` busca por `user_profiles.id` (não `user_id`) — bug latente V4.
3. Modelo de scheduling: apenas 1 notif pra `nextDate` calculada (não múltiplas doses futuras).
4. `user_settings` tem 0 rows na produção atual — `usePushTokenRegistration` precisa garantir upsert da row default antes de ler `notification_time`.

**Decisões CONSCIENTES adiadas pra V2 (não esquecimento):**
5. **Push backup via Edge Function** (Decisão #5): V1 entrega só local notifications. V2 = corrigir bug da Edge Function + criar trigger Supabase pra invocar 30min antes de `nextDate` se device offline.
6. **Lembrete 30min depois** (Decisão #1): adiado pra V2 — requer tracking separado de "abriu mas não registrou" (`markAsApplied` distinto do `registerDose`).
7. **Refactor de `perfil.tsx` em menu** (Decisão #2): pode entrar em V2 quando houver mais sub-páginas (perfil/dados-saude, perfil/idioma, etc.).
8. **i18n en/es** para `notifications.json`: pular V1 (decisão Léo). Entra na próxima onda de internacionalização.
9. **`notification-icon.png` asset**: ship V1 sem (Expo fallback). Follow-up de design pra V1.1 ou V2.

---

**Status:** PLAN READY — 3 ajustes obrigatórios + 2 opcionais do Léo INCORPORADOS:
- ✅ Ajuste 1 (Decisão #5): Edge Function push backup **adiada V2 como decisão consciente**, documentada em pós-merge → `docs/learnings.md`.
- ✅ Ajuste 2 (Decisão #3): Migration `user_profiles.has_seen_push_permission_modal` via MCP `apply_migration`. Modal dispara só se `has_seen=false AND history.length===1`. UPDATE em qualquer click.
- ✅ Ajuste 3 (Decisão #4): `user_settings.notification_time` é fonte ÚNICA do horário (default 20:00). Sem cascata.
- ✅ Opcional A: `notifications.json` só em pt-BR (en/es entram em V2).
- ✅ Opcional B: ship sem `notification-icon.png` (Expo fallback), follow-up registrado.

Aguardando OK do Léo pra criar branch e iniciar Fase 1.
