# Registrar Nova Dose — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o primeiro fluxo de WRITE do DoseDay V5 — registrar uma dose aplicada via modal sheet com form (medicamento read-only, dose decimal, DateTimePicker, chips de local e efeitos colaterais, textarea de observações) + toast de feedback + invalidação de query.

**Architecture:** Modal sheet via Expo Router (`presentation: 'modal'`, `app/dose/registrar.tsx`). Mutation via `useRegisterDose` hook que chama `registerDose` em `lib/supabase/queries/doses.ts`. Após sucesso, invalida `queryKey: ['doseSummary']` cobrindo Home e Doses. Toast via `react-native-toast-message` com config de tokens. `formatMedicationName` extrai nome base sem parênteses — aplicado em NextDoseCard e DoseCard. `TextField` migrado de `components/auth/` → `components/ui/` com suporte a `multiline`.

**Tech Stack:** React Native + Expo SDK 54, Expo Router, React Query v5, Zod, `@react-native-community/datetimepicker`, `react-native-toast-message`, Supabase JS v2, expo-symbols, `react-native-devtools-mcp` para validação.

**Decisions locked in:**
- `TextField` movido para `components/ui/TextField.tsx` + props `multiline?`/`numberOfLines?`
- `DoseCard` migra de `Dose` (mocks) → `DoseRecord` (queries) + renomeia props
- `side_effects: []` (não `null`) no INSERT
- `days_until_next_dose` não enviado no INSERT (default 7 no DB)
- DateTimePicker client: `maximumDate = new Date()` (mais restritivo que CHECK `<= now()+1h`)
- Chip "Outro" em efeitos colaterais = seleção simples de enum, sem texto adicional

---

## File Map

### A criar (7)
| Arquivo | Responsabilidade |
|---|---|
| `lib/utils/formatMedicationName.ts` | Util pura: remove parênteses e conteúdo do nome do medicamento |
| `lib/validation/doseSchemas.ts` | Zod schema + enums INJECTION_SITES / SIDE_EFFECTS + labels PT-BR |
| `components/ui/toastConfig.tsx` | Config visual react-native-toast-message com tokens |
| `lib/utils/showToast.ts` | Wrappers `showSuccessToast` / `showErrorToast` |
| `hooks/useRegisterDose.ts` | useMutation + invalidateQueries(['doseSummary']) |
| `components/ui/TextField.tsx` | TextField migrado de auth/ + props multiline/numberOfLines |
| `app/dose/registrar.tsx` | Tela modal com form completo |

### A modificar (7)
| Arquivo | Mudança |
|---|---|
| `app/_layout.tsx` | + `<Toast />` no root + `<Stack.Screen name="dose/registrar" presentation="modal" />` |
| `lib/supabase/queries/doses.ts` | + função `registerDose` (1ª mutation do projeto) |
| `components/home/NextDoseCard.tsx` | Importar e aplicar `formatMedicationName` |
| `components/doses/DoseCard.tsx` | Trocar import `Dose` (mocks) → `DoseRecord` + renomear props + aplicar `formatMedicationName` |
| `app/(tabs)/doses.tsx` | + botão `+` no header + remover mapper que converte DoseRecord → Dose-like |
| `app/(auth)/signin.tsx` | Atualizar import path `@components/auth/TextField` → `@components/ui/TextField` |
| `app/(auth)/signup.tsx` | Idem |
| `app/(auth)/recover.tsx` | Idem |

### A deletar (1)
| Arquivo | Por quê |
|---|---|
| `components/auth/TextField.tsx` | Movido via `git mv` para `components/ui/TextField.tsx` |

---

## Task 1: Instalar dependências

**Files:** `package.json` (modificado pelo Expo CLI)

- [ ] **Step 1: Instalar via Expo CLI (não npm install)**

```bash
cd /Users/leofrancaia/Desktop/dose-day-v5
npx expo install @react-native-community/datetimepicker react-native-toast-message
```

Expected output: versões compatíveis com SDK 54 instaladas. Sem warnings de peer deps.

- [ ] **Step 2: Verificar instalação**

```bash
grep -E '"@react-native-community/datetimepicker"|"react-native-toast-message"' package.json
```

Expected: ambas as linhas aparecem com versão.

- [ ] **Step 3: Verificar mismatch em DoseCard × mocks ANTES de qualquer Edit**

Verificar o que `app/(tabs)/doses.tsx` passa para `DoseCard`. Ler os dois arquivos:

```bash
cat app/\(tabs\)/doses.tsx
```

E:

```bash
cat components/doses/DoseCard.tsx
```

Procurar: há um mapper que converte `DoseRecord` → `{ medication, dosage, date, time, status }`? Se sim, anote as linhas. Esse mapper será removido na Task 9.

- [ ] **Step 4: Commit de setup**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): instala datetimepicker e toast-message (expo install)"
```

---

## Task 2: `lib/utils/formatMedicationName.ts`

**Files:**
- Create: `lib/utils/formatMedicationName.ts`

- [ ] **Step 1: Criar o arquivo**

```typescript
// lib/utils/formatMedicationName.ts
export function formatMedicationName(full: string): string {
  const parenIndex = full.indexOf(' (')
  return parenIndex === -1 ? full : full.slice(0, parenIndex)
}
```

- [ ] **Step 2: Verificar se Jest está configurado**

```bash
cat package.json | grep -E '"test"|"jest"'
```

Se houver script `"test": "jest"`, execute a Task 2 Step 3. Se não, pule para Step 4.

- [ ] **Step 3: Teste unitário (somente se Jest estiver configurado)**

Criar `lib/utils/__tests__/formatMedicationName.test.ts`:

```typescript
import { formatMedicationName } from '../formatMedicationName'

