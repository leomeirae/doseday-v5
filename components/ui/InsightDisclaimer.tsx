import { StyleSheet, Text, View, ViewStyle } from 'react-native'
import { SymbolView } from 'expo-symbols'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

const DEFAULT_TEXT = 'Conteúdo educacional · Não substitui orientação médica.'
const DEFAULT_A11Y =
  'Conteúdo educacional. Não substitui orientação médica. Converse com seu médico.'

type Props = { text?: string; style?: ViewStyle }

export function InsightDisclaimer({ text = DEFAULT_TEXT, style }: Props) {
  const a11yLabel = text === DEFAULT_TEXT ? DEFAULT_A11Y : text
  return (
    <View
      style={[styles.badge, style]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={a11yLabel}
    >
      <SymbolView
        name="sparkles"
        size={12}
        tintColor={colors.textSecondary}
        style={styles.icon}
      />
      <Text style={styles.text}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.sm,
    borderWidth: 0.5,
    flexDirection: 'row',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  icon: {
    flexShrink: 0,
  },
  text: {
    ...typography.caption,
    color: colors.textSecondary,
    flexShrink: 1,
  },
})
