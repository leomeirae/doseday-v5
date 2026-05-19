import { useEffect, useRef } from 'react'
import {
  AccessibilityInfo,
  findNodeHandle,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SymbolView } from 'expo-symbols'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, typography, spacing, radius, elevation } from '@lib/theme/tokens'
import { TextField } from '@components/ui/TextField'
import { AuthButton } from '@components/ui/AuthButton'
import { DELETE_ACCOUNT_CONFIRMATION } from '@lib/validation/accountSchemas'

type Props = {
  confirmation: string
  onChangeConfirmation: (value: string) => void
  onDelete: () => void
  onCancel: () => void
  canDelete: boolean
  loading?: boolean
}

const lossItems = [
  'Histórico de doses',
  'Diário e check-ins',
  'Insights gerados',
  'Sua sessão atual',
]

export function DeleteAccountModal({
  confirmation,
  onChangeConfirmation,
  onDelete,
  onCancel,
  canDelete,
  loading = false,
}: Props) {
  const titleRef = useRef<Text>(null)

  useEffect(() => {
    const handle = findNodeHandle(titleRef.current)
    if (!handle) return

    const timeout = setTimeout(() => {
      AccessibilityInfo.setAccessibilityFocus(handle)
    }, 300)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={onCancel}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          accessibilityHint="Fecha esta tela sem excluir seus dados"
          testID="delete-account-cancel-top"
          hitSlop={13}
          style={({ pressed }) => [pressed && styles.pressedHeaderButton]}
        >
          <SymbolView name="xmark" size={18} tintColor={colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Excluir conta</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          accessibilityViewIsModal
        >
          <View style={styles.iconWrap} accessibilityElementsHidden>
            <SymbolView name="trash.fill" size={42} tintColor={colors.semanticCritical} />
          </View>

          <Text
            ref={titleRef}
            style={styles.title}
            accessibilityRole="header"
            testID="delete-account-title"
          >
            Excluir conta
          </Text>

          <Text style={styles.body}>
            Esta ação é permanente. Você vai perder:
          </Text>

          <View style={styles.lossList}>
            {lossItems.map((item) => (
              <View key={item} style={styles.lossItem}>
                <View style={styles.bullet} />
                <Text style={styles.lossText}>{item}</Text>
              </View>
            ))}
          </View>

          <TextField
            label={`Digite ${DELETE_ACCOUNT_CONFIRMATION} para confirmar`}
            value={confirmation}
            onChangeText={(value) => onChangeConfirmation(value.toUpperCase())}
            autoCapitalize="characters"
            maxLength={DELETE_ACCOUNT_CONFIRMATION.length}
            accessibilityLabel="Confirmação para excluir conta"
            testID="delete-account-confirm-input"
          />

          <View style={styles.actions}>
            <AuthButton
              variant="destructive"
              label="Excluir permanentemente"
              onPress={onDelete}
              loading={loading}
              disabled={!canDelete}
              accessibilityLabel="Excluir conta permanentemente"
              testID="delete-account-confirm-button"
            />
            <AuthButton
              variant="secondary"
              label="Cancelar"
              onPress={onCancel}
              disabled={loading}
              accessibilityLabel="Cancelar exclusão de conta"
              accessibilityHint="Fecha esta tela sem excluir seus dados"
              testID="delete-account-cancel-button"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  flex: {
    flex: 1,
  },
  header: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressedHeaderButton: {
    opacity: 0.7,
  },
  headerTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 18,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
    ...elevation[2],
  },
  title: {
    ...typography.title,
    color: colors.semanticCritical,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  lossList: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  lossItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.semanticCritical,
  },
  lossText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
})
