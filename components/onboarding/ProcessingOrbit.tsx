import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Circle } from 'react-native-svg'
import { colors, radius } from '@lib/theme/tokens'

type Props = {
  reducedMotion: boolean
}

const RING_SIZE = 132
const CORE_SIZE = 52
const TRACK_STROKE = 2
const ARC_STROKE = 3
const CENTER = RING_SIZE / 2
const R = (RING_SIZE - ARC_STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * R
const ARC_FRACTION = 0.22
const ROTATION_MS = 2600

// Núcleo estável + arco orbital lento. Único elemento Vital Mint da tela
// (Vital Mint Rarity Rule). Movimento lento = clínico, não spinner genérico.
export function ProcessingOrbit({ reducedMotion }: Props) {
  const rotation = useSharedValue(0)

  useEffect(() => {
    if (reducedMotion) return
    rotation.value = withRepeat(
      withTiming(360, { duration: ROTATION_MS, easing: Easing.linear }),
      -1,
      false
    )
  }, [reducedMotion, rotation])

  const orbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}deg` }],
  }))

  const arc = (
    <Svg width={RING_SIZE} height={RING_SIZE}>
      <Circle
        cx={CENTER}
        cy={CENTER}
        r={R}
        stroke={colors.brand}
        strokeWidth={ARC_STROKE}
        strokeLinecap="round"
        strokeDasharray={`${CIRCUMFERENCE * ARC_FRACTION} ${
          CIRCUMFERENCE * (1 - ARC_FRACTION)
        }`}
        fill="none"
      />
    </Svg>
  )

  return (
    <View
      style={styles.container}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <Svg
        width={RING_SIZE}
        height={RING_SIZE}
        style={StyleSheet.absoluteFill}
      >
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={R}
          stroke={colors.semanticMuted}
          strokeWidth={TRACK_STROKE}
          strokeOpacity={0.35}
          fill="none"
        />
      </Svg>

      {reducedMotion ? (
        <View style={StyleSheet.absoluteFill}>{arc}</View>
      ) : (
        <Animated.View style={[StyleSheet.absoluteFill, orbitStyle]}>
          {arc}
        </Animated.View>
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
  core: {
    width: CORE_SIZE,
    height: CORE_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
  },
})
