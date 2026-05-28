import { ScrollView, Pressable, Text, StyleSheet } from 'react-native'
import { QUICK_LOG_LABELS, SYMPTOM_TYPES } from '@lib/validation/diarioSchemas'
import type { SymptomType } from '@lib/validation/diarioSchemas'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

type Props = {
  selected: SymptomType[]
  onChange: (symptoms: SymptomType[]) => void
}

export function SymptomsMultiSelect({ selected, onChange }: Props) {
  function toggle(type: SymptomType) {
    if (selected.includes(type)) {
      onChange(selected.filter((symptom) => symptom !== type))
    } else {
      onChange([...selected, type])
    }
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {SYMPTOM_TYPES.map((type) => {
        const isSelected = selected.includes(type)
        return (
          <Pressable
            key={type}
            onPress={() => toggle(type)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={QUICK_LOG_LABELS[type]}
            style={[
              styles.chip,
              isSelected && styles.chipSelected,
            ]}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {QUICK_LOG_LABELS[type]}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
    borderWidth: 0.5,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipSelected: {
    borderColor: colors.textPrimary,
    borderWidth: 1,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.textPrimary,
  },
})
