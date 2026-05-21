# ADR 0003 — Edge Functions usam `verify_jwt = true` com Supabase Auth nativo

**Data:** 2026-05-20
**Status:** Aceito
**Origem:** Prompt 33 (contrato estruturado do onboarding insight) + decisão Léo
**Decisores:** Léo (PO) + Cowork (validação)

---

## Contexto

A Edge Function `generate-onboarding-insight` da V4 estava configurada com `verify_jwt = false` e implementava **auth manual interna**:
1. Parse manual do header `Authorization: Bearer <jwt>`
2. Validação custom do JWT contra Supabase Auth
3. Extração do `user_id` do payload

Esse padrão duplica trabalho que o Supabase já faz automaticamente quando `verify_jwt = true` está ativo. Razões prováveis pelas quais a V4 fez assim:
- Cache de pattern errado de tutorial
- Necessidade temporária durante migração de auth provider que nunca foi limpa
- Desconhecimento da feature `verify_jwt` nativa do Supabase

A V5 tem Supabase Auth **funcional em produção** (V4 está na App Store), com Google Sign-In e Sign in with Apple já configurados e operando sem issues conhecidos.

## Decisão

**Padrão canônico das Edge Functions do DoseDay V5:**

| Config | Valor |
|---|---|
| `verify_jwt` (no `supabase/config.toml` ou Dashboard) | **`true`** |
| Auth manual interna | **Não implementar** |
| Cliente | `supabase.functions.invoke(<name>, { body })` — JWT enviado automaticamente |
| Dentro da function | `createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: req.headers.get('Authorization')! } } })` resolve identidade do user |
| Service role (`SUPABASE_SERVICE_ROLE_KEY`) | **Apenas em escritas server-side** que precisam contornar RLS (ex: `educational_insights.upsert`). Nunca expor ao cliente |

### Exceções permitidas

`verify_jwt = false` só pode ser usado em:
- **Webhook público** (Apple App Store Server Notifications, RevenueCat webhook, Stripe webhook)
- **Cron interno** (Supabase Scheduler triggered)
- **Callback de provedor externo** que não envia JWT (validar com HMAC/secret próprio)

Cada exceção exige **justificativa explícita no PR + ADR próprio**.

## Alternativas consideradas

| Alternativa | Por que rejeitada |
|---|---|
| Manter `verify_jwt = false` + auth manual | Duplicação de trabalho. Superfície de bug maior. Sem benefício visível em runtime |
| `verify_jwt = true` + auth manual extra como "defesa em profundidade" | Over-engineering. Supabase Auth já é robusto. Adicionar camada custom adiciona pontos de falha sem reduzir risco real |
| Migrar pra outro provedor de auth (Clerk, Auth0, etc.) | Custo de migração desnecessário. Supabase Auth atende plenamente requisitos de DoseDay (LGPD, OAuth Google/Apple, sessões persistentes) |

## Consequências

### Positivas
- Menos código de auth pra manter em cada Edge Function (~30 linhas a menos por function)
- Padrão único e previsível em todas as functions
- Erros de auth virão com mensagens consistentes do Supabase (401 padrão, não 403 custom)
- Onboarding novo de Edge Function fica trivial: criar function, marcar `verify_jwt = true`, pronto
- Service role fica restrito a operações específicas server-side — superfície menor pra vazamento

### Negativas
- Edge Functions existentes da V4 que usavam auth manual precisam ser ajustadas no momento da migração pra V5 (Prompt 33 é a primeira a fazer isso)
- Endpoints públicos (webhooks) precisam de plano de auth alternativo (HMAC/secret)

### Neutras
- Performance: `verify_jwt = true` adiciona ~5-15ms à latência (Supabase verifica JWT antes do código rodar). Aceitável

## Reversibilidade

**Alta.** `verify_jwt` é flag de config — pode voltar a `false` por function via dashboard ou `supabase/config.toml`. Mas voltar exige reintroduzir código de auth manual, o que é trabalho contra o propósito.

## Implementação

- Prompt 33 (`docs/prompts/33-HIGH-onboarding-insight-contract.md`) é a primeira function a aplicar esse ADR
- Edge Functions futuras (Movimento 2 `memoria-perguntas`, Movimento 3 `relatorio-bilingue`, `delete-user-account`) seguem o mesmo padrão
- Webhook RevenueCat (se for criado pra premium) entra como exceção justificada com HMAC validation
