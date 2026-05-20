import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { colors, radius } from '@lib/theme/tokens'

type Props = {
  reducedMotion: boolean
}

const RING_SIZE = 120
const CORE_SIZE = 56

// Único elemento com Vital Mint na tela loading (Vital Mint Rarity Rule).
export function PulseAnimation({ reducedMotion }: Props) {
  const progress = useSharedValue(0)

  useEffect(() => {
    if (reducedMotion) return
    progress.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }),
      -1,
      false
    )
  }, [progress, reducedMotion])

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.7 + progress.value * 0.6 }],
    opacity: 0.45 * (1 - progress.value),
  }))

  return (
    <View style={styles.container} accessibilityElementsHidden importantForAccessibility="no">
      {reducedMotion ? (
        <View style={[styles.ring, styles.ringStatic]} />
      ) : (
        <Animated.View style={[styles.ring, ringStyle]} />
      )}
      <View style={styles.core} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
  },
  ringStatic: {
    opacity: 0.18,
    transform: [{ scale: 0.92 }],
  },
  core: {
    width: CORE_SIZE,
    height: CORE_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
  },
})
