# Fix Push Notification Bugs

**Data:** 2026-05-20  
**Branch:** `feature/25-fix-push-notif-bugs`  
**Base:** `origin/main`  
**Status:** aprovado por Leo

## Objetivo

Corrigir os 5 bugs reais do PR #27 em notificacoes V1, sem mergear o PR e sem refactors fora do escopo.

## Assumptions Karpathy

| Item | Decisao |
|---|---|
| Think Before Coding | Os bugs estao delimitados aos fluxos de permissao, settings, token/default settings e modal contextual. |
| Simplicity First | Usar `upsert` nativo Supabase agora que `user_settings.user_id` tem UNIQUE. Sem helper workaround. |
| Surgical Changes | Editar apenas arquivos diretamente ligados aos 5 bugs e registrar o aprendizado #47. |
| Goal-Driven Execution | Sucesso = permissao tappable, toggle persistente, teste em 5s, default row criada, modal para users existentes. |

## Plano

1. Recriar branch `feature/25-fix-push-notif-bugs` a partir de `origin/main`.
2. Em `app/perfil/notificacoes.tsx`, tornar o card Permissao tappable:
   - `denied` chama `Linking.openSettings()`.
   - `undetermined` chama `requestPermissions()`.
   - `granted` apenas informa estado.
3. Em `app/perfil/notificacoes.tsx`, persistir o toggle `Lembretes de dose` via:
   - `supabase.from('user_settings').upsert(..., { onConflict: 'user_id' })`.
   - defaults `notifications_enabled` e `notification_time` quando row nao existir.
4. Em `app/perfil/notificacoes.tsx`, adicionar 4o card `Testar notificacao` com botao que agenda local notification em 5s.
5. Em `hooks/usePushTokenRegistration.ts`, garantir row default em `user_settings` quando permission estiver granted, usando `upsert` nativo.
6. Em `app/dose/registrar.tsx`, ampliar trigger do modal:
   - primeira dose recem-salva.
   - user existente com mais de 1 dose e `has_seen_push_permission_modal=false`.
7. Em `components/notifications/PermissionRequestModal.tsx`, ajustar copy para tom calmo, direto e sem culpa.
8. Registrar aprendizado #47 em `docs/learnings.md`.

## Riscos

| Risco | Mitigacao |
|---|---|
| Sair do escopo dos 5 bugs | Pausar se surgir qualquer ajuste nao listado aqui. |
| Overwrite de settings existentes | Upsert deve mandar defaults apenas para row ausente ou preservar `notification_time` no toggle. |
| Simulador limitar push real | Validar pelo fluxo de permissao, local notification e dados Supabase; reportar limitacoes. |

## Validacao

- `npm run type-check`
- `npm run lint`
- MCP Supabase para confirmar constraint e dados de `user_settings`
- MCP React Native / simulador para tela de notificacoes, permissao, toggle e teste em 5s quando ambiente estiver disponivel
- `/impeccable critique` da tela de notificacoes, alvo >= 30/40

