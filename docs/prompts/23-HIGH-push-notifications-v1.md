# Prompt 23-HIGH-push-notifications-v1

**Branch:** `feature/23-push-notifications-v1`
**Modelo recomendado:** Sonnet 4.6 (decisões técnicas + integration com Supabase + MCP validation)
**Pré-requisitos:**
- PR #25 (regra 17 + migração Edge Functions IaC do Codex) mergeado em `main`
- Edge Function `send-rich-notification` deployada no Supabase remoto (vinda da V4)

---

## Contexto

DoseDay é app de tracking de canetas GLP-1 (Mounjaro, Ozempic, Wegovy). O **diferencial clínico do produto é lembrar a dose semanal**. Sem notificações funcionando, o app perde sua razão de existir.

**Estado atual no V5:**

| Item | Status |
|---|---|
| `expo-notifications@^0.32.17` | ✅ Instalado |
| Strings i18n (`notification.*` em pt-BR/en/es) | ✅ Existem |
| Plugin no `app.json` | ⚠️ Parcial — validar |
| `hooks/useNotifications.ts` | ❌ Não existe |
| `lib/notifications.ts` | ❌ Não existe |
| Tela settings de notificação | ❌ Não existe |
| Schema Supabase: coluna `expo_push_token` em `user_profiles` | ❓ Verificar via MCP `list_tables` |
| Edge Function `send-rich-notification` | ✅ Importada no IaC (Codex Prompt 22). Deployada em produção (V4 legado) |

**Referência V4 (`/Users/leofrancaia/Desktop/Dose-Day-Jules-1/`):**
- `hooks/useNotifications.ts`
- `hooks/useReportNotification.ts`
- `lib/notifications.ts`
- `app/(settings)/notifications.tsx`
- `supabase/functions/send-rich-notification/index.ts`

**Persona Mariana:** 38, classe B, em tratamento GLP-1 ativo. Esquece a dose semanal porque é só 1x por semana — fácil de perder. Quer lembrete confiável e silencioso (sem stress).

---

## Tarefa

Implementar fluxo completo de Push Notifications V5 — desde permissão até agendamento por dose, integração com Edge Function backup, e tela de settings.

### Decisões de produto (TRAVADAS no prompt — NÃO inventar alternativas)

| Decisão | Resposta |
|---|---|
| Quando pedir permissão? | **Modal contextual quando user salva a 1ª dose** (não no signup — pattern menos invasivo, alinhado com Apple HIG) |
| Quantas notificações por dose? | **V1: 1 notificação no horário da dose + 1 lembrete 30min depois SE não houver confirmação de aplicação** |
| Timing customizável? | **V1 fixo.** V2 (futuro) traz settings de timing |
| Onde salvar push token? | `user_profiles.expo_push_token` (TEXT, nullable) — verificar/criar via MCP migration |
| Quando registrar token? | Após permission GRANTED + login válido. Re-registrar em foreground se token mudou |
| Permission denied — comportamento? | Banner não-bloqueante na tela Doses + CTA pra Settings do iOS via `Linking.openSettings()` |
| Notification tap — onde abre? | Tela Doses com a dose específica destacada via deeplink `doseday://doses/<dose_id>` |
| Local vs Push? | **Híbrido:** local notification agendada no device (offline-safe) + push backup via Edge Function `send-rich-notification` (se device offline na hora) |
| Plataforma | **iOS-only** (regra do V5) |
| Tela de settings de notificação | `app/(perfil)/notifications.tsx` — toggle on/off + status da permissão + link pra Settings iOS se denied |
| i18n | pt-BR primário, en/es opt-in (strings já em `locales/*/settings.json`) |
| Quiet hours / horário de respeitar? | **V1 não.** V2 (futuro) pode adicionar (LGPD: notif noturna sem opt-in pode ser problema regulatório) |

### Arquivos a criar/modificar

