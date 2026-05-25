# DoseDay V5 — Prompt 37-MID-pivot-home-sheets-dedicated

**Instância de destino:** Aba 1 (principal)
**Worktree:** `dose-day-v5/`
**Branch a criar:** `feature/37-pivot-home-sheets-dedicated`
**Modelo:** Sonnet/Opus (MID — pivot de UX, múltiplos sheets, refactor de navegação)
**Caveman:** N/A

---

## Contexto obrigatório (leia ANTES de qualquer coisa, na ordem)

1. `CLAUDE.md` (raiz) — regras anti-pirraça 1–31
2. `@docs/karpathy.md` — escopo cirúrgico, assumptions explícitas, zero suposição
3. `@docs/learnings.md` — aprendizados acumulados (regra obrigatória pré-MID/HIGH)
4. `@docs/HOME_DESIGN_DIRECTION.md` — fonte da direção; **este prompt MUDA §4 e §7**, atualizar via grill-with-docs
5. `@docs/PRODUCT_COHERENCE.md` — §6 (decisões), §11.3 (vocabulário público), §15 (monetização — Resumo Pro será o destino do diferencial)
6. `@CONTEXT.md` — glossário; **este prompt ADICIONA** entradas: "sheet", "Notas", "Frequentes do user"
7. `@docs/DESIGN.md` — tokens canônicos, Named Rules (`The Mint Soft State Rule`, `The Ultralight-Is-Personal Rule`), tipografia, spacing
8. `components/home/HomeV7Content.tsx` (pós-PR #74 mergeado em main) — arquivo central do pivot
9. `app/_layout.tsx` — Stack.Screen registrations (vai mudar `presentation: 'modal'` → `'formSheet'`)
10. `app/dose/registrar.tsx`, `app/peso/registrar.tsx`, `app/diario/anotar-memoria.tsx` (PR #73) — telas existentes que viram sheets
11. `app/diario/quick-log.tsx` — tela polimórfica de sintomas (vai ser substituída por sheet dedicado)
12. `lib/supabase/queries/symptoms.ts`, `lib/supabase/queries/diario.ts`, `lib/supabase/queries/weight.ts`, `lib/supabase/queries/doses.ts`, `lib/supabase/queries/purchases.ts` — queries existentes
13. `lib/theme/tokens.ts` — radius, spacing, colors a usar
14. Memórias auto-injetadas (regra 30) — se houver contexto da sessão anterior, ler primeiro
15. Rodar `npx claude-mem search "quick-log sheet home v7 pivot anotar"` ANTES de planejar

---

## Objetivo desta tarefa

**Pivotar a Home v7 de "Quick Actions no topo" para "Blocos interativos com sheets dedicados"**, criando 5 sheets nativos iOS (Form Sheet com detents) que mantêm o dashboard visível atrás. Cada bloco da Home com ação dedicada ganha um `+` discreto no header. Tap no body do bloco continua navegando pra visualização detalhada quando aplicável.

Este pivot resolve 2 problemas estratégicos: **(a)** chips engessados causaram baixo preenchimento na V4 (App Store reviews); **(b)** tela cheia push-screen quebra o contexto da memória do tratamento. Sheets com peek do dashboard atrás mantêm continuidade visual.

A captura permanece **convencional e estruturada** (sem IA na captura). IA fica reservada exclusivamente pro Resumo Pro futuro (não escopo deste PR).

---

## Critérios de aceitação

### Estrutura da Home

- [ ] `HomeQuickActions` (os 3 botões topo: Anotar dose / Anotar peso / Adicionar memória) **removido** do JSX
- [ ] Cada bloco interativo recebe ícone `+` à direita do header uppercase (PRÓXIMA DOSE, PESO, **SINTOMAS** novo, **NOTAS RECENTES** renomeado, CUSTOS REGISTRADOS)
- [ ] Tap no `+` abre o sheet correspondente
- [ ] Tap no body do bloco (não no `+`) mantém navegação atual:
  - PRÓXIMA DOSE body → `/perfil/protocolo` (editar protocolo)
  - PESO body → `/peso/historico` (ver histórico completo)
  - SINTOMAS body → expande/scroll na lista de observações recentes (sem rota nova)
  - NOTAS RECENTES body → não navegável (timeline read-only)
  - CUSTOS body → `/perfil/custos` (criar rota nova, lista detalhada) — **fora de escopo deste PR**, comentar com TODO
- [ ] Bloco "MEMÓRIA RECENTE" **renomeado** para "NOTAS RECENTES"
- [ ] Bloco "OBSERVAÇÕES" **renomeado** para "SINTOMAS" (mais claro pro usuário leigo)

### Sheets (5 telas, todas Form Sheet iOS)

Cada sheet deve:
- Usar `presentation: 'formSheet'` no `app/_layout.tsx` (não `'modal'`)
- Manter dashboard visível atrás (peek das bordas — nativo do iOS 15+)
- Ter drag handle no topo (nativo) + botão `X` direito superior
- Header com título conciso ("Anotar dose", "Anotar peso", etc.)
- Footer com CTA "Anotar" em Vital Mint (usar `AuthButton` variant primary)
- Suportar swipe-down pra dismiss
- Touch targets ≥ 44pt

#### Sheet 1: Dose (`app/dose/registrar.tsx` — refactor)
- [ ] Atualizar `presentation` no `_layout.tsx` de `'modal'` para `'formSheet'`
- [ ] Manter form atual (mg, data/hora) — apenas trocar layout pra formSheet
- [ ] Ghost placeholder: "ex: 5,0 mg · agora"

#### Sheet 2: Peso (`app/peso/registrar.tsx` — refactor)
- [ ] Atualizar `presentation` no `_layout.tsx` de `'modal'` para `'formSheet'`
- [ ] Manter form atual (peso kg) — apenas trocar layout pra formSheet
- [ ] Ghost placeholder: "ex: 87,2"

#### Sheet 3: Sintoma (`app/diario/anotar-sintoma.tsx` — **CRIAR NOVO**)
- [ ] Header "Anotar sintoma"
- [ ] Textarea livre (multiline, `minHeight: 100`, `maxLength: 500`, `textAlignVertical: 'top'`)
- [ ] Ghost placeholder: "ex: náusea leve depois do almoço · azia ao deitar"
- [ ] Label "Frequentes" visível abaixo da textarea + chips do user (top 5 últimos 30 dias)
- [ ] Hook `useFrequentSymptoms()` consome SQL agrupado (ver seção Backend)
- [ ] Tap num chip insere o termo na textarea + foca cursor logo após
- [ ] CTA "Anotar" desabilitado enquanto `trim().length === 0`
- [ ] On submit: extrai `log_type` via regex (ver seção Backend), insere em `symptom_logs` com `raw_text` + `log_type` + `logged_at = NOW()` + `intensity: null`
- [ ] Toast "Sintoma anotado" + dismiss
- [ ] Se 0 sintomas nos últimos 30 dias → chips section oculta (não renderiza label "Frequentes" sozinho)

#### Sheet 4: Notas (`app/diario/anotar-memoria.tsx` — refactor do PR #73)
- [ ] Atualizar `presentation` no `_layout.tsx` de `'modal'` para `'formSheet'`
- [ ] Ghost placeholder atualizado: "ex: bati o pé pra não comer doce hoje · domingo foi difícil"
- [ ] Header continua "Anotar memória" — **mudar para "Anotar nota"** (consistência com bloco "Notas Recentes")
- [ ] Toast "Nota anotada" (era "Memória registrada")
- [ ] Restante do form intacto (textarea + AuthButton)

#### Sheet 5: Custo (`app/diario/anotar-custo.tsx` — **CRIAR NOVO**)
- [ ] Header "Anotar custo"
- [ ] Input numérico R$ (formatação BRL, `keyboardType="decimal-pad"`)
- [ ] Ghost no R$: "ex: 1.400,00"
- [ ] Textarea descrição (multiline, `minHeight: 80`, `maxLength: 200`)
- [ ] Ghost descrição: "ex: caneta Mounjaro 5mg · Drogasil"
- [ ] CTA "Anotar" desabilitado enquanto `amount === null || description.trim().length === 0`
- [ ] On submit: insere em `purchases` com `amount`, `description`, `purchased_at = NOW()`
- [ ] Toast "Custo anotado" + dismiss

### Backend

- [ ] **Criar `lib/symptoms/extractType.ts`** com regex extractor PT-BR:
  ```typescript
  export const SYMPTOM_PATTERNS = [
    { type: 'nausea', regex: /\bn[aá]usea/i },
    { type: 'headache', regex: /\b(dor de cabe[çc]a|cefaleia|enxaqueca)/i },
    { type: 'heartburn', regex: /\b(azia|refluxo|queima[çc][aã]o)/i },
    { type: 'fatigue', regex: /\b(cansa[çc]o|cansad[ao]|fadiga|sem energia)/i },
    { type: 'diarrhea', regex: /\bdiarr[ée]ia/i },
    { type: 'constipation', regex: /\b(constipa[çc][aã]o|preso|prisão de ventre)/i },
    { type: 'injection_pain', regex: /\b(dor na aplica[çc][aã]o|dor da inje[çc][aã]o)/i },
    { type: 'vomiting', regex: /\bv[oô]mit/i },
  ] as const

  export function extractSymptomType(text: string): string {
    for (const { type, regex } of SYMPTOM_PATTERNS) {
      if (regex.test(text)) return type
    }
    return 'other'
  }
  ```
- [ ] **Função pure, exportada com tipos** — testável isoladamente
- [ ] **Schema `symptom_logs` valida coluna `raw_text`** — se não existir, propor migration via Supabase MCP **dentro do plano**, aguardar aprovação antes de aplicar
- [ ] **Hook `hooks/useFrequentSymptoms.ts`** novo:
  ```typescript
  export function useFrequentSymptoms() {
    const { session } = useSession()
    return useQuery({
      queryKey: ['frequentSymptoms', session?.user?.id],
      queryFn: () => fetchFrequentSymptoms(session!.user.id),
      staleTime: 5 * 60 * 1000, // 5min
      refetchOnMount: true,
    })
  }
  ```
- [ ] Query SQL via supabase-js:
  ```typescript
  // lib/supabase/queries/symptoms.ts — ADICIONAR
  export async function fetchFrequentSymptoms(userId: string): Promise<FrequentSymptom[]> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data, error } = await supabase
      .from('symptom_logs')
      .select('log_type')
      .eq('user_id', userId)
      .neq('log_type', 'other')
      .gte('logged_at', thirtyDaysAgo)

    if (error) throw error

    // agregar JS-side (Supabase JS não tem GROUP BY direto via .select)
    const counts = (data ?? []).reduce<Record<string, number>>((acc, row) => {
      acc[row.log_type] = (acc[row.log_type] ?? 0) + 1
      return acc
    }, {})

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([log_type, count]) => ({ log_type, count }))
  }
  ```
- [ ] **Hook `hooks/useRegisterSymptom.ts`** novo (mutation):
  - Recebe `{ rawText: string }`
  - Extrai `log_type` via `extractSymptomType(rawText)`
  - Insere em `symptom_logs` com `raw_text`, `log_type`, `intensity: null`, `logged_at: new Date().toISOString()`
  - Invalida queries: `['frequentSymptoms', userId]`, `['symptomMemory', userId]`, `['diarioSummary', userId]`
- [ ] **Hook `hooks/useRegisterCost.ts`** novo (mutation):
  - Recebe `{ amount: number, description: string }`
  - Insere em `purchases` com `amount`, `description`, `purchased_at: new Date().toISOString()`
  - Invalida queries: `['purchaseSummary', userId]`

### Rotas / Stack.Screen no `_layout.tsx`

- [ ] Trocar `presentation: 'modal'` por `presentation: 'formSheet'` em:
  - `dose/registrar`
  - `peso/registrar`
  - `diario/anotar-memoria`
- [ ] Adicionar novas `<Stack.Screen>` registrations:
  - `diario/anotar-sintoma` (formSheet)
  - `diario/anotar-custo` (formSheet)
- [ ] Considerar `<Stack.Screen options={{ presentation: 'formSheet', sheetAllowedDetents: ['medium', 'large'], sheetGrabberVisible: true }} />` — validar API exata do Expo Router 6+

### Schemas / Validation

- [ ] **`lib/validation/diarioSchemas.ts`** — adicionar:
  - `symptomNoteSchema`: `z.object({ rawText: z.string().trim().min(1).max(500) })`
  - `costNoteSchema`: `z.object({ amount: z.number().positive(), description: z.string().trim().min(1).max(200) })`

### Atualizações de doc obrigatórias

- [ ] `docs/HOME_DESIGN_DIRECTION.md` §4: atualizar tabela de ordem dos blocos pra remover linha "Acoes rapidas"
- [ ] `docs/HOME_DESIGN_DIRECTION.md` §7: substituir tabela de "tres acoes aprovadas" por seção nova "Entries dedicados via sheet" com 5 itens
- [ ] `CONTEXT.md`: adicionar 3 entradas:
  - **sheet** — modal iOS Form Sheet com detents (medium/large) que mantém dashboard visível atrás. Usado para todos os entries de dados na Home v7
  - **Notas** — substitui o termo "memória" como label de UI; "Notas Recentes" substitui "Memória Recente". O conceito-guarda-chuva do produto continua sendo "memória do tratamento"
  - **Frequentes (sintomas)** — chips dos 5 tipos de sintoma que o próprio usuário registrou mais vezes nos últimos 30 dias. Atalho de digitação, não condicionante. Query SQL pura, zero IA
- [ ] `docs/history.md`: entry do Prompt 37
- [ ] `docs/adr/`: criar ADR `0006-home-pivot-sheets-dedicated.md` (via grill-with-docs) documentando decisão de pivot + rejeição de IA classificadora + escolha do regex extractor

---

## Restrições explícitas

- **NÃO usar IA na captura.** OpenAI, Anthropic, qualquer LLM: zero. Sem Structured Outputs, sem classificação inline.
- **NÃO modificar `quickLogSchema` ou `QUICK_LOG_TYPES`.** Schemas legados continuam intactos.
- **NÃO mexer no Redirect guard de `app/diario/quick-log.tsx`** (do PR #73). Continua redirecionando `type=other` → `/diario/anotar-memoria`.
- **NÃO mudar `useRegisterMemoryNote`** (PR #73). Hook continua intacto. Sheet 4 (Notas) usa esse hook.
- **NÃO tocar `useRegisterQuickLog`** (legado). Sintomas via novo `useRegisterSymptom`.
- **NÃO criar nova lib externa.** `@gorhom/bottom-sheet` ou `react-native-bottom-sheet` **proibidos**. Usar `presentation: 'formSheet'` nativo do Expo Router 6+.
- **NÃO usar `as any`, `// @ts-ignore`, `// eslint-disable`** sem justificativa explícita no plano.
- **NÃO adicionar chips em outras telas** (Notas, Custo). Chips só no Sheet de Sintoma — único atalho adaptativo.
- **NÃO mexer no bloco "PARA A CONSULTA"** neste PR. Mantido como read-only por enquanto. Sheet dedicado pra ele entra em PR futuro.
- **NÃO criar entrypoint pra registrar custo no bloco vazio (`purchases.count === 0`).** Bloco condicional continua sumindo quando vazio. `+` no header só renderiza quando bloco está visível.
- **PT-BR obrigatório.** Todos os textos visíveis ao usuário em português.
- **LGPD / PHI:** `raw_text` em sintomas e `description` em custos contém PHI. Confirmar RLS via Supabase MCP antes de mergear: `auth.uid() = user_id` em INSERT WITH CHECK pra `symptom_logs` e `purchases`.
- **Karpathy §3 — escopo cirúrgico:** cada linha alterada deve traçar a um critério de aceitação explícito acima. Zero drive-by refactor.
- **Touch target ≥ 44pt** em todos os elementos interativos (CTAs, chips, `+` icons).

---

## Antes de executar, RETORNE:

### A) Skills que vai utilizar

| Fase | Skill | Por quê |
|---|---|---|
| Pré-leitura | `karpathy-guidelines` | Assumptions explícitas, "could 50 lines do this?", success criteria verificáveis no plano |
| Pré-leitura | `claude-mem:mem-search` (`npx claude-mem search`) | Trazer trabalho prévio sobre quick-log/sheet/Home v7 pra evitar redescoberta |
| Planejamento | `grill-with-docs` | Toca conceitos de domínio (sheet, Notas vs Memória, Frequentes, regex extractor). Vai atualizar CONTEXT.md + gerar ADR 0006 |
| Planejamento | `superpowers:writing-plans` | Persistir plano em `docs/superpowers/plans/2026-05-25-pivot-home-sheets-dedicated.md` ANTES de tocar código (regra 21) |
| Implementação | `impeccable craft` | 5 sheets seguindo 6-seções (intent → flow → components → polish → accessibility → motion) |
| Implementação | `ios-liquid-glass-expo` | Form Sheet com detents iOS-native via Expo Router 6+. Validar API exata `presentation: 'formSheet'` + `sheetAllowedDetents` |
| Implementação | `react-native-best-practices` | KeyboardAvoidingView, SafeAreaView edges, ScrollView keyboardShouldPersistTaps, padrões Expo Router file-based |
| Validação | `impeccable critique` | Gate ≥ 32/40 — se `/impeccable critique` indisponível (mesmo blocker do PR #73 e #74), fazer critique manual contra DESIGN.md e documentar |
| Validação | `security-review` | PHI em `raw_text` (sintomas) e `description` (custos); confirmar RLS pra symptom_logs e purchases |
| Validação | `design:accessibility-review` | WCAG 2.1 AA — touch targets ≥ 44pt, contraste do `+` icon, screen reader labels em chips e CTAs |
| Sessão | `claude-mem` | Compactação automática session-end (regra 30) |

### B) Plano de execução

Lista numerada com checkpoints. Estimar tempo por etapa.

1. **Pré-leitura + mem-search** (5min) — checkpoint: 3 memórias relevantes citadas (Home v7, quick-log, sheet detents)
2. **Verificar via Supabase MCP**: (a) coluna `symptom_logs.raw_text` existe? (b) RLS de `symptom_logs` e `purchases`. (5min) — checkpoint: schema confirmado, RLS confirmada; se `raw_text` ausente, propor migration `apply_migration` no plano
3. **Verificar API Expo Router 6.x** pra `presentation: 'formSheet'` + `sheetAllowedDetents` — buscar via `WebFetch docs.expo.dev` se necessário (5min) — checkpoint: API exata documentada
4. **Salvar plano** em `docs/superpowers/plans/2026-05-25-pivot-home-sheets-dedicated.md` com Karpathy §1 (assumptions), §2 (could 50 lines), §3 (linha-a-linha) (15min) — checkpoint: arquivo criado
5. **Criar branch** `feature/37-pivot-home-sheets-dedicated` (1min)
6. **Backend** (40min total):
   - 6a. Criar `lib/symptoms/extractType.ts` (10min) — checkpoint: tsc PASS + testes unitários inline (8 patterns + fallback)
   - 6b. Adicionar `fetchFrequentSymptoms` em `lib/supabase/queries/symptoms.ts` (5min)
   - 6c. Criar `hooks/useFrequentSymptoms.ts` (5min)
   - 6d. Criar `hooks/useRegisterSymptom.ts` (10min)
   - 6e. Criar `hooks/useRegisterCost.ts` (5min)
   - 6f. Adicionar `symptomNoteSchema` e `costNoteSchema` em `diarioSchemas.ts` (5min) — checkpoint: type-check PASS, lint PASS
7. **Sheet 3 — Sintoma** (`app/diario/anotar-sintoma.tsx`) (45min) — checkpoint: compila + screenshot vazio com Frequentes ocultos + screenshot vazio com Frequentes (com seed) + screenshot preenchido
8. **Sheet 5 — Custo** (`app/diario/anotar-custo.tsx`) (35min) — checkpoint: compila + screenshot vazio + screenshot preenchido + validação BRL
9. **Sheet 4 — Notas** (refactor `anotar-memoria.tsx`) (15min) — checkpoint: header "Anotar nota" + ghost atualizado + toast "Nota anotada"
10. **Sheets 1+2 — Dose e Peso** (refactor _layout.tsx) (10min) — checkpoint: `presentation: 'formSheet'` nas 3 rotas (`dose/registrar`, `peso/registrar`, `diario/anotar-memoria`) + 2 rotas novas registradas
11. **HomeV7Content.tsx** — remoção QuickActions + adição de `+` headers (45min) — checkpoint: compila, screenshot Home pós-pivot
12. **Rename "MEMÓRIA RECENTE" → "NOTAS RECENTES"** e **"OBSERVAÇÕES" → "SINTOMAS"** (5min) — checkpoint: render OK
13. **Tap nos blocos** (Pressable wrappers em PRÓXIMA DOSE e PESO) — body tap navega, `+` abre sheet (15min) — checkpoint: testes manuais ambos navegação correta
14. **Atualizar HOME_DESIGN_DIRECTION.md §4 + §7 via grill-with-docs** (15min) — checkpoint: doc atualizado
15. **Criar ADR 0006-home-pivot-sheets-dedicated.md** via grill-with-docs (10min) — checkpoint: ADR salvo
16. **Atualizar CONTEXT.md** (3 entradas novas) (5min) — checkpoint: glossário atualizado
17. **Atualizar docs/history.md** (Prompt 37) (3min)
18. **Type-check + lint** (3min) — checkpoint: 0 errors, 1 warning preexistente em i18n
19. **Capturar screenshots reais** via `react-native-devtools-mcp` ou simulador (15min) — checkpoint: 11 PNGs em `assets/screenshots/pivot-home/` (1 Home pós-pivot + 2 cada sheet × 5 = 10)
20. **`/impeccable critique`** nos 3 sheets novos (anotar-sintoma, anotar-custo, anotar-memoria refactor) (15min) — checkpoint: ≥ 32/40 cada OU critique manual documentado
21. **`security-review`** da branch (5min) — checkpoint: 0 críticos, RLS validada
22. **Commit + push + PR** (10min) — checkpoint: PR aberto, CI verde, screenshots embedados, link pro plano

**Tempo total estimado:** ~5h efetivas

### C) Riscos identificados

| # | Risco | Mitigação |
|---|---|---|
| 1 | `symptom_logs.raw_text` pode não existir como coluna — schema atual usa `notes` ou ainda nada | Etapa 2 verifica via Supabase MCP. Se ausente, criar migration `apply_migration` com aprovação antes de implementar |
| 2 | Expo Router 6.x pode não expor `sheetAllowedDetents` ainda (depende de versão) | Etapa 3 valida. Se ausente, fallback pra `presentation: 'formSheet'` simples (sem detents customizados) + documentar débito |
| 3 | iOS < 15 não suporta Sheet Detents — DoseDay V5 mira iOS 17+ por causa Liquid Glass | Confirmar `expo-constants` minOSVersion ≥ 15 no `app.json`. Se < 15, dropar suporte |
| 4 | Regex em PT-BR pode misclassificar termos compostos ("dor de cabeça forte e enxaqueca" → headache só 1 vez, OK; mas "constipação intestinal" → constipation match OK) | Testes unitários inline em `extractType.ts` com 20+ frases reais. Iterar regex se < 95% acurácia |
| 5 | Tap no body de bloco + tap no `+` podem conflitar (event bubbling) | `+` é `Pressable` com `hitSlop` e `stopPropagation`. Validar manual no simulador |
| 6 | Form Sheet medium detent pode ser pequeno demais pra textarea + chips Frequentes (Sintoma) | Permitir detents `['medium', 'large']` pra usuário arrastar pra cima se precisar |
| 7 | Rename "Memória Recente" → "Notas Recentes" pode quebrar testes existentes ou screenshots commitados | Buscar referências em `__tests__/` (se houver) e `docs/` — atualizar |
| 8 | Tab bar provisória ainda existe (Diário, Doses, Relatórios) — usuário pode acessar `quick-log.tsx` direto via Diário e ficar confuso sem sintoma livre | Fora de escopo deste PR. Tab bar sai em PR futuro quando Configurações hub estiver pronta (§2 SETTINGS_DESIGN_DIRECTION) |
| 9 | Chips "Frequentes" mostrando 0 sintomas em user novo confunde | Etapa 7: se `data.length === 0`, ocultar toda a section "Frequentes" (não renderizar label sozinho) |
| 10 | `/impeccable critique` continua indisponível (blocker dos PRs #73 e #74) | Critique manual contra DESIGN.md + Named Rules. Documentar estimativa de score |

### D) Arquivos que vai criar/editar

| Arquivo | Ação | Resumo |
|---|---|---|
| `docs/superpowers/plans/2026-05-25-pivot-home-sheets-dedicated.md` | criar | Plano persistido (regra 21) |
| `docs/adr/0006-home-pivot-sheets-dedicated.md` | criar | ADR (via grill-with-docs) |
| `app/diario/anotar-sintoma.tsx` | criar | Sheet 3 — Sintoma com textarea + Frequentes |
| `app/diario/anotar-custo.tsx` | criar | Sheet 5 — Custo com R$ + descrição |
| `lib/symptoms/extractType.ts` | criar | Regex extractor PT-BR puro |
| `hooks/useFrequentSymptoms.ts` | criar | Query React Query pra top 5 sintomas do user |
| `hooks/useRegisterSymptom.ts` | criar | Mutation insert symptom_logs com regex extract |
| `hooks/useRegisterCost.ts` | criar | Mutation insert purchases |
| `lib/supabase/queries/symptoms.ts` | editar | Adicionar `fetchFrequentSymptoms` |
| `lib/validation/diarioSchemas.ts` | editar | Adicionar `symptomNoteSchema` + `costNoteSchema` |
| `app/_layout.tsx` | editar | Trocar `'modal'` → `'formSheet'` em 3 rotas + adicionar 2 rotas novas |
| `app/diario/anotar-memoria.tsx` | editar | Header "Anotar nota" + ghost + toast "Nota anotada" |
| `components/home/HomeV7Content.tsx` | editar | Remover `HomeQuickActions` + adicionar `+` headers + rename labels + tap handlers |
| `docs/HOME_DESIGN_DIRECTION.md` | editar (grill-with-docs) | §4 + §7 atualizados |
| `CONTEXT.md` | editar (grill-with-docs) | 3 entradas novas |
| `docs/history.md` | editar | Entry Prompt 37 |
| `assets/screenshots/pivot-home/01-home-pos-pivot.png` | criar | Home v7 pós-pivot |
| `assets/screenshots/pivot-home/02-sheet-dose-empty.png` | criar | Sheet Dose vazio |
| `assets/screenshots/pivot-home/03-sheet-dose-filled.png` | criar | Sheet Dose preenchido |
| `assets/screenshots/pivot-home/04-sheet-peso-empty.png` | criar | Sheet Peso vazio |
| `assets/screenshots/pivot-home/05-sheet-peso-filled.png` | criar | Sheet Peso preenchido |
| `assets/screenshots/pivot-home/06-sheet-sintoma-empty.png` | criar | Sheet Sintoma vazio (sem Frequentes) |
| `assets/screenshots/pivot-home/07-sheet-sintoma-frequentes.png` | criar | Sheet Sintoma com chips Frequentes |
| `assets/screenshots/pivot-home/08-sheet-sintoma-filled.png` | criar | Sheet Sintoma preenchido |
| `assets/screenshots/pivot-home/09-sheet-notas-empty.png` | criar | Sheet Notas vazio |
| `assets/screenshots/pivot-home/10-sheet-notas-filled.png` | criar | Sheet Notas preenchido |
| `assets/screenshots/pivot-home/11-sheet-custo-empty.png` | criar | Sheet Custo vazio |
| `assets/screenshots/pivot-home/12-sheet-custo-filled.png` | criar | Sheet Custo preenchido |

**Não tocar:** `useRegisterMemoryNote`, `useRegisterQuickLog`, `quickLogSchema`, `QUICK_LOG_TYPES`, `components/diario/QuickLogChips.tsx`, `app/diario/quick-log.tsx` (Redirect guard mantido), `HomeV7Content.tsx:formatQuickLogTitle` (lógica de timeline intacta), tab bar.

### E) Como vai validar

- [ ] `npm run type-check` → 0 errors
- [ ] `npm run lint` → 0 errors (1 warning preexistente em `lib/i18n/index.ts` aceitável)
- [ ] **Sheet abre e fecha**:
  - [ ] Tap em `+` PRÓXIMA DOSE → sheet abre com dashboard visível atrás
  - [ ] Swipe-down fecha sheet
  - [ ] `X` button fecha sheet
  - [ ] Drag handle (nativo) presente
- [ ] **Comportamento por sheet**:
  - [ ] Dose: form continua funcionando, presentation é formSheet
  - [ ] Peso: form continua funcionando, presentation é formSheet
  - [ ] Sintoma: textarea aceita texto livre, chips Frequentes aparecem quando user tem ≥ 1 sintoma nos últimos 30 dias, chips ocultos se user 0 sintomas. Tap em chip preenche textarea. Submit insere row em `symptom_logs` com `log_type` extraído via regex.
  - [ ] Notas: header diz "Anotar nota", toast diz "Nota anotada"
  - [ ] Custo: R$ aceita BRL, descrição obrigatória, submit insere em `purchases`
- [ ] **Home pós-pivot**:
  - [ ] 3 quick actions REMOVIDOS do topo
  - [ ] `+` aparece à direita de PRÓXIMA DOSE, PESO, SINTOMAS (era OBSERVAÇÕES), NOTAS RECENTES (era MEMÓRIA RECENTE), CUSTOS REGISTRADOS
  - [ ] Tap no body do bloco PRÓXIMA DOSE → navega pra `/perfil/protocolo`
  - [ ] Tap no body do bloco PESO → navega pra `/peso/historico`
  - [ ] Tap em `+` em qualquer bloco → abre sheet correto
- [ ] **Regex extractor** — testes inline em `extractType.ts`:
  - `extractSymptomType("náusea hoje") === 'nausea'` ✓
  - `extractSymptomType("dor de cabeça forte") === 'headache'` ✓
  - `extractSymptomType("azia ao deitar") === 'heartburn'` ✓
  - `extractSymptomType("tô cansada") === 'fatigue'` ✓
  - `extractSymptomType("voltei a usar calça 38") === 'other'` ✓ (mudança positiva, fora dos 8 patterns)
- [ ] **`/impeccable critique`** nos 3 sheets novos (ou critique manual contra DESIGN.md ≥ 32/40 estimado)
- [ ] **`security-review`** da branch → 0 críticos, RLS confirmada via Supabase MCP
- [ ] **`design:accessibility-review`** → touch targets ≥ 44pt, contrast ratio em chips e `+` icons, screen reader labels
- [ ] **Screenshots reais** capturados (12 PNGs em `assets/screenshots/pivot-home/`)

### F) Otimização de tokens

- `rtk read` em arquivos > 200 linhas (`HomeV7Content.tsx`, `_layout.tsx` se grande)
- `rtk grep "presentation\|formSheet\|HomeQuickActions" --type tsx` em vez de grep full
- Outputs de `npm install` / `npm run *` salvos em `/tmp/*.log` referenciados via `@file`
- Plano salvo em arquivo (regra 21) — não despejar no chat
- Memória entre sessões via `claude-mem` (regra 30)
- ADR e atualizações de doc via grill-with-docs (etapas 14, 15, 16) — não duplicar conteúdo no chat

---

## Karpathy §1 — Assumptions explícitas (a confirmar no plano)

1. Expo Router 6.x suporta `presentation: 'formSheet'` + `sheetAllowedDetents` nativamente (confirmar etapa 3)
2. iOS 15+ obrigatório no `app.json` (confirmar etapa 3)
3. `symptom_logs` tem ou pode ganhar coluna `raw_text` via migration (confirmar etapa 2)
4. RLS de `symptom_logs` e `purchases` já cobre `auth.uid() = user_id` em INSERT WITH CHECK (confirmar etapa 2)
5. Tab bar atual (Diário, Doses, Relatórios, Perfil) **continua existindo** neste PR. Saída ficará pra PR futuro com Configurações hub
6. Bloco "PARA A CONSULTA" mantido read-only neste PR. Sheet pra registrar consultation_notes é PR separado futuro
7. Bloco "CUSTOS REGISTRADOS" continua condicional (`purchases.count > 0` pra renderizar). `+` no header só existe quando bloco está visível
8. Cor mint do CTA dos sheets segue `colors.brand` (Vital Mint) — `AuthButton variant='primary'`
9. Toast lib é `react-native-toast-message` (já no package.json)
10. Nenhum sheet usa Liquid Glass effect (glass restrito a navegação)

## Karpathy §2 — Could 50 lines do this?

Não. Pivot envolve:
- 2 telas novas (~200 LOC cada com header/textarea/chips/CTA) = ~400 LOC
- 3 hooks novos = ~60 LOC
- 1 query nova = ~20 LOC
- 1 regex extractor + testes = ~30 LOC
- 2 schemas zod = ~10 LOC
- Refactor de 3 sheets existentes = ~30 LOC
- Refactor de `HomeV7Content.tsx` (remover quick actions + adicionar `+` headers + Pressable wrappers) = ~80 LOC
- Doc updates = ~50 LOC

**Total novo:** ~600-700 LOC. **Edits:** ~120 LOC. Não dá pra 50. Mas cada linha traceia a um critério de aceitação acima — zero drive-by refactor.

## Karpathy §3 — Cada linha traceia ao pedido

Verificar na tabela D (Arquivos) — todos os arquivos têm escopo declarado. Nenhum arquivo "Não tocar" é alterado.

## Karpathy §4 — Success criteria verificáveis

Toda a seção E é checklist binário. Sem subjetivo "ficou bonito" — apenas comportamento observável.

---

## ⏸️ Pause aqui e aguarde aprovação do Léo antes de executar.

Retorno esperado do Claude Code:

1. Confirmação de leitura dos 15 itens do "Contexto obrigatório"
2. Output curto de `npx claude-mem search "quick-log sheet home v7 pivot anotar"` com 3 memórias relevantes
3. Output da verificação Supabase MCP (`symptom_logs.raw_text` + RLS)
4. Output da verificação Expo Router 6.x (`presentation: 'formSheet'` + `sheetAllowedDetents`)
5. Tabela A (Skills) preenchida
6. Plano B numerado com tempos confirmados
7. Riscos C com mitigações concretas
8. Tabela D (arquivos) confirmada
9. Checklist E de validação confirmado
10. Nota F de otimização

**Sem código.** Sem screenshots ainda. Sem PR. Só plano.

Léo aprova → Claude Code executa etapas 4–22 em sequência, com checkpoints onde pausar se algo divergir.

Sobre uso de Caminho A (Cowork mergeia direto via MCP) ou Caminho B (Cowork espera Claude Code abrir PR): este PR é grande e Léo deve revisar visualmente cada sheet antes do merge. **Manual approve** recomendado (não auto mode).
