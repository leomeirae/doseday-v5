# Prompt 13-MID-registrar-nova-dose

**Branch:** `feature/13-registrar-nova-dose`
**Modelo recomendado:** Sonnet (decisões de UX modal sheet + form com vários tipos + integração mutation)
**Pré-requisito:** Prompt 12 mergeado em `main`. Home + Doses lendo dados reais. `react-native-devtools-mcp` conectado.

---

## Contexto

App hoje é **100% leitura**. Mariana abre, vê suas doses históricas, vê a próxima calculada — mas não consegue registrar absolutamente nada. App conceitualmente quebrado: "memória do tratamento" não cresce.

Este prompt destrava o **primeiro fluxo de WRITE** do V5: registrar uma dose aplicada. Padrão de Modal Sheet + Form que vai ser reusado em:
- Diário (Prompt 14) — registrar humor/sintomas
- Peso (futuro) — registrar peso atual
- Edit/delete (futuro) — modificar doses existentes

Persona-alvo: Mariana. Vê `docs/PRODUCT.md`.

**Detalhe arquitetural importante:** `medication_applications.application_date` tem CHECK `<= now() + 1 hour`. Doses futuras não podem ser registradas (são calculadas). Form precisa **clampar a data ao máximo de "agora"** (sem futuro).

---

## Tarefa

### 1. Helper de formatação de medicamento

**`lib/utils/formatMedicationName.ts`** (novo)

```typescript
/**
 * Extrai o nome comercial removendo o nome científico entre parênteses.
 * Decisão de produto: usuários se referem por nome comercial (Mounjaro), não pelo composto (Tirzepatida).
 *
 * "Mounjaro (Tirzepatida)" → "Mounjaro"
 * "Ozempic (Semaglutida)"  → "Ozempic"
 * "Wegovy"                  → "Wegovy" (sem parênteses, devolve igual)
 */
export function formatMedicationName(full: string): string {
  const parenIndex = full.indexOf(' (')
  return parenIndex === -1 ? full : full.slice(0, parenIndex)
}
```

Aplicar em:
- `components/home/NextDoseCard.tsx` — onde mostra o nome (atualmente trunca)
- `components/doses/DoseCard.tsx` — consistência visual

### 2. Toast de feedback

Decisão: usar lib `react-native-toast-message` (estável, ecosystem RN padrão, ~30 LOC de setup).

```bash
npm install react-native-toast-message
```

Setup em `app/_layout.tsx`:
- Importar `Toast` do lib
- Renderizar `<Toast />` no fim do root layout (depois do `<Stack>`, dentro do AuthProvider)
- Criar `components/ui/toastConfig.tsx` com config visual usando tokens (bg `bgElevated`, text `textPrimary`, brand-color border-left pra success)

Helper `lib/utils/showToast.ts`:
```typescript
import Toast from 'react-native-toast-message'

export function showSuccessToast(message: string) {
  Toast.show({ type: 'success', text1: message, position: 'bottom', visibilityTime: 2500 })
}

export function showErrorToast(message: string) {
  Toast.show({ type: 'error', text1: message, position: 'bottom', visibilityTime: 3500 })
}
```

### 3. Schema Zod e query

**`lib/validation/doseSchemas.ts`** (novo)

```typescript
import { z } from 'zod'

export const INJECTION_SITES = [
  'abdome',
  'coxa_direita',
  'coxa_esquerda',
  'braco_direito',
  'braco_esquerdo',
] as const

export const SIDE_EFFECTS = [
  'nausea',
  'headache',
  'fatigue',
  'diarrhea',
  'constipation',
  'injection_pain',
  'other',
] as const

export const registerDoseSchema = z.object({
  dose: z.number().positive('Dose deve ser maior que zero').max(20, 'Dose máxima é 20mg'),
  applicationDate: z.date().refine((d) => d.getTime() <= Date.now(), {
    message: 'Não é possível registrar doses futuras',
  }),
  injectionSite: z.enum(INJECTION_SITES).optional(),
  sideEffects: z.array(z.enum(SIDE_EFFECTS)).default([]),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
})

export type RegisterDoseInput = z.infer<typeof registerDoseSchema>
```

**`lib/supabase/queries/doses.ts`** (modificar — adicionar função)

```typescript
export async function registerDose(userId: string, input: RegisterDoseInput, medicationName: string): Promise<void> {
  const { error } = await supabase.from('medication_applications').insert({
    user_id: userId,
    medication_name: medicationName,
    dose: input.dose,
    application_date: input.applicationDate.toISOString(),
    injection_site: input.injectionSite ?? null,
    side_effects: input.sideEffects,
    notes: input.notes ?? null,
    // days_until_next_dose: default = 7 (constraint do DB)
  })
  if (error) throw error
}
```

### 4. Hook de mutation