describe('formatMedicationName', () => {
  it('removes parenthetical content', () => {
    expect(formatMedicationName('Mounjaro (Tirzepatida)')).toBe('Mounjaro')
  })

  it('returns original name when no parentheses', () => {
    expect(formatMedicationName('Wegovy')).toBe('Wegovy')
  })

  it('handles multiple words before parenthesis', () => {
    expect(formatMedicationName('Saxenda 6mg/mL (Liraglutida)')).toBe('Saxenda 6mg/mL')
  })
})
```

Rodar:
```bash
npx jest lib/utils/__tests__/formatMedicationName.test.ts
```
Expected: 3 passing.

- [ ] **Step 4: Type-check**

```bash
npm run type-check
```
Expected: 0 erros.

- [ ] **Step 5: Commit**

```bash
git add lib/utils/formatMedicationName.ts
git commit -m "feat(utils): adiciona formatMedicationName — remove parênteses do nome do med"
```

---

## Task 3: `lib/validation/doseSchemas.ts`

**Files:**
- Create: `lib/validation/doseSchemas.ts`

- [ ] **Step 1: Verificar se `lib/validation/` existe**

```bash
ls lib/validation/ 2>/dev/null || echo "NOT_FOUND"
```

Se `NOT_FOUND`, o arquivo será criado direto (Node/TS cria o arquivo, não o dir automaticamente — usar Write tool).

- [ ] **Step 2: Criar o schema**

```typescript
// lib/validation/doseSchemas.ts
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

export type InjectionSite = (typeof INJECTION_SITES)[number]
export type SideEffect = (typeof SIDE_EFFECTS)[number]

export const INJECTION_SITE_LABELS: Record<InjectionSite, string> = {
  abdome: 'Abdome',
  coxa_direita: 'Coxa direita',
  coxa_esquerda: 'Coxa esquerda',
  braco_direito: 'Braço direito',
  braco_esquerdo: 'Braço esquerdo',
}

export const SIDE_EFFECT_LABELS: Record<SideEffect, string> = {
  nausea: 'Náusea',
  headache: 'Dor de cabeça',
  fatigue: 'Cansaço',
  diarrhea: 'Diarreia',
  constipation: 'Constipação',
  injection_pain: 'Dor na injeção',
  other: 'Outro',
}

export const registerDoseSchema = z.object({
  dose: z
    .number()
    .positive('Dose deve ser maior que zero')
    .max(20, 'Dose máxima é 20mg'),
  applicationDate: z
    .date()
    .refine((d) => d.getTime() <= Date.now(), {
      message: 'Não é possível registrar doses futuras',
    }),
  injectionSite: z.enum(INJECTION_SITES).optional(),
  sideEffects: z.array(z.enum(SIDE_EFFECTS)).default([]),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
})

export type RegisterDoseInput = z.infer<typeof registerDoseSchema>
```

- [ ] **Step 3: Type-check**

```bash
npm run type-check
```
Expected: 0 erros.

- [ ] **Step 4: Commit**

```bash
git add lib/validation/doseSchemas.ts
git commit -m "feat(validation): schema Zod para registrar dose (enums, labels PT-BR)"
```

---

## Task 4: `registerDose` em `lib/supabase/queries/doses.ts`

**Files:**
- Modify: `lib/supabase/queries/doses.ts`

Esta é a **primeira mutation (INSERT)** do projeto. Seguir o mesmo padrão do `getDoseSummary`: sem try/catch, propagar erro do Supabase direto.

- [ ] **Step 1: Ler o arquivo atual para verificar imports existentes**

```bash
head -20 lib/supabase/queries/doses.ts
```

Confirmar: `supabase` está importado de `@lib/supabase/client` e `RegisterDoseInput` não está importado ainda.

- [ ] **Step 2: Adicionar import e função ao final do arquivo**

No início do arquivo, adicionar import (após os imports existentes):

```typescript
import type { RegisterDoseInput } from '@lib/validation/doseSchemas'
```

No final do arquivo, adicionar:

```typescript
export async function registerDose(
  userId: string,
  input: RegisterDoseInput,
  medicationName: string
): Promise<void> {
  const { error } = await supabase.from('medication_applications').insert({
    user_id: userId,
    medication_name: medicationName,
    dose: input.dose,
    application_date: input.applicationDate.toISOString(),
    injection_site: input.injectionSite ?? null,
    side_effects: input.sideEffects,
    notes: input.notes ?? null,
  })

  if (error) throw error
}
```

**Notas críticas:**
- `side_effects: input.sideEffects` sempre é array `[]` no mínimo (Zod default). Não enviar `null`.
- `days_until_next_dose` omitido — DB usa default 7.
- `id` omitido — auto-gerado UUID.
- `created_at` omitido — auto.

- [ ] **Step 3: Type-check**

```bash
npm run type-check
```
Expected: 0 erros. Se `@lib/validation/doseSchemas` der "module not found", verificar se `tsconfig.json` tem `@lib` no paths.

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/queries/doses.ts lib/validation/doseSchemas.ts
git commit -m "feat(supabase): função registerDose — primeira mutation do projeto"
```

---

## Task 5: Toast infra

**Files:**
- Create: `components/ui/toastConfig.tsx`
- Create: `lib/utils/showToast.ts`

- [ ] **Step 1: Verificar token names de semanticSuccess e semanticCritical**

```bash
grep -E "semantic(Success|Critical|Warning)" lib/theme/tokens.ts | head -10
```

Anote os nomes exatos. Se `semanticSuccess` não existir, verificar o nome correto (pode ser `success`, `positive`, `green`, etc).

- [ ] **Step 2: Criar `components/ui/toastConfig.tsx`**

Substituir `colors.semanticSuccess` e `colors.semanticCritical` pelos nomes exatos descobertos no Step 1.

