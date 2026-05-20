import { useEffect } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { SymbolView } from 'expo-symbols'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'

export type LoadingStepStatus = 'pending' | 'active' | 'done'

type Props = {
  label: string
  status: LoadingStepStatus
  reducedMotion: boolean
}

export function LoadingStepIndicator({ label, status, reducedMotion }: Props) {
  const scale = useSharedValue(status === 'done' ? 1 : 0.6)

  useEffect(() => {
    if (status !== 'done') return
    if (reducedMotion) {
      scale.value = 1
      return
    }
    scale.value = withSpring(1, { damping: 12, stiffness: 180 })
  }, [reducedMotion, scale, status])

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <View style={styles.row} accessibilityRole="text" accessibilityLabel={label}>
      <View style={styles.icon}>
        {status === 'done' ? (
          <Animated.View style={checkStyle}>
            <SymbolView
              name="checkmark.circle.fill"
              size={22}
              tintColor={colors.semanticPositive}
            />
          </Animated.View>
        ) : status === 'active' ? (
          <ActivityIndicator size="small" color={colors.textSecondary} />
        ) : (
          <View style={styles.pendingDot} />
        )}
      </View>
      <Text
        style={[
          styles.label,
          status === 'pending' && styles.labelPending,
          status === 'done' && styles.labelDone,
        ]}
      >
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 32,
  },
  icon: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.semanticMuted,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  labelPending: {
    color: colors.textTertiary,
  },
  labelDone: {
    color: colors.textSecondary,
  },
})
