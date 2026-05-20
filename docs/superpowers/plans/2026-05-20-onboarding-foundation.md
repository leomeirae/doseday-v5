# Onboarding Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar a fundacao de onboarding do DoseDay V5 sem telas de conteudo, permitindo que 24b/24c adicionem steps reais sobre tipos, validacao, queries, contexto, shell e roteamento ja prontos.

**Architecture:** Onboarding nasce modular: tipos em `lib/types`, validacao em `lib/validation`, persistencia em `lib/supabase/queries`, estado cross-step em `contexts`, route group dedicado em `app/(onboarding)` e shell visual em `components/onboarding`. O `AuthGuard` vira 3-way usando `useSession()` + `useProfile()` para separar sem sessao, sessao sem onboarding e sessao completa.

**Tech Stack:** Expo SDK 54, React Native 0.81, Expo Router 6, TypeScript strict, React Query, Supabase, Zod, React Hook Form, `@hookform/resolvers`.

---

## Baseline

| Validacao | Resultado |
|---|---|
| `user_profiles.onboarding_completed_at` | Existe nos tipos gerados e REST retornou `200`. |
| `consent_history` | Existe nos tipos gerados e REST retornou `200`; colunas: `id`, `user_id`, `consent_type`, `version`, `granted`, `ip_address`, `user_agent`, `created_at`. |
| Count global `onboarding_completed_at is null` | MCP Supabase nao esta exposto nesta sessao. REST anon retornou `0`, mas pode estar limitado por RLS. Sem MCP, nao executar backfill automatico. |

Queries MCP a rodar assim que o MCP Supabase estiver disponivel:

```sql
select count(*) as profiles_with_null_onboarding
from public.user_profiles
where onboarding_completed_at is null;

select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'consent_history'
order by ordinal_position;
```

Backfill aprovado apenas se o count MCP vier `> 0` e antes de validar users legados:

```sql
update public.user_profiles up
set
  onboarding_completed_at = now(),
  updated_at = now()
where up.onboarding_completed_at is null
  and up.created_at < now() - interval '1 day'
  and (
    up.current_medication is not null
    or up.current_dose is not null
    or up.goal_weight is not null
    or up.treatment_start_date is not null
    or exists (
      select 1 from public.medication_applications ma
      where ma.user_id = up.user_id
    )
    or exists (
      select 1 from public.daily_checkins dc
      where dc.user_id = up.user_id
    )
    or exists (
      select 1 from public.weight_logs wl
      where wl.user_id = up.user_id
    )
  );
```

## Tasks

- [ ] Criar branch `feature/24a-onboarding-foundation` a partir de `main`, preservando mudancas locais pre-existentes.
- [ ] Instalar `react-hook-form` e `@hookform/resolvers`.
- [ ] Criar `lib/types/onboarding.ts` com steps, sets required/optional, data e state.
- [ ] Criar `lib/validation/onboardingSchemas.ts` com Zod por step e map por step.
- [ ] Criar `lib/supabase/queries/onboarding.ts` com progress, update, complete e consent.
- [ ] Estender `lib/supabase/queries/profile.ts` com `onboardingCompletedAt`.
- [ ] Criar `contexts/OnboardingContext.tsx` com reducer, persistencia otimista, RHF helper e invalidacao de profile.
- [ ] Criar `app/(onboarding)/_layout.tsx` e `app/(onboarding)/index.tsx`.
- [ ] Criar `components/onboarding/OnboardingShell.tsx` sem glass e com tokens.
- [ ] Refatorar `app/_layout.tsx` para AuthGuard 3-way com SplashView enquanto profile carrega.
- [ ] Validar com `npm run type-check` e `npm run lint`.
- [ ] Validar redirect em simulador/MCP quando as ferramentas estiverem disponiveis; salvar screenshot real em `assets/screenshots/prompt24a/`.
- [ ] Atualizar `CLAUDE.md` historico e `docs/learnings.md` apenas se houver descoberta nova.

## Karpathy Checks

| Disciplina | Aplicacao |
|---|---|
| Assumptions | `useSession()` e `useProfile()` continuam fontes de sessao/perfil; MCP Supabase indisponivel impede backfill automatico. |
| Could 50 lines do this? | Nao. O pedido exige fundacao modular para evitar repetir o god file de `diarioSchemas.ts`. |
| Surgical | Nao mexer em tabs/auth existentes alem do `AuthGuard`; zero refactor lateral. |
| Goal-driven | User sem onboarding cai em `(onboarding)`; user completo cai em `(tabs)`; validado por type-check, lint e screenshot quando possivel. |

## Risks

| Risco | Mitigacao |
|---|---|
| Users legados com `NULL` serem bloqueados | Backfill so via MCP e so para perfis antigos com sinal clinico ou dados reais. |
| Redirect loop | Checar `navigationState?.key`, grupos atuais e loading de profile antes de `router.replace`. |
| Placeholder apontar para rota inexistente | `index.tsx` fica como placeholder funcional dentro do proprio grupo ate 24b criar steps reais. |
| Dependencias RHF ausentes | Instalar antes do codigo e commitar `package-lock.json`. |

## Validation

| Comando/acao | Esperado |
|---|---|
| `npm run type-check` | PASS |
| `npm run lint` | PASS |
| MCP/Simulator login user onboarding null | Redirect para `(onboarding)` |
| MCP/Simulator login user completo | Redirect para `(tabs)` |
| `/impeccable critique` | Rodar antes de marcar UI pronta se ferramenta estiver disponivel |
| PR | Abrir sem merge, com screenshots reais quando validação visual estiver disponivel |
