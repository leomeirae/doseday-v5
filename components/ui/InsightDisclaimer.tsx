import { View, Text, StyleSheet } from 'react-native'
import { SymbolView } from 'expo-symbols'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

export function InsightDisclaimer() {
  return (
    <View
      style={styles.badge}
      accessible
      accessibilityRole="text"
      accessibilityLabel="Conteúdo educacional. Não substitui orientação médica. Converse com seu médico."
    >
      <SymbolView
        name="sparkles"
        size={12}
        tintColor={colors.textSecondary}
        style={styles.icon}
      />
      <Text style={styles.text} numberOfLines={2}>
        Conteúdo educacional · Não substitui orientação médica.
      </Text>
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
