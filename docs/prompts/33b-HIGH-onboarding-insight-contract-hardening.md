# DoseDay V5 — Prompt 33b-HIGH-onboarding-insight-contract-hardening

**Instância de destino:** Aba 1 (principal) — Claude Code direto
**Branch a criar:** `feature/33b-onboarding-insight-hardening`
**Modelo recomendado:** Sonnet 4.6 (HIGH — decisão arquitetural sobre fallback policy + 2-step parse + duplicação de schema client/server)
**Esforço estimado:** 3-5h
**Origem estratégica:** Auditoria do Codex App após PRs #36/#46/#47. Codex identificou 2 P1 no contrato do onboarding insight. Este prompt fecha ambos antes da Fase 2. Revisado por Léo em 2026-05-21 com 5 ajustes incorporados.

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
2. **Fallback seguro em vez de 500** — Edge Function hoje retorna `status: 500` quando OpenAI falha, JSON vem inválido, output contém termo proibido, ou Zod não passa. Cliente cai no `catch` e o onboarding fica sem insight estruturado. O caminho seguro é: Edge Function **retorna 200 com contrato fallback seguro** que respeita as mesmas garantias legais, mantendo a experiência emocional do Result.

Ambos sustentam o Prompt 32 (Home D0 reaproveita contrato direto do DB) e qualquer evolução futura do contrato (v3, etc).

---

## Estratégia de parse em 2 etapas (ajuste 1 do Léo)

Servidor não pode confiar no `schemaVersion` que o LLM devolver. Mas também não pode quebrar quando o LLM devolve `schemaVersion` errado, porque a sobrescrita determinística acontece **depois** do parse. Solução em 2 etapas:

```
Etapa A — RAW PARSE
  Schema Zod "raw" (sem schemaVersion):
    onboardingInsightRawSchema = onboardingInsightContractSchema.omit({ schemaVersion: true })
  parsedRaw = onboardingInsightRawSchema.parse({ ...openaiOutput, ...deterministicLabels })
  (Aqui o schemaVersion do LLM é ignorado — omit não exige nem rejeita.)

Etapa B — CONTRATO CANON
  contract = onboardingInsightContractSchema.parse({
    ...parsedRaw,
    schemaVersion: 'onboarding_insight_v2',   // servidor injeta
  })
  (Aqui o canon valida tudo, incluindo schemaVersion literal.)
```

Resultado: LLM pode mandar `schemaVersion: 'banana'` — é descartado em A; canon em B só vê o literal correto que o servidor injetou. Se LLM omitir, idem. Se LLM mandar shape inválido em outro campo, A falha (vai pro fallback path).

Mesma estratégia no fallback path: `buildFallbackContract` retorna shape `raw` + injeta schemaVersion + valida com canon. Garante que **um único schema canon** é verdade.

---

## Critérios de aceitação

- [ ] `OnboardingInsightContract` em `types/api.ts` ganha `schemaVersion: z.literal('onboarding_insight_v2')` (campo obrigatório, não opcional)
- [ ] `onboardingInsightRawSchema` exportado em `types/api.ts` como `onboardingInsightContractSchema.omit({ schemaVersion: true })` — único schema sem schemaVersion, usado SO em parse interno do servidor (não exposto pro client da Home)
- [ ] Schema Zod local da Edge Function espelha exatamente as definições do client (mesmas constantes exportadas se viável via duplicação consciente, ou comment apontando o mirror)
- [ ] `ONBOARDING_INSIGHT_RESPONSE_FORMAT.schema.properties` inclui `schemaVersion` no JSON Schema enviado pra OpenAI (LLM continua sendo orientado a emitir o campo, mesmo que servidor sobrescreva depois — evita JSON malformado por campo desconhecido)
- [ ] `ONBOARDING_INSIGHT_RESPONSE_FORMAT.schema.required` inclui `'schemaVersion'`
- [ ] **Parse 2-step**: raw schema parsing **antes** da injeção de `schemaVersion` determinístico; canon schema parsing **depois**. Mesma estratégia no path do LLM e no path do fallback
- [ ] Persistência em `educational_insights`:
  - `context.schemaVersion = 'onboarding_insight_v2'`
  - `context.output.schemaVersion = 'onboarding_insight_v2'` (redundante mas intencional — garante leitura mesmo se alguém ler só `output`)
  - `context.contract_version` permanece (`'v2'`) por compat com qualquer leitor antigo, MAS marcado como deprecated no comment
