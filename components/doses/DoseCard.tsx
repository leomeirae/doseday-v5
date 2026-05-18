import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'
import type { Dose } from '@lib/mocks/doses'
import { StatusBadge } from './StatusBadge'
import { formatDoseDate } from '@lib/utils/dateFormat'

interface Props {
  dose: Dose
  isNext?: boolean
}

const STATUS_A11Y: Record<Dose['status'], string> = {
  scheduled: 'Agendada',
  applied:   'Aplicada',
  skipped:   'Pulada',
}

export function DoseCard({ dose, isNext = false }: Props) {
  const dateLabel = formatDoseDate(dose.date)
  const hasTime = dose.time !== '--'
  const timeLabel = hasTime ? dose.time.replace(':', ' horas e ').replace(/^0/, '') : ''
  const a11yLabel = hasTime
    ? `${dateLabel}, ${dose.medication} ${dose.dosage} às ${timeLabel} minutos, ${STATUS_A11Y[dose.status]}`
    : `${dateLabel}, ${dose.medication} ${dose.dosage}, ${STATUS_A11Y[dose.status]}`

  return (
    <View
      style={[styles.card, isNext && styles.cardNext]}
      accessible={true}
      accessibilityLabel={a11yLabel}
    >
      <Text style={styles.date}>{dateLabel}</Text>
      <Text style={styles.medication}>{dose.medication} {dose.dosage}{hasTime ? ` • ${dose.time}` : ''}</Text>
      <View style={styles.badgeRow}>
        <StatusBadge status={dose.status} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  // Próxima dose imediata: borda sutil em semanticInfo para distinguir da fila
  cardNext: {
    borderColor: 'rgba(91,168,217,0.25)',
  },
  date: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  medication: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  badgeRow: {
    marginTop: spacing.sm,
  },
})
