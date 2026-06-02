import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { Circle, Svg } from 'react-native-svg'
import { colors } from '@lib/theme/tokens'

type Props = {
  /** Progresso determinado, 0..1 (ex.: stepIndex / total de steps). */
  progress: number
  reducedMotion: boolean
}

const RING_SIZE = 120
const STROKE_WIDTH = 5
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

// Anel de progresso determinado da tela de loading do onboarding.
// O preenchimento é o único elemento com Vital Mint na tela (Vital Mint Rarity Rule).
export function LoadingProgressRing({ progress, reducedMotion }: Props) {
  const animatedProgress = useSharedValue(reducedMotion ? progress : 0)

  useEffect(() => {
    if (reducedMotion) {
      // Reduced motion: salta direto pro valor, sem animação.
      animatedProgress.value = progress
      return
    }
    animatedProgress.value = withTiming(progress, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    })
  }, [animatedProgress, progress, reducedMotion])

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - animatedProgress.value),
  }))

  return (
    <View
      style={styles.container}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <Svg width={RING_SIZE} height={RING_SIZE}>
        {/* Trilha de fundo */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {/* Preenchimento (Vital Mint) — começa no topo (rotate -90) */}
        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke={colors.brand}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        />
      </Svg>
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
})
