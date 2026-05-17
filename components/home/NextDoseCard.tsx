import { View, Text, StyleSheet } from 'react-native'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'
import { homeMock } from '@lib/mocks/home'

function formatScheduledDate(date: Date): string {
  const raw = format(date, "EEEE, d 'de' MMMM", { locale: ptBR })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

export function NextDoseCard() {
  const { daysUntil, medication, scheduledDate } = homeMock.nextDose
  const dateLabel = formatScheduledDate(scheduledDate)

  return (
    <View>
      <Text style={styles.sectionTitle}>Próxima dose</Text>
      <View style={styles.card}>
        <Text style={styles.daysNumber}>{daysUntil}</Text>
        <Text style={styles.daysLabel}>dias até sua próxima dose</Text>
        <View style={styles.separator} />
        <View style={styles.detailsRow}>
          <Text style={styles.medicationLabel}>{medication}</Text>
          <Text style={styles.scheduledDate}>{dateLabel}</Text>
        </View>
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
  },
  daysNumber: {
    ...typography.numberLarge,
    color: colors.brand,
  },
  daysLabel: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  separator: {
    height: 1,
    backgroundColor: colors.bgSurface,
    marginVertical: spacing.md,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medicationLabel: {
    ...typography.label,
    color: colors.textPrimary,
  },
  scheduledDate: {
    ...typography.caption,
    color: colors.textTertiary,
  },
})
