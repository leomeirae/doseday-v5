# DoseDay V5 — Prompt 33-HIGH-onboarding-insight-contract

**Instância de destino:** Aba 1 (principal) — Claude Code direto  
**Branch a criar:** `feature/33-onboarding-insight-contract`  
**Modelo recomendado:** Sonnet 4.6 ou modelo high atual  
**Esforço estimado:** 2h-4h  
**Origem estratégica:** Fase 1 do redesign dos primeiros 3 minutos. Desbloqueia Prompt 31 (Result IA) e Prompt 32 (Home continuidade).  
**Pré-requisito operacional:** executar a partir de `main` atualizado. Não reaproveitar branch do Prompt 35.

---

## Contexto obrigatório (leia antes de qualquer coisa)

- `CLAUDE.md` — regras anti-pirraça
- `docs/karpathy.md` — Karpathy Guidelines
- `docs/learnings.md` — especialmente #49 sobre `generate-onboarding-insight`
- `docs/working-rules.md` — screenshots reais e MCP
- `docs/PRODUCT.md` — Voice & Tone, limites médicos, disclaimer fixo
- `docs/DESIGN.md` — Number-First, Vital Mint Rarity, zero glass em conteúdo
- `docs/interacao-claude-codex/07-auditoria-v2.md` §4 e §5.3
- `docs/interacao-claude-codex/08-direcao-visual-primeiros-3-minutos.md`
- `docs/interacao-claude-codex/08c-codex-app-debate-direcao.md`
- `docs/interacao-claude-codex/decisoes.md` D015
- `lib/supabase/queries/insights.ts`
- `hooks/useOnboardingInsight.ts`
- `app/(onboarding)/result.tsx`
- `components/home/InsightCard.tsx`

---

## Contexto técnico confirmado pelo Cowork

| Item | Estado confirmado |
|---|---|
| Edge Function remota | `generate-onboarding-insight` existe no Supabase, versão 4, status ACTIVE |
| Fonte local | `supabase/functions/generate-onboarding-insight/` ainda NÃO existe no repo |
| Config remota | `verify_jwt=false`, mas a função exige `Authorization` e chama `supabase.auth.getUser()` dentro do handler |
| Bug legal atual | System prompt exige trials por nome (`SURMOUNT`, `STEP`, `SURPASS`) e body com estudos clínicos |
| Contrato atual | Response `{ headline, body, disclaimer }` |
| Cliente atual | `callGenerateOnboardingInsight()` tipa a resposta como `CheckinInsightOutput` |
| Result atual | Usa `insight.data.headline` e `insight.data.body`; facts determinísticos ficam abaixo |
| Home atual | `InsightCard` usa `memory-daily-insight` e ainda pode mostrar placeholder Premium |
| Persistência | Tabela `educational_insights` tem `context jsonb`, `headline`, `body`, `disclaimer`, `model`, `prompt_version`; há índice único `(user_id, trigger_source)` |

---

## Objetivo desta tarefa

Corrigir o P0 Legal **ONB-08**: `generate-onboarding-insight` não pode citar estudos clínicos nominais, trials, porcentagens populacionais ou claims terapêuticos ao paciente.

Ao mesmo tempo, transformar a saída da função em um contrato estruturado e persistido para que **Result IA** e **Home D0/D1** renderizem a mesma verdade depois: dados determinísticos do usuário + insight curto + próximo passo + bullets sobre como o DoseDay acompanha.

Esta tarefa prepara o contrato. O redesign visual do Result fica no Prompt 31. A Home continuidade fica no Prompt 32.

---

## Contrato alvo

Criar um tipo canônico compartilhado no cliente:

```ts
export type OnboardingInsightOutput = {
  schemaVersion: 'onboarding_insight_v2'
  stageLabel: string | null
  medicationLabel: string | null
  goalLabel: string | null
  deltaLabel: string | null
  shortInsight: string
  nextStep: string
  contextBullets: [string, string, string]
  disclaimer: string
}
```

### Regras por campo