```tsx
// components/ui/toastConfig.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import type { ToastConfig } from 'react-native-toast-message'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

function ToastBase({
  message,
  borderColor,
}: {
  message: string
  borderColor: string
}) {
  return (
    <View style={[styles.container, { borderLeftColor: borderColor }]}>
      <Text style={styles.text} numberOfLines={2}>
        {message}
      </Text>
    </View>
  )
}

export const toastConfig: ToastConfig = {
  success: ({ text1 }) => (
    <ToastBase message={text1 ?? ''} borderColor={colors.semanticSuccess} />
  ),
  error: ({ text1 }) => (
    <ToastBase message={text1 ?? ''} borderColor={colors.semanticCritical} />
  ),
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    ...typography.body,
    color: colors.textPrimary,
  },
})
```

- [ ] **Step 3: Criar `lib/utils/showToast.ts`**

```typescript
// lib/utils/showToast.ts
import Toast from 'react-native-toast-message'

export function showSuccessToast(message: string): void {
  Toast.show({
    type: 'success',
    text1: message,
    position: 'bottom',
    visibilityTime: 2500,
  })
}

export function showErrorToast(message: string): void {
  Toast.show({
    type: 'error',
    text1: message,
    position: 'bottom',
    visibilityTime: 3500,
  })
}
```

- [ ] **Step 4: Type-check**

```bash
npm run type-check
```
Expected: 0 erros.

- [ ] **Step 5: Commit**

```bash
git add components/ui/toastConfig.tsx lib/utils/showToast.ts
git commit -m "feat(toast): infra de toast com config de tokens (success/error)"
```

---

## Task 6: Atualizar `app/_layout.tsx`

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Ler o arquivo para entender estrutura atual**

```bash
cat app/_layout.tsx
```

Identificar: (1) onde está o `</Stack>` ou o fim dos providers, (2) se já há algum `Stack.Screen` definido explicitamente.

- [ ] **Step 2: Adicionar imports**

No topo do arquivo, adicionar:

```typescript
import Toast from 'react-native-toast-message'
import { toastConfig } from '@components/ui/toastConfig'
```

- [ ] **Step 3: Adicionar `Stack.Screen` para o modal**

Dentro do `<Stack>` (ou onde os Stack.Screen são declarados), adicionar **antes** do fechamento `</Stack>`:

```tsx
<Stack.Screen
  name="dose/registrar"
  options={{ presentation: 'modal', headerShown: false }}
/>
```

- [ ] **Step 4: Adicionar `<Toast />` no root**

Após o fechamento do último provider/wrapper (mas antes do fechamento do componente raiz), adicionar:

```tsx
<Toast config={toastConfig} />
```

O `<Toast />` deve ficar **por último** nos filhos do root para ficar acima de todos os outros elementos.

- [ ] **Step 5: Type-check e verificação visual**

```bash
npm run type-check
```
Expected: 0 erros.

MCP: `screenshot` da Home para confirmar que o app ainda renderiza após as mudanças.

- [ ] **Step 6: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat(layout): adiciona Toast provider e Stack.Screen modal dose/registrar"
```

---

## Task 7: `hooks/useRegisterDose.ts`

**Files:**
- Create: `hooks/useRegisterDose.ts`

- [ ] **Step 1: Verificar exports de useSession e useProfile**

```bash
grep -n "export" hooks/useSession.ts | head -5
grep -n "export" hooks/useProfile.ts | head -5
```

Confirmar: `useSession` retorna `{ session }` e `useProfile` retorna `{ profile }`. Verificar também o tipo de `profile.currentMedication` (string | null?).

- [ ] **Step 2: Verificar queryKey em useDoseSummary**

```bash
grep -n "queryKey" hooks/useDoseSummary.ts
```

Confirmar que o key usado é `['doseSummary']` para o `invalidateQueries` funcionar.

- [ ] **Step 3: Criar o hook**

```typescript
// hooks/useRegisterDose.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@hooks/useSession'
import { useProfile } from '@hooks/useProfile'
import { registerDose } from '@lib/supabase/queries/doses'
import type { RegisterDoseInput } from '@lib/validation/doseSchemas'

export function useRegisterDose() {
  const { session } = useSession()
  const { profile } = useProfile()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RegisterDoseInput) => {
      if (!session?.user?.id) throw new Error('Sem sessão')
      return registerDose(
        session.user.id,
        input,
        profile?.currentMedication ?? 'Medicamento desconhecido'
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doseSummary'] })
    },
  })
}
```

**Atenção:** Se o type-check reclamar que `profile.currentMedication` não é string (e.g. é `string | null | undefined`), a linha `profile?.currentMedication ?? 'Medicamento desconhecido'` já cobre isso.

- [ ] **Step 4: Type-check**

```bash
npm run type-check
```
Expected: 0 erros.

- [ ] **Step 5: Commit**

```bash
git add hooks/useRegisterDose.ts
git commit -m "feat(hooks): useRegisterDose — mutation com invalidação de doseSummary"
```

---

## Task 8: Mover `TextField` → `components/ui/TextField.tsx` + extensão multiline

**Files:**
- Create: `components/ui/TextField.tsx` (via git mv)
- Delete: `components/auth/TextField.tsx`
- Modify: `app/(auth)/signin.tsx`, `app/(auth)/signup.tsx`, `app/(auth)/recover.tsx`

- [ ] **Step 1: Listar todos os importadores**

```bash
grep -rn "from.*auth/TextField" app/ components/ --include="*.tsx" --include="*.ts"
```

Expected: `signin.tsx`, `signup.tsx`, `recover.tsx`. Se houver outros, incluí-los na lista de modificações.

- [ ] **Step 2: Mover o arquivo preservando histórico**

```bash
git mv components/auth/TextField.tsx components/ui/TextField.tsx
```

- [ ] **Step 3: Ler o arquivo movido**

```bash
cat components/ui/TextField.tsx
```

Localizar: (a) interface `Props`, (b) o `TextInput` no JSX, (c) o `styles.input` com `height: 52`.

- [ ] **Step 4: Adicionar props multiline à interface**

Na interface `Props` (após as props existentes, antes do `}`), adicionar:

```typescript
  multiline?: boolean
  numberOfLines?: number
