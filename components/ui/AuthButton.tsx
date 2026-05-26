import { ActivityIndicator, Pressable, Text, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

type HapticIntensity = 'light' | 'medium' | 'heavy'

const HAPTIC_STYLE: Record<HapticIntensity, Haptics.ImpactFeedbackStyle> = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
}

type Props = {
  label: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary'
  accessibilityLabel?: string
  testID?: string
  haptic?: HapticIntensity
}

export function AuthButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  accessibilityLabel,
  testID,
  haptic,
}: Props) {
  const isPrimary = variant === 'primary'
  const isDisabled = disabled || loading

  function handlePress() {
    if (haptic) {
      Haptics.impactAsync(HAPTIC_STYLE[haptic]).catch(() => {})
    }
    onPress()
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? colors.textInverse : colors.textPrimary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.label,
            isPrimary ? styles.labelPrimary : styles.labelSecondary,
            isDisabled && styles.labelDisabled,
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
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.bgSurface,
  },
  disabled: {
    backgroundColor: colors.bgSurface,
    borderColor: colors.bgSurface,
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
  labelDisabled: {
    color: colors.textTertiary,
  },
})
