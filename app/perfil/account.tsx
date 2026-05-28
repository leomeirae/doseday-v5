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
import { showSuccessToast } from '@lib/utils/showToast'

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
  const [savePressed, setSavePressed] = useState(false)
  const [deletePressed, setDeletePressed] = useState(false)
  const isDirty = name.trim() !== (profile?.fullName ?? '').trim()

  useEffect(() => {
    if (profile?.fullName !== undefined) {
      setName(profile.fullName ?? '')
    }
  }, [profile?.fullName])

  function handleSave() {
    if (name.trim().length < 2) {
      Alert.alert('', t('name.errors.minLength'))
      return
    }
    updateProfile.mutate(name, {
      onSuccess: () => showSuccessToast(t('name.savedToast')),
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

  const isBlocked = updateProfile.isPending || deleteAccount.isPending

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          onPress={() => router.back()}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
          hitSlop={12}
        >
          <SymbolView name="chevron.left" size={18} tintColor={colors.textSecondary} />
          <Text style={styles.backLabel}>Perfil</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('header.title')}</Text>
        <View style={styles.headerSpacer} />
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
              editable={!isBlocked}
              accessibilityLabel={t('name.label')}
              testID="account-name-input"
            />
            {isDirty && (
              <Pressable
                style={[
                  styles.saveButton,
                  savePressed && styles.saveButtonPressed,
                  updateProfile.isPending && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                onPressIn={() => setSavePressed(true)}
                onPressOut={() => setSavePressed(false)}
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
            style={[
              styles.deleteButton,
              deletePressed && styles.deleteButtonPressed,
              isBlocked && styles.deleteButtonDisabled,
            ]}
            onPress={handleDeletePress}
            onPressIn={() => setDeletePressed(true)}
            onPressOut={() => setDeletePressed(false)}
            disabled={isBlocked}
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
  },
  backPressed: { opacity: 0.65 },
  backLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  headerTitle: {
    ...typography.title,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: { minWidth: 70 },
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
