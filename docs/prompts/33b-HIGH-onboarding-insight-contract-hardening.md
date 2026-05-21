# DoseDay V5 — Prompt 33b-HIGH-onboarding-insight-contract-hardening

**Instância de destino:** Aba 1 (principal) — Claude Code direto
**Branch a criar:** `feature/33b-onboarding-insight-hardening`
**Modelo recomendado:** Sonnet 4.6 (HIGH — decisão arquitetural sobre fallback policy + 2-step parse + duplicação de schema client/server)
**Esforço estimado:** 3-5h
**Origem estratégica:** Auditoria do Codex App após PRs #36/#46/#47. Codex identificou 2 P1 no contrato do onboarding insight. Este prompt fecha ambos antes da Fase 2. Revisado por Léo em 2026-05-21 com 7 ajustes incorporados (5 conceituais + 2 técnicos).

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

## Estratégia de parse em 2 etapas (ajuste 1 do Léo + correcão técnica)

Servidor não pode confiar no `schemaVersion` que o LLM devolver. **Atencão ao detalhe:** `onboardingInsightContractSchema.omit({ schemaVersion: true })` **herda `.strict()`** do schema canon. Logo, se o LLM mandar `schemaVersion: "banana"`, o raw parse com strict rejeita o campo desconhecido **antes** da sobrescrita. **Não serve.**

**Solucão adotada (decisão Léo):** remocão explícita via destructuring **antes** do raw parse. Mais legível, intent claro, não depende de `.strip()` implícito.

```typescript
// 1. Parse JSON cru do LLM
const parsedModelOutput = JSON.parse(raw) as Record<string, unknown>

// 2. Remove schemaVersion vindo do LLM — servidor é a fonte da verdade desse campo
const { schemaVersion: _ignoredSchemaVersion, ...modelOutputWithoutVersion } = parsedModelOutput

// 3. RAW PARSE: valida tudo MENOS schemaVersion (Zod strict aceita campos do raw schema)
const parsedRaw = onboardingInsightRawSchema.parse({
  ...modelOutputWithoutVersion,
  ...deterministicLabels,
})

// 4. CANON PARSE: servidor injeta schemaVersion e canon valida tudo (incluindo literal)
const contract = onboardingInsightContractSchema.parse({
  ...parsedRaw,
  schemaVersion: 'onboarding_insight_v2',
})
```

Resultado:
- LLM manda `schemaVersion: 'banana'` → destructuring descarta → raw parse passa → canon recebe literal correto ✅
- LLM omite `schemaVersion` → destructuring não quebra → raw parse passa → canon recebe literal correto ✅
- LLM viola outro campo (ex: shortInsight vazio) → raw parse rejeita → cai no fallback path ✅

Mesma estratégia no fallback path: `buildFallbackContract` retorna shape `raw` (sem schemaVersion) + injeta schemaVersion no canon parse. Garante que **um único schema canon** é verdade e que **o servidor sempre tem a última palavra** sobre `schemaVersion`.

---

## Critérios de aceitação

- [ ] `OnboardingInsightContract` em `types/api.ts` ganha `schemaVersion: z.literal('onboarding_insight_v2')` (campo obrigatório, não opcional)
- [ ] `onboardingInsightRawSchema` exportado em `types/api.ts` como `onboardingInsightContractSchema.omit({ schemaVersion: true })` — único schema sem schemaVersion, usado SO em parse interno do servidor (não exposto pro client da Home)
- [ ] **Destructuring explícito** descarta `schemaVersion` vindo do LLM **antes** do raw parse (ver "Estratégia de parse em 2 etapas"). Comment no código explicando o motivo (omit herda strict)
- [ ] Schema Zod local da Edge Function espelha exatamente as definições do client (mesmas constantes exportadas se viável via duplicação consciente, ou comment apontando o mirror)
- [ ] `ONBOARDING_INSIGHT_RESPONSE_FORMAT.schema.properties` inclui `schemaVersion` no JSON Schema enviado pra OpenAI (LLM continua sendo orientado a emitir o campo)
- [ ] `ONBOARDING_INSIGHT_RESPONSE_FORMAT.schema.required` inclui `'schemaVersion'`
- [ ] **Parse 2-step com destructuring**: `JSON.parse` → destructuring remove schemaVersion do LLM → raw schema parsing → injeção de `schemaVersion: 'onboarding_insight_v2'` → canon schema parsing. Mesma estratégia no path do LLM e no path do fallback
- [ ] Persistência em `educational_insights`:
  - `context.schemaVersion = 'onboarding_insight_v2'`
  - `context.output.schemaVersion = 'onboarding_insight_v2'` (redundante mas intencional)
  - `context.contract_version` permanece (`'v2'`) por compat, marcado como deprecated em comment
