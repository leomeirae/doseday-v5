# P0 Contencao — Edge Functions IA orfas + texto proibido em prod

**Data:** 2026-05-22 (revisado pos-recuperacao de source)
**Status:** Frente 1 executada localmente em 2026-05-23. PR prepara contencao, mas **nenhum deploy Supabase foi executado**.
**Origem:** auditoria Supabase SELECT-only + `get_edge_function` em 2026-05-22; documentado em `docs/PRODUCT_COHERENCE.md` §3 + §13.2 + §13.3 + §6 (decisao fechada sobre tese de credibilidade).
**Gate:** este plano interrompe o standby pre-Fase 2 da Regra de Foco #64 — `CLAUDE.md` Regra 11 (security-review obrigatorio para PHI) + decisao de produto §6 (pivotar tese de credibilidade clinica) prevalecem.

---

## 1. Fatos confirmados (revisados 2026-05-22)

| Fato | Evidencia | Reclassificacao |
|---|---|---|
| `generate-checkin-insight` v4 tem `verify_jwt=false` no gateway | `list_edge_functions` 2026-05-22 | **P1 config** (nao P0 security): auth manual em codigo retorna 401 sem Bearer; nao e endpoint publico real |
| `generate-checkin-insight` system prompt EXIGE citar trials por nome (REGRA DE OURO 6) | Source recuperado via `get_edge_function`, snapshot em `docs/handoff/edge-functions-snapshot-2026-05-22/` | **P0 compliance** (mantido): nao e gap esquecido; e tese de produto antiga ("credibilidade = citar trial") que viola ANVISA + App Store. **Conserto e decisao de produto, nao patch de regex.** |
| `validateNumericClaims()` REJEITA outputs sem trial associado | Snapshot linha `numericNearTrial` regex | Reforca P0 compliance: o codigo FORCA a tese a aparecer no output |
| `generate-checkin-insight` gerou SURPASS em `educational_insights` HOJE | rows 2026-05-22 14:40 e 16:45 UTC | Continua P0 — geracao viva continua enquanto v4 estiver no ar |
| `memory-daily-insight` v4 tem prompt `[PLACEHOLDER — sera preenchido pelo PO]` literal | Source recuperado | **P1 qualidade + rastreabilidade**: roda contra `gpt-5-nano` em prod sem saida controlada |
| `memory-summary` v2 mesma situacao (prompt placeholder) + sem caller identificado | Source recuperado + `grep` em client local | **P1 rastreabilidade + custo** |
| 3 EFs ativas em prod sem source versionado em `supabase/functions/` | `ls supabase/functions/` vs `list_edge_functions` | **Source RECUPERADO** em 2026-05-22 (Opcao 3 abaixo: concluida). NAO promovido. |
| 5 rows com termos proibidos em `educational_insights` | Query SELECT (§13.2 do PRODUCT_COHERENCE) | P0a-cleanup ainda valido, mas gated pelas opcoes de contencao primaria |
| `medication_applications.days_until_next_dose` = `integer NOT NULL DEFAULT 7` | `information_schema.columns` | Fora do escopo deste plano (vai pra P1 da §12) |
| **Decisao de produto fechada (§6 PRODUCT_COHERENCE):** abandonar tese "credibilidade clinica = citar trials por nome" | Decisao do Leo 2026-05-22 | **Pre-requisito para Opcao 4 — sem isso, hardenizar e tatear no escuro** |

---

## 2. Classificacao de risco (revisada)

| Risco | Severidade revisada | Janela de exposicao |
|---|---|---|
| Output `SURPASS`/`SURMOUNT` visivel ao usuario | **P0 compliance/legal** (ANVISA RDC 96/2008, App Store 1.4.1) | Desde 2026-04-24 ate hoje (rows de `onboarding`); desde quando `generate-checkin-insight` v4 foi deployada (rows de `first_checkin`). **Causa raiz: tese de produto, nao gap tecnico.** |
| `generate-checkin-insight` sem `verify_jwt` no gateway | **P1 config nao-padrao** | Permanente ate padronizacao. **Reduzido de P0:** o codigo nao expoe endpoint publico real (auth manual retorna 401). |
| 3 EFs com source nao versionado em `supabase/functions/` | **P1 audit/processo** | Source ja foi recuperado em snapshot. Decisao de promover gated por Opcao 4 (que por sua vez depende da tese §6). |
| `memory-daily-insight` + `memory-summary` rodam com prompt `[PLACEHOLDER]` em prod | **P1 qualidade + custo OpenAI** | Permanente ate decisao de produto sobre o que essas EFs devem dizer. |
| `memory-summary` ativa sem caller mapeado | **Alto** | Desconhecido — pode estar sendo invocada por scheduler externo. Investigar via logs Supabase. |