**`hooks/useRegisterDose.ts`** (novo)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from './useSession'
import { useProfile } from './useProfile'
import { registerDose } from '@lib/supabase/queries/doses'
import type { RegisterDoseInput } from '@lib/validation/doseSchemas'

export function useRegisterDose() {
  const { session } = useSession()
  const { data: profile } = useProfile()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RegisterDoseInput) => {
      if (!session?.user?.id) throw new Error('Sem sessão')
      const medicationName = profile?.currentMedication ?? 'Medicamento desconhecido'
      return registerDose(session.user.id, input, medicationName)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doseSummary'] })
    },
  })
}
```

### 5. Tela modal — `app/dose/registrar.tsx` (novo)

**Layout:**

```
┌────────────────────────────────────┐
│ ✕                Registrar dose    │ ← header com close + título
├────────────────────────────────────┤
│                                    │
│ Medicamento                        │
│ Mounjaro                           │ ← read-only (do profile)
│                                    │
│ Dose (mg)                          │
│ [    5    ]                        │ ← TextField numérico
│                                    │
│ Data e hora                        │
│ [ Hoje, 18 de maio às 08:40   ▾ ] │ ← DateTimePicker
│                                    │
│ Local da aplicação (opcional)      │
│ ○ Abdome  ○ Coxa  ○ Braço          │ ← chips selecionáveis
│                                    │
│ Como você se sentiu? (opcional)    │
│ ○ Náusea  ○ Dor de cabeça  ○ ...  │ ← multi-select chips
│                                    │
│ Observações (opcional)             │
│ [                              ]   │ ← TextField multiline
│                                    │
│  ┌────────────────────────────┐    │
│  │     Registrar dose         │    │ ← AuthButton primary
│  └────────────────────────────┘    │
└────────────────────────────────────┘
```

**Stack config (`app/_layout.tsx`):**

Adicionar a rota como modal:
```typescript
<Stack.Screen name="dose/registrar" options={{ presentation: 'modal' }} />
```

**Composição da tela:**

- `SafeAreaView` + `ScrollView`
- Header customizado (não usar header nativo): row com botão `✕` à esquerda + título "Registrar dose" centralizado
- Padding horizontal `lg`, vertical `md`
- Botão `✕` chama `router.back()` (descarta sem salvar — confirmar via Alert se houver mudanças? **V1: sem confirmação. Adicionar em V2 se incomodar**)

**Componentes do form:**

1. **MedicationField** (read-only):
   - Label "Medicamento" + texto fixo `formatMedicationName(profile.currentMedication)`
   - Sem input — texto apenas
   - Se `profile.currentMedication` for null: mostrar texto cinza "Defina seu medicamento no perfil" e desabilitar o botão "Registrar dose"

2. **DoseField:**
   - Reusar `TextField` de `components/auth/` (extrair ou criar `components/ui/TextField.tsx` pra ser shared)
   - `keyboardType="decimal-pad"`, value como string convertida pra number no submit
   - Validação inline depois do primeiro submit
   - Default: `profile.currentDose` (autopop, editável)

3. **DateTimeField:**
   - `<DateTimePicker>` do `@react-native-community/datetimepicker` (instalar se necessário)
   - `maximumDate={new Date()}` (clamp ao "agora" — respeita constraint do DB)
   - Display inline (não modal) no iOS, padrão `spinner` ou `compact`
   - Default: `new Date()` (agora)
   - **Atenção:** o componente nativo do RN não é trivial em todos os casos. Investigar antes de instalar — pode ser que o Expo SDK 54 já traga via `expo-datepicker` ou recomende uma lib específica

4. **InjectionSiteField:**
   - Chips horizontais (scrollable se necessário). Layout: row com gap `sm`
   - Estado selecionado: bg `bgSurface`, border `1px brand`, text `textPrimary`
   - Não selecionado: bg `bgElevated`, border `0.5px rgba(255,255,255,0.06)`, text `textSecondary`
   - Labels em PT-BR mapeados a partir dos enum keys:
     - `abdome` → "Abdome"
     - `coxa_direita` → "Coxa direita"
     - `coxa_esquerda` → "Coxa esquerda"
     - `braco_direito` → "Braço direito"
     - `braco_esquerdo` → "Braço esquerdo"

5. **SideEffectsField:**
   - Mesmo padrão de chips, mas multi-select
   - Labels PT-BR:
     - `nausea` → "Náusea"
     - `headache` → "Dor de cabeça"
     - `fatigue` → "Cansaço"
     - `diarrhea` → "Diarreia"
     - `constipation` → "Constipação"
     - `injection_pain` → "Dor na injeção"
     - `other` → "Outro"

6. **NotesField:**
   - `TextField` multiline (rows={3})
   - `maxLength={500}`
   - Placeholder: "Como você se sentiu? Algo que vale registrar?"

7. **Submit button:**
   - `AuthButton` variant primary, label "Registrar dose"
   - `disabled` se `!profile.currentMedication` OU se Zod falhar OU mutation em loading
   - `loading` = `useRegisterDose().isPending`
   - `onPress`:
     - Validar via Zod
     - Se inválido: setar erros nos campos
     - Se válido: `mutate(input)`
     - `onSuccess`: `showSuccessToast('Dose registrada')` + `router.back()`
     - `onError`: `showErrorToast(mapQueryError(err))` (manter modal aberto pra retentar)

### 6. Trigger pra abrir o modal

Adicionar **botão "+" no header da tela Doses** (`app/(tabs)/doses.tsx`):

```tsx
// Atualizar o header inline da Doses
<View style={styles.headerRow}>
  <Text style={styles.title}>Doses</Text>
  <Pressable
    onPress={() => router.push('/dose/registrar')}
    accessibilityLabel="Registrar nova dose"
    accessibilityRole="button"
    style={styles.addButton}
    hitSlop={8}
  >
    <SymbolView name="plus" size={24} tintColor={colors.brand} />
  </Pressable>