- [ ] **Edge Function nunca retorna 500 em erro LLM-side.** Define-se 3 caminhos:
  - **Auth fail** → `401`
  - **Input inválido** → `400`
  - **OpenAI fail / JSON inválido / output raw Zod fail / forbidden text / upsert fail** → `200` com contrato fallback seguro
- [ ] **Contrato fallback** é montado por função pura `buildFallbackContract(ctx, reason)`:
  - `schemaVersion: 'onboarding_insight_v2'` (servidor injeta via mesmo 2-step parse)
  - `stageLabel`, `medicationLabel`, `goalLabel`, `deltaLabel`: reusa `deriveDeterministicLabels(ctx)`
  - `shortInsight` (string fixa, 121 chars):
    > `"Vamos organizar seu tratamento e acompanhar sua rotina com calma. O DoseDay já está pronto para registrar o que importa."`
  - `nextStep` (string fixa, 70 chars):
    > `"Registre sua próxima dose para começar a memória do tratamento no app."`
  - `contextBullets` (2 strings fixas):
    > `["Anote a dose da semana e sintomas do dia.", "Use essa memória para conversar melhor em consulta."]`
  - `disclaimer`: `FIXED_DISCLAIMER`
- [ ] **Fallback passa pelos mesmos bloqueios legais** — teste unitário chama `containsForbiddenText(fallback)` e verifica que retorna `null`
- [ ] Quando fallback é emitido, `console.warn` registra a razão (`openai_fail|json_invalid|raw_zod_fail|forbidden_text|upsert_fail`) sem PHI
- [ ] Quando fallback é emitido, o upsert ainda acontece com `context.fallback_reason` populado. Se upsert falhar, retorna 200 com fallback mesmo assim (`console.error` da falha de DB)
- [ ] **Reader Home** aceita **apenas** `schemaVersion === 'onboarding_insight_v2'`. Versão ausente ou diferente → `null`
- [ ] **Bloqueios legais intactos**: `FORBIDDEN_OUTPUT_PATTERNS` + `FORBIDDEN_PHRASES` não tocadas ou só expandidas
- [ ] Persistência legacy mantém `headline` / `body` / `disclaimer` derivados
- [ ] **Zero mudança em UI** além do necessário pra `tsc --noEmit` passar
- [ ] **HandlerDeps com `resolveUserId` opcional** — ver "Estratégia de testes" abaixo
- [ ] `npx tsc --noEmit` PASS
- [ ] `npm run lint` PASS
- [ ] `deno check` PASS no `index.ts` e no `handler.ts`
- [ ] Edge Function deployada v9+, `verify_jwt=true` mantido
- [ ] Invoke autenticado real (happy): response.schemaVersion === `onboarding_insight_v2`. Row no DB com `context.schemaVersion` e `context.output.schemaVersion`
- [ ] Testes Deno: mínimo **5 casos** (ver "Estratégia de testes"), todos PASS
- [ ] **Sem screenshots**
- [ ] Aprendizado #57 registrado
- [ ] ADR 0004 criado

---

## Restrições explícitas

- **Karpathy regra 22:** mudança cirúrgica em 3 arquivos de código + 1 teste novo + ADR + aprendizado
- **NÃO TOCAR** em `app/(onboarding)/result.tsx`, `components/home/InsightCard.tsx`, hooks consumidores
- **NÃO ALTERAR** RLS de `educational_insights`
- **NÃO RENOMEAR** `context.contract_version` (manter pra compat, marcar deprecated)
- **NÃO EXPANDIR** `OnboardingInsightContract` com campos novos além de `schemaVersion`
- **NÃO ENCOLHER** os bloqueios legais
- **NÃO USAR** `as any`, `// @ts-ignore`, `// eslint-disable`
- **NÃO TROCAR** modelo `gpt-5` nem provedor OpenAI
- **NÃO DESLIGAR** `verify_jwt=true`
- **NÃO EXPOR** `OPENAI_API_KEY` nem `SUPABASE_SERVICE_ROLE_KEY` ao client
- **NÃO MEXER em `OPENAI_API_KEY` de produção sob nenhuma hipótese** — simular falha apenas via teste unitário com mock
- **Fallback shortInsight/nextStep/contextBullets** são **strings fixas em código**
- **NÃO usar `.strip()` implícito** no raw schema — remoção explícita via destructuring (decisão Léo, mais legível)

