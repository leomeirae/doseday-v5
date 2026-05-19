# HANDOFF — Prompt 18 — Perfil V2 LGPD

Data: 2026-05-18
Branch: `feature/18-perfil-v2-lgpd`
Worktree: `/private/tmp/doseday-perfil-v2`

## Entrega

- Perfil V2 substitui `app/(tabs)/perfil.tsx`.
- Fluxo de exclusão LGPD adicionado em `app/perfil/excluir.tsx` como modal.
- `AuthButton` ganhou variant aditiva `destructive`, preservando `primary` e `secondary`.
- Delete real não foi executado em `leonardo@teste.com`.
- URLs externas seguem como placeholders e foram registradas em `docs/architecture.md`.

## Arquivos principais

- `components/ui/AuthButton.tsx`
- `components/perfil/AccountCard.tsx`
- `components/perfil/SectionLink.tsx`
- `components/perfil/DeleteAccountModal.tsx`
- `app/(tabs)/perfil.tsx`
- `app/perfil/excluir.tsx`
- `hooks/useDeleteAccount.ts`
- `lib/supabase/queries/account.ts`
- `lib/validation/accountSchemas.ts`
- `assets/screenshots/prompt18/*.png`

## Validação

- `npm run type-check`: passou.
- `npm run lint`: passou com 1 warning existente em `lib/i18n/index.ts`.
- `npx impeccable detect --json ...`: `[]`.
- MCP React Native: Metro conectado, hierarquia de Perfil inclui links, delete em 1 tap e Sair.
- MCP Supabase: `delete-user-account` ativa, `verify_jwt=true`, código valida JWT via `auth.getUser()` antes de `auth.admin.deleteUser()`.

## Observações

- O botão destrutivo usa `colors.textInverse`, conforme decisão explícita do PO.
- O fluxo de sucesso/erro real de delete deve ser validado com mock ou conta descartável, nunca com `leonardo@teste.com`.
