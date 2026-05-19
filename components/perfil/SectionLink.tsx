import { Pressable, Text, View, StyleSheet } from 'react-native'
import { SymbolView } from 'expo-symbols'
import type { SFSymbol } from 'expo-symbols'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

type Props = {
  label: string
  icon: SFSymbol
  onPress?: () => void
  destructive?: boolean
  role?: 'button' | 'link'
  hint?: string
  testID?: string
  disabled?: boolean
}

export function SectionLink({
  label,
  icon,
  onPress,
  destructive = false,
  role = 'link',
  hint,
  testID,
  disabled = false,
}: Props) {
  const tintColor = destructive ? colors.semanticCritical : colors.textSecondary
  const textColor = destructive ? colors.semanticCritical : colors.textPrimary

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled }}
      testID={testID}
      style={({ pressed }) => [
        styles.row,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.leading}>
        <SymbolView name={icon} size={20} tintColor={tintColor} />
        <Text style={[styles.label, { color: textColor }]} numberOfLines={2}>
          {label}
        </Text>
      </View>
      <SymbolView name="chevron.right" size={14} tintColor={colors.textTertiary} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  leading: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.body,
    flex: 1,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.5,
  },
})