| Campo | Origem | Regra |
|---|---|---|
| `stageLabel` | Determinística no servidor | Ex.: `Semana 8`, ou `null` se não houver semana |
| `medicationLabel` | Determinística no servidor | Ex.: `Mounjaro 5mg`, ou só medicamento/dose quando parcial |
| `goalLabel` | Determinística no servidor | Ex.: `Meta: 78 kg`, ou `null` |
| `deltaLabel` | Determinística no servidor | Ex.: `12,0 kg até a meta`, ou `null` |
| `shortInsight` | IA, validada | 1 frase curta. Sem estudo, sem porcentagem, sem conselho médico |
| `nextStep` | IA, validada | Próxima ação dentro do app, não ação clínica |
| `contextBullets` | IA, validada | Exatamente 3 bullets sobre como o DoseDay acompanha |
| `disclaimer` | Fixo no servidor | `Isso é uma anotação inteligente, não orientação médica. Sempre fale com um profissional de saúde.` |

### Persistência

Manter compatibilidade com a tabela atual, sem migration neste prompt:

| Coluna | Como gravar |
|---|---|
| `headline` | `output.shortInsight` |
| `body` | `output.nextStep` |
| `disclaimer` | disclaimer fixo |
| `context` | `{ input: ctx, output, schemaVersion: 'onboarding_insight_v2' }` |
| `prompt_version` | `v2` |

Se descobrir que outro código depende de `context` como input puro, adaptar esse reader para `context.input`. Não criar migration sem parar e pedir aprovação.

---

## Conteúdo proibido no output ao paciente

| Proibido | Exemplos |
|---|---|
| Estudos/trials nominais | `SURMOUNT`, `SURPASS`, `STEP`, `SUSTAIN`, `SELECT` |
| Claims populacionais | `70% das pessoas`, `pacientes costumam`, `em estudos...` |
| Claim terapêutico | `a tirzepatida mostrou redução`, `o medicamento leva a...` |
| Conselho médico | `procure atendimento`, `ajuste a dose`, `fale com seu médico sobre X sintoma` |
| Diagnóstico/prescrição | `indica`, `sugere`, `diagnóstico`, `recomendamos` |
| Motivacional | `você consegue`, `parabéns`, emoji, streak, gamificação |

Conteúdo permitido:

- Dados próprios fornecidos pelo usuário: semana, medicamento, dose, peso atual, meta.
- Organização do tratamento no app: dose, peso e sintomas semana a semana.
- Próximo passo no app: registrar primeira dose, acompanhar sintomas, preparar consulta.
- Disclaimer fixo.

---

## Direção de implementação

### 1. Materializar a função remota no repo

1. Usar MCP Supabase `get_edge_function(function_slug='generate-onboarding-insight')`.
2. Criar `supabase/functions/generate-onboarding-insight/index.ts` com o conteúdo remoto atual como base.
3. Não editar `generate-checkin-insight` neste PR, mesmo que tenha prompt parecido. Se houver drift entre as funções, reportar no PR.

### 2. Atualizar prompt e output da Edge Function

Mudar `SYSTEM_PROMPT` para:

- Não mencionar estudos/trials/literatura.
- Pedir JSON conforme `OnboardingInsightOutput`.
- Deixar claro que a IA só preenche `shortInsight`, `nextStep` e `contextBullets`.
- Proibir porcentagens, kg populacional e claims sobre população.
- Focar no uso do DoseDay: organizar dose, peso, sintomas, consulta.

Preferir Structured Outputs do OpenAI em vez de JSON mode:

```ts
response_format: {
  type: 'json_schema',
  json_schema: {
    name: 'onboarding_insight_output',
    strict: true,
    schema: { ... }
  }
}
```

Se a API/modelo atual rejeitar `json_schema`, parar e reportar no plano. Não cair silenciosamente para prompt frágil. JSON mode só é aceitável se o plano explicar o motivo e mantiver validação manual robusta.

### 3. Determinismo antes da IA

