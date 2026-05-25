# Plano — Pivot Home v7 → Sheets Dedicados (Prompt 37)

**Data:** 2026-05-25
**Branch a criar:** `feature/37-pivot-home-sheets-dedicated`
**Repo:** dose-day-v5 (`main` em `f47b2ed` após PR #74)
**Autor:** Claude Code · DoseDay V5
**Status:** aguardando aprovação Léo nas decisões D1 + D2

---

## 1. Contexto — por que esta mudança

A Home v7 atual (mergeada via PRs #71–#74) tem **3 botões "Quick Actions"** fixos no topo: `Anotar dose`, `Anotar peso`, `Adicionar memória`. Cada um abre uma tela cheia (`presentation: 'modal'`) que ocupa todo o viewport, quebrando o contexto da "memória do tratamento" que a Home apresenta logo abaixo.

Dois problemas estratégicos justificam o pivot agora:

| Problema | Evidência |
|---|---|
| **Chips engessados causaram baixo preenchimento na V4** | App Store reviews da v4 (referenciados em `docs/learnings.md` #43) |
| **Tela cheia push-screen quebra o contexto da memória** | A âncora visual da Home é "seu tratamento está organizado até aqui" (`docs/HOME_DESIGN_DIRECTION.md` §1). Sair em modal full-screen recomeça o contexto a cada registro |

**Solução:** trocar os 3 botões topo por **`+` discreto no header de cada bloco interativo** (Próxima dose, Peso, Sintomas, Notas recentes, Custos registrados). Cada `+` abre um **iOS Form Sheet** com detents — sheet sobe pela metade da tela, mantém o dashboard visível atrás, fecha por swipe-down. Body do bloco continua navegando pra detalhe (`/perfil/protocolo`, `/peso/historico`) quando aplicável.

A captura permanece **convencional e estruturada** — zero IA. IA fica reservada exclusivamente pro Resumo Pro futuro (decisão §6 + §15 `PRODUCT_COHERENCE.md`).

**Outcome esperado:** Home dá entrada de dado sem quebrar contexto, vocabulário público alinha com decisões §6 (Notas substitui "memória" como label; Sintomas substitui "Observações"), e a UX prepara terreno pra hub de Configurações (PR futuro `SETTINGS_DESIGN_DIRECTION`).

---

## 2. Decisões pendentes — aguardando Léo

### D1 — Schema mismatch (descoberto via Supabase MCP)

O prompt 37 assumiu colunas que **não existem** no banco. Verificação concreta:

| Tabela | Prompt assumiu | Schema real |
|---|---|---|
| `symptom_logs` | `raw_text` text + `intensity: null` | sem `raw_text`. `intensity` é `int NOT NULL` |
| `purchases` | `amount` + `description` + `purchased_at` | `price numeric NOT NULL` + `notes text` + `purchase_date date NOT NULL` + `quantity int NOT NULL` + `unit varchar default 'caneta'` |

| Opção | Custo | Risco | Veredito |
|---|---|---|---|
| **A. Migration nova** — adicionar colunas `raw_text`, `amount`, `description`, `purchased_at` | +1h, requer `apply_migration` em prod | Cria colunas duplicadas (`notes` ≈ `raw_text`, `price` ≈ `amount`). Anti-pirraça regra 14.21 + Aprendizado 46 alertam contra schema crescer sem necessidade | **NÃO recomendo** |
| **B. Adaptar hooks ao schema existente** | 0 migration, 100% código novo na camada JS | `intensity` é `NOT NULL` — usar regex secundário pra extrair "leve/moderado/forte" com default 2 (moderado). `context.source = 'free_text_v1'` marca origem pra futura migração se quisermos | **RECOMENDO** |

**RLS verificada:** `symptom_logs` tem 1 policy `ALL` (`auth.uid()=user_id` USING + WITH CHECK) e `purchases` tem 4 policies separadas com mesmo predicate. PHI seguro em ambas para INSERT autenticado.

### D2 — Caminho de merge

| Opção | Quando faz sentido |
|---|---|
| **A. Cowork mergeia direto via MCP após Claude Code abrir o PR** | PR pequeno, baixo risco visual |
| **B. Léo revisa visualmente cada sheet no simulador antes do merge** | PR grande com mudança de UX (este caso) |

**Prompt original recomenda B.** Concordo — PR mexe em 5 sheets + Home + docs. Léo deve ver cada sheet renderizado no iPhone 17 simulator antes de merge.

---

## 3. Arquitetura recomendada (Caminho B + B)

### 3.1 Pivot da Home v7

```
ANTES (HomeV7Content.tsx atual)
┌────────────────────────────────────────┐
│ "Seu tratamento está organizado..."    │
│ data atual                             │
├────────────────────────────────────────┤
│ [Anotar dose] [Anotar peso] [+memória] │ ← REMOVER
├────────────────────────────────────────┤
│ PRÓXIMA DOSE                           │
│   valor + helper                       │
│                                        │
│ PESO                                   │
│   48pt valor + sparkline               │
│                                        │
│ MEMÓRIA RECENTE          ← rename      │
│   timeline                             │
│                                        │
│ OBSERVAÇÕES              ← rename      │
│   símptoma recente                     │
│                                        │
│ PARA A CONSULTA                        │
│ CUSTOS REGISTRADOS                     │
└────────────────────────────────────────┘

DEPOIS
┌────────────────────────────────────────┐
│ "Seu tratamento está organizado..."    │
│ data atual                             │
├────────────────────────────────────────┤
│ PRÓXIMA DOSE                       [+] │ ← + abre sheet Dose
│   body navega → /perfil/protocolo      │
│                                        │
│ PESO                               [+] │ ← + abre sheet Peso
│   body navega → /peso/historico        │
│                                        │
│ NOTAS RECENTES                     [+] │ ← + abre sheet Notas
│   read-only timeline                   │
│                                        │
│ SINTOMAS                           [+] │ ← + abre sheet Sintoma
│   read-only observação recente         │
│                                        │
│ PARA A CONSULTA                        │ ← intocado
│ CUSTOS REGISTRADOS                 [+] │ ← + abre sheet Custo
└────────────────────────────────────────┘
```

### 3.2 Configuração dos 5 sheets

Todos via `presentation: 'formSheet'` no `app/_layout.tsx` com:

```ts
{
  presentation: 'formSheet',
  sheetAllowedDetents: [0.5, 1.0],   // metade + cheio (fractions, não strings)
  sheetGrabberVisible: true,
  sheetCornerRadius: 20,             // alinha com radius.lg
}
```

**Importante (descoberto via WebFetch nos docs do Expo Router 6.x):** `sheetAllowedDetents` aceita array de fractions `[0..1]` **ou** `'fitToContents'`. **Não** aceita strings semânticas tipo `'medium'` / `'large'` — o prompt original estava errado nisso.

| # | Sheet | Arquivo | Tipo | Hook escrita | Hook leitura |
|---|---|---|---|---|---|
| 1 | Dose | `app/dose/registrar.tsx` (refactor) | numérico + datetime | `useRegisterDose` (existe) | — |
| 2 | Peso | `app/peso/registrar.tsx` (refactor) | numérico kg | `useWeightLogs.addWeightLog` (existe) | — |
| 3 | Sintoma | `app/diario/anotar-sintoma.tsx` (criar) | textarea + chips Frequentes | `useRegisterSymptom` (criar) | `useFrequentSymptoms` (criar) |
| 4 | Notas | `app/diario/anotar-memoria.tsx` (refactor copy) | textarea | `useRegisterMemoryNote` (existe — não mexer) | — |
| 5 | Custo | `app/diario/anotar-custo.tsx` (criar) | R$ + descrição | `useRegisterCost` (criar) | — |

### 3.3 Estratégia do extrator de sintoma (sem IA)

```ts
// lib/symptoms/extractType.ts (NOVO)
export const SYMPTOM_PATTERNS = [
  { type: 'nausea', regex: /\bn[aá]usea|enjoo/i },
  { type: 'headache', regex: /\b(dor de cabe[çc]a|cefaleia|enxaqueca)/i },
  { type: 'heartburn', regex: /\b(azia|refluxo|queima[çc][aã]o)/i },
  { type: 'fatigue', regex: /\b(cansa[çc]o|cansad[ao]|fadiga|sem energia)/i },
  { type: 'diarrhea', regex: /\bdiarr[ée]ia/i },
  { type: 'constipation', regex: /\b(constipa[çc][aã]o|preso|pris[aã]o de ventre)/i },
  { type: 'injection_pain', regex: /\b(dor na aplica[çc][aã]o|dor da inje[çc][aã]o)/i },
  { type: 'vomiting', regex: /\bv[oô]mit/i },
] as const

export const INTENSITY_PATTERNS = [
  { value: 1, regex: /\bleve|fraco/i },
  { value: 3, regex: /\bforte|severo|intenso/i },
  { value: 2, regex: /\bmoderad[oa]/i },
]

export function extractSymptomType(text: string): string { /* ... */ }
export function extractIntensity(text: string): 1 | 2 | 3 { /* default 2 */ }
```

Pure functions, testáveis isoladamente. Resolve o problema `intensity NOT NULL` extraindo do texto livre quando possível, default 2 (moderado) se não houver palavra-chave de intensidade.

### 3.4 Mapping no insert (Caminho B)

```ts
// hooks/useRegisterSymptom.ts (NOVO)
mutationFn: ({ rawText }) => supabase.from('symptom_logs').insert({
  user_id: userId,
  symptom_type: extractSymptomType(rawText),
  intensity: extractIntensity(rawText),
  symptom_date: new Date().toISOString().slice(0, 10),
  notes: rawText,                                  // texto livre vai pra coluna `notes`
  context: { schema_version: 1, source: 'free_text_v1' },
  // logged_at usa default now()
})

// hooks/useRegisterCost.ts (NOVO)
mutationFn: ({ price, description, purchaseDate }) => supabase.from('purchases').insert({
  user_id: userId,
  price,
  notes: description,                              // descrição vai pra `notes`
  purchase_date: purchaseDate.toISOString().slice(0, 10),
  quantity: 1,
  // unit usa default 'caneta'
  // category usa default 'medication'
})
```

---

## 4. Sequência de execução (~5h efetivas)

| # | Etapa | Tempo | Checkpoint |
|---|---|---|---|
| 1 | Salvar plano em `docs/superpowers/plans/2026-05-25-pivot-home-sheets-dedicated.md` (cópia deste, regra 21) | 5min | arquivo criado |
| 2 | `git checkout -b feature/37-pivot-home-sheets-dedicated` | 1min | branch ativa |
| 3 | **Backend lib** (sequencial) | 50min | type-check PASS após cada |
|   | 3a. `lib/symptoms/extractType.ts` + testes inline 20 frases | 15min | acurácia ≥95% |
|   | 3b. `lib/supabase/queries/symptoms.ts` — adicionar `fetchFrequentSymptoms` | 10min | agrupa top 5 últ 30d |
|   | 3c. `lib/supabase/queries/purchases.ts` — adicionar `addPurchase({price, description, purchaseDate})` | 5min | mapping documentado |
|   | 3d. `hooks/useFrequentSymptoms.ts` | 5min | staleTime 5min |
|   | 3e. `hooks/useRegisterSymptom.ts` | 10min | invalida queries certas |
|   | 3f. `hooks/useRegisterCost.ts` | 5min | invalida purchaseSummary |
|   | 3g. `lib/validation/diarioSchemas.ts` — `symptomNoteSchema` + `costNoteSchema` | 5min | quickLogSchema intacto |
| 4 | `app/_layout.tsx` — trocar 3 `'modal'`→`'formSheet'` + 2 rotas novas | 10min | compila + renderiza |
| 5 | **Sheet 3 — Sintoma** (`anotar-sintoma.tsx`) | 45min | 3 screenshots |
| 6 | **Sheet 5 — Custo** (`anotar-custo.tsx`) | 30min | 2 screenshots |
| 7 | **Sheet 4 — Notas** (refactor copy `anotar-memoria.tsx` — header "Anotar nota" + ghost + toast) | 10min | diff cirúrgico |
| 8 | `HomeV7Content.tsx` — remover QuickActions + adicionar `+` headers + Pressable wrappers | 50min | screenshot pós-pivot |
| 9 | Rename strings: `"MEMÓRIA RECENTE"`→`"NOTAS RECENTES"`, `"OBSERVAÇÕES"`→`"SINTOMAS"` | 5min | grep PASS |
| 10 | `grill-with-docs` — atualizar `HOME_DESIGN_DIRECTION.md` §4 §7 + criar ADR `0006-home-pivot-sheets-dedicated.md` + adicionar 3 entradas em `CONTEXT.md` | 25min | docs atualizados |
| 11 | `docs/history.md` entry Prompt 37 | 3min | linha adicionada |
| 12 | `npm run type-check` + `npm run lint` | 3min | 0 errors |
| 13 | 12 screenshots reais via `react-native-devtools-mcp` em `assets/screenshots/pivot-home/` | 20min | PNGs prontos |
| 14 | `/impeccable critique` (ou critique manual se indisponível) | 15min | ≥32/40 |
| 15 | `security-review` da branch | 5min | 0 críticos |
| 16 | Commit cirúrgico + push + PR | 10min | PR aberto, CI verde |

---

## 5. Arquivos

### Criar (10)

| Arquivo | Resumo |
|---|---|
| `docs/superpowers/plans/2026-05-25-pivot-home-sheets-dedicated.md` | Cópia deste plano (regra 21) |
| `docs/adr/0006-home-pivot-sheets-dedicated.md` | ADR: pivot + rejeição IA classificadora + escolha regex + decisão Caminho B (sem migration) |
| `app/diario/anotar-sintoma.tsx` | Sheet 3 |
| `app/diario/anotar-custo.tsx` | Sheet 5 |
| `lib/symptoms/extractType.ts` | Regex PT-BR + `extractIntensity` + testes inline |
| `hooks/useFrequentSymptoms.ts` | React Query top 5 sintomas user |
| `hooks/useRegisterSymptom.ts` | Mutation insert symptom_logs |
| `hooks/useRegisterCost.ts` | Mutation insert purchases (mapeando `price/notes/purchase_date`) |
| `assets/screenshots/pivot-home/*.png` | 12 PNGs (1 Home + 2 por sheet × 5 + 1 com chips Frequentes) |

### Editar (8) — diff cirúrgico Karpathy §3

| Arquivo | Mudança |
|---|---|
| `lib/supabase/queries/symptoms.ts` | +1 export `fetchFrequentSymptoms`. Reutiliza pattern de query do `getRecentSymptom` existente |
| `lib/supabase/queries/purchases.ts` | +1 export `addPurchase`. Reutiliza pattern do `getPurchaseSummary` existente |
| `lib/validation/diarioSchemas.ts` | +2 schemas. Zero mexida em `quickLogSchema`/`memoryNoteSchema`/`checkinSchema` |
| `app/_layout.tsx` | 3 `Stack.Screen` mudam `'modal'`→`'formSheet'` + 2 novas. Pattern `presentation: 'formSheet'` reaproveitado |
| `app/diario/anotar-memoria.tsx` | Header "Anotar nota" + ghost atualizado + toast "Nota anotada". `useRegisterMemoryNote` intacto |
| `components/home/HomeV7Content.tsx` | Remover bloco `QuickActions` JSX + adicionar `+` Pressable em cada eyebrow visível + outer Pressable wrappers nos blocos navegáveis (Próxima dose, Peso) + rename 2 strings de label |
| `docs/HOME_DESIGN_DIRECTION.md` | §4 (remover linha "Ações rápidas") + §7 (substituir tabela por "Entries dedicados via sheet") |
| `CONTEXT.md` | +3 entradas: `sheet`, `Notas`, `Frequentes (sintomas)` |
| `docs/history.md` | +1 entry Prompt 37 |

### NÃO TOCAR (cláusula explícita do prompt 37)

- `useRegisterMemoryNote` (PR #73) — hook intacto, Sheet 4 reutiliza
- `useRegisterQuickLog` (legado) — sintomas via novo `useRegisterSymptom`
- `quickLogSchema`, `QUICK_LOG_TYPES` — schemas legados intocados
- `components/diario/QuickLogChips.tsx` — chips legados intocados
- `app/diario/quick-log.tsx` — Redirect guard mantido (`type=other` → `/diario/anotar-memoria`)
- `HomeV7Content.tsx:formatQuickLogTitle` — lógica de timeline intacta
- Tab bar atual (Diário, Doses, Relatórios, Perfil) — sai em PR futuro com Settings hub
- Bloco "PARA A CONSULTA" — read-only mantido, Sheet dedicado é PR separado
- Schema de qualquer tabela Supabase — zero `apply_migration` neste PR

---

## 6. Riscos e mitigações

| # | Risco | Mitigação |
|---|---|---|
| 1 | Schema mismatch `symptom_logs` (raw_text não existe, intensity NOT NULL) — **CONFIRMADO** | Caminho B + extractIntensity com fallback 2. ADR 0006 documenta a decisão |
| 2 | Schema mismatch `purchases` (amount/description/purchased_at não existem) — **CONFIRMADO** | Caminho B mapeando `price/notes/purchase_date` no hook. API JS limpa pro caller |
| 3 | `sheetAllowedDetents` aceita fractions, não strings — **CONFIRMADO** | Usar `[0.5, 1.0]` |
| 4 | Regex PT-BR misclassifica frases ambíguas ("tô mal") | 20+ frases-teste inline, acurácia ≥95% antes de prosseguir |
| 5 | Tap no body de bloco + tap no `+` conflitam (event bubbling) | `+` Pressable inner com `hitSlop` e `stopPropagation`; outer Pressable só nos blocos navegáveis. Validar manual no simulador |
| 6 | Form Sheet detent 0.5 pequeno demais para textarea + chips Frequentes | Permitir `[0.5, 1.0]`; default index 0; user arrasta pra cima |
| 7 | iOS < 15 sem suporte a detents | DoseDay V5 mira iOS 17+ (Liquid Glass na tab bar exige). Confirmar `app.json` minOSVersion no simulador 17 que usamos |
| 8 | Rename "Memória Recente"→"Notas Recentes" quebra testes ou screenshots commitados | `grep -r "MEMÓRIA RECENTE\|Memória Recente"` antes; atualizar referências |
| 9 | `/impeccable critique` indisponível (blocker dos PRs #73 #74) | Critique manual contra DESIGN.md Named Rules; score documentado em comentário |
| 10 | Tab bar provisória deixa user acessar `quick-log` direto via Diário | Fora de escopo (cláusula NÃO TOCAR). Sai em PR futuro |
| 11 | `context.schema_version=1` (default jsonb) conflita com `context.source='free_text_v1'` | Merge: `{schema_version: 1, source: 'free_text_v1'}` |

---

## 7. Verificação (end-to-end)

```
type-check + lint
  [ ] npm run type-check → 0 errors
  [ ] npm run lint → 0 errors (1 warning preexistente i18n aceitável)

Sheet abre / fecha
  [ ] Tap em + de cada bloco → sheet abre com dashboard visível atrás
  [ ] Swipe-down fecha
  [ ] X button fecha
  [ ] Drag handle nativo visível

Sheet Dose / Peso (refactor)
  [ ] Form atual funciona com presentation: 'formSheet'
  [ ] Validação Zod inalterada

Sheet Sintoma (novo)
  [ ] Textarea aceita texto livre
  [ ] Chips Frequentes ocultos quando user tem 0 sintomas últ 30d
  [ ] Chips Frequentes visíveis quando user tem ≥1 sintoma (top 5)
  [ ] Tap em chip preenche textarea + foca cursor após
  [ ] Submit insere row em symptom_logs com:
       - symptom_type extraído via regex
       - intensity extraída via regex (default 2)
       - notes = texto bruto
       - context = { schema_version: 1, source: 'free_text_v1' }
       - symptom_date = hoje
  [ ] Toast "Sintoma anotado" + dismiss

Sheet Notas (refactor copy)
  [ ] Header diz "Anotar nota" (era "Anotar memória")
  [ ] Ghost atualizado: "ex: bati o pé pra não comer doce hoje · domingo foi difícil"
  [ ] Toast "Nota anotada" (era "Memória registrada")
  [ ] Hook useRegisterMemoryNote inalterado

Sheet Custo (novo)
  [ ] R$ aceita BRL via decimal-pad keyboard
  [ ] Descrição obrigatória (min 1 char)
  [ ] Submit insere em purchases com price + notes + purchase_date + quantity:1
  [ ] Toast "Custo anotado" + dismiss

Home pós-pivot
  [ ] 3 quick actions REMOVIDOS do topo
  [ ] + aparece à direita de PRÓXIMA DOSE, PESO, SINTOMAS, NOTAS RECENTES, CUSTOS REGISTRADOS
  [ ] Tap body PRÓXIMA DOSE → /perfil/protocolo
  [ ] Tap body PESO → /peso/historico
  [ ] Tap em + de qualquer bloco → sheet correto
  [ ] Bloco CUSTOS continua condicional (count > 0)
  [ ] Bloco PARA A CONSULTA inalterado

Regex extractor (testes inline em extractType.ts)
  [ ] "náusea hoje" → { type: 'nausea', intensity: 2 }
  [ ] "dor de cabeça forte" → { type: 'headache', intensity: 3 }
  [ ] "azia ao deitar" → { type: 'heartburn', intensity: 2 }
  [ ] "náusea leve" → { type: 'nausea', intensity: 1 }
  [ ] "tô cansada" → { type: 'fatigue', intensity: 2 }
  [ ] "vômito depois da dose" → { type: 'vomiting', intensity: 2 }
  [ ] "voltei a usar calça 38" → { type: 'other', intensity: 2 }

Gates finais
  [ ] /impeccable critique → ≥ 32/40 cada (ou critique manual documentado)
  [ ] security-review → 0 críticos (RLS já validada via Supabase MCP)
  [ ] 12 screenshots reais em assets/screenshots/pivot-home/
  [ ] PR aberto com checklist + screenshots embedados + link pro plano
```

---

## 8. Karpathy

### §1 — Assumptions explícitas

1. **Schema real** divergente do prompt → **Caminho B** (sem migration). Verificado via Supabase MCP.
2. **RLS** de `symptom_logs` e `purchases` cobre `auth.uid()=user_id` em INSERT. Verificado.
3. **`sheetAllowedDetents`** aceita fractions `[0..1]` ou `'fitToContents'`, não strings. Verificado via WebFetch.
4. iOS mínimo não documentado nos docs do Expo Router — assumir iOS 17+ baseado em `expo-glass-effect` já em uso na tab bar.
5. **Tab bar atual mantida** neste PR. Saída fica pra PR futuro com Settings hub.
6. **Bloco "PARA A CONSULTA"** mantido read-only — Sheet dedicado é PR futuro separado.
7. **Toast lib** `react-native-toast-message` (já no package.json) — reusar `showSuccessToast`/`showErrorToast` de `lib/utils/showToast.ts`.
8. **CTA mint dos sheets** via `AuthButton variant='primary'` (já existente em `components/ui/AuthButton.tsx`) — usa `colors.brand`.
9. **Zero glass** nos sheets — regra 3 anti-pirraça (glass exclusivo da navegação).
10. **`context.schema_version=1`** (default jsonb) preservado + `context.source='free_text_v1'` no insert.

### §2 — Could 50 lines do this?

Não. Total novo ~600 LOC + edits ~120 LOC. Cada linha traceia a um critério da seção 7 (verificação binária). Zero drive-by refactor.

### §3 — Cirurgia

Tabela §5 declara escopo de cada arquivo. Lista "NÃO TOCAR" explícita. Diff esperado: 9 arquivos editados, 10 criados, zero arquivos surpresa.

### §4 — Sucesso verificável

Seção 7 é checklist binário. Comportamento observável apenas. Sem "ficou bonito" subjetivo.

---

## 9. Reuso confirmado (zero código duplicado)

| Funcionalidade | Reuso de |
|---|---|
| Form/keyboard pattern em sheets | `KeyboardAvoidingView` + `SafeAreaView` + `ScrollView keyboardShouldPersistTaps='handled'` do `app/diario/anotar-memoria.tsx` |
| CTA primary mint | `components/ui/AuthButton.tsx` `variant='primary'` |
| Header com X de sheet | Pattern do `app/diario/anotar-memoria.tsx` (SymbolView xmark + dismiss) |
| Chips Frequentes (Sheet Sintoma) | Pattern visual do `components/diario/SymptomsMultiSelect.tsx` (chip Pressable + minHeight 44pt) |
| Toast success/error | `lib/utils/showToast.ts` |
| Query pattern p/ symptom_logs | `lib/supabase/queries/symptoms.ts` `getRecentSymptom` |
| Mutation optimistic React Query | Padrão de `hooks/useUpdateProfile.ts` e `hooks/useWeightLogs.ts` |
| Eyebrow caption | `HomeV7Content.tsx:styles.eyebrow` (já uppercase + letterSpacing 1.4 + fontWeight 700) |
| Pressable scaled | `HomeV7Content.tsx:styles.arrowButtonPressed` pattern |
| Validação Zod | `lib/validation/diarioSchemas.ts:memoryNoteSchema` pattern |

---

## 10. Pontos de atenção para revisão

Antes de aprovar execução, vale conferir:

1. **D1 — Caminho B aceitável?** Mapping `notes` → "raw_text" + `intensity` extraída via regex te incomoda? Alternativa: Caminho A com migration explícita.
2. **D2 — Manual approve no merge confirmado?**
3. **Detents `[0.5, 1.0]`** — quer testar primeiro `'fitToContents'` para sheets menores (Dose/Peso) e `[0.5, 1.0]` só pra Sintoma?
4. **Bloco PARA A CONSULTA** segue read-only neste PR — OK?
5. **ADR 0006** vai documentar a decisão de não migrar agora — OK em criar?

---

## 11. Próximo passo

Após Léo aprovar D1 + D2, execução segue sequência da seção 4. Cada checkpoint para se algo divergir. Não toco em código até `ok` explícito.
