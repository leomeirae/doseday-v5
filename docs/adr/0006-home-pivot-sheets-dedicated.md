# ADR 0006 — Home v7 pivot: sheets dedicados, sem IA na captura, sem migration

**Data:** 2026-05-25
**Status:** Aceita
**Contexto do trabalho:** Prompt 37 — `feature/37-pivot-home-sheets-dedicated`
**Decisores:** Léo (PO), Claude Code

---

## Contexto

A Home v7 (mergeada via PRs #71–#74) tinha 3 botões "Quick Actions" fixos no topo — `Anotar dose`, `Anotar peso`, `Adicionar memória`. Cada um abria uma tela cheia (`presentation: 'modal'` do Expo Router) que ocupava todo o viewport, quebrando o contexto da "memória organizada do tratamento" que a Home apresenta logo abaixo.

Dois problemas estratégicos justificaram o pivot:

1. **Chips engessados causaram baixo preenchimento na V4** (App Store reviews da V4 referenciados em `docs/learnings.md` #43).
2. **Tela cheia push-screen quebra o contexto da memória.** A âncora visual da Home é "seu tratamento está organizado até aqui" (`HOME_DESIGN_DIRECTION.md` §1). Sair em modal full-screen recomeça o contexto a cada registro.

---

## Decisão

Pivotar a Home para **blocos interativos com sheets dedicados**:

1. Remover a linha de Quick Actions do topo.
2. Adicionar `+` discreto no header de cada bloco interativo (`PRÓXIMA DOSE`, `PESO`, `NOTAS RECENTES`, `SINTOMAS`, `CUSTOS REGISTRADOS`).
3. Tap no `+` abre um **iOS Form Sheet** com detents — sheet sobe pela metade da tela, mantém o dashboard visível atrás, fecha por swipe-down ou `X`.
4. Tap no body do bloco continua navegando pra detalhe quando aplicável (`PRÓXIMA DOSE` body → `/perfil/protocolo`; `PESO` body → `/peso/historico`).
5. **Captura permanece convencional e estruturada — zero IA.** IA fica reservada exclusivamente pro Resumo Pro futuro (§6 + §15 `PRODUCT_COHERENCE.md`).
6. Vocabulário público alinha com decisões §6: "Notas" substitui "memória" como label de UI; "Sintomas" substitui "Observações" no header da Home.

---

## Decisões secundárias tomadas durante o planejamento

### D1 — Schema mismatch resolvido sem migration (Caminho B)

Durante verificação via Supabase MCP, descobriu-se que o prompt 37 assumia colunas que **não existem** no banco:

| Tabela | Prompt assumiu | Schema real |
|---|---|---|
| `symptom_logs` | `raw_text` text + `intensity: null` | sem `raw_text`. `intensity` é `int NOT NULL` |
| `purchases` | `amount` + `description` + `purchased_at` | `price numeric NOT NULL` + `notes text` + `purchase_date date NOT NULL` + `quantity int NOT NULL` |

**Opção A (rejeitada):** adicionar colunas via `apply_migration`. Custo: +1h, migration nova em prod, cria colunas duplicadas (`notes` ≈ `raw_text`, `price` ≈ `amount`). Anti-pirraça regra 14.21 + Aprendizado 46 alertam contra schema crescer sem necessidade.

**Opção B (aceita):** adaptar hooks ao schema existente. Mapping JS-side:

- `useRegisterSymptom` insere em `symptom_logs` com `symptom_type = extractSymptomType(rawText)` + `intensity = extractIntensity(rawText)` (default 2 se sem keyword) + `notes = rawText` (texto bruto preservado) + `symptom_date = hoje` + `context = { schema_version: 1, source: 'free_text_v1' }`.
- `useRegisterCost` insere em `purchases` com `price` + `notes = description` + `purchase_date` + `quantity: 1` + defaults `unit='caneta'` e `category='medication'`.

`context.source = 'free_text_v1'` marca a origem da linha pra uma futura migração caso queiramos colunas dedicadas — sem comprometer schema agora.

### D2 — Regex extractor PT-BR em vez de classificador IA

`extractSymptomType` é função pura com 8 patterns regex (`nausea`, `headache`, `heartburn`, `fatigue`, `diarrhea`, `constipation`, `injection_pain`, `vomiting`). Quando nenhum pattern bate, retorna `'other'` — a linha ainda persiste, com o texto livre preservado em `notes`.

`extractIntensity` opera no mesmo texto: detecta "forte/severo/intenso" → 3, "leve/fraco" → 1, "moderado" → 2, ou default 2 se nenhuma keyword aparece. Satisfaz o `NOT NULL` da coluna sem forçar chip de intensidade no UI.

Testes unitários cobrem 20+ frases reais em `lib/symptoms/__tests__/extractType.test.ts`, seguindo o padrão de `lib/utils/__tests__/formatMedicationName.test.ts`.

### D3 — Detents mix por sheet

| Sheet | `sheetAllowedDetents` |
|---|---|
| Dose (`/dose/registrar`) | `'fitToContents'` |
| Peso (`/peso/registrar`) | `'fitToContents'` |
| Sintoma (`/diario/anotar-sintoma`) | `[0.5, 1.0]` |
| Notas (`/diario/anotar-memoria`) | `[0.5, 1.0]` |
| Custo (`/diario/anotar-custo`) | `[0.5, 1.0]` |

Dose e Peso são forms compactos (um número + datetime) — `fitToContents` ajusta o sheet ao mínimo necessário. Sintoma, Notas e Custo têm textarea + (no caso de Sintoma) chips Frequentes — `[0.5, 1.0]` permite usuário arrastar pra cima quando precisa de mais espaço.

API descoberta via WebFetch dos docs do Expo Router 6.x: `sheetAllowedDetents` aceita array de fractions `[0..1]` ou `'fitToContents'` — **não** aceita strings semânticas (`'medium'`/`'large'`).

---

## Restrições mantidas (NÃO TOCADAS neste PR)

- `useRegisterMemoryNote` (PR #73) — hook intacto, Sheet 4 reutiliza
- `useRegisterQuickLog` (legado) — sintomas via novo `useRegisterSymptom`
- `quickLogSchema`, `QUICK_LOG_TYPES` — schemas legados intocados
- `components/diario/QuickLogChips.tsx` — chips legados intocados
- `app/diario/quick-log.tsx` — Redirect guard mantido (`type=other` → `/diario/anotar-memoria`)
- Tab bar atual — sai em PR futuro com Settings hub (`SETTINGS_DESIGN_DIRECTION`)
- Bloco "PARA A CONSULTA" — read-only mantido, Sheet dedicado é PR separado
- Schema Supabase — zero `apply_migration` neste PR

---

## RLS verificada antes da decisão

Via Supabase MCP:

- `symptom_logs`: 1 policy `ALL` "Users can manage own symptom logs" com `auth.uid() = user_id` em USING + WITH CHECK. ✓ PHI seguro para INSERT.
- `purchases`: 4 policies separadas (SELECT/INSERT/UPDATE/DELETE) com mesmo predicate `user_id = auth.uid()`. ✓ PHI seguro para INSERT.

`raw_text` (em `symptom_logs.notes`) e `description` (em `purchases.notes`) contêm PHI. Ambas tabelas cobrem com RLS — `security-review` passa neste eixo.

---

## Trade-offs aceitos

- **`context.schema_version=1`** (default do jsonb) é merged com `context.source='free_text_v1'` no insert. Não há conflito porque `context` é um objeto livre — ambos campos coexistem.
- **`intensity=2` default** quando sem keyword no texto é semanticamente "moderado" — não 100% fiel ao usuário que digitou "náusea hoje" sem qualificador. Aceitável porque (a) o texto bruto fica em `notes`, (b) a Home v7 não exibe intensidade hoje, (c) o relatório futuro pode reinterpretar a partir de `notes` se quiser.
- **Bloco PARA A CONSULTA** sem `+` cria inconsistência visual (todos os outros têm). Aceita porque o sheet dedicado a `consultation_notes` é PR futuro separado — não há hook nem rota pronta hoje.

---

## Próximos passos (fora deste PR)

1. PR para sheet dedicado de `PARA A CONSULTA` (consultation_notes).
2. PR para Settings hub (`SETTINGS_DESIGN_DIRECTION`) que substitui tab bar atual.
3. Possível migration futura de `symptom_logs` adicionando coluna `raw_text` dedicada, caso o produto evolua pra distinguir captura livre vs estruturada — neste caso a migration filtra rows pelo `context.source='free_text_v1'` para popular a coluna.
4. Refinamento dos regex patterns em `extractType.ts` conforme amostra real do usuário (acurácia atual estimada ≥95% em 20 frases-teste; iterar com dados de produção).