---

## 3. Cinco opcoes de contencao (revisadas)

### Atualizacao 2026-05-23 — Frente 1 local

O source local agora contem uma contencao deterministica, sem chamada OpenAI, para as funcoes paciente-facing em risco:

| Item | Status local | Status producao |
|---|---|---|
| `app/diario/checkin.tsx` | caller pos-check-in removido; check-in salva, confirma e volta | entra no app apos merge/release |
| `lib/supabase/queries/insights.ts` | `callGenerateCheckinInsight`, `callMemoryDailyInsight` e `getLatestEducationalInsight(first_checkin)` retornam fallback local seguro | entra no app apos merge/release |
| `supabase/functions/generate-checkin-insight` | versionada como contencao sem OpenAI | v4 antiga continua ate deploy explicito |
| `supabase/functions/memory-daily-insight` | versionada como contencao sem OpenAI | v4 antiga continua ate deploy explicito |
| `supabase/functions/memory-summary` | versionada como contencao sem OpenAI | v2 antiga continua ate deploy explicito |
| `supabase/functions/generate-insights` | convertida para contencao sem OpenAI | v27 antiga continua ate deploy explicito |
| `supabase/functions/generate-report` | convertida para contencao sem OpenAI | v48 antiga continua ate deploy explicito |

Esta frente fecha o risco no source local e prepara PR auditavel. Ela **nao limpa rows em producao** e **nao altera nenhuma funcao deployada**.

Cada opcao com objetivo, pre-requisito, risco operacional, custo de UX e como reverter. **Nenhuma autorizada por este documento.** Aprovacao item-a-item pelo Leo.

### Opcao 1 — Padronizar `verify_jwt=true` no gateway de `generate-checkin-insight`

**Objetivo:** alinhar config ao ADR 0003. **NAO fecha o P0 compliance** — apenas remove a config nao-padrao.

**Pre-requisito:** confirmar via leitura do source recuperado que todas as chamadas client-side ja enviam Bearer (confirmado: `lib/supabase/queries/insights.ts:37` usa `supabase.functions.invoke` que envia JWT automaticamente).

**Como executar (quando autorizado):** Supabase MCP — `deploy_edge_function` com mesmo source do snapshot + flag `verify_jwt=true`. **Importante:** so executar depois de decidir Opcao 4 — nao faz sentido redeployar com tese antiga se a proxima versao vai reescrever tudo.

**Risco operacional:** baixo. Apenas adiciona uma camada de validacao no gateway, ja coberta pelo codigo.

**Custo de UX:** zero pra usuario logado.

**Reversao:** redeploy v4 anterior (Supabase mantem historico).

**Severidade:** reduzida de P0 security para **P1 config** apos o achado de auth manual. Pode rodar junto da Opcao 4.

---

### Opcao 2 — Contencao funcional: desabilitar chamada client-side ate haver versao reescrita

**Objetivo:** parar a geracao viva de output proibido AGORA, sem precisar deployar prod. Usuario nao recebe mais `CheckinInsightView` apos primeiro check-in.

**Como executar (quando autorizado):**
- Em `app/diario/checkin.tsx:60-117`, encapsular `tryGenerateFirstCheckinInsight` em flag (env var ou remote config) que esteja OFF em prod.
- Caller ja tem catch silencioso (linha 109-116): se a chamada nao acontece ou falha, fluxo continua com `showSuccessToast + router.back()`.

**Risco operacional:** baixo. Comportamento de fallback ja existe e funciona.

**Custo de UX:** **regressao de feature**. Usuario nao ve mais o insight pos-primeiro-check-in. Pequena perda de wow inicial, mas consistente com a decisao §6 (substituir tese atual por outra).

**Reversao:** revert do commit, ou flip da flag.

**Vantagem combinatoria:** elimina geracao viva de novas rows com SURPASS **sem precisar tocar prod** nem redeployar. Funciona como cinto + suspensorio enquanto a reescrita (Opcao 4) nao fica pronta.

---

### Opcao 3 — Recuperar source local das 3 EFs **(CONCLUIDA em 2026-05-22)**

**Objetivo:** trazer `generate-checkin-insight` v4, `memory-daily-insight` v4 e `memory-summary` v2 pra inspecao local.

