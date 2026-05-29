import { useState } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { SymbolView } from 'expo-symbols'
import type { SFSymbol } from 'sf-symbols-typescript'
import { colors, typography, spacing } from '@lib/theme/tokens'

interface SettingsRowProps {
  icon?: SFSymbol
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
  const [pressed, setPressed] = useState(false)

  return (
    <>
      <Pressable
        style={[
          styles.row,
          pressed && !disabled && styles.rowPressed,
          disabled && styles.rowDisabled,
        ]}
        onPress={disabled ? undefined : onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
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
