# Plano — Prompt 36 (MID) — Anotar memória: tela dedicada

**Branch alvo:** `feature/36-anotar-memoria-tela-dedicada`
**Worktree:** `dose-day-v5/`
**Modelo:** Opus 4.7 (default da sessão)

---

## Context

A Home v7 hoje navega "Adicionar memória" → `/diario/quick-log?type=other`, renderizando a tela polimórfica de sintomas com campos sem sentido pra nota livre (chips Leve/Moderado/Forte, label "Tipo: Outro", textarea de 3 linhas). Viola §7 do `HOME_DESIGN_DIRECTION.md` (memória = nota livre curta, não sintoma) e gera atrito UX.

Solução: bifurcar conceitualmente as duas intenções. Nova rota `/diario/anotar-memoria` com **apenas textarea + CTA "Registrar"**. Tela `quick-log.tsx` continua servindo sintomas. Schema do banco fica intocado — historic rows com `log_type='other'` continuam aparecendo na timeline ("Memória adicionada.").

---

## Pré-requisitos validados (recon)

**Schema `quick_logs`** (Supabase MCP, projeto `pjesgdczasumgjzqyzzk`):
- `intensity` integer **nullable** com `default=1` → insert DEVE enviar `null` explicitamente, não omitir.
- `notes` text nullable.
- `log_type` text (sem enum no DB, sem CHECK).
- Coluna em snake_case (`log_type`), não `logType`.

**RLS `quick_logs`** (LGPD): policies confirmadas para todos os 4 comandos com `auth.uid() = user_id`. INSERT tem `WITH CHECK`. ✅ LGPD coberta sem migration.

**`app/diario/quick-log.tsx`:**
- Lê `useLocalSearchParams<{ type?: string }>()` (linha 33), fallback `'other'` (linha 36).
- Form: chips intensidade (default 2 "Moderado") + textarea `multiline numberOfLines={3} maxLength={500}`.
- Submit: `quickLogSchema.safeParse({ logType, intensity, notes })` → `useRegisterQuickLog()` → `showSuccessToast('Registrado')` → `router.back()`.

**`components/home/HomeV7Content.tsx`:**
- L63: `onPressMemory={() => router.push('/diario/quick-log?type=other' as Href)}`
- L387: `if (log.logType === 'other') return 'Memória adicionada.'` ← **mantém intacto** (rows históricos).

**`lib/validation/diarioSchemas.ts`:**
- `QUICK_LOG_TYPES` = array com 10 tipos incluindo `'other'` (linhas 3-14).
- `quickLogSchema.logType: z.enum(QUICK_LOG_TYPES)` (linha 106).
- `INTENSITY_LABELS` = `{1: 'Leve', 2: 'Moderado', 3: 'Forte'}`.

**`hooks/useRegisterQuickLog.ts` + `lib/supabase/queries/diario.ts:91-104`:**
```ts
supabase.from('quick_logs').insert({
  user_id, log_type, intensity, notes: input.notes ?? null,
  logged_at: input.loggedAt.toISOString()
})
```

**`app/_layout.tsx` L174-177:**
```tsx
<Stack.Screen name="diario/quick-log" options={{ presentation: 'modal', headerShown: false }} />
```
Padrão pra mirror em `diario/anotar-memoria`.

**Theme tokens (`lib/theme/tokens.ts`):** `colors.bgBase #050B12`, `colors.brand #00D4AA`, `spacing.lg=24, md=16`, `radius.md=14`, `typography.title 22/600`, `typography.body 16/400`, `typography.caption 13/400`.

**`components/ui/AuthButton.tsx`:** props `{label, onPress, loading, disabled, variant='primary'|'secondary'}`. Reusar direto.

**`app/peso/registrar.tsx`:** padrão de referência (SafeAreaView → KeyboardAvoidingView → ScrollView `keyboardShouldPersistTaps="handled"` → footer com AuthButton).

**Grep `'other'` em quick-log domain (3 hits):**
1. `app/diario/quick-log.tsx:36` — fallback default
2. `components/home/HomeV7Content.tsx:63` — entry point (vai mudar)
3. `components/home/HomeV7Content.tsx:387` — timeline label (mantém)

**`components/diario/QuickLogChips.tsx:28`:** ⚠️ itera `QUICK_LOG_TYPES.map(...)` — renderiza chip "Outro" que navega pra `quick-log?type=other`. **Conflito com o prompt** (ver Decisão Pendente abaixo).

---

## ✅ Decisão (Léo aprovou — 2026-05-25)

**Interpretação A: Guard + redirect, schema intacto.**

