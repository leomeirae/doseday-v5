import { View, Text, StyleSheet } from 'react-native'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  EMOTIONAL_EMOJIS,
  INTENSITY_LABELS,
  QUICK_LOG_LABELS,
  TRIGGER_LABELS,
} from '@lib/validation/diarioSchemas'
import type { CheckinRecord, QuickLogRecord } from '@lib/supabase/queries/diario'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

type Props =
  | { kind: 'quick_log'; item: QuickLogRecord }
  | { kind: 'checkin'; item: CheckinRecord }

export function DiarioTimelineItem(props: Props) {
  if (props.kind === 'quick_log') {
    const { item } = props
    const timeAgo = formatDistanceToNow(item.loggedAt, {
      addSuffix: true,
      locale: ptBR,
    })

    return (
      <View style={styles.container}>
        <View style={styles.dot} accessibilityElementsHidden />
        <View style={styles.content}>
          <Text style={styles.title}>
            {QUICK_LOG_LABELS[item.logType]} · {INTENSITY_LABELS[item.intensity]}
          </Text>
          <Text style={styles.meta}>{timeAgo}</Text>
          {!!item.notes && <Text style={styles.notes}>{item.notes}</Text>}
        </View>
      </View>
    )
  }

  const { item } = props
  const dateLabel = format(new Date(`${item.date}T00:00:00`), "d 'de' MMM", {
    locale: ptBR,
  })
  const emoji = item.emotionalState ? EMOTIONAL_EMOJIS[item.emotionalState] : '—'
  const symptomsLabel = item.symptoms.map((symptom) => QUICK_LOG_LABELS[symptom]).join(', ')
  const triggersLabel = item.symptomTriggers
    .map((trigger) => TRIGGER_LABELS[trigger])
    .join(', ')

  return (
    <View style={styles.container}>
      <Text style={styles.emojiIcon} accessibilityElementsHidden>
        {emoji}
      </Text>
      <View style={styles.content}>
        <Text style={styles.title}>Check-in · {dateLabel}</Text>
        {symptomsLabel.length > 0 && <Text style={styles.meta}>{symptomsLabel}</Text>}
        {triggersLabel.length > 0 && (
          <Text style={styles.meta}>Gatilhos: {triggersLabel}</Text>
        )}
        {!!item.notes && <Text style={styles.notes}>{item.notes}</Text>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.md,
    borderWidth: 0.5,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dot: {
    backgroundColor: colors.textTertiary,
    borderRadius: 4,
    height: 8,
    marginTop: 6,
    width: 8,
  },
  emojiIcon: {
    fontSize: 20,
    lineHeight: 24,
  },
  content: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    ...typography.label,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  notes: {
    ...typography.caption,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
})
