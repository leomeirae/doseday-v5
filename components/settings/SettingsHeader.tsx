import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SymbolView } from 'expo-symbols'
import { colors, spacing, typography } from '@lib/theme/tokens'

type SettingsHeaderProps = {
  title: string
  onBack: () => void
  backAccessibilityLabel: string
  testID?: string
}

export function SettingsHeader({
  title,
  onBack,
  backAccessibilityLabel,
  testID,
}: SettingsHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel={backAccessibilityLabel}
        hitSlop={12}
        testID={testID}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <SymbolView name="chevron.left" size={20} tintColor={colors.textSecondary} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.spacer} />
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.06)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backButton: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    minHeight: 44,
    width: 44,
  },
  pressed: {
    opacity: 0.65,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  spacer: {
    width: 44,
  },
})
