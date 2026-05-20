# Perfil Menu + Account Settings — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refatorar `app/(tabs)/perfil.tsx` em menu de rows estilo iOS Settings e criar `app/perfil/account.tsx` com editar nome + apagar conta (LGPD).

**Architecture:** Dois commits sequenciais. Commit 1: primitives (`SettingsRow`, `SettingsSection`) + refactor de `perfil.tsx`. Commit 2: locales, hooks, tela `account.tsx`. Sem migrations — usa colunas existentes (`user_profiles.full_name`). Edge Function `delete-user-account` existe e aceita invoke sem payload.

**Tech Stack:** React Native (StyleSheet nativo), Expo Router, React Query, Supabase client, i18next, expo-symbols.

**Correção pós-aprovação:** Ordem das sections: PERFIL DE SAÚDE → PREFERÊNCIAS → SOBRE → CONTA (CONTA por último, padrão iOS — ações finais/destrutivas no fim).

---

## Baseline confirmado

| Item | Resultado |
|---|---|
| `delete-user-account` payload | Nenhum — JWT header only |
| `useProfile` hook | Existe em `hooks/useProfile.ts`, query key `['profile', userId]`, retorna `{ fullName }` |
| Profile type | `Profile.fullName: string \| null` em `lib/supabase/queries/profile.ts` |
| `_layout.tsx` padrão | `<Stack.Screen name="perfil/notificacoes" options={{ headerShown: false }} />` |
| `components/perfil/` | Não existe — criar do zero |

---

## File Map

**Criar:**
- `components/perfil/SettingsSection.tsx` — wrapper de section com header uppercase
- `components/perfil/SettingsRow.tsx` — row pressable com SF Symbol + label + chevron
- `locales/pt-BR/account.json` — copy sóbrio alinhado ao PRODUCT.md
- `locales/en/account.json` — tradução EN
- `locales/es/account.json` — tradução ES
- `app/perfil/account.tsx` — tela com 3 cards
- `hooks/useUpdateProfile.ts` — mutation UPDATE full_name + optimistic
- `hooks/useDeleteAccount.ts` — invoke Edge Function + signOut + redirect

**Modificar:**
- `app/(tabs)/perfil.tsx` — refactor em sections/rows (~150 linhas)
- `app/_layout.tsx` — +1 Stack.Screen perfil/account
- `lib/i18n/index.ts` — +3 imports + +3 keys no resources

---

## Commit 1 — feat(perfil): refactor em menu de rows + Settings primitives

### Task 1: SettingsSection component

**Files:**
- Create: `components/perfil/SettingsSection.tsx`

- [ ] Criar `components/perfil/SettingsSection.tsx`:

```tsx
import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, spacing } from '@lib/theme/tokens'

interface SettingsSectionProps {
  title: string
  children: React.ReactNode
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.content}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.caption,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  content: {
    backgroundColor: colors.bgElevated,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.06)',
  },
})
```

### Task 2: SettingsRow component

**Files:**
- Create: `components/perfil/SettingsRow.tsx`

- [ ] Criar `components/perfil/SettingsRow.tsx`:

```tsx
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { SymbolView } from 'expo-symbols'
import { colors, typography, spacing } from '@lib/theme/tokens'

interface SettingsRowProps {
  icon?: string
  iconColor?: string
  label: string
  value?: string
  onPress?: () => void
  showChevron?: boolean
  variant?: 'default' | 'destructive'
  disabled?: boolean
  isLast?: boolean
  testID?: string
  accessibilityLabel?: string
  accessibilityHint?: string
}

export function SettingsRow({
  icon,
  iconColor,
  label,
  value,
  onPress,
  showChevron = true,
  variant = 'default',
  disabled = false,
  isLast = false,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: SettingsRowProps) {
  const labelColor =
    variant === 'destructive' ? colors.semanticCritical : colors.textPrimary

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.row,
          pressed && !disabled && styles.rowPressed,
          disabled && styles.rowDisabled,
        ]}
        onPress={disabled ? undefined : onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        testID={testID}
      >
        {icon && (
          <SymbolView
            name={icon}
            size={18}
            tintColor={iconColor ?? colors.semanticInfo}
            style={styles.icon}
          />
        )}
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        <View style={styles.right}>
          {value && (
            <Text style={styles.value} numberOfLines={1}>
              {value}
            </Text>
          )}
          {showChevron && (
            <SymbolView
              name="chevron.right"
              size={14}
              tintColor={colors.textTertiary}
            />
          )}
        </View>
      </Pressable>
      {!isLast && <View style={styles.separator} />}
    </>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  rowPressed: {
    opacity: 0.65,
  },
  rowDisabled: {
    opacity: 0.4,
  },
  icon: {
    marginRight: spacing.sm,
  },
  label: {
    ...typography.body,
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: {
    ...typography.body,
    color: colors.textSecondary,
    maxWidth: 120,
  },
  separator: {
    height: 0.5,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginLeft: spacing.md,
  },
})
```