---

## Estratégia de testes (ajustes 3 + 6 do Léo)

**Problema 1 evitado:** importar `index.ts` em teste executa `Deno.serve` no top-level.

**Solução 1:** extrair lógica para `handler.ts` puro. `index.ts` vira:

```ts
import { handleRequest } from './handler.ts'
Deno.serve(handleRequest)
```

**Problema 2 evitado:** mock de OpenAI falhando ainda precisa passar pela auth, que hoje cria um Supabase client real com SUPABASE_URL + SUPABASE_ANON_KEY do Deno.env. Em teste, isso não tem como funcionar.

**Solução 2 (ajuste 7 do Léo):** `HandlerDeps` ganha `resolveUserId?: (req: Request) => Promise<string>`. Default é `resolveAuthenticatedUserId` real; teste injeta resolver fake.

```ts
// handler.ts
export function buildFallbackContract(ctx, reason) { ... }
export function containsForbiddenText(contract) { ... }
export function deriveDeterministicLabels(ctx) { ... }
export const SYSTEM_PROMPT = '...'
export const FIXED_DISCLAIMER = '...'
export const FORBIDDEN_OUTPUT_PATTERNS = [...]
export const FORBIDDEN_PHRASES = [...]

export type HandlerDeps = {
  openai?: {
    chat: { completions: { create: (...args: unknown[]) => Promise<unknown> } }
  }
  serviceClient?: SupabaseClient  // pra mock de upsert se quiser; default cria via env
  resolveUserId?: (req: Request) => Promise<string>  // pra mock de auth; default resolveAuthenticatedUserId
}

export async function handleRequest(req: Request, deps: HandlerDeps = {}): Promise<Response> {
  const resolveUserId = deps.resolveUserId ?? resolveAuthenticatedUserId
  const userId = await resolveUserId(req).catch(/* maps to 401 */)
  // ...
  const openai = deps.openai ?? new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })
  // ...
}
```

**Casos de teste em `handler.test.ts`** (mínimo 5):

1. `buildFallbackContract({ medication: 'Mounjaro', dose_mg: 5, treatment_week: 8, current_weight: 90, initial_weight: 100, goal_weight: 80 }, 'openai_fail')` → contrato canon Zod-válido com `schemaVersion === 'onboarding_insight_v2'`, labels determinísticos preenchidos, shortInsight/nextStep/contextBullets exatamente iguais às strings fixas.
2. `buildFallbackContract({}, 'json_invalid')` → contrato canon Zod-válido mesmo com ctx vazio (labels genéricos).
3. `containsForbiddenText(buildFallbackContract({ medication: 'Mounjaro', dose_mg: 5 }, 'forbidden_text'))` → `null` (fallback não bate em nenhuma lista).
4. `handleRequest(req, { openai: mockFail, resolveUserId: async () => 'fake-user-id-uuid' })` com req autenticado e payload válido → response.status === 200, body contém fallback contract com `schemaVersion === 'onboarding_insight_v2'`, body não tem `error` key. Note: `serviceClient` pode ficar com default (upsert pode falhar em teste sem env, e o código deve cair pra `200 + fallback + log error` — isso é outro caso pra cobrir, ver caso 6 abaixo se desejado).
5. **2-step parse descarta schemaVersion errado do LLM**: simular OpenAI retornando JSON com `schemaVersion: 'banana'` (mas todos os outros campos válidos) → response.schemaVersion no body final === `'onboarding_insight_v2'`. Validar que o destructuring + canon parse funcionaram juntos. Pode ser teste do `handleRequest` com mock de OpenAI retornando esse JSON, OU teste unitário de função helper exportada que faz o 2-step parse.

Opcional adicional:
6. (se viável) `handleRequest` com OpenAI sucesso + `serviceClient` que sempre rejeita upsert → ainda retorna 200 com contrato real (não fallback), upsert não impede return. **OU** retorna 200 com fallback se considerarmos upsert fail como caso de fallback. **Decisão:** quando OpenAI deu success mas upsert falha, retornar o contrato REAL (não fallback) com `200` — cliente recebe o insight que o usuário gerou. Log error da falha de upsert. Próxima invocação tenta upsert de novo.

O arquivo de teste **não importa `index.ts`** — importa só `handler.ts`.

---

## Validador anti-citação (ajuste 2 do Léo)

