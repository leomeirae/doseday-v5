# HANDOFF — Prompt 13: Registrar Nova Dose

**Data:** 2026-05-18
**Branch:** `feature/13-registrar-nova-dose`
**PR:** https://github.com/leomeirae/doseday-v5/pull/13
**Plano canônico:** `docs/superpowers/plans/2026-05-18-registrar-nova-dose.md`

---

## Estado pós-implementação

Prompt 13 está **100% implementado e validado**. O PR #13 foi criado e está pronto para merge em `main`. Todos os 17 testes MCP passaram. Type-check e lint passam com zero erros.

O que funciona agora:
- **Modal "Registrar dose"** (`app/dose/registrar.tsx`): form completo com autopop de medicamento + dose do perfil, DateTimePicker customizado, chips de local e efeitos, campo de observações
- **Mutation hook** (`hooks/useRegisterDose.ts`): INSERT em `medication_applications` + invalidação de `doseSummary`
- **Toast feedback**: sucesso fecha modal, erro mantém modal aberto para retry
- **Botão + no header de Doses** → abre modal via `router.push('/dose/registrar')`
- **`formatMedicationName`** aplicado em NextDoseCard e toDoseCard mapper — "Mounjaro" sem "(Tirzepatida)"
- **`TextField` movido** para `components/ui/TextField.tsx` com suporte a `multiline`/`numberOfLines`
- **Toast provider** em `app/_layout.tsx` (último filho do root, fora do QueryClientProvider)

---

## Decisões tomadas

| Decisão | Justificativa |
|---|---|
| `TextField` movido de `auth/` → `ui/` | Componente genérico usado por form de dose; `AuthButton` permanece em `auth/` (refactor separado) |
| `side_effects: input.sideEffects` (nunca `null`) | Array vazio `[]` mais consistente para reads downstream; alinha com tipo PostgreSQL `text[]` |
| `days_until_next_dose` NOT enviado no INSERT | Usa default 7 do DB — não duplicar lógica de negócio no cliente |
| DateTimePicker `display="inline"` com toggle | `display="compact"` é invisível em iOS 26 dark mode — workaround documentado em memória |
| `autoFilledRef` pattern para autopop | Evita re-fill quando usuário limpa o campo; resolve `exhaustive-deps` lint warning |
| DoseCard **não migrado** para `DoseRecord` neste prompt | Mapper `toDoseCard` em `doses.tsx` faz a conversão; migração completa é follow-up isolado |
| Validação Zod no client: dose ≤ 20mg, `applicationDate ≤ now()` | DB tem CHECK `<= now()+1h`; cliente é mais restritivo para UX imediata |

---

## Padrões estabelecidos (referência para prompts futuros)

### 1. Mutation hook (template canônico)
- Arquivo: `hooks/useRegisterDose.ts`
- Padrão: `useMutation` + guard de sessão + `onSuccess: invalidateQueries(['doseSummary'])`
- Copiar para: `useRegisterWeight`, `useRegisterDiario`, `useEditDose`, `useDeleteDose`
- **Detalhe crítico:** `useProfile()` retorna `.data` (não `.profile`)

### 2. Modal sheet (template canônico)
- Stack.Screen: `app/_layout.tsx` com `presentation: 'modal', headerShown: false`
- Layout: `SafeAreaView edges={['top','bottom']}` → Header sticky → `KeyboardAvoidingView behavior="padding"` → `ScrollView keyboardShouldPersistTaps="handled"` → Footer com CTA
- Convenção de path: `app/<feature>/<acao>.tsx` (ex.: `app/dose/registrar.tsx`)

### 3. Toast (padrão de feedback para todas as mutations)
- `showSuccessToast('mensagem')` antes de `router.back()` no `onSuccess`
- `showErrorToast(mapQueryError(err))` no `onError` — modal permanece aberto
- `<Toast config={toastConfig} />` deve ser **último filho do root** (fora do QueryClientProvider)

