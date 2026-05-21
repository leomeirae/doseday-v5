import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'

type WelcomeActionDockProps = {
  createAccountLabel: string
  signInLabel: string
  createAccountHint: string
  signInHint: string
  disabled: boolean
  onCreateAccount: () => void
  onSignIn: () => void
}

export function WelcomeActionDock({
  createAccountLabel,
  signInLabel,
  createAccountHint,
  signInHint,
  disabled,
  onCreateAccount,
  onSignIn,
}: WelcomeActionDockProps) {
  return (
    <View style={styles.dock}>
      <Pressable
        onPress={onCreateAccount}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={createAccountLabel}
        accessibilityHint={createAccountHint}
        accessibilityState={{ disabled, busy: disabled }}
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && !disabled ? styles.primaryButtonPressed : null,
          disabled ? styles.disabled : null,
        ]}
        testID="welcome-create-account"
      >
        <Text style={styles.primaryLabel}>{createAccountLabel}</Text>
      </Pressable>

      <Pressable
        onPress={onSignIn}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={signInLabel}
        accessibilityHint={signInHint}
        accessibilityState={{ disabled, busy: disabled }}
        style={({ pressed }) => [
          styles.secondaryButton,
          pressed && !disabled ? styles.secondaryButtonPressed : null,
        ]}
        testID="welcome-sign-in"
      >
        <Text style={styles.secondaryLabel}>{signInLabel}</Text>
      </Pressable>
    </View>
  )
}

function withAlpha(hexColor: string, alpha: number) {
  const hex = hexColor.replace('#', '')
  const red = parseInt(hex.slice(0, 2), 16)
  const green = parseInt(hex.slice(2, 4), 16)
  const blue = parseInt(hex.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

const styles = StyleSheet.create({
  dock: {
    width: '100%',
    borderRadius: radius.lg,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: withAlpha(colors.textPrimary, 0.08),
    padding: spacing.sm,
    gap: spacing.xs,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryButtonPressed: {
    backgroundColor: colors.brandDim,
  },
  primaryLabel: {
    ...typography.label,
    color: colors.textInverse,
    textAlign: 'center',
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  secondaryButtonPressed: {
    backgroundColor: withAlpha(colors.bgSurface, 0.72),
  },
  secondaryLabel: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.72,
  },
})