</View>
```

Onde `headerRow` = `{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }`.

**Decisão V1:** apenas 1 entrada (botão "+" na Doses). NextDoseCard da Home **não vira tappable** neste prompt — fica pra Prompt futuro. Mantém simplicidade.

### 7. Aplicar `formatMedicationName` em NextDoseCard e DoseCard

Substituir `dose.medicationName` por `formatMedicationName(dose.medicationName)` nos dois componentes. Resolve o truncamento do screenshot atual.

---

## Skills obrigatórias

| Skill | Por quê |
|---|---|
| `react-native-best-practices` | Hooks, mutations, form patterns, Zod, KeyboardAvoidingView, DateTimePicker |
| `supabase-postgres-best-practices` | Mutation INSERT com RLS, array PostgreSQL (side_effects), constraint `application_date` |
| `/impeccable craft` | Modal sheet design, chips selecionáveis, hierarquia visual do form |
| `/impeccable harden` | Edge cases: data futura, dose fora do range, network drop durante submit, double-submit, profile.currentMedication ausente |

---

## Validação automatizada via `react-native-devtools-mcp`

### Bateria de testes

| # | Ação | Tool | Critério |
|---|---|---|---|
| 1 | Cold start + signin Leonardo | `tap` + `type_text` | Home renderiza |
| 2 | Verificar Home com nome curto | `screenshot` Home | Mostra "Mounjaro" (sem "(Tirzepatida)") |
| 3 | Navegar pra Doses | `tap` na tab | Header com botão "+" visível |
| 4 | Tap no botão "+" | `tap` no "+" | Modal abre com header "Registrar dose" |
| 5 | Screenshot modal vazio | `screenshot` | Mostra Medicamento "Mounjaro" + Dose 5 (autopop) + Data atual + chips vazios |
| 6 | A11y modal | `get_view_hierarchy` | Botão close, todos inputs e chips com labels |
| 7 | Modificar dose pra 7.5 | `tap` field + `type_text` "7.5" | Aceita decimal |
| 8 | Selecionar site abdome | `tap` chip "Abdome" | Chip muda visual pra selecionado |
| 9 | Marcar 2 efeitos colaterais | `tap` "Náusea" + `tap` "Dor de cabeça" | Ambos selecionados |
| 10 | Tap "Registrar dose" | `tap` botão | Loading aparece |
| 11 | Aguardar 2s | wait | Modal fecha, toast "Dose registrada" |
| 12 | Verificar Home atualizada | `screenshot` Home | Próxima dose recalculada (última registrada + 7 dias) |
| 13 | Verificar Doses atualizada | `tap` tab Doses + `screenshot` | Novo card no histórico (data de hoje, "Aplicada", dose 7.5mg) |
| 14 | Validar no DB | `mcp__supabase__execute_sql` | `SELECT count FROM medication_applications WHERE user_id = '...'` retorna 5 |
| 15 | Testar dose inválida | Abrir modal de novo, dose=25 (>20) + tap "Registrar" | Erro inline "Dose máxima é 20mg" |
| 16 | Testar data futura | Selecionar data amanhã | DateTimePicker bloqueia (maximumDate) — ou erro inline |
| 17 | Limpar fixture extra criada | `mcp__supabase__execute_sql DELETE` | Voltar pra 4 doses no histórico (estado pré-teste) |

### Greps técnicos

```bash
npm run type-check                # 0 erros
npm run lint                      # 0 erros novos

# formatMedicationName aplicado nos dois lugares
grep -rn "formatMedicationName" components/home/ components/doses/
# Esperado: NextDoseCard.tsx e DoseCard.tsx

# Lib instalada
cat package.json | grep "react-native-toast-message"
# Esperado: presente