| Arquivo | Ação | Linhas estimadas |
|---|---|---|
| `lib/notifications.ts` | Criar | ~150 |
| `hooks/useNotifications.ts` | Criar | ~120 |
| `hooks/usePushTokenRegistration.ts` | Criar | ~80 |
| `hooks/useScheduleDoseNotifications.ts` | Criar | ~150 |
| `components/notifications/PermissionRequestModal.tsx` | Criar | ~120 |
| `components/notifications/PermissionDeniedBanner.tsx` | Criar | ~80 |
| `app/(perfil)/notifications.tsx` | Criar | ~180 |
| `app.json` | Modificar | +5 linhas (validar plugin config) |
| `app/_layout.tsx` | Modificar | +30 linhas (notification listener + tap handler + deeplink) |
| Componentes que chamam `saveDose` (ex: `app/(modals)/registrar-dose.tsx`) | Modificar | +10 linhas cada (trigger permission modal + schedule) |
| `lib/supabase/queries/doses.ts` | Modificar | +20 linhas (re-schedule on update) |
| Migration Supabase (se coluna não existir) | Via MCP `apply_migration` | ~10 linhas SQL |

### Passo a passo

#### Fase 1 — Foundation (sem mexer em UI)

1. **Verificar schema Supabase** via MCP `list_tables`:
   - `user_profiles` tem coluna `expo_push_token`?
   - Se **NÃO**, criar migration: `ALTER TABLE user_profiles ADD COLUMN expo_push_token TEXT;` via MCP `apply_migration` (regra 8: nunca `supabase db push`)
   - Validar RLS: usuário só consegue UPDATE no próprio token

2. **Criar `lib/notifications.ts`** — referência consciente da V4, NÃO copy:
   - Função `requestPermissions()` — retorna `{ granted: boolean, canAskAgain: boolean }`
   - Função `registerForPushNotificationsAsync()` — retorna ExpoPushToken ou null
   - Função `scheduleLocalNotification(dose)` — cria 1 notif no horário + 1 lembrete 30min depois (cancela ambas se confirmação de aplicação chegar antes)
   - Função `cancelScheduledNotification(doseId)` — cancela todas as notif agendadas pra essa dose
   - Função `handleNotificationResponse(response)` — extrai dose_id, retorna deeplink path
   - Função `getNotificationSettings()` — retorna estado atual (permission + scheduled count)
   - Logging via `console.log('[notifications]', ...)` em todos os branches críticos

3. **Atualizar `app.json` plugin config** — validar que tem:
```json
{
  "expo": {
    "plugins": [
      ["expo-notifications", {
        "icon": "./assets/notification-icon.png",
        "color": "#5BA8D9",
        "sounds": []
      }]
    ]
  }
}
```
   - Confirmar se asset `notification-icon.png` existe. Se não, usar fallback do icone padrão e registrar como follow-up

#### Fase 2 — Hooks

4. **`hooks/useNotifications.ts`** — hook principal:
   - Estado: `{ permission: 'granted'|'denied'|'undetermined', isLoading: boolean, error: Error | null }`
   - Actions: `requestPermission()`, `openSystemSettings()`
   - Listener: `Notifications.addNotificationReceivedListener` (foreground) e `addNotificationResponseReceivedListener` (tap)
   - Cleanup em unmount

5. **`hooks/usePushTokenRegistration.ts`** — registrar token no Supabase:
   - Usa `useNotifications` pra esperar permission granted
   - Pega ExpoPushToken via `registerForPushNotificationsAsync`
   - Salva via `supabase.from('user_profiles').update({ expo_push_token: token }).eq('user_id', user.id)`
   - Re-roda no foreground (token pode mudar)
   - Query key React Query: `['push-token', userId]`

6. **`hooks/useScheduleDoseNotifications.ts`** — orquestra agendamento:
   - Recebe lista de doses ativas via `useDosesAtivas` (existente)
   - Pra cada dose com `scheduled_for` no futuro: agenda local notif
   - Cancela notifs órfãs (doses deletadas/concluídas)
   - Roda no app start + sempre que `doses` muda