**Problema:** grep simples retorna match porque blocklist contém os termos legitimamente.

**Solução:** validar **apenas as strings user-facing**, **excluindo** as listas:

- `SYSTEM_PROMPT` (template enviado pra OpenAI)
- Strings fixas do fallback (caso 3 do teste)
- Outputs reais retornados na invocação autenticada de teste
- Strings que viram body legado via `buildLegacyBody`

**NÃO grepar** `handler.ts` inteiro.

Grep canon no SYSTEM_PROMPT:
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
| Planejamento | `superpowers:writing-plans` | Persistir plano em `docs/superpowers/plans/2026-05-21-onboarding-insight-hardening.md` |
| Planejamento | `grill-with-docs` | Stress-test contra ADRs. Atualizar ADR 0002 |
| Planejamento | `karpathy-guidelines` | Diff cirúrgico, trace |
| Implementação | `supabase` | Deploy + verificação via MCP |
| Validação | `security-review` | Fallback não expande superfície de PHI |

### B) Plano de execução

1. **Ler estado atual**. Mapear pontos de injeção. Checkpoint: Léo aprova diagrama final.
2. **Persistir plano** via `superpowers:writing-plans`.
3. **`grill-with-docs`** + atualizar ADR 0002.
4. **Criar ADR 0004** sobre política de fallback.
5. **Editar `types/api.ts`**: adicionar `schemaVersion: z.literal('onboarding_insight_v2')` ao schema canon. Exportar `onboardingInsightRawSchema = onboardingInsightContractSchema.omit({ schemaVersion: true })`.
6. **Extrair `handler.ts`** de `index.ts`. Mover funções puras e constantes. `index.ts` vira `Deno.serve(handleRequest)`.
7. **Adicionar 2-step parse com destructuring explícito** em `handler.ts`:
   - a. `JSON.parse(raw)` → `parsedModelOutput`
   - b. Destructuring: `const { schemaVersion: _ignoredSchemaVersion, ...modelOutputWithoutVersion } = parsedModelOutput`
   - c. `onboardingInsightRawSchema.parse({ ...modelOutputWithoutVersion, ...deterministicLabels })` → `parsedRaw`
   - d. `onboardingInsightContractSchema.parse({ ...parsedRaw, schemaVersion: 'onboarding_insight_v2' })` → `contract`
   - e. Comment explicando "omit() herda strict(); destructuring evita o reject antes da sobrescrita"
8. **Adicionar `buildFallbackContract`** com mesma estratégia 2-step.
9. **Refatorar `handleRequest`** com `HandlerDeps`:
   - `resolveUserId` opcional (default `resolveAuthenticatedUserId`)
   - `openai` opcional (default `new OpenAI(...)`)
   - `serviceClient` opcional (default `createClient(...)` com service role)
   - Auth fail: 401. Input parse fail: 400. Outros: fallback path → 200.
10. **Criar `handler.test.ts`** com mínimo 5 casos (ver "Estratégia de testes").
11. **Editar reader** `lib/supabase/queries/insights.ts`: validar `schemaVersion === 'onboarding_insight_v2'`.
12. **Validar localmente**: `tsc --noEmit`, `lint`, `deno check`, `deno test`.
13. **Deploy** via MCP. Confirmar v9+ e `verify_jwt=true`.
14. **Invoke autenticado real** (happy). Verificar via `execute_sql` que ambos `context.schemaVersion` e `context.output.schemaVersion` estão populados.
15. **Caminho fallback validado APENAS via teste unitário** (decisão Léo). Sem mexer em `OPENAI_API_KEY` de produção sob nenhuma hipótese.
16. **`security-review`**.
17. **Aprendizado #57** em `docs/learnings.md`.
18. **Abrir PR** `feature/33b-onboarding-insight-hardening`.

### C) Riscos identificados

