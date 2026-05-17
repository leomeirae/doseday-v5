import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'
import { homeMock } from '@lib/mocks/home'

export function InsightCard() {
  return (
    <View>
      <Text style={styles.sectionTitle}>Insight do dia</Text>
      <View style={styles.card}>
        <Text style={styles.insightText}>{homeMock.insight.text}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  insightText: {
    ...typography.body,
    color: colors.textPrimary,
  },
})