# DateTimePicker
cat package.json | grep "@react-native-community/datetimepicker"
# Esperado: presente (ou alternativa Expo escolhida)
```

---

## Critérios de aceitação

- [ ] `lib/utils/formatMedicationName.ts` criado e testado
- [ ] `NextDoseCard` e `DoseCard` aplicam `formatMedicationName()` (sem truncamento ou parênteses)
- [ ] `react-native-toast-message` instalado e configurado com tokens
- [ ] `lib/utils/showToast.ts` com helpers success/error
- [ ] `lib/validation/doseSchemas.ts` com `registerDoseSchema`, enums `INJECTION_SITES` e `SIDE_EFFECTS`
- [ ] `lib/supabase/queries/doses.ts` com `registerDose()`
- [ ] `hooks/useRegisterDose.ts` com mutation + invalidate
- [ ] `app/dose/registrar.tsx` (modal) com form completo
- [ ] Stack config no `app/_layout.tsx` registra `dose/registrar` como `presentation: 'modal'`
- [ ] Botão "+" no header da tela Doses, abre o modal
- [ ] DateTimePicker com `maximumDate={new Date()}` (respeita constraint DB)
- [ ] Chips de site de injeção (single-select) e efeitos colaterais (multi-select) funcionando
- [ ] Submit chama `mutate`, `onSuccess` mostra toast + fecha modal + Home/Doses atualizam
- [ ] Erro de rede → toast vermelho, modal não fecha
- [ ] Zero `as any` / `// @ts-ignore`
- [ ] Zero hard-coded color/font/spacing
- [ ] A11y: todos os campos do form com `accessibilityLabel`
- [ ] `npm run type-check` zero erros
- [ ] `npm run lint` zero erros novos
- [ ] Bateria de 17 testes MCP executada
- [ ] **5 screenshots no PR:**
  1. Modal inicial (autopop com Mounjaro + dose 5)
  2. Modal preenchido (chips selecionados)
  3. Modal com erro de validação (dose > 20)
  4. Toast de sucesso pós-submit
  5. Doses atualizada com novo card de hoje
- [ ] `/impeccable critique` ≥ 28/40, P1/P2 resolvidos
- [ ] `/impeccable harden` rodado (edge cases)
- [ ] Salvar plano de execução em `docs/superpowers/plans/YYYY-MM-DD-registrar-nova-dose.md` ANTES de executar (regra anti-pirraça 21)
- [ ] Commit: `feat(dose): registrar nova dose com modal sheet + form + toast`
- [ ] PR aberto

---

## Restrições

- **Sem editar dose existente** — V2
- **Sem deletar dose** — V2
- **Sem agendar dose futura** — não é o modelo (constraint DB)
- **Sem mudar `current_medication` ou `current_dose` do profile** — feature do Perfil V2 futuro
- **Sem onboarding novo** — quem tem `currentMedication: null` vê msg "Defina no perfil" mas Perfil V2 ainda é placeholder. Cobrir no log "deferred" do PR
- **Sem mudar `lib/theme/tokens.ts`, infra de auth, `app/(tabs)/_layout.tsx`**
- **Sem CTA no NextDoseCard** (não fica tappable neste prompt)

---

## Antes de executar

1. Ler `CLAUDE.md` (regras anti-pirraça — em especial 21: salvar plano via `superpowers:writing-plans`)
2. Ler `docs/architecture.md` seções 14.0, 14.1, 15 e aprendizados 20-24
3. Ler `docs/PRODUCT.md` Voice & Tone
4. Ler `lib/supabase/queries/doses.ts` (vai ganhar nova função, não recriar)
5. Ler `components/home/NextDoseCard.tsx` e `components/doses/DoseCard.tsx` (vão usar `formatMedicationName`)
6. Ler `components/auth/TextField.tsx` e `components/auth/AuthButton.tsx` (reusáveis no form)
7. Confirmar via `ping` que simulador está rodando
8. Credenciais teste: `leonardo@teste.com` / `123456`

## Pós-execução

1. Rodar `/impeccable critique` (com screenshot via MCP do modal completo)
2. Rodar `/impeccable harden` (network drop, double-submit, profile sem currentMedication)
3. Resolver P1/P2 antes do commit
4. 5 screenshots via MCP anexados no PR
5. Atualizar `docs/architecture.md` seção "Aprendizados" se houver descoberta (DateTimePicker quirks, Toast lib peculiaridades, etc)
6. Atualizar `CLAUDE.md` tabela "Histórico" com linha do Prompt 13
7. PR description deve incluir:
   - "Primeiro fluxo de WRITE do V5 — input de dose"
   - 5 screenshots
   - Detalhe do `formatMedicationName` aplicado (resolve truncamento do screenshot do Prompt 12)
   - Pendência: NextDoseCard ainda não tappable (entrada única via Doses + "+")
