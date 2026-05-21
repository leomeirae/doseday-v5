import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'

type Props = {
  cardLabel: string
  goalWeight: number | undefined
  goalLabel: string
  deltaLabel: string
}

export function InsightGoalCard({ cardLabel, goalWeight, goalLabel, deltaLabel }: Props) {
  const hasGoalNumber = typeof goalWeight === 'number' && isFinite(goalWeight)
  const formattedGoal = hasGoalNumber
    ? `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(goalWeight)} kg`
    : null

  return (
    <View
      style={styles.card}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${cardLabel}: ${formattedGoal ?? goalLabel}. ${deltaLabel}`}
    >
      <Text style={styles.label}>{cardLabel}</Text>
      {hasGoalNumber ? (
        <Text style={styles.hero}>{formattedGoal}</Text>
      ) : (
        <Text style={styles.heroFallback}>{goalLabel}</Text>
      )}
      <Text style={styles.delta}>{deltaLabel}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSurface,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  delta: {
    ...typography.bodyClinical,
    color: colors.textSecondary,
  },
  hero: {
    ...typography.numberMedium,
    color: colors.textPrimary,
  },
  heroFallback: {
    ...typography.title,
    color: colors.textPrimary,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
})
