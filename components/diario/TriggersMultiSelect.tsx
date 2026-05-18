import { ScrollView, Pressable, Text, StyleSheet } from 'react-native'
import { TRIGGER_LABELS, TRIGGERS } from '@lib/validation/diarioSchemas'
import type { Trigger } from '@lib/validation/diarioSchemas'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

type Props = {
  selected: Trigger[]
  onChange: (triggers: Trigger[]) => void
}

export function TriggersMultiSelect({ selected, onChange }: Props) {
  function toggle(type: Trigger) {
    if (selected.includes(type)) {
      onChange(selected.filter((trigger) => trigger !== type))
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
      {TRIGGERS.map((type) => {
        const isSelected = selected.includes(type)
        return (
          <Pressable
            key={type}
            onPress={() => toggle(type)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={TRIGGER_LABELS[type]}
            style={({ pressed }) => [
              styles.chip,
              isSelected && styles.chipSelected,
              pressed && styles.chipPressed,
            ]}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {TRIGGER_LABELS[type]}
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
  chipPressed: {
    transform: [{ scale: 0.96 }],
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.textPrimary,
  },
})
