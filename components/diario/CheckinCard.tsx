import { View, Text, Pressable, StyleSheet } from 'react-native'
import type { CheckinRecord } from '@lib/supabase/queries/diario'
import {
  EMOTIONAL_EMOJIS,
  EMOTIONAL_LABELS,
  QUICK_LOG_LABELS,
  TRIGGER_LABELS,
} from '@lib/validation/diarioSchemas'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

type Props = {
  todayCheckin: CheckinRecord | null
  treatmentWeek: number | null
  onPressCTA: () => void
}

export function CheckinCard({ todayCheckin, treatmentWeek, onPressCTA }: Props) {
  if (todayCheckin) {
    const emoji = todayCheckin.emotionalState
      ? EMOTIONAL_EMOJIS[todayCheckin.emotionalState]
      : '—'
    const label = todayCheckin.emotionalState
      ? EMOTIONAL_LABELS[todayCheckin.emotionalState]
      : ''
    const symptomsText = todayCheckin.symptoms
      .map((symptom) => QUICK_LOG_LABELS[symptom])
      .join(', ')
    const triggersText = todayCheckin.symptomTriggers
      .map((trigger) => TRIGGER_LABELS[trigger])
      .join(', ')

    return (
      <View style={styles.card} accessibilityLabel={`Check-in de hoje: ${label}`}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.resumeContent}>
          <Text style={styles.resumeTitle}>{label}</Text>
          {symptomsText.length > 0 && (
            <Text style={styles.resumeDetail}>{symptomsText}</Text>
          )}
          {triggersText.length > 0 && (
            <Text style={styles.resumeDetail}>Gatilhos: {triggersText}</Text>
          )}
        </View>
      </View>
    )
  }

  const subtitle =
    treatmentWeek != null ? `Você está na semana ${treatmentWeek}` : 'Anote como foi seu dia'

  return (
    <View style={styles.card}>
      <Text style={styles.ctaTitle}>Como você está hoje?</Text>
      <Text style={styles.ctaSubtitle}>{subtitle}</Text>
      <Pressable
        onPress={onPressCTA}
        accessibilityRole="button"
        accessibilityLabel="Fazer check-in"
        style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
      >
        <Text style={styles.ctaButtonLabel}>Fazer check-in</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,
    borderWidth: 0.5,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  emoji: {
    fontSize: 32,
  },
  resumeContent: {
    gap: spacing.xxs,
  },
  resumeTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  resumeDetail: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  ctaTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  ctaSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  ctaButton: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    marginTop: spacing.xs,
    paddingVertical: spacing.sm,
  },
  ctaButtonPressed: {
    opacity: 0.85,
  },
  ctaButtonLabel: {
    ...typography.label,
    color: colors.textInverse,
  },
})