```

- [ ] **Step 5: Passar props ao TextInput**

No JSX do `TextInput`, adicionar as novas props:

```tsx
<TextInput
  {/* ... props existentes ... */}
  multiline={multiline}
  numberOfLines={multiline ? (numberOfLines ?? 3) : undefined}
  textAlignVertical={multiline ? 'top' : 'center'}
  style={[
    styles.input,
    focused && styles.inputFocused,
    !!error && styles.inputError,
    multiline && styles.inputMultiline,
  ]}
/>
```

**Nota:** O array de styles no TextInput provavelmente já tem `focused` e `error` variants — verifique o código atual e adicione `multiline && styles.inputMultiline` ao array existente.

- [ ] **Step 6: Adicionar estilo `inputMultiline`**

No `StyleSheet.create({...})`, adicionar após o estilo `input`:

```typescript
inputMultiline: {
  height: undefined,
  minHeight: 52,
  paddingTop: 12,
  paddingBottom: 12,
},
```

**Nota:** O estilo `input` tem `height: 52`. Ao combinar com `inputMultiline`, o `height: undefined` sobrescreve o `height: 52` e `minHeight: 52` garante o tamanho mínimo.

- [ ] **Step 7: Atualizar 3 importadores**

Em `app/(auth)/signin.tsx`, `app/(auth)/signup.tsx`, `app/(auth)/recover.tsx`:

Trocar:
```typescript
import { TextField } from '@components/auth/TextField'
```
ou:
```typescript
import TextField from '@components/auth/TextField'
```

Por:
```typescript
import { TextField } from '@components/ui/TextField'
```

(Ajuste para default vs named import conforme o arquivo original.)

- [ ] **Step 8: Type-check**

```bash
npm run type-check
```
Expected: 0 erros. Se houver "Cannot find module '@components/auth/TextField'", algum importador foi esquecido — rodar o grep do Step 1 novamente.

- [ ] **Step 9: Validação visual das telas auth via MCP**

```
mcp__react-native__screenshot  →  confirmar que Home/Signin renderiza
```

Navegar para signin: `mcp__react-native__open_deeplink` com `/(auth)/signin` ou tap no DEV link da Home. Screenshot.

- [ ] **Step 10: Commit**

```bash
git add components/ui/TextField.tsx app/\(auth\)/signin.tsx app/\(auth\)/signup.tsx app/\(auth\)/recover.tsx
git commit -m "refactor(ui): move TextField para components/ui + suporte a multiline"
```

---

## Task 9: Fix `DoseCard.tsx` + aplicar `formatMedicationName` em Doses

**Files:**
- Modify: `components/doses/DoseCard.tsx`
- Modify: `app/(tabs)/doses.tsx`

- [ ] **Step 1: Ler `app/(tabs)/doses.tsx` na íntegra**

```bash
cat app/\(tabs\)/doses.tsx
```

Procurar: há um mapper que converte `DoseRecord` → objeto com `{ medication, dosage, date, time, status }`? Se sim, anote as linhas — esse mapper será **removido** nesta task.

- [ ] **Step 2: Ler `components/doses/DoseCard.tsx` na íntegra**

```bash
cat components/doses/DoseCard.tsx
```

Identificar exatamente:
- Linha do import de `Dose` de mocks
- Linha onde usa `dose.medication`
- Linha onde usa `dose.dosage`
- Linha onde usa `dose.date`
- Linha onde usa `dose.time`
- A11y label completo

- [ ] **Step 3: Atualizar import em `DoseCard.tsx`**

Trocar:
```typescript
import type { Dose } from '@lib/mocks/doses'
```
Por:
```typescript
import type { DoseRecord } from '@lib/supabase/queries/doses'
import { formatMedicationName } from '@lib/utils/formatMedicationName'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
```

- [ ] **Step 4: Atualizar prop type do componente**

Trocar `dose: Dose` → `dose: DoseRecord` no tipo das props (ou no parâmetro do componente).

- [ ] **Step 5: Atualizar acessos de campos**

| Antes | Depois |
|---|---|
| `dose.medication` | `formatMedicationName(dose.medicationName)` |
| `dose.dosage` | `\`${dose.dose}mg\`` |
| `dose.date` | `format(dose.applicationDate, "d 'de' MMMM", { locale: ptBR })` |
| `dose.time` | `'--'` (hardcoded — Aprendizado 23: não há campo de horário no DB) |

Para a a11y label, substituir os refs antigos pelos novos valores.

- [ ] **Step 6: Verificar e atualizar `app/(tabs)/doses.tsx`**

Se havia mapper de conversão `DoseRecord → Dose-like`, removê-lo. Passar `DoseRecord` diretamente para `DoseCard`. O tipo do array passado deve ser `DoseRecord[]`.

Se `DoseCard` recebia a prop como `dose={item}` onde `item` era um objeto mapeado, simplificar para `dose={record}` onde `record: DoseRecord`.

- [ ] **Step 7: Type-check**

```bash
npm run type-check
```
Expected: 0 erros.

- [ ] **Step 8: Screenshot de validação via MCP**

```
mcp__react-native__screenshot  →  navegar para tab Doses
```

Confirmar: cards mostram `medicationName` sem parênteses, `dose` com `mg`, `date` formatado, sem `undefined`.

- [ ] **Step 9: Commit**

```bash
git add components/doses/DoseCard.tsx app/\(tabs\)/doses.tsx
git commit -m "fix(doses): DoseCard migra tipo de mocks para DoseRecord + aplica formatMedicationName"
```