### 4. `formatMedicationName`
- Util em `lib/utils/formatMedicationName.ts`
- Sempre usar ao renderizar `medicationName` vindo do Supabase

---

## Aprendizados técnicos (continuação a partir do Aprendizado 24 do Prompt 12)

**#25 — DateTimePicker iOS 26 dark mode:** `display="compact"` renderiza com altura/contraste zero. Workaround: botão `TouchableOpacity` customizado com toggle `showPicker` → `<DateTimePicker display="inline" />`.

**#26 — `simctl io tap` removido no Xcode moderno:** Substituído por `idb ui tap X Y --udid <DEVICE_ID>`. IDB instalado em `/Users/leofrancaia/.local/bin/idb`. Usar `idb ui describe-all --udid <DEVICE_ID>` para obter coordenadas do accessibility tree. Para texto: `idb ui text "texto"`.

**#27 — Tab bar Liquid Glass inacessível via IDB:** O componente BlurView da tab bar não expõe itens no accessibility tree do IDB. Solução: `mcp__react-native__open_deeplink` com `doseday:///<route>` para navegação entre abas durante testes.

**#28 — Typed routes Expo Router:** `router.push('/dose/registrar')` gera TS error se o arquivo de rota não existir ainda. Criar o arquivo placeholder primeiro, depois substituir pela implementação completa.

**#29 — Token names corretos:**
- `colors.bgBase` (não `bgDefault`)
- `colors.semanticPositive` (não `semanticSuccess`)
- `typography.title` — 22px/600 para header de modal (não `h3` — não existe)
- `typography.caption` existe ✅

**#30 — `AuthButton` props:** Aceita apenas `label`, `onPress`, `loading?`, `disabled?`, `variant?`. Não aceita `accessibilityHint`.

---

## O que NÃO foi feito neste prompt (follow-ups)

| Item | Status | Próximo prompt sugerido |
|---|---|---|
| `DoseCard` migração completa `Dose` mocks → `DoseRecord` queries | Deferred — mapper em `doses.tsx` cobre por ora | Prompt 14 ou isolado |
| `/impeccable critique` do modal | Não executado (17 MCP tests fizeram o papel de validação) | Opcional antes do merge |
| Screenshot 4 (toast success) | Não capturado (toast sumiu rápido) | Não crítico |
| `InsightCard` dinâmico | Mockado; último importador de `lib/mocks/home.ts` | Prompt futuro (Insights IA) |

---

## Próximos passos sugeridos

1. **Merge PR #13** → `main`
2. **Prompt 14:** Diário (primeiro write de `diary_entries` — segue padrão de hook + modal estabelecido aqui)
3. **Ou Prompt 14:** Edit/Delete dose (CRUD completo de `medication_applications`)
4. **A cada 5-10 prompts:** `/improve-codebase-architecture` (regra anti-pirraça 13)

---

## Skills recomendadas para a próxima sessão

| Skill | Quando usar |
|---|---|
| `react-native-best-practices` | Qualquer nova tela ou componente RN |
| `supabase-postgres-best-practices` | Próxima mutation (Diário, Edit/Delete) |
| `superpowers:writing-plans` | Antes de executar (regra anti-pirraça 21) |
| `/impeccable craft` ou `/impeccable distill` | Se a próxima tela tiver UI nova significativa |
| `handoff` | Ao fim da próxima sessão |

---

## Referências

- Plano completo: `docs/superpowers/plans/2026-05-18-registrar-nova-dose.md`
- Padrões do Prompt 13 em memória: `/Users/leofrancaia/.claude/projects/-Users-leofrancaia-Desktop-dose-day-v5/memory/project_prompt13_patterns.md`
- Arquitetura + aprendizados: `docs/architecture.md` (seções 15+, aprendizados #25-30 a adicionar)
- PR #13: https://github.com/leomeirae/doseday-v5/pull/13
