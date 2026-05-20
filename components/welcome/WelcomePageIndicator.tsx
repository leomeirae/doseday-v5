import { useEffect, useState, type ReactNode } from 'react'
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect'
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { colors, radius, spacing } from '@lib/theme/tokens'

type WelcomePageIndicatorProps = {
  count: number
  activeIndex: number
  onPress: (index: number) => void
  accessibilityLabelForIndex: (index: number) => string
}

export function WelcomePageIndicator({
  count,
  activeIndex,
  onPress,
  accessibilityLabelForIndex,
}: WelcomePageIndicatorProps) {
  return (
    <IndicatorGlassSurface>
      <View style={styles.row}>
        {Array.from({ length: count }).map((_, index) => (
          <Pressable
            key={index}
            onPress={() => onPress(index)}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabelForIndex(index)}
            accessibilityState={{ selected: activeIndex === index }}
            hitSlop={spacing.xs}
            style={styles.hitArea}
            testID={`welcome-page-indicator-${index + 1}`}
          >
            <IndicatorDot active={activeIndex === index} />
          </Pressable>
        ))}
      </View>
    </IndicatorGlassSurface>
  )
}

function IndicatorDot({ active }: { active: boolean }) {
  const reducedMotion = useReducedMotion()
  const width = useSharedValue(active ? 22 : 7)

  useEffect(() => {
    width.value = reducedMotion
      ? withTiming(active ? 22 : 7, { duration: 0 })
      : withSpring(active ? 22 : 7, { damping: 18, stiffness: 220, mass: 0.8 })
  }, [active, reducedMotion, width])

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
  }))

  return (
    <Animated.View
      style={[
        styles.dot,
        active ? styles.dotActive : styles.dotInactive,
        animatedStyle,
      ]}
    />
  )
}

function IndicatorGlassSurface({ children }: { children: ReactNode }) {
  const reduceTransparency = useReduceTransparency()
  const surfaceStyle = [styles.glassSurface, styles.glassTint]

  if (!reduceTransparency && isGlassEffectAPIAvailable()) {
    return (
      <GlassView
        glassEffectStyle="regular"
        colorScheme="dark"
        tintColor={withAlpha(colors.brand, 0.08)}
        style={surfaceStyle}
      >
        {children}
      </GlassView>
    )
  }

  if (!reduceTransparency && Platform.OS === 'ios') {
    return (
      <BlurView intensity={48} tint="dark" style={surfaceStyle}>
        {children}
      </BlurView>
    )
  }

  return <View style={surfaceStyle}>{children}</View>
}

function useReduceTransparency() {
  const [reduceTransparency, setReduceTransparency] = useState(false)

  useEffect(() => {
    AccessibilityInfo.isReduceTransparencyEnabled().then(setReduceTransparency)
    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setReduceTransparency
    )

    return () => {
      subscription.remove()
    }
  }, [])

  return reduceTransparency
}

function withAlpha(hexColor: string, alpha: number) {
  const hex = hexColor.replace('#', '')
  const red = parseInt(hex.slice(0, 2), 16)
  const green = parseInt(hex.slice(2, 4), 16)
  const blue = parseInt(hex.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

const styles = StyleSheet.create({
  glassSurface: {
    minHeight: 40,
    borderRadius: radius.full,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  glassTint: {
    backgroundColor: withAlpha(colors.bgSurface, 0.72),
    borderWidth: 1,
    borderColor: withAlpha(colors.brand, 0.18),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  hitArea: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 7,
    borderRadius: radius.full,
  },
  dotActive: {
    backgroundColor: colors.brand,
  },
  dotInactive: {
    backgroundColor: colors.textTertiary,
  },
})