#### Fase 3 — UI

7. **`components/notifications/PermissionRequestModal.tsx`**:
   - Apresentado quando user salva 1ª dose (detectar via `useDoses().count === 1` ou flag em `user_profiles.has_seen_permission_modal`)
   - Copy clínica: "Quer lembrar da dose toda semana? Ative as notificações pra não esquecer." (PT-BR)
   - 2 botões: "Ativar" → `requestPermission()` / "Agora não" → fecha modal, marca flag
   - Liquid Glass NÃO aplica (regra 3 — glass só em navegação)
   - Acessível: `accessibilityRole="button"`, labels descritivos
   - Usar `colors.semanticInfo` pro accent (NÃO `colors.brand` — Vital Mint Rarity)

8. **`components/notifications/PermissionDeniedBanner.tsx`**:
   - Mostrado no topo da tela Doses se permission === 'denied'
   - Copy: "Você desativou as notificações. Lembrete da dose não vai chegar. Reativar em Ajustes."
   - CTA: "Abrir Ajustes" → `Linking.openSettings()`
   - Dismissable (salvar `notifications_banner_dismissed_at` em local storage / AsyncStorage)

9. **`app/(perfil)/notifications.tsx`** — tela settings:
   - Card 1: Status permissão (Granted / Denied / Não definido) + CTA correspondente
   - Card 2: Toggle "Notificações de dose" (master switch, salvo em `user_profiles.notifications_enabled` — coluna nova, BOOLEAN, default true)
   - Card 3: Lista de notificações agendadas (próximas 4) com timestamp e dose
   - Card 4: Botão "Testar notificação agora" — dispara notif local em 5s pra validação
   - Sem glass nos cards. Usar `Surface elevated` do DESIGN.md

#### Fase 4 — Wire-up

10. **Modificar `app/_layout.tsx`**:
    - Mount `useNotifications` global
    - Listener de tap: extrair `dose_id` do payload, navegar via `router.push('/doses?highlight=<dose_id>')`
    - Foreground handler: se app aberto e notif chega, mostrar in-app banner sutil (NÃO modal — não bloquear)

11. **Modificar fluxo de salvar dose** (`app/(modals)/registrar-dose.tsx` ou equivalente):
    - Após `saveDose()` bem-sucedido: checar se é a 1ª dose → abrir `PermissionRequestModal` se permission undetermined
    - Após permission granted → chamar `scheduleLocalNotification(dose)`

12. **Modificar `lib/supabase/queries/doses.ts`**:
    - Em `updateDose`: cancelar notif antiga + agendar nova
    - Em `deleteDose`: cancelar notif
    - Em `markDoseAsApplied`: cancelar notif do lembrete (30min depois)

#### Fase 5 — Edge Function backup (opcional, registrar como follow-up se ficar pesado)

13. **Validar Edge Function `send-rich-notification`** via MCP `get_edge_function`:
    - Verificar payload esperado (provavelmente `{ to: expoPushToken, title, body, data }`)
    - Documentar em `supabase/functions/send-rich-notification/README.md` (se ainda não existe)
    - **NÃO** mexer no código da function — está em produção V4

14. **Trigger Supabase pra push backup:**
    - SE o tempo permitir: criar trigger no DB que invoca a Edge Function 30min antes da dose pra device offline
    - SE NÃO: registrar como follow-up V2 em `docs/learnings.md`

---

## Validação obrigatória via MCP `react-native`

Em ambiente iOS simulator (push real não funciona em simulador, mas local notification + permission flow + token registration funcionam):

1. **Permission flow:**
   - Cold start → login → ir pra Doses → criar nova dose → modal de permissão aparece
   - Screenshot ANTES de `requestPermission()` + DEPOIS de granted
   - Screenshot do banner DENIED após o user negar