`QUICK_LOG_TYPES`, `quickLogSchema`, `QuickLogChips` ficam **100% intactos**. Em `quick-log.tsx` adicionamos guard usando `<Redirect href="/diario/anotar-memoria" />` de `expo-router` (evita flash de render que `router.replace` em `useEffect` causaria). Chip "Outro" do Diário cai naturalmente no redirect.

**Refinamentos confirmados:**

1. **JSDoc em `QUICK_LOG_TYPES`** (`lib/validation/diarioSchemas.ts`, 1 linha de comentário):
   ```ts
   /** 'other' é tipo de storage legado (rows históricas em `quick_logs`).
    *  UI redireciona pra /diario/anotar-memoria via guard em quick-log.tsx. */
   ```

2. **Guard em `app/diario/quick-log.tsx`** logo após `useLocalSearchParams`:
   ```tsx
   if (params.type === 'other' || !params.type) {
     return <Redirect href="/diario/anotar-memoria" />
   }
   ```
   `Redirect` de `expo-router` é declarativo — sem flash de render.

3. **`CONTEXT.md`** (via `grill-with-docs`) ganha:
   - **memória** — nota livre do paciente; rota `/diario/anotar-memoria`; armazenada em `quick_logs` com `log_type='other'`
   - **sintoma** — tipo enumerado + intensidade Leve/Moderado/Forte; rota `/diario/quick-log?type=<sintoma>`; armazenada em `quick_logs` com `log_type=<sintoma>` + `intensity`
   - **nota:** `'other'` no enum é shape de storage, não conceito de UI

---

## A) Skills utilizadas

| Fase | Skill | Razão |
|---|---|---|
| Pré-leitura | `karpathy-guidelines` | Assumptions explícitas, escopo cirúrgico, success criteria verificáveis (✅ skill já invocada) |
| Pré-leitura | `claude-mem:mem-search` | Pré-carregar memória sobre quick-log/sintoma/memória |
| Planejamento | `grill-with-docs` | Conceito de domínio "memória" vs "sintoma" — atualizar `CONTEXT.md` glossário |
| Planejamento | `superpowers:writing-plans` | Persistir plano em `docs/superpowers/plans/2026-05-25-anotar-memoria-tela-dedicada.md` (regra 21) |
| Implementação | `impeccable craft` | 6-seções (intent → flow → components → polish → accessibility → motion) na tela nova |
| Implementação | `react-native-best-practices` | KeyboardAvoidingView/SafeAreaView/ScrollView com `keyboardShouldPersistTaps` |
| Validação | `impeccable critique` | Gate ≥ 32/40 na tela nova |
| Validação | `security-review` | Confirmar que `notes` não vaza em logs/analytics |
| Persistência | `claude-mem` | Compactação automática session-end (regra 30) |

---

## B) Plano de execução (16 etapas, ~110min)

| # | Etapa | Tempo | Checkpoint |
|---|---|---|---|
| 1 | Pré-leitura + `mem-search` "quick-log anotar memoria sintoma" | 5min | 3 memórias relevantes citadas |
| 2 | Verificar RLS `quick_logs` via Supabase MCP | ✅ feito | `auth.uid() = user_id` confirmado em todos cmds |
| 3 | Verificar `intensity` nullable | ✅ feito | nullable=YES, default=1 (insert manda `null` explícito) |
| 4 | Salvar plano em `docs/superpowers/plans/2026-05-25-anotar-memoria-tela-dedicada.md` | 5min | Arquivo criado com assumptions Karpathy |
| 5 | `git checkout -b feature/36-anotar-memoria-tela-dedicada` | 1min | Branch criada |
| 6 | Criar `memoryNoteSchema` em `lib/validation/diarioSchemas.ts` (`{notes: z.string().trim().min(1).max(500)}`) + export type | 5min | `tsc --noEmit` PASS |
| 7 | Criar `hooks/useRegisterMemoryNote.ts` (mutation `insert quick_logs {log_type:'other', intensity: null, notes}`) | 10min | Hook compila, query key invalidation idêntica a `useRegisterQuickLog` |
| 8 | Criar `app/diario/anotar-memoria.tsx` (header X + título "Anotar memória" + textarea `multiline` `numberOfLines={8}` `maxLength={500}` + CTA "Registrar"). **Style da textarea DEVE incluir `minHeight: 200` e `textAlignVertical: 'top'`** — `numberOfLines` no iOS é só hint pro autoresize; sem `minHeight` o TextInput colapsa pra 40-60px no estado vazio. Validar visualmente no screenshot `01-empty.png`. | 40min | Compila, screenshot vazio mostra textarea com ~200px de altura visível (não colapsada), screenshot preenchido |
| 9 | Registrar rota em `app/_layout.tsx` (Stack.Screen presentation modal) | 3min | Tipos Expo Router regerados sem erro |
| 10 | Atualizar `components/home/HomeV7Content.tsx:63` → `router.push('/diario/anotar-memoria' as Href)` | 2min | Navegação real no simulador |
| 11 | **Em `app/diario/quick-log.tsx`**: importar `Redirect` de `expo-router`; após `useLocalSearchParams`, se `params.type === 'other'` ou ausente, `return <Redirect href="/diario/anotar-memoria" />`. **Adicionar JSDoc** em `QUICK_LOG_TYPES` (diarioSchemas.ts) explicando que `'other'` é storage legado. Sem mexer em `quickLogSchema` nem `QuickLogChips`. | 10min | type-check PASS, sintomas continuam funcionais, chip "Outro" cai no redirect declarativo (sem flash) |
| 12 | `npx impeccable critique app/diario/anotar-memoria.tsx` | 10min | ≥ 32/40 |
| 13 | `security-review` da branch | 5min | 0 críticos, `notes` não em logs |
| 14 | Capturar 2 screenshots em `assets/screenshots/anotar-memoria/` via `react-native-devtools-mcp` | 5min | `01-empty.png` + `02-filled.png` |
| 15 | Atualizar `docs/history.md` (entry Prompt 36) | 3min | Tabela atualizada |
| 16 | Abrir PR com template, screenshots embedados | 5min | CI verde, PR aberto |