- [ ] **Edge Function nunca retorna 500 em erro LLM-side.** Define-se 3 caminhos:
  - **Auth fail** (`resolveAuthenticatedUserId` joga) → mantém `401`
  - **Input inválido** (Zod `EducationalInsightContextSchema.parse` joga) → mantém `400`
  - **OpenAI fail / JSON inválido / output raw Zod fail / forbidden text / upsert fail** → **`200`** com contrato fallback seguro
- [ ] **Contrato fallback** é montado por função pura `buildFallbackContract(ctx, reason)`:
  - `schemaVersion: 'onboarding_insight_v2'` (servidor injeta via mesmo 2-step parse)
  - `stageLabel`, `medicationLabel`, `goalLabel`, `deltaLabel`: reusa `deriveDeterministicLabels(ctx)` (já existe)
  - `shortInsight` (string fixa, 121 chars):
    > `"Vamos organizar seu tratamento e acompanhar sua rotina com calma. O DoseDay já está pronto para registrar o que importa."`
  - `nextStep` (string fixa, 70 chars):
    > `"Registre sua próxima dose para começar a memória do tratamento no app."`
  - `contextBullets` (2 strings fixas):
    > `["Anote a dose da semana e sintomas do dia.", "Use essa memória para conversar melhor em consulta."]`
  - `disclaimer`: `FIXED_DISCLAIMER` (já existe)
