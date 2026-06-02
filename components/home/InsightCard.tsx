import { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { SymbolView } from 'expo-symbols'
import { InsightDisclaimer } from '@components/ui/InsightDisclaimer'
import { useEntitlements } from '@contexts/SubscriptionContext'
import { useDailyInsight } from '@hooks/useDailyInsight'
import { useOnboardingInsightFromDB } from '@hooks/useOnboardingInsightFromDB'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

const STATIC_FALLBACK = 'Vamos acompanhar seu tratamento dia a dia.'

interface Props {
  source: 'onboarding' | 'daily'
}

export function InsightCard({ source }: Props) {
  const router = useRouter()
  const { t } = useTranslation('subscription')
  const { isPremium } = useEntitlements()
  const [gateCtaPressed, setGateCtaPressed] = useState(false)
  const onboarding = useOnboardingInsightFromDB()
  // Gate defensivo: IA contínua (insight diário) é Premium — free não dispara a
  // query. O insight do onboarding NUNCA é gateado (decisão de produto travada).
  const daily = useDailyInsight({ enabled: source === 'daily' && isPremium })

  const isLoading = source === 'onboarding' ? onboarding.isLoading : isPremium && daily.isLoading
  const showDailyGate = source === 'daily' && !isPremium

  function renderContent() {
    if (showDailyGate) {
      return (
        <>
          <View style={styles.gateHeader}>
            <SymbolView name="lock.fill" size={16} tintColor={colors.brand} />
            <Text style={styles.gateTitle}>{t('gate.dailyInsight.title')}</Text>
          </View>
          <Text style={styles.insightText}>{t('gate.dailyInsight.description')}</Text>
          <Pressable
            onPress={() => router.push('/paywall')}
            onPressIn={() => setGateCtaPressed(true)}
            onPressOut={() => setGateCtaPressed(false)}
            accessibilityRole="button"
            accessibilityLabel={t('gate.dailyInsight.cta')}
            accessibilityHint="Abre os detalhes da assinatura Premium."
            testID="insight-premium-gate-cta"
            style={[styles.gateCta, gateCtaPressed && styles.gateCtaPressed]}
          >
            <Text style={styles.gateCtaLabel}>{t('gate.dailyInsight.cta')}</Text>
          </Pressable>
        </>
      )
    }

    if (isLoading) {
      return (
        <>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
        </>
      )
    }

    if (source === 'onboarding') {
      const contract = onboarding.data
      if (!contract) {
        return <Text style={styles.insightText}>{STATIC_FALLBACK}</Text>
      }
      return (
        <>
          <InsightDisclaimer text={contract.disclaimer} />
          <Text style={styles.insightText}>{contract.shortInsight}</Text>
          <Text style={styles.nextStep}>{contract.nextStep}</Text>
        </>
      )
    }

    const data = daily.data
    if (data && (data.kind === 'premium' || data.kind === 'fallback') && data.insightText) {
      return (
        <>
          <InsightDisclaimer />
          <Text style={styles.insightText}>{data.insightText}</Text>
        </>
      )
    }

    return <Text style={styles.insightText}>{STATIC_FALLBACK}</Text>
  }

  return (
    <View
      accessible
      accessibilityLabel={buildA11yLabel(
        source,
        isLoading,
        showDailyGate,
        t,
        onboarding.data,
        daily.data,
      )}
    >
      <Text style={styles.sectionTitle}>Insight do dia</Text>
      <View style={styles.card}>
        <View style={styles.cardContent}>{renderContent()}</View>
      </View>
    </View>
  )
}

function buildA11yLabel(
  source: Props['source'],
  isLoading: boolean,
  showDailyGate: boolean,
  t: (key: string) => string,
  onboarding: ReturnType<typeof useOnboardingInsightFromDB>['data'],
  daily: ReturnType<typeof useDailyInsight>['data'],
): string {
  if (showDailyGate) {
    return `${t('gate.dailyInsight.title')}. ${t('gate.dailyInsight.description')}`
  }
  if (isLoading) return 'Insight do dia carregando'
  if (source === 'onboarding') {
    return onboarding ? `${onboarding.shortInsight} ${onboarding.nextStep}` : STATIC_FALLBACK
  }
  if (daily && (daily.kind === 'premium' || daily.kind === 'fallback') && daily.insightText) {
    return daily.insightText
  }
  return STATIC_FALLBACK
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,
    borderWidth: 0.5,
    padding: spacing.lg,
  },
  cardContent: {
    gap: spacing.sm,
  },
  insightText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  nextStep: {
    ...typography.label,
    color: colors.textPrimary,
  },
  skeletonLine: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xs,
    height: 14,
  },
  skeletonLineShort: {
    width: '65%',
  },
  gateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  gateTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  gateCta: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  gateCtaPressed: {
    backgroundColor: colors.brandDim,
  },
  gateCtaLabel: {
    ...typography.label,
    color: colors.textInverse,
  },
})
