# Plano — Editor de medicação + dose + frequência (protocolo-01-MID)

**Data:** 2026-06-01
**Branch:** `feature/protocolo-01-editor-medicacao-dose` (base `origin/main` = `6dee03f`)
**Aprovado por:** Léo (sessão 2026-06-01) — 4 perguntas respondidas (abaixo)
**Prompt:** `docs/prompts/protocolo-01-MID-editor-medicacao-dose.md`

## Problema

Pós-onboarding não existe forma de definir/trocar medicação nem dose:
- `app/configuracoes/tratamento.tsx:62-69` — linha "Medicamento atual" morta (`chevron={false}`, sem onPress)
- `app/perfil/protocolo.tsx` — só edita `dose_frequency_days`
- **2º beco:** `app/dose/registrar.tsx:152` — sem medicação, link aponta pra `/(tabs)/perfil` (que leva à linha morta) e o submit fica desabilitado (L253)

Usuário `planning` (medicação null) fica em beco sem saída. Escalonamento de dose (2,5→5→7,5) impossível.

## Decisões aprovadas pelo Léo

| # | Pergunta | Decisão |
|---|---|---|
| 1 | Frequência vazia pode salvar? | **SIM** — vazio = `null` (necessário pro fix do planning; `getDoseSummary` já trata null) |
| 2 | Título da tela | **"Medicação e protocolo"** |
| 3 | Trocar link do dose/registrar L152 | **SIM** — `/perfil/protocolo` (mata o 2º beco) |
| 4 | Ordem vs onboarding-03 | **Editor vai ANTES** (dose nullable aqui é forward-compatible) |

## Design do editor (estender `/perfil/protocolo`)

3 seções + 1 botão Salvar (mutation única):

| Seção | UI | Regra |
|---|---|---|
| Medicamento | 5 `SelectionCard` (reuso), labels de `onboarding:medication.options.*` | Pré-seleciona atual; null = nada selecionado |
| Dose | `NumericInput` (reuso) + chips `COMMON_DOSES[medicação]` (export compartilhado) | Vazio = `null`; preenchida: positiva ≤ 20 mg. Validação local, NÃO reusa `doseSchema` |
| Intervalo entre aplicações | Chips 1/7/10/14 + input livre (existente) | 1-90 OU vazio = `null` |

**Copy da dose por status:** `planning`/`starting` → "Dose inicial"; `ongoing`/`restart` → "Dose atual". Nunca "dose recomendada".

**Semântica:** editar dose = prefill + display apenas. Histórico (`medication_applications`) é snapshot — não muda. Próxima dose não depende de `current_dose`.

## Mutation

Estender `useUpdateDoseProtocol` (único consumidor: protocolo.tsx):
```
input: { currentMedication: OnboardingMedication | null, currentDose: number | null, doseFrequencyDays: number | null }
→ update current_medication, current_dose, dose_frequency_days, dose_frequency_source
→ optimistic update + invalida ['profile'] e ['doseSummary']
```
`isDirty` considera os 3 campos.

## Reações em cadeia (preservar)

- **Frequência muda** → invalida `['doseSummary']` → `getDoseSummary` recalcula → `useScheduleDoseNotifications` (`_layout.tsx:27`) reagenda notificação. Cadeia já existe.
- **Medicação/dose muda** → invalida `['profile']` → autofill registrar dose + gating + EmptyDoseStateCard + display Configurações.
- **Insight IA** → não toca (exclusivo do onboarding).

## Arquivos

| Arquivo | Mudança |
|---|---|
| `app/perfil/protocolo.tsx` | + seções Medicamento e Dose, título "Medicação e protocolo", save unificado |
| `hooks/useUpdateProfile.ts` | Estender input + mutationFn de `useUpdateDoseProtocol` |
| `app/configuracoes/tratamento.tsx` | Linha "Medicamento atual" clicável → `/perfil/protocolo` |
| `app/dose/registrar.tsx` | Link L152 → `/perfil/protocolo` |
| `lib/types/onboarding.ts` | Export `COMMON_DOSES` |
| `app/(onboarding)/dose.tsx` | Importar `COMMON_DOSES` compartilhado (sem mudança de comportamento) |

**Sem:** schema novo, migration, edge, contrato IA, paywall, auth, locale en/es.

## Higiene git (instrução do Léo)

- Base limpa de `origin/main` (feito: reset --hard, branch nova).
- `git add` SÓ por path explícito dos arquivos do plano.
- NÃO stagear: nenhum arquivo " 2.", `graphify-out/`, `.codegraph/`.
- `git status --short` 2× antes do commit, reportar "git status validado, zero contaminação".

## QA (PARAR e mostrar pro Léo antes do PR)

1. `npx tsc --noEmit` + lint
2. **Beco resolvido:** conta sem medicação → Configurações → Tratamento → "Medicamento atual" → Mounjaro, dose vazia → salvar → linha mostra "Mounjaro" → registrar dose desbloqueado
3. **Escalonamento:** dose 5 → 7,5 → salvar → registrar dose pré-preenche 7,5 → histórico intacto
4. **Frequência:** conta com ≥1 dose registrada → 7→10 dias → próxima dose recalcula + notificação reagenda
5. **Regressão:** fluxo antigo só-frequência funciona
6. Screenshots reais (toggle de QA reversível se precisar de estado gated, reportando antes/depois)

## Riscos

| Risco | Mitigação |
|---|---|
| Quebrar save de frequência | Estender (não substituir) mutation; QA de regressão |
| Notificação não reagendar | Cadeia preservada; QA com conta com dose registrada |
| Divergir do onboarding-03 | Dose vazia=null é compatível com qualquer decisão de lá |
| Contaminação git | Staging explícito por path, status 2× |
