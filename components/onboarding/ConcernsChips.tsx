import { StyleSheet, Pressable, Text, View } from 'react-native'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'

type Props = {
  options: readonly string[]
  selected: string[]
  labelFor: (value: string) => string
  onToggle: (value: string) => void
}

export function ConcernsChips({ options, selected, labelFor, onToggle }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="list">
      {options.map((option) => {
        const isSelected = selected.includes(option)
        const label = labelFor(option)
        return (
          <Pressable
            key={option}
            onPress={() => onToggle(option)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={label}
            testID={`concern-${option}`}
            style={({ pressed }) => [
              styles.chip,
              isSelected && styles.chipSelected,
              pressed && styles.chipPressed,
            ]}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>{label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.semanticMuted,
  },
  chipSelected: {
    backgroundColor: colors.bgSurface,
    borderColor: colors.brand,
  },
  chipPressed: {
    transform: [{ scale: 0.97 }],
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.textPrimary,
  },
})