Criar helpers na função:

| Helper | Responsabilidade |
|---|---|
| `buildDeterministicLabels(ctx)` | Monta `stageLabel`, `medicationLabel`, `goalLabel`, `deltaLabel` sem IA |
| `buildFallbackOutput(ctx)` | Gera output seguro se OpenAI falhar |
| `validateOutput(output)` | Rejeita campos ausentes, tamanho excessivo e termos proibidos |
| `containsForbiddenClinicalClaim(text)` | Bloqueia studies/trials/percentuais/população |

Regra: se a IA devolver algo inválido, usar fallback seguro e logar o motivo. Não retornar 500 para o app quando há fallback local seguro.

### 4. Segurança/Auth da Edge Function

Alvo preferido: `verify_jwt=true`, porque a função é chamada pelo app via `supabase.functions.invoke` com usuário logado.

Obrigatório:

- Manter validação interna com `auth.getUser()`.
- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` ao cliente.
- Não enviar nome, email ou user_id para OpenAI.
- Enviar apenas contexto mínimo: medicamento, dose, semana, pesos/meta.
- Se `verify_jwt=true` quebrar preflight ou invoke autenticado, parar e reportar no plano. Não fazer deploy final em `verify_jwt=false` sem justificar.

### 5. Atualizar cliente TypeScript

Em `lib/supabase/queries/insights.ts`:

- Criar/exportar `OnboardingInsightOutput`.
- Trocar `callGenerateOnboardingInsight()` para retornar esse tipo.
- Não reutilizar `CheckinInsightOutput` para onboarding.
- Criar parser/type guard sem `as any`.
- Criar `getLatestOnboardingInsight(userId)` que lê `educational_insights` com `trigger_source='onboarding'` e retorna `context.output` quando `schemaVersion === 'onboarding_insight_v2'`.
- Manter `getLatestEducationalInsight()` de first-checkin intacto.

Em `hooks/useOnboardingInsight.ts`:

- Ajustar tipos para `OnboardingInsightOutput`.
- Manter `staleTime: Infinity` e `gcTime: Infinity`.
- Não chamar IA para `treatment_status === 'planning'`.

Em `app/(onboarding)/result.tsx`:

- Fazer adaptação mínima para não quebrar antes do Prompt 31.
- Renderizar `shortInsight` como headline do card de IA.
- Renderizar `nextStep` como body do card de IA.
- Manter facts determinísticos existentes até o redesign.
- Não implementar o layout Number-First final aqui.

Não mexer em `components/home/InsightCard.tsx` neste prompt, exceto se for inevitável para type-check. Home será Prompt 32.

---

## Critérios de aceitação

- [ ] `supabase/functions/generate-onboarding-insight/index.ts` existe no repo e parte da versão remota atual.
- [ ] Function não contém `SURMOUNT`, `SURPASS`, `STEP`, `SUSTAIN`, `SELECT`, `trial`, `trials`, `literatura` ou `estudo clínico` no prompt enviado ao paciente.
- [ ] Function retorna `OnboardingInsightOutput` com `schemaVersion='onboarding_insight_v2'`.
- [ ] `disclaimer` é sempre sobrescrito pelo servidor com o texto fixo do PRODUCT.md.
- [ ] Campos determinísticos não são gerados pela IA.
- [ ] Output inválido da IA cai em fallback seguro, sem 500 para o app.
- [ ] Upsert em `educational_insights` preserva `headline/body/disclaimer` e grava output estruturado em `context.output`.
- [ ] `prompt_version='v2'`.
- [ ] `lib/supabase/queries/insights.ts` exporta tipo, caller e reader do insight onboarding.
- [ ] `app/(onboarding)/result.tsx` compila com o novo contrato e mostra texto seguro.
- [ ] Zero `as any`, zero `// @ts-ignore`, zero `// eslint-disable`.
- [ ] `npm run type-check` passa.
- [ ] `npm run lint` passa.
- [ ] `deno check supabase/functions/generate-onboarding-insight/index.ts` passa, se Deno estiver disponível.
- [ ] Edge Function deployada e testada via invoke autenticado.
- [ ] MCP Supabase confirma 1 row em `educational_insights` com `trigger_source='onboarding'`, `prompt_version='v2'`, e `context.output.schemaVersion='onboarding_insight_v2'`.
- [ ] Screenshot real do Result IA em `assets/screenshots/prompt33/01-result-ia-sem-estudos.png`.
- [ ] PR body inclui screenshot real, output de type-check/lint, e nota de `security-review`.

