import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, spacing } from '@lib/theme/tokens'
import type { DoseStatus } from '@lib/supabase/queries/doses'

const STATUS_MAP: Record<DoseStatus, { color: string; label: string }> = {
  scheduled: { color: colors.semanticInfo,     label: 'Agendada' },
  applied:   { color: colors.semanticPositive, label: 'Aplicada' },
  skipped:   { color: colors.semanticWarning,  label: 'Pulada'   },
}

interface Props {
  status: DoseStatus
}

export function StatusBadge({ status }: Props) {
  const { color, label } = STATUS_MAP[status]
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    ...typography.caption,
  },
})