2. **Local notification:**
   - Settings → "Testar notificação agora" → screenshot da notif local aparecendo em 5s (precisa app em background)
   - Validar tap: notif → app abre na tela Doses com dose destacada

3. **Schedule + cancel:**
   - Criar dose com `scheduled_for` em 1 minuto → validar que aparece em "próximas 4" na settings → aguardar 1 min → screenshot da notif
   - Cancelar a dose → validar que sumiu de "próximas 4"

4. **Permission denied recovery:**
   - Negar permissão → banner aparece na Doses → tap em "Abrir Ajustes" → simulador abre Settings nativo (screenshot)

5. **Push token no Supabase:**
   - Após permission granted, validar via MCP Supabase `execute_sql`: `SELECT expo_push_token FROM user_profiles WHERE user_id = '<leonardo-test-uuid>'` — deve retornar token válido (formato `ExponentPushToken[...]`)

Screenshots reais (PNG em `assets/screenshots/prompt23/`) — mínimo **6 screenshots** no PR:
1. Modal permissão
2. Settings com permission granted
3. Banner denied na Doses
4. Notif local recebida (background)
5. Tap → tela Doses com highlight
6. Próximas 4 notifs agendadas

---

## Skills obrigatórias

- `react-native-best-practices` — padrões Expo, hooks RN
- `supabase-postgres-best-practices` — migration `expo_push_token`, RLS, query keys React Query
- `superpowers:writing-plans` — salvar plano em `docs/superpowers/plans/2026-05-19-push-notifications-v1.md` ANTES de codar (regra 21)
- `/impeccable craft` — UI dos componentes (PermissionRequestModal, PermissionDeniedBanner, tela settings)
- `/impeccable harden` — edge cases (permission revoked durante uso, app force-quit, token expirado, schedule no passado)
- `/impeccable critique` — pré-merge (target ≥30/40)

---

## Karpathy checks (declarar no plano)

| Disciplina | Aplicação esperada |
|---|---|
| Assumptions | (a) `user_profiles` é a tabela canônica (validar via MCP `list_tables`). (b) Push real não testável em simulador — validação V1 cobre só local notif + permission flow. (c) Edge Function `send-rich-notification` da V4 tem payload `{ to, title, body, data }` — validar via `get_edge_function` antes de assumir |
| Could 50 lines do this? | Cada hook isolado deve ficar ~80-150 linhas. Se algum passar de 200, simplificar. PermissionRequestModal: 80-120 |
| Surgical changes | Não mexer em código existente fora dos arquivos listados. Doses screen recebe SÓ o banner + trigger pro permission modal — sem refactor |
| Goal-driven | Sucesso = 6 screenshots reais + permission flow funcional + schedule cancelando corretamente + token registrado no Supabase + lint/type-check PASS + critique ≥30/40 |

---

## Critérios de aceitação

- [ ] Schema `user_profiles` tem coluna `expo_push_token` (criada via MCP `apply_migration` se não existir)
- [ ] `lib/notifications.ts` criada com 6 funções + logging
- [ ] 3 hooks novos criados (`useNotifications`, `usePushTokenRegistration`, `useScheduleDoseNotifications`)
- [ ] 2 componentes novos criados (`PermissionRequestModal`, `PermissionDeniedBanner`)
- [ ] Tela `app/(perfil)/notifications.tsx` criada com 4 cards
- [ ] `app/_layout.tsx` integrado com notification listeners
- [ ] Fluxo de salvar dose dispara permission modal na 1ª dose
- [ ] Notificações de dose canceladas ao deletar/aplicar dose
- [ ] **6 screenshots reais** em `assets/screenshots/prompt23/` (não descrições!)
- [ ] `colors.brand` (Vital Mint) NÃO aparece nesses componentes (Rarity Rule)
- [ ] Glass NÃO aplicado em componentes de notificação (regra 3)
- [ ] `npm run type-check` PASS
- [ ] `npm run lint` PASS
- [ ] `/impeccable critique` ≥ 30/40
- [ ] Plano salvo em `docs/superpowers/plans/2026-05-19-push-notifications-v1.md` ANTES de codar (regra 21)
- [ ] Karpathy declarations no plano (a, b, c, d)
- [ ] Aprendizados registrados em `docs/learnings.md` ao final
- [ ] PR aberto via MCP `github__create_pull_request`, NÃO mergeado