---

## Restrições explícitas

- Não implementar Prompt 31: nada de redesign completo do Result.
- Não implementar Prompt 32: nada de Home D0/D1 ainda.
- Não tocar `memory-daily-insight` neste PR.
- Não tocar `generate-checkin-insight` neste PR.
- Não criar migration sem aprovação explícita.
- Não usar claims clínicos ou estudos nominais em qualquer texto voltado ao paciente.
- Não trocar Chat Completions por Responses API neste PR, a menos que a API atual bloqueie Structured Outputs e o plano peça aprovação.
- Não inserir PHI adicional no payload enviado à OpenAI.
- Não mexer no paywall.

---

## Antes de executar, RETORNE:

### A) Skills que vai utilizar

| Fase | Skill | Por quê |
|---|---|---|
| Planejamento | `supabase` | Edge Function, deploy e leitura da função remota |
| Planejamento | `openai-docs` | Confirmar API atual de Structured Outputs antes de mexer no request |
| Planejamento | `react-native-best-practices` | Cliente Expo/RN e validação no simulador |
| Implementação | `supabase-postgres-best-practices` | Persistência em `educational_insights` e leitura de JSONB |
| Implementação | `security-review` | Função com dado sensível de saúde e OpenAI |
| Validação | `react-native-devtools-mcp` + IDB se necessário | Screenshot real e validação visual |

### B) Plano de execução

1. **Criar branch a partir de main atualizado**: `feature/33-onboarding-insight-contract`. Checkpoint: working tree não mistura Prompt 35.
2. **Persistir plano aprovado** em `docs/superpowers/plans/2026-05-20-onboarding-insight-contract.md`. Checkpoint: arquivo existe antes de código.
3. **Baixar função remota** com MCP `get_edge_function`. Checkpoint: `supabase/functions/generate-onboarding-insight/index.ts` criado a partir da v4 remota.
4. **Confirmar docs atuais** OpenAI Structured Outputs e Supabase Edge Function auth. Checkpoint: plano decide `json_schema` e `verify_jwt`.
5. **Editar Edge Function**: contrato v2, prompt seguro, labels determinísticas, fallback, validação, persistência em `context.output`. Checkpoint: grep em código sem termos proibidos no prompt/output.
6. **Editar cliente mínimo**: tipos, caller, reader, hook e Result compatibility. Checkpoint: sem alteração visual final de Result/Home.
7. **Rodar validação estática**: `npm run type-check`, `npm run lint`, `deno check` se disponível. Checkpoint: sem erro novo.
8. **Deploy e teste autenticado**: usar MCP `deploy_edge_function` ou fluxo equivalente aprovado. Checkpoint: invoke retorna `schemaVersion='onboarding_insight_v2'`.
9. **Validar no app**: onboarding result renderiza sem estudos nominais. Checkpoint: screenshot real em `assets/screenshots/prompt33/`.
10. **Security review e PR**: PR com checklist, screenshot, outputs e nota de riscos. Checkpoint: PR aberto, não mergeado.

### C) Riscos identificados

| Risco | Mitigação |
|---|---|
| Função remota existe mas não está no repo | Materializar via `get_edge_function` antes de editar |
| `verify_jwt=true` pode alterar comportamento de auth | Testar invoke autenticado; se quebrar, parar e reportar antes do deploy final |
| Structured Outputs pode ser rejeitado pelo modelo/config atual | Testar request; se rejeitar, pedir aprovação para fallback JSON mode + validação |
| `context` já pode ser consumido como input puro | Grep por `educational_insights` e adaptar reader para `context.input` |
| Output de IA escapa guardrails | Validação server-side + fallback seguro |
| Prompt 33 virar redesign de UI | Travar escopo: só compatibility mínima de Result, Home fica para Prompt 32 |

