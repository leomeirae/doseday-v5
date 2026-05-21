# DoseDay V5 — Prompt 33b-HIGH-onboarding-insight-contract-hardening

**Instância de destino:** Aba 1 (principal) — Claude Code direto
**Branch a criar:** `feature/33b-onboarding-insight-hardening`
**Modelo recomendado:** Sonnet 4.6 (HIGH — decisão arquitetural sobre fallback policy + duplicação de schema client/server)
**Esforço estimado:** 3-5h
**Origem estratégica:** Auditoria do Codex App após PRs #36/#46/#47. Codex identificou 2 P1 no contrato do onboarding insight (ver `docs/interacao-claude-codex/` histórico recente). Este prompt fecha ambos antes da Fase 2.

---

## Contexto obrigatório (leia antes de qualquer coisa)

- `CLAUDE.md` — regras anti-pirraça
- `docs/karpathy.md` — Karpathy Guidelines (regra 22)
- `docs/learnings.md` — ler antes de qualquer prompt MID/HIGH (regra obrigatória). Em especial `#53` (OpenAI, não Anthropic), `#54` (verify_jwt=true), `#56` (contrato D015 reaproveitado na Home)
- `docs/PRODUCT.md` — seção IA + Voice & Tone (vocabulário-âncora anti-dramático)
- `docs/interacao-claude-codex/decisoes.md` D015 (P009=A — sem citações nominais)
- `docs/adr/0001-labels-deterministicos-edge-onboarding.md` — contrato base
- `docs/adr/0002-persistencia-hibrida-educational-insights.md` — onde mora o contrato
- `docs/adr/0003-verify-jwt-true-supabase-auth.md` — padrão Edge Function
- `types/api.ts` — contrato Zod do client (sem schemaVersion hoje)
- `supabase/functions/generate-onboarding-insight/index.ts` — Edge Function (~340 linhas, retorna 500 em todos os erros downstream do LLM)
- `lib/supabase/queries/insights.ts` — `getOnboardingInsightContract` (reader da Home, aceita qualquer shape válido sem checar versão)
- `hooks/useOnboardingInsightFromDB.ts` — hook da Home (não muda nesse prompt)
- `app/(onboarding)/result.tsx` — consumidor do contrato no onboarding (não muda)
- `components/home/InsightCard.tsx` — consumidor do contrato na Home (não muda)

---

## Objetivo desta tarefa