- [ ] **Fallback passa pelos mesmos bloqueios legais** que o output do LLM — teste unitário chama `containsForbiddenText(fallback)` e verifica que retorna `null`
- [ ] Quando fallback é emitido, `console.warn` registra a razão (`openai_fail|json_invalid|raw_zod_fail|forbidden_text|upsert_fail`) sem PHI — nunca logar peso, dose, input completo ou output completo
- [ ] Quando fallback é emitido, o upsert em `educational_insights` ainda acontece, com `context.fallback_reason` populado pra auditoria. Se o próprio upsert falhar, retorna 200 com fallback mesmo assim (client não pode ficar travado) e loga `console.error` da falha de DB
- [ ] **Reader Home** (`getOnboardingInsightContract` em `lib/supabase/queries/insights.ts`) aceita **apenas** `schemaVersion === 'onboarding_insight_v2'` no contrato lido. Versão ausente ou diferente → retorna `null` (cai no fallback estático do `InsightCard` já implementado no PR #46)
- [ ] **Bloqueios legais intactos**: `FORBIDDEN_OUTPUT_PATTERNS` (SURMOUNT/SURPASS/STEP/clinical trial/estudo clínico) e `FORBIDDEN_PHRASES` (motivacional/prescritivo/alarmista/percentuais/população) **não são tocadas**, ou são **expandidas** com novas entradas se aparecer gap — nunca encolhidas
- [ ] Persistência legacy mantém `headline` / `body` / `disclaimer` derivados (compat V4) — ADR 0002 segue válido
- [ ] **Zero mudança em UI** além do necessário pra `tsc --noEmit` passar. Não alterar `result.tsx`, `InsightCard.tsx`, `useOnboardingInsightFromDB.ts`, nada que mexa visual
- [ ] `npx tsc --noEmit` PASS
- [ ] `npm run lint` PASS
- [ ] `deno check --config supabase/functions/generate-onboarding-insight/deno.json supabase/functions/generate-onboarding-insight/index.ts` PASS
- [ ] Edge Function deployada via MCP `deploy_edge_function` em versão nova (v9 ou superior), com `verify_jwt=true` mantido
- [ ] Invoke autenticado de cenário **success**: payload válido → contrato retornado tem `schemaVersion === 'onboarding_insight_v2'`. Row em `educational_insights` tem `context.schemaVersion` e `context.output.schemaVersion`. Verificar via Supabase MCP `execute_sql`
- [ ] Testes Deno (ver "Estratégia de testes" abaixo): mínimo 4 casos, todos PASS
- [ ] **Sem screenshots** (sem impacto visual)
- [ ] Aprendizado #57 registrado em `docs/learnings.md`
- [ ] ADR 0004 criado em `docs/adr/0004-fallback-seguro-edge-onboarding-insight.md`

---

## Restrições explícitas

- **Karpathy regra 22:** mudança cirúrgica em 3 arquivos de código (`types/api.ts`, Edge Function, reader em `insights.ts`) + 1 arquivo de teste novo + ADR + aprendizado. Zero "drive-by refactoring" em UI ou hooks consumidores
- **NÃO TOCAR** em `app/(onboarding)/result.tsx`, `components/home/InsightCard.tsx`, `hooks/useOnboardingInsightFromDB.ts`, `hooks/useOnboardingInsight.ts` — nenhuma mudança visual
- **NÃO ALTERAR** RLS de `educational_insights` (já validada em PR #46)
- **NÃO RENOMEAR** `context.contract_version` no jsonb (manter pra compat, marcar como deprecated em comentário)
- **NÃO EXPANDIR** `OnboardingInsightContract` com campos novos além de `schemaVersion`
- **NÃO ENCOLHER** os bloqueios legais (`FORBIDDEN_OUTPUT_PATTERNS` + `FORBIDDEN_PHRASES`)
- **NÃO USAR** `as any`, `// @ts-ignore`, `// eslint-disable`
- **NÃO TROCAR** modelo `gpt-5` nem provedor OpenAI (Aprendizado #53)
- **NÃO DESLIGAR** `verify_jwt=true` (ADR 0003)
- **NÃO EXPOR** `OPENAI_API_KEY` nem `SUPABASE_SERVICE_ROLE_KEY` ao client
- **NÃO MEXER em `OPENAI_API_KEY` de produção sob nenhuma hipótese** — simular falha apenas via teste unitário com injeção de dependência ou mock (ver "Estratégia de testes")
- **Fallback shortInsight/nextStep/contextBullets** são **strings fixas em código**, nunca geradas dinamicamente por LLM

---

## Estratégia de testes (ajuste 3 do Léo)

**Problema a evitar:** importar `index.ts` em um arquivo de teste executa `Deno.serve` no top-level, prejudicando testabilidade headless.

**Solução:** extrair funções puras testaveis para um módulo separado `supabase/functions/generate-onboarding-insight/handler.ts` que **não** chama `Deno.serve`. O `index.ts` vira um wrapper fino:

```ts
// index.ts (só amarra Deno.serve ao handler):
import { handleRequest } from './handler.ts'
Deno.serve(handleRequest)
```

```ts
// handler.ts (puro, testável):
export function buildFallbackContract(ctx, reason) { ... }
export function containsForbiddenText(contract) { ... }
export function deriveDeterministicLabels(ctx) { ... }
export const SYSTEM_PROMPT = '...'
export const FIXED_DISCLAIMER = '...'
export const FORBIDDEN_OUTPUT_PATTERNS = [...]
export const FORBIDDEN_PHRASES = [...]

// Handler exportado para teste. Recebe dependencies via parâmetro
// (openai, supabase) para permitir mock.
export async function handleRequest(req: Request, deps?: HandlerDeps): Promise<Response> { ... }

export type HandlerDeps = {
  openai?: { chat: { completions: { create: (...) => Promise<...> } } }
  serviceClient?: SupabaseClient
  // defaults: cria via createClient + Deno.env
}
```

**Casos de teste em `handler.test.ts`:**

1. `buildFallbackContract({ medication: 'Mounjaro', dose_mg: 5, treatment_week: 8, current_weight: 90, initial_weight: 100, goal_weight: 80 }, 'openai_fail')` → contrato Zod-válido com `schemaVersion === 'onboarding_insight_v2'`, labels determinísticos preenchidos, shortInsight/nextStep/contextBullets exatamente iguais às strings fixas.
2. `buildFallbackContract({}, 'json_invalid')` → contrato Zod-válido mesmo com ctx vazio (labels genericos: "Fase inicial do tratamento", "GLP-1 em acompanhamento", "Meta ainda não informada", "Variação ainda não calculada").
3. `containsForbiddenText(buildFallbackContract({ medication: 'Mounjaro', dose_mg: 5 }, 'forbidden_text'))` → `null` (fallback não bate em nenhuma das listas).
4. `handleRequest(req, { openai: { chat: { completions: { create: () => { throw new Error('OpenAI down') } } } } })` com req autenticado e payload válido → response.status === 200, body contém fallback contract com `schemaVersion === 'onboarding_insight_v2'`, body não tem `error` key.

O arquivo de teste **não importa `index.ts`** — importa só `handler.ts`, evitando o side-effect do `Deno.serve`.

---

## Validador anti-citação (ajuste 2 do Léo)

**Problema a evitar:** grep simples `git diff --staged | grep -E "SURMOUNT|SURPASS|STEP"` retorna match porque esses termos aparecem **legitimamente** na blocklist (`FORBIDDEN_OUTPUT_PATTERNS`). Inválido como gate.

**Solução:** validar **apenas as strings user-facing** que vão pra UI/persistência, **excluindo** as listas proibitivas. Lista explícita:

- `SYSTEM_PROMPT` (template enviado pra OpenAI) — grep manual
- Strings fixas do fallback (`shortInsight`, `nextStep`, `contextBullets`) — teste unitário (caso 3 acima)
- Outputs reais retornados na invocação autenticada de teste — inspecionar response body
- Strings fixas que viram body legado (`buildLegacyBody`) — derivam do fallback ou do contrato real, já passam por `containsForbiddenText`

**NÃO grepar** a Edge Function como um todo — a blocklist mora lá.

Grep canon a usar manualmente (no SYSTEM_PROMPT específico):
```bash
awk '/^const SYSTEM_PROMPT = `/,/^`$/' supabase/functions/generate-onboarding-insight/handler.ts \
  | grep -Ev '^(const SYSTEM_PROMPT|`)' \
  | grep -E 'SURMOUNT|SURPASS|STEP|clinical trial|estudo clínico' \
  && echo 'FAIL: forbidden term in SYSTEM_PROMPT' \
  || echo 'PASS: SYSTEM_PROMPT clean'
```

---

## Antes de executar, RETORNE:

### A) Skills que vai utilizar

| Fase | Skill | Por quê |
|---|---|---|
| Planejamento | `superpowers:writing-plans` | Persistir plano em `docs/superpowers/plans/2026-05-21-onboarding-insight-hardening.md` (regra 21) |
| Planejamento | `grill-with-docs` | Stress-test contra ADRs 0001/0002/0003 e D015. Confirmar decisão de coexistência `contract_version` vs `schemaVersion`. Atualizar ADR 0002 |
| Planejamento | `karpathy-guidelines` | Cada linha do diff traceia a um critério de aceitação. Diff cirúrgico |
| Implementação | `supabase` | Deploy via MCP `deploy_edge_function`. Verificação de persistência via `execute_sql` |
| Validação | `security-review` | Confirmar que fallback não expande superfície de PHI em logs e que `service_role` continua restrito ao upsert |

### B) Plano de execução

1. **Ler estado atual** das 4 fontes (types/api.ts, Edge Function, reader, ADRs). Mapear pontos de injeção do 2-step parse + buildFallbackContract. Checkpoint: Léo aprova diagrama de fluxo final.
2. **Persistir plano** via `superpowers:writing-plans`.
3. **`grill-with-docs`** + atualizar ADR 0002 com nota sobre coexistência (legado `contract_version` mantido, canon é `schemaVersion` no payload).
4. **Criar ADR 0004** em `docs/adr/0004-fallback-seguro-edge-onboarding-insight.md` documentando a política de fallback (200 em vez de 500 em erros LLM-side).
5. **Editar `types/api.ts`**: adicionar `schemaVersion: z.literal('onboarding_insight_v2')` ao schema canon. Exportar `onboardingInsightRawSchema = onboardingInsightContractSchema.omit({ schemaVersion: true })`.
6. **Extrair handler.ts** de `index.ts`. Mover funcoes puras e constantes (FORBIDDEN_*, SYSTEM_PROMPT, FIXED_DISCLAIMER, deriveDeterministicLabels, containsForbiddenText, buildLegacyBody, schemas locais) pra `handler.ts`. `index.ts` vira `Deno.serve(handleRequest)`. Imports do `handler.ts` não disparam `Deno.serve`.
7. **Adicionar 2-step parse** em `handler.ts`:
   - a. `onboardingInsightRawSchema` (sem schemaVersion) parsing do output do LLM
   - b. `onboardingInsightContractSchema` (com schemaVersion literal) parsing final após servidor injetar `schemaVersion: 'onboarding_insight_v2'`
8. **Adicionar `buildFallbackContract`** em `handler.ts` (função pura). Strings fixas do fallback (shortInsight/nextStep/contextBullets) viram `const FALLBACK_*` no topo. Mesmo 2-step parse no path do fallback.
9. **Refatorar `handleRequest`** em `handler.ts`:
   - Auth fail: 401
   - Input parse fail: 400
   - OpenAI/JSON/Zod raw/forbidden/upsert fails: cair em fallback path — montar via `buildFallbackContract`, upsert best-effort com `fallback_reason`, retornar 200
   - Aceitar `HandlerDeps` opcional pra injeção de mock em teste
10. **Criar `handler.test.ts`** com mínimo 4 casos (ver "Estratégia de testes").
11. **Editar reader** `lib/supabase/queries/insights.ts`: `getOnboardingInsightContract` valida `schemaVersion === 'onboarding_insight_v2'`. Versão ausente ou diferente → `null`.
12. **Validar localmente**: `tsc --noEmit`, `lint`, `deno check`, `deno test`.
13. **Deploy** via MCP `deploy_edge_function`. Confirmar v9+ e `verify_jwt=true`.
14. **Invoke autenticado** real com fixture válida (caminho happy). Verificar via Supabase MCP `execute_sql` que `context.schemaVersion = 'onboarding_insight_v2'` E `context.output.schemaVersion = 'onboarding_insight_v2'`.
15. **Caminho fallback validado APENAS via teste unitário do passo 10** (decisão Léo). Sem mexer em OPENAI_API_KEY de produção sob nenhuma hipótese.
16. **`security-review`**: confirmar service_role restrito ao upsert, logs sem PHI, fallback path não expande superfície de leak.
17. **Aprendizado #57** em `docs/learnings.md`.
18. **Abrir PR** `feature/33b-onboarding-insight-hardening`.

### C) Riscos identificados

| Risco | Severidade | Mitigação |
|---|---|---|
| Insights existentes em DB sem `schemaVersion` no payload | Média | Reader rejeita → client cai no fallback estático já implementado. Aceitável pré-launch. Documentar em #57: redeploy do PR 33b invalida cache de insights existentes — usuários de QA precisam refazer onboarding |
| LLM devolve `schemaVersion` errado ou ausente | Baixa | Resolvido pelo 2-step parse: raw schema ignora o campo, servidor injeta literal, canon valida |
| Fallback só com labels determinísticos quebra UX da Home | Média | Fallback **sempre** preenche todos os 8 campos. Strings fixas calmas, sem claim, sem motivacional |
| Duplicação de schema Zod entre client e Edge Function pode divergir no tempo | Média | Comment explícito "mirror de types/api.ts" no schema da Edge Function. Considerar `import { ... } from '../../../types/api.ts'` se Deno aceitar (testar localmente) |
| `index.ts` fica frame minimal mas `Deno.serve` ainda é lançado em deploy | Esperado | Confirmação pós-deploy via invocação autenticada. `handler.test.ts` valida lógica sem Deno.serve |
| Upsert fail no fallback path silenciosamente perde insight no DB | Média | Log `console.error` específico + retorna 200 com fallback mesmo assim. Próxima invocação tenta de novo |
| `FORBIDDEN_PHRASES` cresce e bate em algum campo fallback | Baixa | Teste 3 valida. Se adicionar phrase que bate, teste falha antes do deploy |
| Edge Function versão nova quebra invocações em voo | Baixa | Deploy idempotente. Invocações em curso terminam na versão antiga; próximas usam v9+ |
| ADR 0002 fica desatualizado | Baixa | Etapa 3 do plano atualiza |
| Mock de OpenAI em teste exige tipos compatíveis com `npm:openai@4.x` | Média | Definir `HandlerDeps['openai']` como interface mínima (só `chat.completions.create`), não tipo total da lib |

### D) Arquivos que vai criar/editar

| Arquivo | Ação | Resumo |
|---|---|---|
| `types/api.ts` | editar | +`schemaVersion` no canon + export `onboardingInsightRawSchema` via `.omit()` (~3 linhas) |
| `supabase/functions/generate-onboarding-insight/handler.ts` | criar | Extração de index.ts: handler + funções puras + constantes + 2-step parse + buildFallbackContract (~300 linhas movidas + ~50 linhas novas) |
| `supabase/functions/generate-onboarding-insight/index.ts` | editar | Reduzir a `Deno.serve(handleRequest)` + imports (~5 linhas) |
| `supabase/functions/generate-onboarding-insight/handler.test.ts` | criar | Testes Deno do fallback + 2-step parse + handler com mock (~120 linhas) |
| `lib/supabase/queries/insights.ts` | editar | +verificação `schemaVersion === 'onboarding_insight_v2'` no reader (~5 linhas) |
| `docs/adr/0002-persistencia-hibrida-educational-insights.md` | editar | Nota sobre coexistência `contract_version` (legado) vs `schemaVersion` (canon no payload) |
| `docs/adr/0004-fallback-seguro-edge-onboarding-insight.md` | criar | Decisão de retornar 200 em vez de 500 em erros LLM-side |
| `docs/superpowers/plans/2026-05-21-onboarding-insight-hardening.md` | criar | Plano persistido |
| `docs/learnings.md` | editar | Aprendizado #57 |

**Não tocar em:**
- `app/(onboarding)/result.tsx`, `components/home/InsightCard.tsx`
- `hooks/useOnboardingInsightFromDB.ts`, `hooks/useOnboardingInsight.ts`
- Qualquer outra Edge Function
- RevenueCat, push, schema do Supabase (sem migration)

### E) Como vai validar

- [ ] `npx tsc --noEmit` PASS
- [ ] `npm run lint` PASS
- [ ] `deno check --config supabase/functions/generate-onboarding-insight/deno.json supabase/functions/generate-onboarding-insight/index.ts` PASS
- [ ] `deno check --config .../deno.json .../handler.ts` PASS
- [ ] `deno test supabase/functions/generate-onboarding-insight/handler.test.ts` PASS (4+ casos)
- [ ] Edge Function v9+ deployada, `verify_jwt=true` confirmado via MCP
- [ ] Invoke autenticado real (caminho happy): response.schemaVersion === 'onboarding_insight_v2'
- [ ] `execute_sql`: 
  ```sql
  SELECT context->>'schemaVersion', context->'output'->>'schemaVersion'
  FROM educational_insights
  WHERE user_id = $1 AND trigger_source = 'onboarding'
  ORDER BY created_at DESC LIMIT 1
  ```
  → ambos retornam `onboarding_insight_v2`
- [ ] Caminho fallback validado APENAS via teste unitário (`handler.test.ts` caso 4). NÃO simular em produção.
- [ ] **Anti-citação** (ajuste 2 do Léo): grep apenas em SYSTEM_PROMPT + strings fixas de fallback + outputs retornados em testes/invocação real. **NÃO** grepar `handler.ts` inteiro (`FORBIDDEN_*` contém os termos legitimamente)
- [ ] Reader Home com row sem `schemaVersion` (simular via `execute_sql` que insere row com `context = {output: {...sem schemaVersion}}`) → retorna `null` no client. Limpar a row depois
- [ ] `security-review` PASS — `service_role` restrito ao upsert; logs não vazam PHI; `OPENAI_API_KEY` não exposto
- [ ] **Sem screenshots** (sem impacto visual)
- [ ] Aprendizado #57 registrado
- [ ] ADR 0004 criado

### F) Otimização de tokens

Arquivos a ler:
- `types/api.ts` (~20 linhas) — Read direto
- `supabase/functions/generate-onboarding-insight/index.ts` (~340 linhas) — Read em janelas via `offset`/`limit`, ou `rtk read`
- `lib/supabase/queries/insights.ts` (~140 linhas) — Read direto
- ADRs 0001/0002/0003 — Read direto cada (todos <100 linhas)
- `docs/PRODUCT.md` — `rtk read` apenas na seção de Voice & Tone se precisar revalidar fallback copy

Greps anti-citação pós-implementação são curtos — Grep direto OK (mas SEM grepar `handler.ts` inteiro).

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
              RAW Zod parse        buildFallbackContract(ctx, reason)
              (sem schemaVersion)         │
                    │                     │
            servidor injeta schemaVersion = 'onboarding_insight_v2'
                    │                     │
            CANON Zod parse ←───────┘
            (com schemaVersion literal)
                    │
            upsert(context.schemaVersion + output.schemaVersion + ?fallback_reason)
                    │
              200 { contrato v2 }
```

### Política de fallback (resumo pra ADR 0004)

| Falha | Antes | Depois |
|---|---|---|
| Auth | 401 | 401 (inalterado) |
| Input ctx inválido | 400 | 400 (inalterado) |
| OpenAI fetch falha | 500 | 200 + fallback |
| OpenAI retorna JSON inválido | 500 | 200 + fallback |
| Output viola RAW Zod | 500 | 200 + fallback |
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

Solução. (1) schemaVersion como campo Zod literal no contrato canon. Servidor
faz 2-step parse: raw schema (sem schemaVersion) processa output do LLM,
servidor injeta schemaVersion determinístico, canon schema valida. LLM pode
mandar schemaVersion errado ou omitir — sempre cai no literal injetado.
Persistido em context.schemaVersion E context.output.schemaVersion. Reader
Home rejeita qualquer versão diferente. (2) Edge Function diferencia
auth/input (4xx, erro do cliente) de OpenAI/Zod/forbidden/upsert (200 com
fallback determinístico, erro do servidor que cliente não pode resolver).
Fallback shortInsight/nextStep/contextBullets são strings fixas no código,
passam pelos mesmos bloqueios legais, calmas, sem claim.

Princípio. Contrato com LLM precisa de três camadas: (a) schemaVersion no
próprio payload pra reader poder rejeitar versões antigas; (b) 2-step parse
no servidor pra não confiar no LLM pra string canônica; (c) fallback
determínistico no servidor pra erros LLM-side não virarem 5xx pro cliente.
5xx é pra erro do servidor que cliente não pode resolver — erro de LLM cabe
em 200 + fallback, porque o cliente *tem* alternativa (fallback estático) e
não há nada que fazer (retry idempotente não conserta LLM mal-comportado).

Bônus 1. Auth fail e input invalido são erros do cliente, mantêm 4xx. Só
falhas LLM-side viram 200 com fallback. Distinção clara entre "erro do
cliente" e "erro do servidor que cliente não pode resolver".

Bônus 2. Edge Function dividida em `index.ts` (só `Deno.serve(handleRequest)`)
+ `handler.ts` (puro, testável, com injeção de dep). Pattern aplicável a
qualquer Edge Function que precise de testes Deno sem disparar listener.
```

---

**Fim do Prompt 33b (revisado com 5 ajustes do Léo em 2026-05-21).**
