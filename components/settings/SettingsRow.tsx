import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SymbolView, type SFSymbol } from 'expo-symbols'
import { colors, spacing, typography } from '@lib/theme/tokens'

type SettingsRowProps = {
  icon: SFSymbol
  label: string
  value?: string
  chevron?: boolean
  destructive?: boolean
  divider?: boolean
  onPress: () => void
  accessibilityHint?: string
  testID?: string
}

export function SettingsRow({
  icon,
  label,
  value,
  chevron = true,
  destructive = false,
  divider = false,
  onPress,
  accessibilityHint,
  testID,
}: SettingsRowProps) {
  const labelColor = destructive ? colors.destructive : colors.textPrimary
  const iconColor = destructive ? colors.destructive : colors.textSecondary

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      testID={testID}
      style={({ pressed }) => [
        styles.row,
        divider && styles.divider,
        pressed && styles.rowPressed,
      ]}
    >
      <SymbolView name={icon} size={20} tintColor={iconColor} />
      <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.spacer} />
      {value ? (
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {chevron ? (
        <SymbolView name="chevron.right" size={14} tintColor={colors.textTertiary} />
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  rowPressed: {
    backgroundColor: colors.bgSurface,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  label: {
    ...typography.body,
    flexShrink: 1,
  },
  value: {
    ...typography.body,
    color: colors.textSecondary,
    maxWidth: 180,
  },
  spacer: {
    flex: 1,
  },
})