### Task 3: Refactor perfil.tsx

**Files:**
- Modify: `app/(tabs)/perfil.tsx`

- [ ] Substituir conteúdo de `app/(tabs)/perfil.tsx`:

```tsx
import { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { colors, typography, spacing } from '@lib/theme/tokens'
import { signOut } from '@lib/supabase/auth'
import { useSession } from '@hooks/useSession'
import { useTranslation } from 'react-i18next'
import { SettingsSection } from '@components/perfil/SettingsSection'
import { SettingsRow } from '@components/perfil/SettingsRow'

export default function PerfilScreen() {
  const { session } = useSession()
  const router = useRouter()
  const { t } = useTranslation('settings')
  const [loadingSignOut, setLoadingSignOut] = useState(false)

  async function handleSignOut() {
    Alert.alert(
      t('account.signOut.title'),
      t('account.signOut.message'),
      [
        { text: t('account.signOut.cancel'), style: 'cancel' },
        {
          text: t('account.signOut.confirm'),
          style: 'destructive',
          onPress: async () => {
            setLoadingSignOut(true)
            try {
              await signOut()
            } finally {
              setLoadingSignOut(false)
            }
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>Perfil</Text>

        {/* PERFIL DE SAÚDE — placeholder */}
        <SettingsSection title={t('sections.healthProfile')}>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Em breve</Text>
          </View>
        </SettingsSection>

        {/* PREFERÊNCIAS */}
        <SettingsSection title={t('sections.preferences')}>
          <SettingsRow
            icon="bell.fill"
            iconColor={colors.semanticInfo}
            label={t('preferences.notifications')}
            onPress={() => router.push('/perfil/notificacoes')}
            isLast
            accessibilityLabel="Configurações de Notificações"
            testID="perfil-row-notificacoes"
          />
        </SettingsSection>

        {/* SOBRE — placeholder */}
        <SettingsSection title={t('sections.about')}>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Em breve</Text>
          </View>
        </SettingsSection>

        {/* CONTA */}
        <SettingsSection title={t('sections.account')}>
          <SettingsRow
            icon="person.circle.fill"
            iconColor={colors.textSecondary}
            label={t('account.accountSettings')}
            onPress={() => router.push('/perfil/account')}
            accessibilityLabel="Configurações da conta"
            testID="perfil-row-conta"
          />
          <SettingsRow
            icon="rectangle.portrait.and.arrow.right"
            iconColor={colors.semanticCritical}
            label={loadingSignOut ? 'Saindo...' : t('account.signOut.button')}
            onPress={handleSignOut}
            showChevron={false}
            disabled={loadingSignOut}
            isLast
            accessibilityLabel="Sair da conta"
            testID="perfil-signout-button"
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  headline: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  placeholder: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  placeholderText: {
    ...typography.body,
    color: colors.textTertiary,
  },
})
```

### Task 4: Registrar Stack.Screen perfil/account

**Files:**
- Modify: `app/_layout.tsx`

- [ ] Adicionar `<Stack.Screen name="perfil/account" options={{ headerShown: false }} />` após a linha do `perfil/notificacoes`.

- [ ] Verificar: `grep "perfil/account" app/_layout.tsx` retorna resultado.