---

## Task 10: Aplicar `formatMedicationName` em `NextDoseCard.tsx`

**Files:**
- Modify: `components/home/NextDoseCard.tsx`

- [ ] **Step 1: Ler o arquivo e localizar a linha com medicationName**

```bash
grep -n "medicationName\|medicationLabel" components/home/NextDoseCard.tsx
```

Expected: linha ~73-74 renderiza `{nextDose.medicationName}` sem formatação.

- [ ] **Step 2: Adicionar import**

No topo do arquivo, adicionar:
```typescript
import { formatMedicationName } from '@lib/utils/formatMedicationName'
```

- [ ] **Step 3: Aplicar na renderização**

Trocar:
```tsx
{nextDose.medicationName}{nextDose.dose != null ? ` · ${nextDose.dose}mg` : ''}
```
Por:
```tsx
{formatMedicationName(nextDose.medicationName)}{nextDose.dose != null ? ` · ${nextDose.dose}mg` : ''}
```

- [ ] **Step 4: Type-check + screenshot**

```bash
npm run type-check
```

MCP screenshot da Home: confirmar "Mounjaro" sem "(Tirzepatida)".

- [ ] **Step 5: Commit**

```bash
git add components/home/NextDoseCard.tsx
git commit -m "fix(home): NextDoseCard aplica formatMedicationName — remove parênteses"
```

---

## Task 11: Botão `+` no header de `app/(tabs)/doses.tsx`

**Files:**
- Modify: `app/(tabs)/doses.tsx`

- [ ] **Step 1: Ler como o header atual está implementado**

```bash
grep -n "headerRight\|header\|Pressable\|SymbolView" app/\(tabs\)/doses.tsx | head -20
```

Identificar se há `<Stack.Screen options={{ ... }}>` inline ou se o header é um componente customizado.

- [ ] **Step 2: Adicionar botão `+` ao header**

**Opção A** — Se o header usa `Stack.Screen` com `options`:
```tsx
<Stack.Screen
  options={{
    headerRight: () => (
      <Pressable
        onPress={() => router.push('/dose/registrar')}
        hitSlop={8}
        accessibilityLabel="Registrar nova dose"
        accessibilityRole="button"
        style={{ marginRight: spacing.md }}
      >
        <SymbolView name="plus" size={24} tintColor={colors.brand} />
      </Pressable>
    ),
  }}
/>
```

**Opção B** — Se o header é customizado com View:
Adicionar o Pressable com SymbolView ao lado direito do header row existente.

- [ ] **Step 3: Adicionar imports necessários**

```typescript
import { router } from 'expo-router'
import { Pressable } from 'react-native'
import { SymbolView } from 'expo-symbols'
import { colors, spacing } from '@lib/theme/tokens'
```

(Importar apenas o que ainda não está importado.)

- [ ] **Step 4: Type-check**

```bash
npm run type-check
```
Expected: 0 erros.

- [ ] **Step 5: Screenshot via MCP**

MCP: navegar para tab Doses, screenshot. Confirmar botão `+` visível no header, cor `colors.brand`.

- [ ] **Step 6: Commit**

```bash
git add app/\(tabs\)/doses.tsx
git commit -m "feat(doses): adiciona botão + no header para registrar dose"
```

---

## Task 12: Criar `app/dose/registrar.tsx` — Tela modal com form

**Files:**
- Create: `app/dose/registrar.tsx`

Esta é a maior task. Leia com atenção antes de escrever.

- [ ] **Step 1: Verificar tokens disponíveis para o form**

```bash
grep -n "export const" lib/theme/tokens.ts | head -40
```

Verificar que existem: `colors.bgDefault`, `colors.bgElevated`, `colors.bgSurface`, `colors.brand`, `colors.textPrimary`, `colors.textSecondary`, `colors.semanticCritical`, `typography.h3`, `typography.body`, `typography.caption` (ou nome equivalente para texto pequeno), `spacing.sm`, `spacing.md`, `spacing.lg`, `radius.md`.

Se `typography.caption` não existir, use o equivalente correto. Se `spacing.xs` não existir, use `4` (hardcoded).

- [ ] **Step 2: Criar `app/dose/registrar.tsx`**

