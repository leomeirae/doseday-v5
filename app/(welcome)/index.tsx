import { useRef, useState, useEffect, type ReactNode } from 'react'
import {
  AccessibilityInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { BlurView } from 'expo-blur'
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect'
import * as Haptics from 'expo-haptics'
import { useReducedMotion } from 'react-native-reanimated'
import type { SFSymbol } from 'sf-symbols-typescript'
import { WelcomePageIndicator } from '@components/welcome/WelcomePageIndicator'
import { WelcomeSlide } from '@components/welcome/WelcomeSlide'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'
import { markWelcomeSeen } from '@lib/utils/welcomeStorage'

type WelcomeSlideContent = {
  iconName: SFSymbol
  headline: string
  body: string
}

export default function WelcomeScreen() {
  const { t } = useTranslation('welcome')
  const router = useRouter()
  const { width } = useWindowDimensions()
  const scrollRef = useRef<ScrollView>(null)
  const reducedMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const [navigating, setNavigating] = useState(false)

  const slides: WelcomeSlideContent[] = [
    {
      iconName: 'cross.case.fill' as SFSymbol,
      headline: t('slides.0.headline'),
      body: t('slides.0.body'),
    },
    {
      iconName: 'doc.text.fill' as SFSymbol,
      headline: t('slides.1.headline'),
      body: t('slides.1.body'),
    },
    {
      iconName: 'checkmark.seal.fill' as SFSymbol,
      headline: t('slides.2.headline'),
      body: t('slides.2.body'),
    },
  ]

  const finalSlide = activeIndex === slides.length - 1

  function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const offsetX = event.nativeEvent.contentOffset.x
    const nextIndex = Math.round(offsetX / width)
    setActiveIndex(Math.min(Math.max(nextIndex, 0), slides.length - 1))
  }

  function goToSlide(index: number) {
    if (Platform.OS === 'ios') void Haptics.selectionAsync()
    setActiveIndex(index)
    scrollRef.current?.scrollTo({
      x: width * index,
      animated: !reducedMotion,
    })
  }

  async function goToAuthRoute(route: Href) {
    if (navigating) return

    setNavigating(true)
    if (Platform.OS === 'ios') void Haptics.selectionAsync()

    try {
      await markWelcomeSeen()
      router.replace(route)
    } finally {
      setNavigating(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          bounces={false}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          style={styles.pager}
          testID="welcome-pager"
        >
          {slides.map((slide, index) => (
            <WelcomeSlide
              key={slide.headline}
              iconName={slide.iconName}
              headline={slide.headline}
              body={slide.body}
              width={width}
              accessibilityLabel={t('accessibility.slide', {
                current: index + 1,
                total: slides.length,
              })}
              testID={`welcome-slide-${index + 1}`}
            />
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <WelcomePageIndicator
            count={slides.length}
            activeIndex={activeIndex}
            onPress={goToSlide}
            accessibilityLabelForIndex={(index) =>
              t('accessibility.pageIndicator', { index: index + 1 })
            }
          />

          <View style={styles.actionSlot}>
            {finalSlide ? (
              <Pressable
                onPress={() => void goToAuthRoute('/(auth)/signup' as Href)}
                disabled={navigating}
                accessibilityRole="button"
                accessibilityLabel={t('actions.createAccount')}
                accessibilityHint={t('accessibility.createAccountHint')}
                accessibilityState={{ disabled: navigating, busy: navigating }}
                style={({ pressed }) => [
                  styles.primaryButtonPressable,
                  pressed && !reducedMotion && styles.pressed,
                ]}
                testID="welcome-create-account"
              >
                <PrimaryGlassSurface>
                  <Text style={styles.primaryButtonLabel}>
                    {t('actions.createAccount')}
                  </Text>
                </PrimaryGlassSurface>
              </Pressable>
            ) : null}
          </View>

          <Pressable
            onPress={() => void goToAuthRoute('/(auth)/signin' as Href)}
            disabled={navigating}
            accessibilityRole="link"
            accessibilityLabel={t('actions.signIn')}
            accessibilityHint={t('accessibility.signInHint')}
            accessibilityState={{ disabled: navigating, busy: navigating }}
            style={({ pressed }) => [
              styles.signInLink,
              pressed && !reducedMotion && styles.linkPressed,
            ]}
            testID="welcome-sign-in"
          >
            <Text style={styles.signInText}>{t('actions.signIn')}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

function PrimaryGlassSurface({ children }: { children: ReactNode }) {
  const reduceTransparency = useReduceTransparency()
  const surfaceStyle = [styles.primaryGlassSurface, styles.primaryGlassTint]

  if (!reduceTransparency && isGlassEffectAPIAvailable()) {
    return (
      <GlassView
        glassEffectStyle="regular"
        colorScheme="dark"
        tintColor={withAlpha(colors.brand, 0.08)}
        isInteractive
        style={surfaceStyle}
      >
        {children}
      </GlassView>
    )
  }

  if (!reduceTransparency && Platform.OS === 'ios') {
    return (
      <BlurView intensity={56} tint="dark" style={surfaceStyle}>
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
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  pager: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  actionSlot: {
    width: '100%',
    minHeight: 56,
    justifyContent: 'center',
  },
  primaryButtonPressable: {
    width: '100%',
    minHeight: 56,
    borderRadius: radius.md,
  },
  primaryGlassSurface: {
    minHeight: 56,
    borderRadius: radius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryGlassTint: {
    backgroundColor: withAlpha(colors.brand, 0.08),
    borderWidth: 1,
    borderColor: colors.brand,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  primaryButtonLabel: {
    ...typography.label,
    color: colors.textPrimary,
  },
  signInLink: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  linkPressed: {
    transform: [{ scale: 0.98 }],
  },
  signInText: {
    ...typography.body,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
})