---

## Commit 2 — feat(account): tela Conta — editar nome + apagar (LGPD)

### Task 5: Locales account.json

**Files:**
- Create: `locales/pt-BR/account.json`
- Create: `locales/en/account.json`
- Create: `locales/es/account.json`

- [ ] Criar `locales/pt-BR/account.json` (copy sóbrio — PRODUCT.md Voice & Tone):

```json
{
  "header": { "title": "Conta" },
  "name": {
    "label": "Nome",
    "placeholder": "Como devemos te chamar",
    "saveButton": "Salvar",
    "savingButton": "Salvando...",
    "savedToast": "Nome atualizado",
    "errors": {
      "minLength": "Nome muito curto",
      "saveFailed": "Não consegui salvar. Tente novamente."
    }
  },
  "email": {
    "label": "E-mail",
    "readonlyHint": "Para alterar o e-mail, fale com o suporte."
  },
  "delete": {
    "label": "Apagar conta",
    "description": "Esta ação é permanente. Todos os seus dados serão removidos imediatamente — incluindo doses, peso, sintomas e relatórios.",
    "button": "Apagar minha conta",
    "loadingButton": "Apagando...",
    "confirmTitle": "Apagar conta?",
    "confirmMessage": "Você perderá todos os dados do seu tratamento. Esta ação não pode ser desfeita.",
    "confirmCancel": "Cancelar",
    "confirmDelete": "Sim, apagar",
    "errors": {
      "deleteFailed": "Não consegui apagar a conta. Tente novamente ou contate o suporte."
    }
  }
}
```

- [ ] Criar `locales/en/account.json`:

```json
{
  "header": { "title": "Account" },
  "name": {
    "label": "Name",
    "placeholder": "What should we call you",
    "saveButton": "Save",
    "savingButton": "Saving...",
    "savedToast": "Name updated",
    "errors": {
      "minLength": "Name is too short",
      "saveFailed": "Could not save. Please try again."
    }
  },
  "email": {
    "label": "Email",
    "readonlyHint": "To change your email, contact support."
  },
  "delete": {
    "label": "Delete account",
    "description": "This action is permanent. All your data will be removed immediately — including doses, weight, symptoms and reports.",
    "button": "Delete my account",
    "loadingButton": "Deleting...",
    "confirmTitle": "Delete account?",
    "confirmMessage": "You will lose all your treatment data. This action cannot be undone.",
    "confirmCancel": "Cancel",
    "confirmDelete": "Yes, delete",
    "errors": {
      "deleteFailed": "Could not delete the account. Try again or contact support."
    }
  }
}
```

- [ ] Criar `locales/es/account.json`:

```json
{
  "header": { "title": "Cuenta" },
  "name": {
    "label": "Nombre",
    "placeholder": "¿Cómo te llamamos?",
    "saveButton": "Guardar",
    "savingButton": "Guardando...",
    "savedToast": "Nombre actualizado",
    "errors": {
      "minLength": "El nombre es muy corto",
      "saveFailed": "No se pudo guardar. Inténtalo de nuevo."
    }
  },
  "email": {
    "label": "Correo",
    "readonlyHint": "Para cambiar el correo, contacta con soporte."
  },
  "delete": {
    "label": "Eliminar cuenta",
    "description": "Esta acción es permanente. Todos tus datos serán eliminados de inmediato — incluyendo dosis, peso, síntomas e informes.",
    "button": "Eliminar mi cuenta",
    "loadingButton": "Eliminando...",
    "confirmTitle": "¿Eliminar cuenta?",
    "confirmMessage": "Perderás todos los datos de tu tratamiento. Esta acción no se puede deshacer.",
    "confirmCancel": "Cancelar",
    "confirmDelete": "Sí, eliminar",
    "errors": {
      "deleteFailed": "No se pudo eliminar la cuenta. Inténtalo de nuevo o contacta con soporte."
    }
  }
}
```

### Task 6: Registrar namespace account em i18n.ts

**Files:**
- Modify: `lib/i18n/index.ts`

- [ ] Adicionar imports dos 3 arquivos account.json após as linhas dos notifications:

```ts
import ptBRAccount from '../../locales/pt-BR/account.json'
import enAccount from '../../locales/en/account.json'
import esAccount from '../../locales/es/account.json'
```

- [ ] Adicionar `account: ptBRAccount` em `'pt-BR'`, `account: enAccount` em `en`, `account: esAccount` em `es`.

### Task 7: useUpdateProfile hook

**Files:**
- Create: `hooks/useUpdateProfile.ts`

- [ ] Criar `hooks/useUpdateProfile.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@lib/supabase/client'
import type { Profile } from '@lib/supabase/queries/profile'

export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (fullName: string) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({ full_name: fullName.trim() })
        .eq('user_id', userId)
      if (error) throw error
    },
    onMutate: async (fullName) => {
      await queryClient.cancelQueries({ queryKey: ['profile', userId] })
      const previous = queryClient.getQueryData<Profile | null>(['profile', userId])
      queryClient.setQueryData<Profile | null>(['profile', userId], (old) =>
        old ? { ...old, fullName: fullName.trim() } : old
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['profile', userId], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
    },
  })
}
```

### Task 8: useDeleteAccount hook

**Files:**
- Create: `hooks/useDeleteAccount.ts`

- [ ] Criar `hooks/useDeleteAccount.ts`:

```ts
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@lib/supabase/client'
import { signOut } from '@lib/supabase/auth'
import { router } from 'expo-router'

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('delete-user-account')
      if (error) throw error
      if (!data?.success) throw new Error(data?.error ?? 'Failed to delete account')
    },
    onSuccess: async () => {
      await signOut()
      router.replace('/(auth)/signin')
    },
  })
}
```

### Task 9: account.tsx

**Files:**
- Create: `app/perfil/account.tsx`

- [ ] Criar `app/perfil/account.tsx`:

