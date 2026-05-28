import { View, Text, Pressable, StyleSheet } from 'react-native'
import {
  EMOTIONAL_EMOJIS,
  EMOTIONAL_LABELS,
  EMOTIONAL_STATES,
} from '@lib/validation/diarioSchemas'
import type { EmotionalState } from '@lib/validation/diarioSchemas'
import { colors, typography, spacing } from '@lib/theme/tokens'

type Props = {
  value: EmotionalState | null
  onChange: (state: EmotionalState) => void
}

export function EmotionalStatePicker({ value, onChange }: Props) {
  return (
    <View
      style={styles.row}
      accessibilityRole="radiogroup"
      accessibilityLabel="Como você está"
    >
      {EMOTIONAL_STATES.map((state) => {
        const selected = value === state
        return (
          <Pressable
            key={state}
            onPress={() => onChange(state)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={EMOTIONAL_LABELS[state]}
            style={[
              styles.item,
              selected && styles.itemSelected,
            ]}
          >
            <Text style={styles.emoji}>{EMOTIONAL_EMOJIS[state]}</Text>
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {EMOTIONAL_LABELS[state]}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xxs,
    opacity: 0.5,
  },
  itemSelected: {
    opacity: 1,
  },
  emoji: {
    fontSize: 28,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.textPrimary,
  },
})