| Risco | Severidade | Mitigação |
|---|---|---|
| Insights existentes em DB sem `schemaVersion` no payload | Média | Reader rejeita → client cai no fallback estático. Documentar em #57: redeploy invalida cache de QA |
| `omit()` herda `.strict()` e quebra raw parse | **Resolvido** | Destructuring explícito antes do raw parse (ajuste 6 do Léo) |
| Mock de OpenAI falhando ainda chama auth real | **Resolvido** | `resolveUserId` opcional em `HandlerDeps` (ajuste 7 do Léo) |
| LLM devolve `schemaVersion` errado | Baixa | Destructuring descarta antes do raw parse; canon recebe literal injetado |
| Fallback só com labels determinísticos quebra UX | Média | Fallback preenche os 8 campos. Strings calmas, sem claim |
| Duplicação de schema Zod client/Edge Function diverge | Média | Comment "mirror de types/api.ts". Considerar `import` se Deno aceitar |
| `index.ts` minimal mas `Deno.serve` ainda lança em deploy | Esperado | `handler.test.ts` não importa `index.ts`. Deploy funciona |
| Upsert fail no fallback path silenciosamente perde insight | Média | Log `console.error` + 200 com fallback mesmo assim |
| `FORBIDDEN_PHRASES` cresce e bate em campo fallback | Baixa | Teste 3 valida no CI |
| Edge Function versão nova quebra invocações em voo | Baixa | Deploy idempotente |
| ADR 0002 desatualizado | Baixa | Etapa 3 atualiza |
| Mock de OpenAI exige tipos compatíveis com `npm:openai@4.x` | Média | `HandlerDeps['openai']` é interface mínima (só `chat.completions.create`) |
| Teste 4 sem `serviceClient` mock tenta upsert real e falha | Baixa | Aceitável — o código do fallback path já cobre upsert fail (200 + fallback + log error). Caso 6 opcional cobre explicitamente |

### D) Arquivos que vai criar/editar

| Arquivo | Ação | Resumo |
|---|---|---|
| `types/api.ts` | editar | +`schemaVersion` no canon + export `onboardingInsightRawSchema` (~3 linhas) |
| `supabase/functions/generate-onboarding-insight/handler.ts` | criar | Extração + 2-step parse com destructuring + buildFallbackContract + HandlerDeps com resolveUserId (~350 linhas) |
| `supabase/functions/generate-onboarding-insight/index.ts` | editar | Reduzir a `Deno.serve(handleRequest)` (~5 linhas) |
| `supabase/functions/generate-onboarding-insight/handler.test.ts` | criar | 5+ casos de teste (~150 linhas) |
| `lib/supabase/queries/insights.ts` | editar | +verificação `schemaVersion === 'onboarding_insight_v2'` (~5 linhas) |
| `docs/adr/0002-persistencia-hibrida-educational-insights.md` | editar | Nota sobre coexistência |
| `docs/adr/0004-fallback-seguro-edge-onboarding-insight.md` | criar | Política de fallback |
| `docs/superpowers/plans/2026-05-21-onboarding-insight-hardening.md` | criar | Plano |
| `docs/learnings.md` | editar | Aprendizado #57 |

### E) Como vai validar

- [ ] `npx tsc --noEmit` PASS
- [ ] `npm run lint` PASS
- [ ] `deno check` PASS em `index.ts` E `handler.ts`
- [ ] `deno test supabase/functions/generate-onboarding-insight/handler.test.ts` PASS (5+ casos)
- [ ] Edge Function v9+ deployada, `verify_jwt=true` mantido
- [ ] Invoke happy: response.schemaVersion === `onboarding_insight_v2`
- [ ] `execute_sql`: `context.schemaVersion` E `context.output.schemaVersion` → ambos `onboarding_insight_v2`
- [ ] Caminho fallback validado **APENAS via teste unitário**. **NÃO** simular em produção.
- [ ] **Anti-citação**: grep em SYSTEM_PROMPT + fallback strings + outputs de teste. **NÃO** grepar `handler.ts` inteiro
- [ ] Reader Home com row sem schemaVersion → `null` no client (testar via row simulada em DB)
- [ ] `security-review` PASS
- [ ] **Sem screenshots**
- [ ] Aprendizado #57 + ADR 0004

### F) Otimização de tokens

- `types/api.ts` (~20 linhas) — Read direto
- `supabase/functions/generate-onboarding-insight/index.ts` (~340 linhas) — `rtk read` ou Read em janelas
- `lib/supabase/queries/insights.ts` (~140 linhas) — Read direto
- ADRs 0001/0002/0003 — Read direto cada
- `docs/PRODUCT.md` — `rtk read` seção Voice & Tone se necessário

---

## ⏸️ Pause aqui e aguarde aprovação do Léo antes de executar.

---

## Diagnóstico técnico

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

**Edge Function fail path atual:**
```ts
} catch (err) {
  return new Response(JSON.stringify({ error: message }), {
    status: 500,  // <-- P1
  })
}
```

**Reader Home atual** aceita qualquer shape válido sem checar versão.

### Diagrama de fluxo final