```tsx
import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useTranslation } from 'react-i18next'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'
import { useSession } from '@hooks/useSession'
import { useProfile } from '@hooks/useProfile'
import { useUpdateProfile } from '@hooks/useUpdateProfile'
import { useDeleteAccount } from '@hooks/useDeleteAccount'

export default function AccountScreen() {
  const router = useRouter()
  const { session } = useSession()
  const { t } = useTranslation('account')
  const userId = session?.user?.id ?? ''
  const email = session?.user?.email ?? ''

  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile(userId)
  const deleteAccount = useDeleteAccount()

  const [name, setName] = useState(profile?.fullName ?? '')
  const isDirty = name.trim() !== (profile?.fullName ?? '').trim()

  useEffect(() => {
    if (profile?.fullName !== undefined) {
      setName(profile.fullName ?? '')
    }
  }, [profile?.fullName])

  async function handleSave() {
    if (name.trim().length < 2) {
      Alert.alert('', t('name.errors.minLength'))
      return
    }
    updateProfile.mutate(name, {
      onError: () => Alert.alert('', t('name.errors.saveFailed')),
    })
  }

  function handleDeletePress() {
    Alert.alert(
      t('delete.confirmTitle'),
      t('delete.confirmMessage'),
      [
        { text: t('delete.confirmCancel'), style: 'cancel' },
        {
          text: t('delete.confirmDelete'),
          style: 'destructive',
          onPress: () =>
            deleteAccount.mutate(undefined, {
              onError: () => Alert.alert('', t('delete.errors.deleteFailed')),
            }),
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={() => router.back()}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
          hitSlop={8}
        >
          <SymbolView name="chevron.left" size={20} tintColor={colors.brand} />
          <Text style={styles.backLabel}>Perfil</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('header.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Nome */}
        <Text style={styles.sectionLabel}>{t('name.label')}</Text>
        <View style={styles.card}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder={t('name.placeholder')}
              placeholderTextColor={colors.textTertiary}
              returnKeyType="done"
              onSubmitEditing={isDirty ? handleSave : undefined}
              editable={!updateProfile.isPending && !deleteAccount.isPending}
              accessibilityLabel={t('name.label')}
              testID="account-name-input"
            />
            {isDirty && (
              <Pressable
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.saveButtonPressed,
                  updateProfile.isPending && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={updateProfile.isPending}
                accessibilityLabel={t('name.saveButton')}
                testID="account-save-button"
              >
                <Text style={styles.saveButtonText}>
                  {updateProfile.isPending
                    ? t('name.savingButton')
                    : t('name.saveButton')}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* E-mail (readonly) */}
        <Text style={styles.sectionLabel}>{t('email.label')}</Text>
        <View style={styles.card}>
          <Text style={styles.emailText} numberOfLines={1} testID="account-email">
            {email}
          </Text>
          <Text style={styles.emailHint}>{t('email.readonlyHint')}</Text>
        </View>

        {/* Apagar conta */}
        <View style={styles.deleteCard}>
          <Text style={styles.deleteLabel}>{t('delete.label')}</Text>
          <Text style={styles.deleteDescription}>{t('delete.description')}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.deleteButtonPressed,
              deleteAccount.isPending && styles.deleteButtonDisabled,
            ]}
            onPress={handleDeletePress}
            disabled={deleteAccount.isPending || updateProfile.isPending}
            accessibilityLabel={t('delete.button')}
            testID="account-delete-button"
          >
            <Text style={styles.deleteButtonText}>
              {deleteAccount.isPending
                ? t('delete.loadingButton')
                : t('delete.button')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 70,
    minHeight: 44,
    justifyContent: 'flex-start',
  },
  backPressed: { opacity: 0.65 },
  backLabel: {
    ...typography.body,
    color: colors.brand,
  },
  headerTitle: {
    ...typography.title,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: { minWidth: 70 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  textInput: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    minHeight: 44,
    paddingVertical: 0,
  },
  saveButton: {
    backgroundColor: colors.brand,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 36,
    justifyContent: 'center',
  },
  saveButtonPressed: { opacity: 0.8 },
  saveButtonDisabled: { opacity: 0.4 },
  saveButtonText: {
    ...typography.label,
    color: colors.textInverse,
    fontSize: 14,
  },
  emailText: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emailHint: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  deleteCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: `${colors.semanticCritical}40`,
  },
  deleteLabel: {
    ...typography.subtitle,
    color: colors.semanticCritical,
    marginBottom: spacing.xs,
  },
  deleteDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: colors.semanticCritical,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  deleteButtonPressed: { opacity: 0.7 },
  deleteButtonDisabled: { opacity: 0.4 },
  deleteButtonText: {
    ...typography.label,
    color: colors.semanticCritical,
  },
})
```

### Task 10: Screenshots + validação MCP

- [ ] Rodar app no simulador, navegar Perfil → tirar screenshot 1 (menu com 4 sections)
- [ ] Tap Conta → tela account.tsx → screenshot 2 (3 cards)
- [ ] Editar nome → tap Salvar → screenshot 4 (ou Toast via Alert)
- [ ] Tap "Apagar minha conta" → Alert de confirmação → screenshot 3
- [ ] `execute_sql` confirmar `full_name` mudou
- [ ] `npm run type-check` PASS
- [ ] `npm run lint` PASS

---

## Critérios de aceitação

- [ ] 3 arquivos i18n criados (`account.json` em pt-BR + en + es)
- [ ] `app/perfil/account.tsx` com 3 cards
- [ ] 2 hooks (`useUpdateProfile`, `useDeleteAccount`)
- [ ] 2 componentes (`SettingsRow`, `SettingsSection`)
- [ ] `app/(tabs)/perfil.tsx` refatorado: PERFIL DE SAÚDE → PREFERÊNCIAS → SOBRE → CONTA
- [ ] `app/_layout.tsx` registra `perfil/account`
- [ ] Zero hex hardcoded em componentes novos
- [ ] Zero glass em conteúdo
- [ ] Vital Mint SOMENTE no botão "Salvar" do nome
- [ ] `npm run type-check` PASS
- [ ] `npm run lint` PASS
- [ ] 4 screenshots reais em `assets/screenshots/prompt29/`
- [ ] `/impeccable critique` ≥ 30/40
- [ ] PR aberto, NÃO mergeado