**Status:** ✅ **Concluida** via `mcp__d87070e9-a701-45ce-adf7-f2daa0b7df32__get_edge_function` em modo read-only.

**Localizacao do snapshot:** `docs/handoff/edge-functions-snapshot-2026-05-22/` (untracked, NAO em `supabase/functions/`).

**O que NAO foi feito:**
- Snapshot **nao foi promovido** para `supabase/functions/`. Promocao gated em Opcao 4 (precisa decidir tese §6 antes — promover source antigo seria endossar a tese que vamos abandonar).
- Nenhum source foi alterado.
- Nenhum deploy executado.

**Aprendizado:** revelou que SURPASS no output e design intencional documentado no source, nao falha esquecida de hardening. Reorientou Opcao 4 inteira.

---

### Opcao 4 — Reescrita orientada por decisao de produto §6 (substituiu "hardening")

**Objetivo:** reescrever `generate-checkin-insight` (e prompts de `memory-daily-insight` + `memory-summary`) a partir da decisao §6 do PRODUCT_COHERENCE (pivotar de "citar trials" para "traducao clinica em linguagem do paciente"). **Nao e patch de regex; e reescrita de produto + contrato.**

**Pre-requisitos (em ordem):**

1. **Decisao §6 ja fechada** (2026-05-22): tese antiga descartada.
2. **Definir novo system prompt** alinhado a §6 + §11 (regras de IA). Inputs:
   - tom: educacional sem coach/motivacional (§11.1)
   - linguagem: paciente comum, sem jargao
   - referencias: zero nomes de trials/estudos/marcas. Pode descrever evidencia qualitativamente ("muitos pacientes em estudos clinicos relatam que..."), nunca "trials SURPASS reportam..."
   - claims numericos: se aparecerem, descricao qualitativa ou faixas amplas; **proibir numeros especificos atribuidos a nada**
   - disclaimer fixo (mantido)
3. **Definir contrato Zod com `schemaVersion`** (paridade com `generate-onboarding-insight` v9). Versionar como `checkin_insight_v2` para coexistencia.
4. **Definir blacklist invertida:** lista de termos PROIBIDOS no output (SURMOUNT, SURPASS, STEP, SUSTAIN, SELECT, trial, clinical trial, estudo clinico, ensaio, paper, literatura — alem dos termos ja em `FORBIDDEN_PHRASES` no source atual).
5. **Definir `validateNumericClaims` invertido:** se houver numero no output, exigir descricao qualitativa OU rejeitar (oposto do atual que exige trial associado).
6. **Definir teste de regressao:** smoke test com input `mood='mal' + sintomas` para confirmar que (a) output reconhece input recente; (b) zero referencia a trial; (c) tom nao-coach.
7. **`security-review` skill obrigatoria** antes do deploy.

**Como executar (quando autorizado e quando os 7 pre-requisitos estiverem fechados):**
- Promover snapshot (Opcao 3) para `supabase/functions/generate-checkin-insight/` **com source ja modificado** (nao com a v4 que cita trials).
- Aplicar mesma reescrita em `memory-daily-insight` e `memory-summary` (modo `full`) — substituir `[PLACEHOLDER]` por prompts definidos pelo PO.
- Deploy via `deploy_edge_function` com `verify_jwt=true` (incorpora Opcao 1 automaticamente).
- Validar smoke test com query SELECT em `educational_insights` confirmando que novas rows nao contem termos proibidos.

**Risco operacional:** medio-alto. Mudanca em 3 EFs simultaneamente. Mitigacao: Zod + `schemaVersion` + fallback estatico se output invalido; cliente ja resiliente a erros (catch silencioso); deploy uma EF por vez se preferir.

**Custo de UX:** texto fica menos "cientifico-aparente" mas mais legitimo e seguro. Aceitavel — e justamente a decisao §6.

**Reversao:** versioning automatico do Supabase Functions.

---

### Opcao 5 — Dados: plano separado de cleanup das 5 rows ja criadas

**Objetivo:** remover ou sanitizar rows existentes em `educational_insights` com termos proibidos. **Executar apenas depois da contencao primaria** (Opcao 2 ou 4) — limpar antes da torneira fechada deixa o app gerar novas rows na mesma situacao.

**Como executar (quando autorizado):**
- Sub-opcao 5a — **DELETE** das 5 rows. Risco: remove memoria que ja foi mostrada ao usuario.
- Sub-opcao 5b — **UPDATE** dos campos `body` e `headline` removendo as referencias (manter row, sanitizar texto). Preserva timestamp e contexto, remove violacao.
- Sub-opcao 5c — **Soft delete** via flag `deleted_at` (se a coluna existir — confirmar antes).

