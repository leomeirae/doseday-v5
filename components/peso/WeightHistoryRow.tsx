import { Text, View, StyleSheet } from 'react-native'
import { SymbolView } from 'expo-symbols'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import { RectButton } from 'react-native-gesture-handler'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'
import type { WeightLog } from '@lib/supabase/queries/weight'

type Props = {
  log: WeightLog
  onPress: () => void
  onDelete: () => void
}

export function WeightHistoryRow({ log, onPress, onDelete }: Props) {
  const { t } = useTranslation('weight')

  return (
    <Swipeable
      renderRightActions={() => (
        <RectButton
          style={styles.deleteAction}
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel={t('historyModal.deleteAction')}
        >
          <SymbolView name="trash" size={18} tintColor={colors.textPrimary} />
          <Text style={styles.deleteText}>{t('historyModal.deleteAction')}</Text>
        </RectButton>
      )}
      rightThreshold={72}
      overshootFriction={8}
      onSwipeableOpen={(direction) => {
        if (direction === 'right') onDelete()
      }}
    >
      <RectButton
        style={styles.row}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${log.weight.toFixed(1)} kg`}
        accessibilityHint={t('historyModal.editAction')}
      >
        <View style={styles.main}>
          <Text style={styles.weight}>{log.weight.toFixed(1)} kg</Text>
          <Text style={styles.date}>{format(log.date, "d 'de' MMMM", { locale: ptBR })}</Text>
          {!!log.notes && (
            <Text style={styles.notes} numberOfLines={2}>
              {log.notes}
            </Text>
          )}
        </View>
        <SymbolView name="chevron.right" size={15} tintColor={colors.textTertiary} />
      </RectButton>
    </Swipeable>
  )
}

const styles = StyleSheet.create({
  row: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: spacing.sm,
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  weight: {
    ...typography.numberMedium,
    color: colors.textPrimary,
  },
  date: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xxs,
  },
  notes: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  deleteAction: {
    width: 92,
    minHeight: 76,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    backgroundColor: colors.semanticCritical,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  deleteText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
})