```tsx
// app/dose/registrar.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { router } from 'expo-router'
import DateTimePicker from '@react-native-community/datetimepicker'
import { SymbolView } from 'expo-symbols'
import { useSession } from '@hooks/useSession'
import { useProfile } from '@hooks/useProfile'
import { useRegisterDose } from '@hooks/useRegisterDose'
import { TextField } from '@components/ui/TextField'
import { AuthButton } from '@components/auth/AuthButton'
import { formatMedicationName } from '@lib/utils/formatMedicationName'
import { showSuccessToast, showErrorToast } from '@lib/utils/showToast'
import { mapQueryError } from '@lib/supabase/queries/errors'
import {
  registerDoseSchema,
  INJECTION_SITES,
  SIDE_EFFECTS,
  INJECTION_SITE_LABELS,
  SIDE_EFFECT_LABELS,
  type InjectionSite,
  type SideEffect,
} from '@lib/validation/doseSchemas'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

export default function RegistrarDoseScreen() {
  const { session } = useSession()
  const { profile } = useProfile()
  const { mutate, isPending } = useRegisterDose()

  const initialDose =
    profile?.currentDose != null ? String(profile.currentDose) : ''

  const [doseStr, setDoseStr] = useState(initialDose)
  const [applicationDate, setApplicationDate] = useState(new Date())
  const [injectionSite, setInjectionSite] = useState<InjectionSite | undefined>(
    undefined
  )
  const [sideEffects, setSideEffects] = useState<SideEffect[]>([])
  const [notes, setNotes] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const medicationName = profile?.currentMedication ?? null
  const hasMedication = medicationName != null

  function toggleSideEffect(effect: SideEffect) {
    setSideEffects((prev) =>
      prev.includes(effect) ? prev.filter((e) => e !== effect) : [...prev, effect]
    )
  }

  function handleSubmit() {
    const doseNum = parseFloat(doseStr.replace(',', '.'))

    const raw = {
      dose: doseNum,
      applicationDate,
      injectionSite,
      sideEffects,
      notes: notes.trim() || undefined,
    }

    const result = registerDoseSchema.safeParse(raw)
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.errors.forEach((e) => {
        const field = String(e.path[0] ?? 'form')
        errors[field] = e.message
      })
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    mutate(result.data, {
      onSuccess: () => {
        showSuccessToast('Dose registrada')
        router.back()
      },
      onError: (err) => {
        showErrorToast(mapQueryError(err as Error))
      },
    })
  }

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityLabel="Fechar"
            accessibilityRole="button"
            style={styles.closeButton}
          >
            <SymbolView name="xmark" size={20} tintColor={colors.textSecondary} />
          </Pressable>
          <Text style={styles.headerTitle} accessibilityRole="header">
            Registrar dose
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Form */}
        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Campo 1: Medicamento (read-only) */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Medicamento</Text>
            {hasMedication ? (
              <Text style={styles.fieldValue}>
                {formatMedicationName(medicationName)}
              </Text>
            ) : (
              <Text
                style={styles.fieldValueDisabled}
                accessibilityHint="Acesse seu perfil para configurar seu medicamento"
              >
                Defina seu medicamento no perfil
              </Text>
            )}
          </View>

          {/* Campo 2: Dose */}
          <TextField
            label="Dose (mg)"
            value={doseStr}
            onChangeText={setDoseStr}
            keyboardType="decimal-pad"
            error={formErrors.dose}
            accessibilityLabel="Dose em miligramas"
            placeholder="Ex: 5"
          />

          {/* Campo 3: Data e hora */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Quando</Text>
            <DateTimePicker
              value={applicationDate}
              mode="datetime"
              display="inline"
              maximumDate={new Date()}
              onChange={(_event, date) => {
                if (date) setApplicationDate(date)
              }}
              accentColor={colors.brand}
              accessibilityLabel="Data e hora da aplicação"
            />
            {formErrors.applicationDate ? (
              <Text style={styles.fieldError}>{formErrors.applicationDate}</Text>
            ) : null}
          </View>

          {/* Campo 4: Local da aplicação */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Local da aplicação (opcional)</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {INJECTION_SITES.map((site) => {
                const selected = injectionSite === site
                return (
                  <Pressable
                    key={site}
                    onPress={() =>
                      setInjectionSite(selected ? undefined : site)
                    }
                    style={[styles.chip, selected && styles.chipSelected]}
                    accessibilityLabel={INJECTION_SITE_LABELS[site]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={[
                        styles.chipLabel,
                        selected && styles.chipLabelSelected,
                      ]}
                    >
                      {INJECTION_SITE_LABELS[site]}
                    </Text>
                  </Pressable>
                )
              })}
            </ScrollView>
          </View>

          {/* Campo 5: Efeitos colaterais */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Efeitos colaterais (opcional)</Text>
            <View style={styles.chipsWrap}>
              {SIDE_EFFECTS.map((effect) => {
                const selected = sideEffects.includes(effect)
                return (
                  <Pressable
                    key={effect}
                    onPress={() => toggleSideEffect(effect)}
                    style={[styles.chip, selected && styles.chipSelected]}
                    accessibilityLabel={SIDE_EFFECT_LABELS[effect]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={[
                        styles.chipLabel,
                        selected && styles.chipLabelSelected,
                      ]}
                    >
                      {SIDE_EFFECT_LABELS[effect]}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </View>

          {/* Campo 6: Observações */}
          <TextField
            label="Observações (opcional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            maxLength={500}
            placeholder="Como você se sentiu? Algo que vale registrar?"
            accessibilityLabel="Observações sobre a dose"
          />
        </ScrollView>

        {/* Footer com botão de submit */}
        <View style={styles.footer}>
          <AuthButton
            label="Registrar dose"
            onPress={handleSubmit}
            loading={isPending}
            disabled={!hasMedication || isPending}
            accessibilityLabel={
              !hasMedication
                ? 'Registrar dose — defina seu medicamento no perfil primeiro'
                : 'Registrar dose'
            }
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDefault,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  form: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  field: {
    gap: spacing.sm,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  fieldValue: {
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  fieldValueDisabled: {
    ...typography.body,
    color: colors.textSecondary,
    paddingVertical: spacing.sm,
    fontStyle: 'italic',
  },
  fieldError: {
    ...typography.caption,
    color: colors.semanticCritical,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  chipSelected: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  chipLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  chipLabelSelected: {
    color: colors.textPrimary,
  },
})
```

**Notas importantes:**
- Se `typography.caption` não existir no token, substitua pelo token correto encontrado no Step 1.
- `colors.bgDefault` pode ser `colors.background` ou similar — verificar no Step 1.
- `parseFloat(doseStr.replace(',', '.'))` trata entrada decimal com vírgula (teclado PT-BR).

- [ ] **Step 3: Type-check**

```bash
npm run type-check
```
Expected: 0 erros. Erros comuns:
- `typography.caption` não existe → substituir pelo token correto
- `colors.bgDefault` não existe → substituir pelo token correto  
- `colors.semanticSuccess` em toastConfig → substituir pelo token correto

- [ ] **Step 4: Commit**

```bash
git add app/dose/registrar.tsx
git commit -m "feat(dose): tela modal registrar dose com form completo"
```

---

## Task 13: Validação MCP — 17 testes

