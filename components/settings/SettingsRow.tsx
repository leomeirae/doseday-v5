import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SymbolView, type SFSymbol } from 'expo-symbols'
import { colors, spacing, typography } from '@lib/theme/tokens'

type SettingsRowProps = {
  icon: SFSymbol
  label: string
  value?: string
  chevron?: boolean
  stacked?: boolean
  destructive?: boolean
  divider?: boolean
  onPress?: () => void
  disabled?: boolean
  accessibilityHint?: string
  testID?: string
}

export function SettingsRow({
  icon,
  label,
  value,
  chevron = true,
  stacked = false,
  destructive = false,
  divider = false,
  onPress,
  disabled = false,
  accessibilityHint,
  testID,
}: SettingsRowProps) {
  const [pressed, setPressed] = useState(false)
  const labelColor = destructive ? colors.destructive : colors.textPrimary
  const iconColor = destructive ? colors.destructive : colors.textSecondary
  const accessibilityLabel = value ? `${label}: ${value}` : label
  const rowContent = (
    <>
      <SymbolView name={icon} size={20} tintColor={iconColor} style={{ width: 20, height: 20 }} />
      {stacked && value ? (
        <View style={styles.copy}>
          <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
          <Text style={styles.stackedValue}>{value}</Text>
        </View>
      ) : (
        <>
          <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
            {label}
          </Text>
          <View style={styles.spacer} />
          {value ? (
            <Text style={styles.value} numberOfLines={1}>
              {value}
            </Text>
          ) : null}
        </>
      )}
      {chevron ? (
        <SymbolView name="chevron.right" size={14} tintColor={colors.textTertiary} style={{ width: 14, height: 14 }} />
      ) : null}
    </>
  )

  if (!onPress) {
    return (
      <View
        accessible
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        style={[styles.row, divider && styles.divider]}
      >
        {rowContent}
      </View>
    )
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      testID={testID}
      disabled={disabled}
      style={[
        styles.row,
        divider && styles.divider,
        pressed && styles.rowPressed,
        disabled && styles.rowDisabled,
      ]}
    >
      {rowContent}
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
  rowDisabled: {
    opacity: 0.5,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  label: {
    ...typography.body,
    flexShrink: 1,
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
  },
  stackedValue: {
    ...typography.caption,
    color: colors.textSecondary,
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