---

## C) Riscos identificados

| # | Risco | Mitigação |
|---|---|---|
| 1 | `intensity` tem `default=1` — se o insert OMITIR o campo, vai gravar `1` em vez de `null` | Etapa 7: explicitamente passar `intensity: null` no payload do hook |
| 2 | Remover `'other'` de `QUICK_LOG_TYPES` quebra `quickLogSchema` E `QuickLogChips` simultaneamente | Interpretação A resolve sem modificar nenhum dos dois — guard local + redirect |
| 3 | Historic rows com `log_type='other'` precisam continuar aparecendo "Memória adicionada." | `HomeV7Content.tsx:387` mantido intacto |
| 4 | `notes` é PHI livre — vazar em log/analytics seria violação LGPD | Etapa 13 (security-review) — Sentry/PostHog não devem capturar `notes`; mutation usa apenas Supabase com RLS |
| 5 | `react-native-devtools-mcp` precisa do app rodando no simulador | Verificar `mcp__react-native__get_metro_status` antes; se off, pedir Léo subir Metro (único bash necessário pra Léo) |
| 6 | `/impeccable critique` < 32/40 | Iterar até passar OU pausar e pedir aprovação pra mergear com débito documentado em `docs/learnings.md` |
| 7 | Drift conceitual "memória" vs "sintoma" no longo prazo | Atualizar `CONTEXT.md` glossário via `grill-with-docs` (etapa 4) |

---

## D) Arquivos criados/editados

| Arquivo | Ação | Resumo |
|---|---|---|
| `docs/superpowers/plans/2026-05-25-anotar-memoria-tela-dedicada.md` | criar | Plano persistido (regra 21) |
| `app/diario/anotar-memoria.tsx` | criar | Nova tela: header X + título + textarea grande + CTA "Registrar" |
| `lib/validation/diarioSchemas.ts` | editar | Adicionar `memoryNoteSchema` + `MemoryNoteInput` type. **Não tocar** `QUICK_LOG_TYPES`/`quickLogSchema` |
| `hooks/useRegisterMemoryNote.ts` | criar | Mutation própria — insert em `quick_logs` com `log_type:'other'`, `intensity:null`, `notes` trimmed |
| `app/_layout.tsx` | editar | Adicionar `<Stack.Screen name="diario/anotar-memoria" presentation: 'modal' headerShown: false />` |
| `app/diario/quick-log.tsx` | editar | Importar `Redirect` + adicionar 3 linhas de guard declarativo (`if type===‘other’ \|\| !type → <Redirect href=‘/diario/anotar-memoria’ />`). Não tocar form/schema |
| `lib/validation/diarioSchemas.ts` (JSDoc) | editar | Adicionar comentário JSDoc em `QUICK_LOG_TYPES` documentando que `'other'` é storage legado (não modifica o array) |
| `components/home/HomeV7Content.tsx` | editar | L63: `'/diario/quick-log?type=other'` → `'/diario/anotar-memoria'`. L387 mantém. |
| `assets/screenshots/anotar-memoria/01-empty.png` | criar | Screenshot via MCP |
| `assets/screenshots/anotar-memoria/02-filled.png` | criar | Screenshot via MCP |
| `docs/history.md` | editar | Entry Prompt 36 |
| `CONTEXT.md` | editar (via grill-with-docs) | Glossário "memória" vs "sintoma" |

