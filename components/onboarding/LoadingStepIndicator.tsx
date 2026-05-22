import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { SymbolView } from 'expo-symbols'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'

export type LoadingStepStatus = 'pending' | 'active' | 'done'

type Props = {
  label: string
  status: LoadingStepStatus
  reducedMotion: boolean
  isLast: boolean
  connectorFilled: boolean
}

const ROW_HEIGHT = 46
const ICON_COL = 26
const NODE_SIZE = 26
const CONNECTOR_WIDTH = 2

export function LoadingStepIndicator({
  label,
  status,
  reducedMotion,
  isLast,
  connectorFilled,
}: Props) {
  const checkScale = useSharedValue(status === 'done' ? 1 : 0.6)
  const fill = useSharedValue(connectorFilled ? 1 : 0)
  const pulse = useSharedValue(0)

  useEffect(() => {
    if (status !== 'done') return
    if (reducedMotion) {
      checkScale.value = 1
      return
    }
    checkScale.value = withSpring(1, { damping: 12, stiffness: 180 })
  }, [reducedMotion, checkScale, status])

  useEffect(() => {
    if (reducedMotion) {
      fill.value = connectorFilled ? 1 : 0
      return
    }
    fill.value = withTiming(connectorFilled ? 1 : 0, { duration: 420 })
  }, [connectorFilled, fill, reducedMotion])

  useEffect(() => {
    if (status !== 'active' || reducedMotion) {
      pulse.value = 0
      return
    }
    pulse.value = withRepeat(withTiming(1, { duration: 1100 }), -1, true)
  }, [status, reducedMotion, pulse])

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }))
  const connectorStyle = useAnimatedStyle(() => ({ opacity: fill.value }))
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.16 }],
    opacity: 0.6 + pulse.value * 0.4,
  }))

  const activeRing = (
    <View style={styles.activeRing}>
      <View style={styles.activeDot} />
    </View>
  )

  return (
    <View
      style={styles.row}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <View style={styles.iconCol}>
        {!isLast ? (
          <>
            <View style={styles.connectorBase} />
            <Animated.View style={[styles.connectorFill, connectorStyle]} />
          </>
        ) : null}
        <View style={styles.node}>
          {status === 'done' ? (
            <Animated.View style={checkStyle}>
              <SymbolView
                name="checkmark.circle.fill"
                size={22}
                tintColor={colors.semanticPositive}
              />
            </Animated.View>
          ) : status === 'active' ? (
            reducedMotion ? (
              activeRing
            ) : (
              <Animated.View style={pulseStyle}>{activeRing}</Animated.View>
            )
          ) : (
            <View style={styles.pendingDot} />
          )}
        </View>
      </View>
      <Text
        style={[
          styles.label,
          status === 'pending' && styles.labelPending,
          status === 'done' && styles.labelDone,
          status === 'active' && styles.labelActive,
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
    height: ROW_HEIGHT,
  },
  iconCol: {
    width: ICON_COL,
    height: ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectorBase: {
    position: 'absolute',
    width: CONNECTOR_WIDTH,
    height: ROW_HEIGHT,
    top: ROW_HEIGHT / 2,
    borderRadius: CONNECTOR_WIDTH / 2,
    backgroundColor: colors.semanticMuted,
    opacity: 0.3,
  },
  connectorFill: {
    position: 'absolute',
    width: CONNECTOR_WIDTH,
    height: ROW_HEIGHT,
    top: ROW_HEIGHT / 2,
    borderRadius: CONNECTOR_WIDTH / 2,
    backgroundColor: colors.brandDim,
  },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgBase,
    zIndex: 1,
  },
  activeRing: {
    width: 18,
    height: 18,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.textSecondary,
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
  labelActive: {
    ...typography.label,
    color: colors.textPrimary,
  },
})