Fechar os **2 achados P1** do Codex App sobre o contrato `OnboardingInsightContract` (PR #36) antes de avançar pra Fase 2:

1. **`schemaVersion: 'onboarding_insight_v2'`** — versionamento explícito do contrato no campo do payload (client + Edge Function + persistência). Hoje só existe `context.contract_version: 'v2'` no jsonb, **não no contrato propriamente dito**. Reader da Home não checa versão — aceita qualquer shape válido.
2. **Fallback seguro em vez de 500** — Edge Function hoje retorna `status: 500` quando OpenAI falha, JSON vem inválido, output contém termo proibido, ou Zod não passa. Cliente cai no `catch` e o onboarding fica sem insight estruturado (apenas fallback estático do client). O caminho seguro é: Edge Function **retorna 200 com contrato fallback seguro** que respeita as mesmas garantias legais, mantendo a experiência emocional do Result.

Ambos sustentam o Prompt 32 (Home D0 reaproveita contrato direto do DB) e qualquer evolução futura do contrato (v3, etc).

---

## Critérios de aceitação

- [ ] `OnboardingInsightContract` em `types/api.ts` ganha `schemaVersion: z.literal('onboarding_insight_v2')` (campo obrigatório, não opcional)
- [ ] Schema Zod local da Edge Function espelha exatamente a definição do client (mesma constante exportada se viável, ou comment apontando o mirror)
- [ ] `ONBOARDING_INSIGHT_RESPONSE_FORMAT.schema.properties` inclui `schemaVersion` no JSON Schema enviado pra OpenAI
- [ ] `ONBOARDING_INSIGHT_RESPONSE_FORMAT.schema.required` inclui `'schemaVersion'`
- [ ] Servidor preenche `schemaVersion: 'onboarding_insight_v2'` deterministicamente (não confia no LLM pra essa string) — sobrescreve o que vier do modelo
- [ ] Persistência em `educational_insights`:
  - `context.schemaVersion = 'onboarding_insight_v2'`
  - `context.output.schemaVersion = 'onboarding_insight_v2'` (redundante mas intencional — garante leitura mesmo se alguém ler só `output`)
  - `context.contract_version` permanece (`'v2'`) por compat com qualquer leitor antigo, MAS marcado como deprecated no comment
- [ ] **Edge Function nunca retorna 500 em erro LLM-side.** Define-se 3 caminhos:
  - **Auth fail** (`resolveAuthenticatedUserId` joga) → mantém `401` (não é erro do LLM, é erro do client)
  - **Input inválido** (Zod `EducationalInsightContextSchema.parse` joga) → mantém `400` (client mandou payload errado)
  - **OpenAI fail / JSON inválido / output Zod fail / forbidden text / upsert fail** → **`200`** com contrato fallback seguro (ver "Contrato fallback" abaixo)
- [ ] **Contrato fallback** é montado por função pura `buildFallbackContract(ctx, reason)`:
  - `schemaVersion: 'onboarding_insight_v2'`
  - `stageLabel`, `medicationLabel`, `goalLabel`, `deltaLabel`: reusa `deriveDeterministicLabels(ctx)` (já existe)
  - `shortInsight`: string fixa min 40 chars, calma, sem claim. Sugestão: `"Vamos organizar seu tratamento e acompanhar dia a dia. Seu DoseDay já está pronto pra ajudar."` (88 chars)
  - `nextStep`: string fixa min 20 chars. Sugestão: `"Registre sua primeira dose pra começar a memória do tratamento."` (64 chars)
  - `contextBullets`: 2 bullets fixos. Sugestão: `["Anote a dose da semana e sintomas leves do dia.", "Leve essa memória pra consulta com seu médico."]` (12-180 chars cada)
  - `disclaimer`: `FIXED_DISCLAIMER` (já existe)
- [ ] **Fallback passa pelos mesmos bloqueios legais** que o output do LLM — chamada a `containsForbiddenText(fallback)` no setup tempo de módulo (não em runtime), via teste unitário que valida que o fallback não viola nenhuma das listas
- [ ] Quando fallback é emitido, `console.warn` registra a razão (`openai_fail|json_invalid|zod_fail|forbidden_text|upsert_fail`) sem PHI — nunca logar peso, dose, input completo ou output completo
- [ ] Quando fallback é emitido, o upsert em `educational_insights` ainda acontece, com `context.fallback_reason` populado pra auditoria. Se o próprio upsert falhar, retorna 200 com fallback mesmo assim (client não pode ficar travado) e loga `console.error` da falha de DB
- [ ] **Reader Home** (`getOnboardingInsightContract` em `lib/supabase/queries/insights.ts`) aceita **apenas** `schemaVersion === 'onboarding_insight_v2'`. Versão ausente ou diferente → retorna `null` (cai no fallback estático do `InsightCard` já implementado no PR #46)
- [ ] **Bloqueios legais intactos**: `FORBIDDEN_OUTPUT_PATTERNS` (SURMOUNT/SURPASS/STEP/clinical trial/estudo clínico) e `FORBIDDEN_PHRASES` (motivacional/prescritivo/alarmista/percentuais/população) **não são tocadas**, ou são **expandidas** com novas entradas se aparecer gap — nunca encolhidas
- [ ] Persistência legacy mantém `headline` / `body` / `disclaimer` derivados (compat V4) — ADR 0002 segue válido
- [ ] **Zero mudança em UI** além do necessário pra `tsc --noEmit` passar (ex: passar `schemaVersion` em algum mock de teste, etc). Não alterar `result.tsx`, `InsightCard.tsx`, `useOnboardingInsightFromDB.ts`, nada que mexa visual
- [ ] `npx tsc --noEmit` PASS
- [ ] `npm run lint` PASS
- [ ] `deno check --config supabase/functions/generate-onboarding-insight/deno.json supabase/functions/generate-onboarding-insight/index.ts` PASS
- [ ] Edge Function deployada via MCP `deploy_edge_function` em versão nova (v9 ou superior), com `verify_jwt=true` mantido
- [ ] Invoke autenticado de cenário **success**: payload válido → contrato retornado tem `schemaVersion === 'onboarding_insight_v2'`. Row em `educational_insights` tem `context.schemaVersion` e `context.output.schemaVersion`. Verificar via Supabase MCP `execute_sql`
- [ ] Teste unitário Deno (em `supabase/functions/generate-onboarding-insight/index.test.ts`):
  - `buildFallbackContract(ctx)` retorna contrato Zod-válido pra `ctx` com todos campos preenchidos
  - `buildFallbackContract({})` (todos campos undefined) retorna contrato Zod-válido com labels genéricos
  - Fallback passa por `containsForbiddenText` sem flag
- [ ] **Sem screenshots** (sem impacto visual — fallback do servidor continua renderizando o mesmo `InsightCard` no client com fallback estático já implementado)
- [ ] Aprendizado #57 registrado em `docs/learnings.md`
- [ ] ADR 0004 criado em `docs/adr/0004-fallback-seguro-edge-onboarding-insight.md` documentando a decisão de retornar 200 em vez de 500 em erros LLM-side

---

## Restrições explícitas

- **Karpathy regra 22:** mudança cirúrgica em 3 arquivos de código (`types/api.ts`, Edge Function, reader em `insights.ts`) + 1 arquivo de teste novo + ADR + aprendizado. Zero "drive-by refactoring" em UI ou hooks consumidores
- **Não tocar** em `app/(onboarding)/result.tsx`, `components/home/InsightCard.tsx`, `hooks/useOnboardingInsightFromDB.ts`, `hooks/useOnboardingInsight.ts` — nenhuma mudança visual
- **Não alterar** RLS de `educational_insights` (já validada em PR #46)
- **Não renomear** `context.contract_version` no jsonb (manter pra compat, marcar como deprecated em comentário)
- **Não expandir** `OnboardingInsightContract` com campos novos além de `schemaVersion` — esse é outro PR se for o caso
- **Não encolher** os bloqueios legais (`FORBIDDEN_OUTPUT_PATTERNS` + `FORBIDDEN_PHRASES`)
- **Não usar** `as any`, `// @ts-ignore`, `// eslint-disable`
- **Não trocar** modelo `gpt-5` nem provedor OpenAI (Aprendizado #53)
- **Não desligar** `verify_jwt=true` (ADR 0003)
- **Não expor** `OPENAI_API_KEY` nem `SUPABASE_SERVICE_ROLE_KEY` ao client
- **Fallback shortInsight/nextStep/contextBullets** são strings **fixas em código**, nunca geradas dinamicamente por LLM (toda a defesa do fallback é ser determinístico)

---

## Antes de executar, RETORNE:

### A) Skills que vai utilizar

| Fase | Skill | Por quê |
|---|---|---|
| Planejamento | `superpowers:writing-plans` | Persistir plano em `docs/superpowers/plans/2026-05-21-onboarding-insight-hardening.md` (regra 21) |
| Planejamento | `grill-with-docs` | Stress-test contra ADRs 0001/0002/0003 e D015. Confirmar se renomear `contract_version` → `schemaVersion` ou manter ambos. Atualizar ADR 0002 com a decisão |
| Planejamento | `karpathy-guidelines` | Cada linha do diff traceia a um critério de aceitação. Diff cirúrgico |
| Implementação | `supabase` | Deploy via MCP `deploy_edge_function`. Verificação de persistência via `execute_sql` |
| Validação | `security-review` | Confirmar que fallback não expande superfície de PHI em logs e que `service_role` continua restrito ao upsert |

### B) Plano de execução

1. **Ler estado atual** das 4 fontes (types/api.ts, Edge Function, reader, ADRs). Confirmar onde adicionar `schemaVersion` e onde adicionar `buildFallbackContract`. Checkpoint: Léo aprova diagrama de fluxo (Edge → success/fail → contrato v2 → DB → reader → client).
2. **Persistir plano** via `superpowers:writing-plans` em `docs/superpowers/plans/2026-05-21-onboarding-insight-hardening.md`.
3. **`grill-with-docs`**: stress-test do schemaVersion vs contract_version. Atualizar `docs/adr/0002-persistencia-hibrida-educational-insights.md` com nota sobre coexistência (legado `contract_version` mantido por compat, canon é `schemaVersion`).
4. **Criar ADR 0004** em `docs/adr/0004-fallback-seguro-edge-onboarding-insight.md` documentando a política de fallback (200 em vez de 500 em erros LLM-side, razões legais e de UX).
5. **Editar `types/api.ts`**: adicionar `schemaVersion: z.literal('onboarding_insight_v2')` ao schema Zod. Tipo `OnboardingInsightContract` reexportado.
6. **Editar Edge Function** `supabase/functions/generate-onboarding-insight/index.ts`:
   - a. Adicionar `schemaVersion` no schema Zod local + JSON Schema enviado pra OpenAI
   - b. Criar função pura `buildFallbackContract(ctx, reason)` no topo do arquivo
   - c. Refatorar try/catch:
     - Auth fail: rethrow como `AuthError` com status 401
     - Input parse fail: rethrow como `InputError` com status 400
     - OpenAI/JSON/Zod/forbidden/upsert fails: cair em fallback — montar contrato fallback, tentar upsert (best-effort), retornar 200 com fallback
   - d. Servidor sempre sobrescreve `schemaVersion` no contrato final (não confia no LLM)
   - e. Logs: warn na razão do fallback, sem PHI
   - f. `context.schemaVersion` + `context.output.schemaVersion` + `context.fallback_reason?` quando aplicável
7. **Criar testes Deno** em `supabase/functions/generate-onboarding-insight/index.test.ts`:
   - `buildFallbackContract` produz contrato Zod-válido pra ctx completo, parcial e vazio
   - Fallback não aciona `containsForbiddenText`
   - Resposta de fallback tem status 200 (testar via função exportada que simula resposta sem subir o servidor)
8. **Editar reader** `lib/supabase/queries/insights.ts`:
   - `getOnboardingInsightContract` valida `schemaVersion === 'onboarding_insight_v2'` antes de retornar. Versão ausente ou diferente → `null`.
9. **Validar localmente**: `tsc --noEmit`, `lint`, `deno check`, rodar testes Deno.
10. **Deploy** via MCP `deploy_edge_function`. Confirmar v9+ e `verify_jwt=true`.
11. **Invoke autenticado** real com fixture válida. Verificar response contém `schemaVersion`. Verificar DB row tem `context.schemaVersion` E `context.output.schemaVersion` via `execute_sql`.
12. **Cenário fallback**: documentar como simular (opções: trocar `OPENAI_API_KEY` pra inválida em deploy de teste temporário, OU validar via teste unitário só — Léo decide).
13. **`security-review`**: confirmar service_role restrito ao upsert, logs sem PHI, não-leak de chave em fallback path.
14. **Aprendizado #57** em `docs/learnings.md`.
15. **Abrir PR** `feature/33b-onboarding-insight-hardening`.

### C) Riscos identificados

| Risco | Severidade | Mitigação |
|---|---|---|
| Insights existentes em DB sem `schemaVersion` (pré-PR #36 ou gerados em versão intermediária) | Média | Reader rejeita → client cai no fallback estático já implementado. Aceitável pré-launch. Documentar em aprendizado #57 que **redeploy do PR 33b invalida cache de insights existentes** — usuários de QA precisam refazer onboarding pra ver contrato v2 |
| Fallback só com labels determinísticos quebra UX da Home (D0 sem `shortInsight`/`nextStep` significativos) | Alta | Fallback **sempre** preenche todos os 8 campos. `shortInsight` + `nextStep` são strings fixas no código, calmas, sem claim. Cobrem o caminho de erro sem deixar UI vazia |
| Duplicação de schema Zod entre client e Edge Function pode divergir no tempo | Média | Documentar no título do schema da Edge Function que ele é "mirror de types/api.ts". Critério de aceitação pede comentário explícito no código |
| LLM pode gerar `schemaVersion` errado e quebrar Zod parse | Baixa | Servidor sobrescreve `schemaVersion` **depois** do parse com `'onboarding_insight_v2'`. LLM só preenche o campo pra cumprir o JSON Schema; o valor final é sempre do servidor |
| Upsert fail no fallback path silenciosamente perde insight no DB | Média | Log `console.error` específico + retorna 200 com fallback mesmo assim. Próxima invocação tenta de novo. Aceitável porque cliente fica funcional |
| `FORBIDDEN_PHRASES` cresce e bate em algum campo fallback | Baixa | Teste unitário valida no CI. Se um dia adicionar phrase que bate no fallback, o teste falha antes do deploy |
| Edge Function versão nova quebra invocações em voo | Baixa | Deploy idempotente. Invocações em curso terminam na versão antiga; próximas usam v9 |
| ADR 0002 fica desatualizado (menciona `contract_version`) | Baixa | Etapa 3 do plano atualiza ADR com nota sobre coexistência |
| Resposta de fallback ter `disclaimer` diferente do gerado quebra teste visual da Home | Baixa | `disclaimer` sempre vem de `FIXED_DISCLAIMER` (igual no path success e no path fallback) |

### D) Arquivos que vai criar/editar

| Arquivo | Ação | Resumo |
|---|---|---|
| `types/api.ts` | editar | +1 linha: `schemaVersion: z.literal('onboarding_insight_v2')` |
| `supabase/functions/generate-onboarding-insight/index.ts` | editar | +`buildFallbackContract`, +`schemaVersion` no schema/JSON Schema/upsert, refator try/catch (~50 linhas alteradas) |
| `supabase/functions/generate-onboarding-insight/index.test.ts` | criar | Testes Deno do fallback (~80 linhas) |
| `lib/supabase/queries/insights.ts` | editar | +verificação `schemaVersion === 'onboarding_insight_v2'` no reader (~5 linhas) |
| `docs/adr/0002-persistencia-hibrida-educational-insights.md` | editar | Nota sobre coexistência `contract_version` (legado) vs `schemaVersion` (canon) |
| `docs/adr/0004-fallback-seguro-edge-onboarding-insight.md` | criar | Decisão de retornar 200 em vez de 500 em erros LLM-side. Alternativas + consequências + reversibilidade |
| `docs/superpowers/plans/2026-05-21-onboarding-insight-hardening.md` | criar | Plano persistido |
| `docs/learnings.md` | editar | Aprendizado #57 |

**Não tocar em:**
- `app/(onboarding)/result.tsx` (UI Result)
- `components/home/InsightCard.tsx` (UI Home)
- `hooks/useOnboardingInsightFromDB.ts` (consumer Home, não muda)
- `hooks/useOnboardingInsight.ts` (consumer Result, não muda)
- Qualquer outra Edge Function
- RevenueCat, push, schema do Supabase (sem migration)

### E) Como vai validar

- [ ] `npx tsc --noEmit` PASS sem erros novos
- [ ] `npm run lint` PASS (warnings preexistentes aceitos)
- [ ] `deno check --config supabase/functions/generate-onboarding-insight/deno.json supabase/functions/generate-onboarding-insight/index.ts` PASS
- [ ] `deno test supabase/functions/generate-onboarding-insight/index.test.ts` PASS (3+ casos)
- [ ] Edge Function v9+ deployada, `verify_jwt=true` confirmado via MCP
- [ ] Invoke autenticado com fixture válida → response.schemaVersion === 'onboarding_insight_v2'
- [ ] `execute_sql`: `select context->>'schemaVersion', context->'output'->>'schemaVersion' from educational_insights where user_id=$1 and trigger_source='onboarding' order by created_at desc limit 1` → ambos retornam `onboarding_insight_v2`
- [ ] Grep anti-citação no diff: `git diff --staged | grep -E "SURMOUNT|SURPASS|STEP|clinical trial|estudo clínico"` retorna 0
- [ ] Reader Home com fixture sem schemaVersion (row legado) → retorna null (testar via `execute_sql` que insere row sem schemaVersion + abrir Home no simulador → cai no fallback estático)
- [ ] `security-review` PASS — `service_role` restrito ao upsert; logs não vazam PHI; `OPENAI_API_KEY` não exposto
- [ ] **Sem screenshots** (sem impacto visual)
- [ ] Aprendizado #57 registrado
- [ ] ADR 0004 criado

### F) Otimização de tokens

Arquivos a ler:
- `types/api.ts` (~20 linhas) — Read direto
- `supabase/functions/generate-onboarding-insight/index.ts` (~340 linhas) — Read em janelas via `offset`/`limit`, ou `rtk read`
- `lib/supabase/queries/insights.ts` (~140 linhas) — Read direto
- `docs/adr/0001*.md` + `0002*.md` + `0003*.md` — Read direto cada (todos <100 linhas)
- `docs/PRODUCT.md` (~600 linhas) — `rtk read` apenas na seção de Voice & Tone se precisar consultar guardrail de copy do fallback

Greps anti-citação pós-implementação são curtos — Grep direto OK.

---

## ⏸️ Pause aqui e aguarde aprovação do Léo antes de executar.

---

## Diagnóstico técnico (informação pra acelerar o plano)

### Estado atual verificado via MCP (2026-05-21)

**`types/api.ts`** (8 campos, **sem schemaVersion**):
```ts
export const onboardingInsightContractSchema = z
  .object({
    stageLabel, medicationLabel, goalLabel, deltaLabel,
    shortInsight, nextStep, contextBullets, disclaimer,
  })
  .strict()
```

**Edge Function** (linhas 280–340):
```ts
// fail path atual:
} catch (err) {
  const message = err instanceof Error ? err.message : 'Unknown error'
  console.error(`[generate-onboarding-insight] error=${message}`)
  return new Response(JSON.stringify({ error: message }), {
    status: 500,  // <-- P1 do Codex
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

// persistência atual:
context: {
  contract_version: 'v2',  // <-- só aqui, NÃO no contrato
  input: ctx,
  output: contract,
}
```

**Reader Home** (`lib/supabase/queries/insights.ts` linhas 123–141):
```ts
const output = (data?.context as { output?: unknown } | null)?.output
if (output == null) return null
return onboardingInsightContractSchema.safeParse(output).data ?? null
// <-- aceita qualquer shape válido, sem checar versão
```

### Diagrama de fluxo proposto

```
         POST /generate-onboarding-insight
                       │
              auth & input parse
                /            \
           401/400         OpenAI call
                          /          \
                    success         fail (any reason)
                       │                  │
                    Zod parse        buildFallback(ctx, reason)
                    /        \               │
               valid       forbidden       valid by construction
                  │             │               │
            servidor sobrescreve schemaVersion       ←───────┘
                  │                                      
            upsert(context.schemaVersion + output.schemaVersion + ?fallback_reason)
                  │
              200 { contrato v2 }
```

Em cliente:
```
useOnboardingInsightFromDB → getOnboardingInsightContract
  → if context.schemaVersion !== 'onboarding_insight_v2': return null
  → if !output: return null
  → if safeParse fail: return null
  → return contract
InsightCard:
  source='onboarding' → contract OR fallback estático
```

### Política de fallback (resumo pra ADR 0004)

| Falha | Antes | Depois |
|---|---|---|
| Auth | 401 | 401 (inalterado) |
| Input ctx inválido | 400 | 400 (inalterado) |
| OpenAI fetch falha | 500 | 200 + fallback |
| OpenAI retorna JSON inválido | 500 | 200 + fallback |
| Output viola Zod | 500 | 200 + fallback |
| Output contém termo proibido | 500 | 200 + fallback |
| Upsert falha | 500 | 200 + fallback (log error) |

---

## Pós-PR (entra em `docs/learnings.md` como aprendizado #57)

```
#57 — 2026-05-21 — Contrato de IA versionado + fallback seguro no servidor.

Contexto. PR #36 deixou o OnboardingInsightContract sem schemaVersion no
próprio payload; a Edge Function retornava 500 em qualquer falha downstream
(OpenAI, Zod, forbidden, upsert). Codex App auditou e elevou ambos pra P1.

Achado. (1) Versionar payload no payload é diferente de versionar persistência
no container. `context.contract_version` está na jsonb wrapper, mas o cliente
lê o output — sem schemaVersion no output, não tem como rejeitar contratos
antigos sem quebrar o reader. (2) 500 quebra a promessa emocional do Result/
Home — onboarding fica sem insight estruturado por uma razão LLM, que o usuário
não tem como entender nem agir.

Solução. (1) schemaVersion como campo Zod no contrato (client e Edge Function),
servidor sobrescreve determinísticamente. Persistido em context.schemaVersion E
context.output.schemaVersion. Reader Home rejeita qualquer versão diferente.
(2) Edge Function diferencia auth/input (4xx, erro do cliente) de OpenAI/Zod/
forbidden/upsert (200 com fallback determinístico, erro do servidor). Fallback
shortInsight/nextStep/contextBullets são strings fixas no código, passam pelos
mesmos bloqueios legais, calmas, sem claim.

Princípio. Contrato com LLM precisa de duas camadas: (a) schemaVersion no
próprio payload pra reader poder rejeitar versões antigas; (b) fallback
determínistico no servidor pra erros LLM-side não virarem 5xx pro cliente.
5xx é pra erro do servidor que cliente não pode resolver — erro de LLM cabe em
200 + fallback, porque o cliente *tem* alternativa (fallback estático) e não
há nada que fazer (retry idempotente).

Bônus. Auth fail e input invalido são erros do cliente, mantêm 4xx. Só falhas
LLM-side viram 200 com fallback. Distinção clara entre "erro do cliente" e
"erro do servidor que cliente não pode resolver".
```

---

**Fim do Prompt 33b.**