**Pre-requisito obrigatorio:**
- Snapshot/backup das 5 rows antes de qualquer operacao (export JSON via SELECT).
- Plano com criterio de selecao explicito (IDs literais, nao regex em prod).
- `security-review` previo.
- Confirmacao final do Leo apos backup.

**Risco operacional:** alto se executado sem backup. Baixo com backup.

**Custo de UX:** usuario que voltar aos historicos vai notar texto diferente (5b) ou ausente (5a). Aceitavel.

**Reversao:** restore do backup JSON via INSERT manual.

---

## 4. Ordem recomendada de execucao (revisada)

Quando autorizado, executar nesta ordem:

| Sequencia | Acao | Status | Por que nessa ordem |
|---|---|---|---|
| 1 | **Opcao 3** (recuperar source local) | ✅ **Concluida 2026-05-22** | Pre-requisito de tudo o mais. Read-only. Sem risco. |
| 2 | **Decisao §6 (tese de credibilidade)** | ✅ **Concluida 2026-05-22** | Pre-requisito de Opcao 4. Sem decisao de produto, hardening tatearia no escuro. |
| 3 | **Opcao 2** (desabilitar caller client-side) | ✅ Preparada localmente em 2026-05-23 | Para a torneira no app novo sem precisar mexer em prod. Reversivel rapido. |
| 4 | **Opcao 4** (contencao local das EFs) + **Opcao 1** (verify_jwt) ainda pendente | ✅ Source de contencao preparado localmente; ⏸ deploy pendente | Substitui geracao insegura por resposta sem OpenAI quando deploy for autorizado. |
| 5 | **Opcao 5** (cleanup rows) | ⏸ Aguarda — gated pela contencao primaria | Apenas com torneira fechada. Plano + backup + aprovacao por item. |
| 6 | **Investigar caller de `memory-summary`** (logs Supabase read-only) | ⏸ Aguarda autorizacao | Pode rodar em paralelo a 3-5. Define se essa EF e desativada ou mantida. |

---

## 5. O que NAO fazer

- Nao promover snapshot para `supabase/functions/` sem decisao de Opcao 4 (promover source com SURPASS na regra de ouro seria endossar a tese que vamos abandonar).
- Nao executar nenhuma das 5 opcoes sem autorizacao especifica do Leo por item.
- Nao deletar rows ainda.
- Nao deployar EF ainda.
- Nao alterar `verify_jwt` ainda.
- Nao alterar codigo cliente fora do escopo de caller/contencao.
- Nao tentar "consertar tudo de uma vez" — sequencia importa pra reversibilidade.
- Nao confiar em hipotese — qualquer divergencia entre source baixado e v4 em prod deve pausar o processo (o atual confere com sha256, mas validar a cada interacao futura).

---

## 6. Quem decide o que

| Decisao | Quem |
|---|---|
| Validar redacao do novo system prompt da Opcao 4 | Leo (PO) — alinhar com §6 |
| Aprovar Opcao 2 (desabilitar caller) | Leo — exige PR + revisao do diff |
| Aprovar Opcao 4 (reescrita + deploy) | Leo + `security-review` |
| Aprovar Opcao 5 (cleanup dados) | Leo + plano separado + backup pre-aprovado |
| Investigar caller de `memory-summary` | Cowork (read-only via Supabase MCP logs) — autorizar separadamente |
| Promover snapshot para `supabase/functions/` (PR de IaC) | Leo — apos Opcao 4 redefinir o source desejado |

---

## 7. Proximas pendencias apos contencao

Quando os 5 itens acima estiverem fechados:

- Atualizar `docs/learnings.md` com Aprendizado novo sobre "EFs nao versionadas geram divida silenciosa" + "tese de produto deve preceder hardening tecnico — caso contrario, hardening reforca tese errada".
- Atualizar `CLAUDE.md` se for justificavel uma Regra 31 sobre paridade obrigatoria entre Edge Functions deployadas e source local.
- Decidir destino de `memory-summary` apos logs Supabase read-only: manter com novo contrato ou desativar.
- Decidir contrato futuro de memoria Pro antes de reativar qualquer OpenAI recorrente.
- Autorizar ou rejeitar deploy das funcoes de contencao preparadas na Frente 1.

---

**Fim do plano. Aguardando autorizacao item-a-item.**
