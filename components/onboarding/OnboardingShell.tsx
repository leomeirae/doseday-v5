import type { ReactNode } from 'react'
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SymbolView } from 'expo-symbols'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'
import type { OnboardingStep } from '@lib/types/onboarding'

type CTA = {
  label: string
  onPress: () => void
  disabled?: boolean
  loading?: boolean
}

export type OnboardingShellProps = {
  step: OnboardingStep
  stepNumber: number
  totalSteps: number
  headline: string
  subtitle?: string
  children: ReactNode
  primaryCTA: CTA
  secondaryCTA?: {
    label: string
    onPress: () => void
  }
  showBack?: boolean
  onBack?: () => void
  onClose?: () => void
}

export function OnboardingShell({
  step,
  stepNumber,
  totalSteps,
  headline,
  subtitle,
  children,
  primaryCTA,
  secondaryCTA,
  showBack = true,
  onBack,
  onClose,
}: OnboardingShellProps) {
  const primaryDisabled = primaryCTA.disabled || primaryCTA.loading

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <View style={styles.headerSide}>
            {showBack && onBack ? (
              <IconButton
                label="Voltar"
                symbol="chevron.left"
                onPress={onBack}
                testID={`${step}-back`}
              />
            ) : null}
          </View>

          <Text style={styles.progress} numberOfLines={1}>
            Passo {stepNumber} de {totalSteps}
          </Text>

          <View style={[styles.headerSide, styles.headerSideEnd]}>
            {onClose ? (
              <IconButton
                label="Fechar onboarding"
                symbol="xmark"
                onPress={onClose}
                testID={`${step}-close`}
              />
            ) : null}
          </View>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.copy}>
            <Text style={styles.headline}>{headline}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {children}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={() => { Keyboard.dismiss(); primaryCTA.onPress(); }}
            disabled={primaryDisabled}
            accessibilityRole="button"
            accessibilityLabel={primaryCTA.label}
            accessibilityState={{
              disabled: primaryDisabled,
              busy: primaryCTA.loading,
            }}
            testID={`${step}-primary-cta`}
            style={({ pressed }) => [
              styles.primaryButton,
              primaryDisabled && styles.disabled,
              pressed && !primaryDisabled && styles.pressed,
            ]}
          >
            {primaryCTA.loading ? (
              <ActivityIndicator color={colors.textInverse} size="small" />
            ) : (
              <Text style={styles.primaryLabel}>{primaryCTA.label}</Text>
            )}
          </Pressable>

          {secondaryCTA ? (
            <Pressable
              onPress={secondaryCTA.onPress}
              accessibilityRole="button"
              accessibilityLabel={secondaryCTA.label}
              testID={`${step}-secondary-cta`}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryPressed,
              ]}
            >
              <Text style={styles.secondaryLabel}>{secondaryCTA.label}</Text>
            </Pressable>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function IconButton({
  label,
  symbol,
  onPress,
  testID,
}: {
  label: string
  symbol: 'chevron.left' | 'xmark'
  onPress: () => void
  testID: string
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
    >
      <SymbolView name={symbol} size={18} tintColor={colors.textSecondary} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  flex: {
    flex: 1,
  },
  header: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSide: {
    width: 44,
    alignItems: 'flex-start',
  },
  headerSideEnd: {
    alignItems: 'flex-end',
  },
  progress: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    flex: 1,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPressed: {
    backgroundColor: colors.bgElevated,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  copy: {
    gap: spacing.sm,
  },
  headline: {
    ...typography.display,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
    backgroundColor: colors.bgBase,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.lg,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  primaryLabel: {
    ...typography.label,
    color: colors.textInverse,
    textAlign: 'center',
  },
  secondaryButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  secondaryPressed: {
    opacity: 0.7,
  },
  secondaryLabel: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})