**Pré-requisitos:** Simulador iOS 26 booted. App em `npx expo run:ios`. Credenciais `leonardo@teste.com` / `123456`.

- [ ] **Teste 1: Cold start + signin**

```
mcp__react-native__ping
```
Confirmar app respondendo. Fazer signin com `leonardo@teste.com` / `123456` se necessário via `mcp__react-native__tap` + `mcp__react-native__type_text`.

- [ ] **Teste 2: Screenshot Home — formatMedicationName**

```
mcp__react-native__screenshot
```
**Pass:** NextDoseCard mostra "Mounjaro" (sem "(Tirzepatida)") e a data correta.

- [ ] **Teste 3: Navegar para Doses + botão `+`**

```
mcp__react-native__tap  (tab Doses)
mcp__react-native__screenshot
```
**Pass:** Botão `+` visível no header, cor `brand`.

- [ ] **Teste 4: Abrir modal via `+`**

```
mcp__react-native__tap  (botão +)
mcp__react-native__screenshot
```
**Pass:** Modal slide-up, header "Registrar dose", botão `✕` visível.

- [ ] **Teste 5: Screenshot modal inicial — autopop**

```
mcp__react-native__screenshot
```
**Pass:** Medicamento = "Mounjaro", Dose = "5" (ou valor de `profile.currentDose`), data = hoje agora.

- [ ] **Teste 6: A11y check do modal**

```
mcp__react-native__get_view_hierarchy
```
**Pass:** `✕` tem `accessibilityLabel="Fechar"`, `accessibilityRole="button"`. Campos com label e hint. Chips com `role="button"` e `state.selected`.

- [ ] **Teste 7: Editar dose para 7.5**

```
mcp__react-native__tap  (campo dose)
mcp__react-native__type_text  ("7.5")
mcp__react-native__screenshot
```
**Pass:** Campo mostra "7.5", sem erro.

- [ ] **Teste 8: Selecionar chip Abdome**

```
mcp__react-native__tap  (chip "Abdome")
mcp__react-native__screenshot
```
**Pass:** Chip com border `brand`, background `bgSurface`.

- [ ] **Teste 9: Selecionar 2 efeitos colaterais (Náusea + Cansaço)**

```
mcp__react-native__tap  (chip "Náusea")
mcp__react-native__tap  (chip "Cansaço")
mcp__react-native__screenshot
```
**Pass:** Dois chips selecionados simultaneamente (multi-select).

- [ ] **Teste 10: Tap "Registrar dose" → loading**

```
mcp__react-native__tap  (botão "Registrar dose")
mcp__react-native__screenshot
```
**Pass:** AuthButton mostra `ActivityIndicator`.

- [ ] **Teste 11: Aguardar sucesso**

```
mcp__react-native__get_js_logs
mcp__react-native__screenshot
```
**Pass:** Modal fechou. Toast bottom "Dose registrada" visível (2.5s). Sem erros no console.

- [ ] **Teste 12: Home — próxima dose recalculada**

```
mcp__react-native__tap  (tab Home)
mcp__react-native__screenshot
```
**Pass:** NextDoseCard mostra próxima dose em ~7 dias a partir de hoje.

- [ ] **Teste 13: Tab Doses — novo card**

```
mcp__react-native__tap  (tab Doses)
mcp__react-native__screenshot
```
**Pass:** Card "Hoje, 7.5mg, Aplicada" visível no histórico.

- [ ] **Teste 14: Confirmar INSERT no DB + capturar ID**

Via Supabase MCP:
```sql
SELECT id, dose, application_date 
FROM medication_applications 
WHERE user_id = '7f42257c-50ba-4b35-8e31-25a8443066f7'
ORDER BY created_at DESC 
LIMIT 1;
```
**Pass:** Count total = 5 (era 4). Guardar `id` do registro para o Teste 17.

- [ ] **Teste 15: Dose inválida = 25**

Abrir modal de novo, apagar dose, digitar "25", tap "Registrar dose".

```
mcp__react-native__screenshot
```
**Pass:** Erro inline "Dose máxima é 20mg" visível abaixo do campo. Botão volta ao estado normal (mutation não chamada).

- [ ] **Teste 16: Verificar maximumDate no DatePicker**

```
mcp__react-native__screenshot
```
**Pass:** Datas futuras aparecendo desabilitadas (cinzas) no DateTimePicker inline.

- [ ] **Teste 17: DELETE do registro de teste**

Via Supabase MCP — **Opção A (recomendada)**:
```sql
DELETE FROM medication_applications
WHERE user_id = '7f42257c-50ba-4b35-8e31-25a8443066f7'
  AND application_date::date = CURRENT_DATE
  AND dose = 7.5;
```
**Fallback Opção B** (se múltiplos testes no mesmo dia):
```sql
DELETE FROM medication_applications WHERE id = '<id-capturado-no-teste-14>';
```
**Pass:** "1 row deleted". Count total volta a 4.

- [ ] **Commit dos 5 screenshots**

Salvar os screenshots como arquivos locais:
- `pr-screenshot-01-modal-inicial.png`
- `pr-screenshot-02-modal-preenchido.png`
- `pr-screenshot-03-modal-erro-validacao.png`
- `pr-screenshot-04-toast-sucesso.png`
- `pr-screenshot-05-doses-pos-insert.png`

---

## Task 14: `/impeccable critique` + harden + pre-merge + handoff

**Files:**
- Modify: qualquer arquivo que o critique/harden identificar como P1/P2
- Create: `docs/handoff/HANDOFF-prompt-13.md`
- Modify: `CLAUDE.md` (tabela de histórico)

- [ ] **Step 1: `/impeccable critique` na tela `registrar.tsx`**

Invocar skill `/impeccable critique` com foco na tela `app/dose/registrar.tsx`.

