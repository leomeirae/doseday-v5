import { ScrollView, Pressable, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import type { Href } from 'expo-router'
import * as Haptics from 'expo-haptics'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { QUICK_LOG_LABELS, QUICK_LOG_TYPES } from '@lib/validation/diarioSchemas'
import type { QuickLogType } from '@lib/validation/diarioSchemas'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

type Props = {
  onQuickLog: (logType: QuickLogType) => void
  disabled?: boolean
}

export function QuickLogChips({ onQuickLog, disabled }: Props) {
  const router = useRouter()

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {QUICK_LOG_TYPES.map((logType) => (
        <AnimatedChip
          key={logType}
          label={QUICK_LOG_LABELS[logType]}
          disabled={disabled ?? false}
          onTap={() => onQuickLog(logType)}
          onLongPress={() => {
            const href = `/diario/quick-log?type=${logType}` as Href
            router.push(href)
          }}
        />
      ))}
    </ScrollView>
  )
}

function AnimatedChip({
  label,
  onTap,
  onLongPress,
  disabled,
}: {
  label: string
  onTap: () => void
  onLongPress: () => void
  disabled?: boolean
}) {
  const scale = useSharedValue(1)
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  function handlePress() {
    if (disabled) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onTap()
    scale.value = withSpring(0.95, { damping: 15 }, () => {
      scale.value = withSpring(1)
    })
  }

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={handlePress}
        onLongPress={onLongPress}
        delayLongPress={400}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Toque para registrar. Toque longo para detalhar."
        style={styles.chip}
      >
        <Text style={styles.label}>{label}</Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  chip: {
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
    borderWidth: 0.5,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
})