**Não tocar:** `useRegisterQuickLog.ts`, `quickLogSchema`, `QUICK_LOG_TYPES`, `components/diario/QuickLogChips.tsx`.

---

## E) Validação (success criteria verificáveis — Karpathy §4)

- [ ] `npm run type-check` → 0 errors
- [ ] `npm run lint` → 0 errors (warning preexistente em `lib/i18n/index.ts` aceitável)
- [ ] Simulador iOS: tap "Adicionar memória" da Home v7 → abre `/diario/anotar-memoria`
- [ ] Textarea aceita 500 chars; CTA "Registrar" disabled enquanto trim().length === 0
- [ ] Textarea renderiza com ≥ 200px de altura no estado vazio (validar visualmente em `01-empty.png` — não pode colapsar pra single-line)
- [ ] Submit insere row em `quick_logs` com `log_type='other'`, `intensity=null` (não `1`), `notes=texto`
- [ ] Toast "Memória registrada" aparece após sucesso
- [ ] Modal fecha; Home v7 timeline mostra "Memória adicionada." no topo
- [ ] Tap em chip de sintoma do Diário (Náusea, Dor de cabeça, etc.) ainda abre `quick-log.tsx` antiga com intensidade
- [ ] Tap em chip "Outro" do Diário → cai no redirect → abre `/diario/anotar-memoria` (legacy preservado)
- [ ] Acessar `/diario/quick-log?type=other` direto → redirect pra `/diario/anotar-memoria`
- [ ] `/impeccable critique app/diario/anotar-memoria.tsx` ≥ 32/40
- [ ] `security-review` da branch → 0 críticos
- [ ] 2 screenshots reais em `assets/screenshots/anotar-memoria/`
- [ ] Touch target CTA ≥ 44px

---

## F) Otimização de tokens

- `rtk read app/diario/quick-log.tsx` (compressão estrutural) em vez de Read full quando re-consultar
- `rtk grep "QUICK_LOG_TYPES\|other" --type ts` em vez de grep full
- Outputs de `npm install`/`npm run *` salvos em `/tmp/*.log` + referenciados via `@file`
- Plano salvo em arquivo (regra 21) — não despejar no chat
- Memória entre sessões via `claude-mem` (regra 30) — sessão termina com compactação automática

---

## Karpathy §1 — Assumptions explícitas

1. **Interpretação A confirmada por Léo** (2026-05-25) — `QUICK_LOG_TYPES`, `quickLogSchema`, `QuickLogChips` intactos.
2. **`<Redirect>` declarativo de `expo-router`** (não `router.replace` em effect) — evita flash de render durante redirect.
3. **`intensity: null` no DB é aceitável pra paint historic e novas memórias** — schema permite, RLS permite, timeline já trata `log_type==='other'` como "Memória adicionada.".
4. **`memoryNoteSchema` separado do `quickLogSchema`** evita drift e simplifica revert.
5. **`AuthButton variant='primary'` é o CTA correto** (não criar custom).
6. **Textarea 8 linhas visíveis exige `minHeight: 200` + `textAlignVertical: 'top'`** no style — `numberOfLines={8}` sozinho é só hint pro autoresize no iOS e o input colapsa pra ~40-60px no estado vazio. Validação visual via screenshot `01-empty.png`.
7. **Não há analytics/telemetry separado pra esta tela** — herdarei do padrão do app (PostHog events só em ações genéricas).

## Karpathy §2 — Could 50 lines do this?

Tela nova: ~80-100 linhas (header + textarea + CTA + KeyboardAvoidingView wrap). Hook: ~25 linhas. Schema: ~5 linhas. Total novo: ~130 linhas. Edits: ~10 linhas. **Não dá pra ser 50** porque a tela carrega 3 contextos (theme, i18n se aplicável, mutation) e wrapping de keyboard/safe-area é boilerplate obrigatório em RN — mas cada linha traceia a um critério de aceitação.

## Karpathy §3 — Cada linha traceia ao pedido

✅ Verificado na tabela D acima — nenhum drive-by refactor. `useRegisterQuickLog`, `quickLogSchema`, `QUICK_LOG_TYPES`, `QuickLogChips` ficam intactos.

---

## Próximo passo

Plano aprovado. Saindo do plan-mode e executando etapas 4–16 na ordem.

**Copy PT-BR confirmada (conforme prompt):** header "Anotar memória", placeholder "Anote uma lembrança, observação ou item para a próxima consulta.", CTA "Registrar", toast "Memória registrada".