---

## Restrições

- **iOS-only.** Sem código Android específico. Se Expo notifications quebrar em Android, registrar follow-up — V5 é iOS-first
- **Sem timing customizável.** 1 notif no horário + 1 lembrete 30min depois, fixo. Settings só toggle on/off
- **Sem quiet hours.** Risco regulatório — V2
- **Sem `as any`, `// @ts-ignore`** (regra 2)
- **Migrations só via MCP `apply_migration`** (regra 8)
- **Plano salvo ANTES de código** (regra 21)
- **Glass não aplica em conteúdo** (regra 3)
- **Karpathy obrigatório** (regra 22)
- **NÃO MERGEAR PR** — Léo valida quando voltar

---

## Riscos identificados

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Push real não testável em simulador | **Certa** | Validar SÓ local notification + permission flow. Push real fica pra TestFlight |
| Edge Function payload V4 mudou desde a importação | **Média** | Validar via MCP `get_edge_function` ANTES de assumir contrato |
| Schema `user_profiles` já tem `expo_push_token` mas com nome diferente (ex: `push_token`) | **Média** | MCP `list_tables` primeiro. Se nome existir, usar o existente (não criar duplicada) |
| `notification-icon.png` asset não existe | **Baixa** | Usar fallback Expo + follow-up no `docs/learnings.md` |
| Conflict com lógica existente em `app/_layout.tsx` | **Média** | Ler arquivo completo antes de modificar. Diff cirúrgico |
| 30min lembrete dispara mesmo após user aplicar dose | **Alta se mal feito** | Cancelar lembrete no callback `markDoseAsApplied` |
| Notification permission revogada durante uso (user vai no Settings iOS e desliga) | **Média** | `useNotifications` valida permission em foreground sempre + re-mostra banner se denied |
| Tela `(perfil)/notifications.tsx` brigar com rota existente | **Baixa** | Validar via `ls app/(perfil)/` antes |

---

## Plano esperado da resposta

Antes de executar, Claude Code deve apresentar:

1. **Baseline confirmado:**
   - MCP `list_tables` retornando schema `user_profiles` atual
   - `ls app/(perfil)/` mostrando o que já existe
   - Lista de strings i18n disponíveis em `locales/pt-BR/settings.json` (verificar se cobrem as novas strings necessárias)

2. **Plano salvo em** `docs/superpowers/plans/2026-05-19-push-notifications-v1.md` (regra 21) com:
   - 5 fases listadas
   - Cada arquivo + responsabilidade
   - Karpathy declarations (a, b, c, d)
   - Decisões TRAVADAS pelo prompt (citar com `[TRAVADO]` cada uma)

3. **Skills declaradas** com motivo cada uma

4. **Comando de MCP migration** se schema precisar de coluna nova — mostrar SQL exato ANTES de executar

5. **Riscos adicionais** descobertos no baseline

Depois do `ok` do Léo, executar fases 1-4 em sequência. Fase 5 (Edge Function trigger) **opcional** — se ficar pesado, registrar como follow-up V2 e seguir.

Em caso de ambiguidade não coberta pelas decisões TRAVADAS, **parar e perguntar** — não decidir sozinho.

Branch: `feature/23-push-notifications-v1`. Commit final: `feat(notifications): push notifications V1 com permission flow + scheduling + settings`. Push + PR aberto via MCP, **NÃO MERGEAR**.
