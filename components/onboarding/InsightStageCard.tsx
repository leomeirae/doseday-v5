import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'

type Props = { stageLabel: string; medicationLabel: string }

export function InsightStageCard({ stageLabel, medicationLabel }: Props) {
  return (
    <View
      style={styles.card}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${stageLabel}, ${medicationLabel}`}
    >
      <Text style={styles.stage}>{stageLabel}</Text>
      <Text style={styles.medication}>{medicationLabel}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.md,
    borderWidth: 0.5,
    gap: spacing.xs,
    padding: spacing.md,
  },
  medication: {
    ...typography.body,
    color: colors.textSecondary,
  },
  stage: {
    ...typography.title,
    color: colors.textPrimary,
  },
})