```
         POST /generate-onboarding-insight
                       │
              auth & input parse
                /            \
           401/400         OpenAI call
                          /          \
                    success         fail (any reason)
                       │                  │
             JSON.parse(raw)        buildFallbackContract(ctx, reason)
                       │                  (interno faz 2-step parse)
        destructuring remove schemaVersion         │
                       │                          │
             RAW Zod parse                        │
             (raw schema sem schemaVersion)        │
                       │                          │
            servidor injeta schemaVersion         │
                       │                          │
             CANON Zod parse ←───────┘
             (com schemaVersion literal)
                       │
             upsert(context.schemaVersion +
                    output.schemaVersion +
                    ?fallback_reason)
                       │
              200 { contrato v2 }
```

### Política de fallback (resumo pra ADR 0004)

| Falha | Antes | Depois |
|---|---|---|
| Auth | 401 | 401 (inalterado) |
| Input ctx inválido | 400 | 400 (inalterado) |
| OpenAI fetch falha | 500 | 200 + fallback |
| OpenAI JSON inválido | 500 | 200 + fallback |
| Output viola RAW Zod | 500 | 200 + fallback |
| Output contém termo proibido | 500 | 200 + fallback |
| Upsert falha (com sucesso OpenAI) | 500 | 200 + contrato REAL (não fallback) + log error |
| Upsert falha (no fallback path) | 500 | 200 + fallback + log error |

---

## Pós-PR (entra em `docs/learnings.md` como aprendizado #57)

```
#57 — 2026-05-21 — Contrato de IA versionado + fallback seguro no servidor.

Contexto. PR #36 deixou OnboardingInsightContract sem schemaVersion no
próprio payload; Edge Function retornava 500 em qualquer falha downstream
(OpenAI, Zod, forbidden, upsert). Codex App auditou e elevou ambos pra P1.

Achado. (1) Versionar payload no payload é diferente de versionar persistência
no container. `context.contract_version` está na jsonb wrapper, mas o cliente
lê o output — sem schemaVersion no output, não tem como rejeitar contratos
antigos sem quebrar o reader. (2) 500 quebra a promessa emocional do Result/
Home — onboarding fica sem insight estruturado por razão LLM, que o usuário
não tem como entender nem agir.

Solução. (1) schemaVersion como campo Zod literal no canon. Servidor faz
2-step parse: destructuring descarta schemaVersion vindo do LLM, raw schema
(sem schemaVersion) processa output, servidor injeta literal determinístico,
canon schema valida. Pegadinha: omit() herda strict() do canon, então se LLM
mandar schemaVersion='banana' e ninguém descartar antes, raw parse rejeita
campo desconhecido. Destructuring explícito antes do raw parse evita isso.
Persistido em context.schemaVersion E context.output.schemaVersion. Reader
Home rejeita qualquer versão diferente. (2) Edge Function diferencia
auth/input (4xx, erro do cliente) de OpenAI/Zod/forbidden/upsert (200 com
fallback determinístico, erro do servidor que cliente não pode resolver).
Fallback shortInsight/nextStep/contextBullets são strings fixas no código,
passam pelos mesmos bloqueios legais, calmas, sem claim.

Princípio. Contrato com LLM precisa de quatro camadas: (a) schemaVersion no
próprio payload pra reader poder rejeitar versões antigas; (b) destructuring
explícito de schemaVersion vindo do LLM antes do raw parse, porque .omit()
herda .strict() e raw parse rejeitaria campo desconhecido; (c) injeção
determinística de schemaVersion pelo servidor + canon parse; (d) fallback
determínistico no servidor pra erros LLM-side não virarem 5xx pro cliente.
5xx é pra erro do servidor que cliente não pode resolver — erro de LLM cabe
em 200 + fallback, porque o cliente *tem* alternativa (fallback estático) e
não há nada que fazer (retry idempotente não conserta LLM mal-comportado).

Bônus 1. Auth fail e input inválido são erros do cliente, mantêm 4xx. Só
falhas LLM-side viram 200 com fallback. Distinção clara entre "erro do
cliente" e "erro do servidor que cliente não pode resolver".

Bônus 2. Edge Function dividida em `index.ts` (só `Deno.serve(handleRequest)`)
+ `handler.ts` (puro, testável, com injeção de dep). HandlerDeps inclui
`resolveUserId` opcional pra testes mockarem auth sem Supabase real. Pattern
aplicável a qualquer Edge Function que precise de testes Deno sem disparar
listener e sem depender de env real.
```

---

**Fim do Prompt 33b (revisado com 7 ajustes do Léo em 2026-05-21).**
