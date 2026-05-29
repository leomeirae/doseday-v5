import { useState, type ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SymbolView } from 'expo-symbols'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'

type Props = {
  checked: boolean
  onToggle: () => void
  children: ReactNode
  caption?: string | undefined
  accessibilityLabel: string
  testID?: string | undefined
}

export function ConsentCheckbox({
  checked,
  onToggle,
  children,
  caption,
  accessibilityLabel,
  testID,
}: Props) {
  const [pressed, setPressed] = useState(false)

  return (
    <Pressable
      onPress={onToggle}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      hitSlop={8}
      style={[styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? (
          <SymbolView name="checkmark" size={14} tintColor={colors.textInverse} />
        ) : null}
      </View>
      <View style={styles.copy}>
        <Text style={styles.label}>{children}</Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: radius.xs,
    borderWidth: 2,
    borderColor: colors.semanticMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
  },
  caption: {
    ...typography.caption,
    color: colors.textTertiary,
  },
})