### D) Arquivos que vai criar/editar

| Arquivo | Ação | Resumo |
|---|---|---|
| `supabase/functions/generate-onboarding-insight/index.ts` | criar/editar | Materializar função remota e aplicar contrato v2 seguro |
| `lib/supabase/queries/insights.ts` | editar | Tipos/caller/reader do onboarding insight estruturado |
| `hooks/useOnboardingInsight.ts` | editar | Ajustar retorno para contrato v2 |
| `app/(onboarding)/result.tsx` | editar | Compatibilidade mínima com `shortInsight` e `nextStep` |
| `docs/superpowers/plans/2026-05-20-onboarding-insight-contract.md` | criar | Plano aprovado persistido |
| `assets/screenshots/prompt33/01-result-ia-sem-estudos.png` | criar | Evidência visual real |

**Não tocar em:**

- `components/home/InsightCard.tsx`, salvo se type-check exigir ajuste mínimo
- `supabase/functions/memory-daily-insight/`
- `supabase/functions/generate-checkin-insight/`
- Qualquer migration
- Paywall

### E) Como vai validar

- [ ] `npm run type-check`
- [ ] `npm run lint`
- [ ] `deno check supabase/functions/generate-onboarding-insight/index.ts` se Deno disponível
- [ ] `rg -n "SURMOUNT|SURPASS|SUSTAIN|SELECT|trial|trials|literatura|estudo clínico" supabase/functions/generate-onboarding-insight lib/supabase/queries/insights.ts hooks/useOnboardingInsight.ts 'app/(onboarding)/result.tsx'` sem hits proibidos de runtime
- [ ] Invoke autenticado retorna `schemaVersion='onboarding_insight_v2'`
- [ ] SQL MCP confirma `educational_insights.context->'output'` com contrato v2
- [ ] Screenshot real do Result IA sem estudos nominais
- [ ] `get_js_logs` sem erro da Edge Function durante o fluxo
- [ ] `security-review`: sem PHI extra para OpenAI, sem service role no cliente, auth validada
- [ ] `/impeccable critique` NÃO é obrigatório aqui porque não há redesign final; se houver mudança visual além de compatibility, rodar critique

### F) Otimização de tokens

- Usar `rg`/`rtk grep` para localizar consumidores de `educational_insights`, `callGenerateOnboardingInsight` e `generate-onboarding-insight`.
- Usar MCP `get_edge_function` para recuperar a função remota em vez de tentar reconstruir por memória.
- Arquivos pequenos podem ser lidos direto.

---

## Referências oficiais que o executor deve verificar

- OpenAI Structured Outputs: `response_format: { type: 'json_schema', json_schema: ... }` é preferível a JSON mode quando suportado.
- Supabase Edge Functions auth: funções chamadas pelo client com user JWT devem preferir `verify_jwt=true`; funções sem JWT/webhooks são exceção.
- Supabase deploy: configuração de função e `verify_jwt` devem ficar consistentes no deploy.

---

## Pós-PR

Atualizar `docs/learnings.md` com aprendizado novo:

```md
#53 — 2026-05-20 — Insight de onboarding precisa de contrato estruturado, não texto livre.
Result IA e Home consomem a mesma verdade. A Edge Function deve retornar campos determinísticos
para dados do usuário e campos curtos de IA validados por guardrails. Estudos clínicos nominais,
porcentagens populacionais e claims terapêuticos não entram em output ao paciente. Persistir o
output em `educational_insights.context.output` permite Home D0/D1 reutilizar o insight sem
depender de cache de tela.
```

---

## ⏸️ Pause aqui e aguarde aprovação do Léo antes de executar.

---

**Fim do Prompt 33.**