**Alvo:** ≥ 28/40. P1/P2 resolvidos in-place. P3 vira follow-up anotado.

- [ ] **Step 2: `/impeccable harden` para edge cases**

Invocar skill `/impeccable harden` com foco em:
- Network drop durante submit (modal continua aberto → ✅ já implementado via onError)
- Double-submit enquanto loading (botão disabled → ✅ já implementado)
- Input dose = "0" ou "abc" (Zod captura → ✅)
- `profile.currentMedication = null` (botão disabled → ✅)
- Modal fechado por swipe-down sem submit (abandono silencioso → aceitável V1)
- Teclado aparece sobre o NotesField no footer

- [ ] **Step 3: `npm run type-check` + `npm run lint`**

```bash
npm run type-check && npm run lint
```
Expected: 0 erros, 0 warnings novos.

- [ ] **Step 4: Handoff**

```bash
ls docs/handoff/ 2>/dev/null || mkdir -p docs/handoff
```

Invocar skill `handoff` (Matt Pocock) para gerar `docs/handoff/HANDOFF-prompt-13.md`.

O handoff deve cobrir:
- **Estado pós-merge:** modal de dose funcionando, primeira mutation, toast infra, formatMedicationName, TextField em `ui/`
- **Decisões tomadas:** TextField movido (`auth/` → `ui/`), DoseCard migrou tipo mocks→queries, `side_effects: []` não null, `days_until_next_dose` omitido
- **Padrões estabelecidos:** hook de mutation (`useRegisterDose` como template), modal sheet (`app/<feature>/<acao>.tsx`), toast (`showSuccessToast`/`showErrorToast`), `formatMedicationName` para todo render de medicationName
- **Próximos prompts sugeridos:** Diário (write), Edit/Delete dose, InsightCard dinâmico (remover mock `lib/mocks/home.ts`)
- **Aprendizados novos (continuação da numeração 24):** registrar em `docs/architecture.md`

- [ ] **Step 5: Atualizar `CLAUDE.md` — tabela de histórico**

Na tabela "Histórico" do `CLAUDE.md`, adicionar linha 13:
```markdown
| 2026-05-18 | `13-MID-registrar-nova-dose` | ✅ Modal sheet de registro de dose. formatMedicationName. TextField migrado pra ui/. DoseCard migrado de mocks→DoseRecord. Toast infra. 1ª mutation + 1º modal do V5. | (PR #13) |
```

- [ ] **Step 6: Commit final + PR**

```bash
git add docs/handoff/HANDOFF-prompt-13.md CLAUDE.md
git commit -m "docs: handoff prompt-13 + atualiza histórico CLAUDE.md"
```

```bash
git push origin feature/13-registrar-nova-dose
```

```bash
gh pr create \
  --title "feat(dose): registrar nova dose com modal sheet + form + toast (#13)" \
  --body "$(cat <<'EOF'
## Resumo
- Primeiro fluxo de WRITE do DoseDay V5: modal sheet `app/dose/registrar.tsx` com form completo
- `useRegisterDose` (useMutation + invalidateQueries['doseSummary']) — primeira mutation do projeto
- Toast infra (`react-native-toast-message` + tokens), `formatMedicationName` util, Zod schema com 5 sites + 7 efeitos
- `TextField` migrado de `components/auth/` → `components/ui/` + suporte a `multiline`
- `DoseCard` migrado de tipo `Dose` (mocks) → `DoseRecord` (queries real)
- `/impeccable critique` ≥ 28/40, harden rodado

## Screenshots
[Anexar os 5 screenshots capturados na Task 13]
1. Modal recém-aberto (autopop)
2. Modal preenchido com chips selecionados
3. Modal com erro de validação (dose=25)
4. Toast sucesso visível
5. Tab Doses com novo card

## Test plan
- [ ] 17 testes MCP passaram (log no handoff)
- [ ] `npm run type-check` 0 erros
- [ ] `npm run lint` 0 warnings novos
- [ ] Registro de teste deletado do DB (volta a 4 registros)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review

### Spec coverage
- [x] `formatMedicationName` util — Task 2
- [x] `doseSchemas.ts` com enums PT-BR — Task 3
- [x] `registerDose` query (1ª mutation) — Task 4
- [x] Toast infra — Task 5
- [x] `_layout.tsx` updates — Task 6
- [x] `useRegisterDose` hook — Task 7
- [x] TextField movido + multiline — Task 8
- [x] DoseCard fix (type + naming + format) — Task 9
- [x] NextDoseCard formatMedicationName — Task 10
- [x] Botão `+` em doses.tsx — Task 11
- [x] `app/dose/registrar.tsx` modal completo — Task 12
- [x] 17 testes MCP + 5 screenshots — Task 13
- [x] critique + harden + handoff + CLAUDE.md — Task 14
- [x] `side_effects: []` não null — Task 4 (nota crítica)
- [x] `days_until_next_dose` omitido — Task 4 (nota crítica)
- [x] `maximumDate = new Date()` — Task 12 (registrar.tsx)
- [x] DELETE registro de teste pré-merge — Task 13 (Teste 17)
- [x] `npx expo install` (não npm install) — Task 1

### Placeholder scan
Nenhum "TBD", "TODO", "implement later" encontrado. Todos os steps têm código concreto.

### Type consistency
- `RegisterDoseInput` definido em Task 3, usado em Task 4 e Task 7 ✅
- `DoseRecord` de `@lib/supabase/queries/doses` — usado em Task 9 ✅
- `InjectionSite`, `SideEffect` definidos em Task 3, importados em Task 12 ✅
- `formatMedicationName(full: string): string` — Task 2, usada em Tasks 9, 10, 12 ✅
- `showSuccessToast(message: string)` — Task 5, usada em Task 12 ✅
- `mapQueryError(err: Error): string` — já existia, usada em Task 12 ✅
