import { ActivityIndicator, Pressable, Text, StyleSheet } from 'react-native'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

type Props = {
  label: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'destructive'
  accessibilityLabel?: string
  accessibilityHint?: string
  testID?: string
}

export function AuthButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  accessibilityLabel,
  accessibilityHint,
  testID,
}: Props) {
  const isPrimary = variant === 'primary'
  const isDestructive = variant === 'destructive'
  const usesInverseText = isPrimary || isDestructive
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        isDestructive && styles.destructive,
        !usesInverseText && styles.secondary,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={usesInverseText ? colors.textInverse : colors.textPrimary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.label,
            usesInverseText ? styles.labelPrimary : styles.labelSecondary,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.brand,
  },
  destructive: {
    backgroundColor: colors.semanticCritical,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.bgSurface,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  label: {
    ...typography.label,
  },
  labelPrimary: {
    color: colors.textInverse,
  },
  labelSecondary: {
    color: colors.textPrimary,
  },
})
