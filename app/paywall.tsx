import { useEffect, useState } from 'react'
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { SymbolView } from 'expo-symbols'
import { PaywallFeatureRow } from '@components/paywall/PaywallFeatureRow'
import { PaywallPlanCard } from '@components/paywall/PaywallPlanCard'
import { useEntitlements } from '@contexts/SubscriptionContext'
import { purchase, restore } from '@lib/revenuecat/offerings'
import { usePaywallPlans, type PaywallPlanId } from '@lib/revenuecat/usePaywallPlans'
import { colors, spacing } from '@lib/theme/tokens'

// URLs publicadas (architecture.md §8 — LGPD checklist).
const TERMS_URL = 'https://getdoseday.com/terms'
const PRIVACY_URL = 'https://getdoseday.com/privacy'

// Dev-only: força o estado de erro de carregamento de planos pra QA de
// screenshot. Sempre false em commits (mesmo padrão de FORCE_INSIGHT_ERROR
// em hooks/useOnboardingInsight.ts).
const FORCE_LOAD_ERROR = false

type PaywallStatus = 'idle' | 'processing' | 'success' | 'restored' | 'unavailable' | 'loadError'

export default function PaywallScreen() {
  const { t } = useTranslation('subscription')
  const router = useRouter()
  const { isPremium, refresh } = useEntitlements()
  const { plans, loading: plansLoading, error: plansError, available, reload } = usePaywallPlans()
  const [status, setStatus] = useState<PaywallStatus>('idle')
  const [selectedPlan, setSelectedPlan] = useState<PaywallPlanId>('yearly')
  const [purchaseError, setPurchaseError] = useState(false)
  const [restoreNotFound, setRestoreNotFound] = useState(false)

  // Se a offering não tiver o plano anual, cai pro primeiro plano disponível.
  useEffect(() => {
    if (plans.length > 0 && !plans.some((p) => p.id === selectedPlan)) {
      setSelectedPlan(plans[0].id)
    }
  }, [plans, selectedPlan])

  function close() {
    router.back()
  }

  async function handleSubscribe() {
    setPurchaseError(false)
    setRestoreNotFound(false)

    const plan = plans.find((p) => p.id === selectedPlan)
    if (!available || !plan) {
      setStatus('unavailable')
      return
    }

    setStatus('processing')
    const outcome = await purchase(plan.package)
    if (outcome.status === 'success') {
      await refresh()
      setStatus('success')
    } else if (outcome.status === 'cancelled') {
      // Usuário cancelou na folha do StoreKit → volta ao estado normal, sem erro.
      setStatus('idle')
    } else {
      setStatus('idle')
      setPurchaseError(true)
    }
  }

  async function handleRestore() {
    setPurchaseError(false)
    setRestoreNotFound(false)

    if (!available) {
      setStatus('unavailable')
      return
    }

    setStatus('processing')
    const outcome = await restore()
    if (outcome.status === 'restored') {
      await refresh()
      setStatus('restored')
    } else if (outcome.status === 'nothing') {
      setStatus('idle')
      setRestoreNotFound(true)
    } else {
      setStatus('idle')
      setPurchaseError(true)
    }
  }

  // Premium ativo (compra concluída, restore ou usuário já premium). Tem
  // prioridade sobre loading/loadError — um pagante nunca vê spinner/erro.
  if (status === 'success' || status === 'restored' || (isPremium && status === 'idle')) {
    const title =
      status === 'restored'
        ? t('paywall.restore.successTitle')
        : t('paywall.success.welcomePremium')
    const message =
      status === 'restored'
        ? t('paywall.restore.successMessage')
        : t('paywall.success.subscriptionActivated')
    return (
      <PaywallShell onClose={close} closeLabel={t('paywall.close')}>
        <View className="flex-1 items-center justify-center gap-md px-lg py-xxl">
          <View
            className="w-[64px] h-[64px] rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(0,212,170,0.12)' }}
          >
            {/* style prop: mint a 12% (brand-fade) */}
            <SymbolView name="checkmark" size={28} tintColor={colors.brand} />
          </View>
          <Text
            className="text-text-primary text-[28px] font-semibold leading-[34px] text-center"
            testID="paywall-success-title"
          >
            {/* 📐 text-[28px] = headline */}
            {title}
          </Text>
          <Text className="text-text-secondary text-[16px] leading-[22px] text-center">
            {message}
          </Text>
          <Pressable
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel={t('paywall.success.startButton')}
            testID="paywall-success-continue"
            className="rounded-[14px] items-center justify-center min-h-[52px] px-xl mt-md active:opacity-90"
            style={{ backgroundColor: colors.brand }}
          >
            <Text className="text-text-inverse text-[16px] font-semibold leading-[20px]">
              {t('paywall.success.startButton')}
            </Text>
          </Pressable>
        </View>
      </PaywallShell>
    )
  }

  // Offering ainda carregando da App Store → spinner (nunca cards vazios).
  if (plansLoading && status === 'idle') {
    return (
      <PaywallShell onClose={close} closeLabel={t('paywall.close')}>
        <View className="flex-1 items-center justify-center gap-md px-lg py-xxl">
          <ActivityIndicator size="large" color={colors.brand} />
          <Text className="text-text-secondary text-[15px] leading-[24px] text-center">
            {t('paywall.subtitle')}
          </Text>
        </View>
      </PaywallShell>
    )
  }

  // Erro ao carregar a offering → fallback amigável com retry (nunca tela
  // quebrada). retry re-busca a offering via reload() do hook.
  if ((FORCE_LOAD_ERROR || plansError) && status === 'idle') {
    return (
      <PaywallShell onClose={close} closeLabel={t('paywall.close')}>
        <View className="flex-1 items-center justify-center gap-md px-lg py-xxl">
          <SymbolView name="wifi.exclamationmark" size={40} tintColor={colors.textSecondary} />
          <Text className="text-text-primary text-[22px] font-semibold leading-[28px] text-center">
            {/* 📐 text-[22px] = title */}
            {t('paywall.loadError.title')}
          </Text>
          <Text className="text-text-secondary text-[16px] leading-[22px] text-center">
            {t('paywall.loadError.message')}
          </Text>
          <Pressable
            onPress={reload}
            accessibilityRole="button"
            accessibilityLabel={t('paywall.loadError.retry')}
            className="min-h-[44px] justify-center px-lg active:opacity-70"
          >
            <Text
              className="text-[16px] font-semibold leading-[20px]"
              style={{ color: colors.brand }}
            >
              {t('paywall.loadError.retry')}
            </Text>
          </Pressable>
        </View>
      </PaywallShell>
    )
  }

  const processing = status === 'processing'

  return (
    <PaywallShell onClose={close} closeLabel={t('paywall.close')}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.lg,
          gap: spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View className="gap-xs mt-xs">
          <Text
            className="text-text-primary text-[32px] font-bold leading-[38px]"
            testID="paywall-hero"
          >
            {/* 📐 text-[32px] font-bold = display */}
            {t('paywall.hero')}
          </Text>
          <Text className="text-text-secondary text-[16px] leading-[22px]">
            {t('paywall.subtitle')}
          </Text>
        </View>

        {/* Benefícios */}
        <View className="gap-md">
          <PaywallFeatureRow
            icon="sparkles"
            title={t('paywall.features.ai.title')}
            description={t('paywall.features.ai.description')}
          />
          <PaywallFeatureRow
            icon="doc.text"
            title={t('paywall.features.report.title')}
            description={t('paywall.features.report.description')}
          />
          <PaywallFeatureRow
            icon="chart.line.uptrend.xyaxis"
            title={t('paywall.features.goal.title')}
            description={t('paywall.features.goal.description')}
          />
        </View>

        {/* Planos — preço real vindo do StoreKit (priceString), nunca hardcoded */}
        {plans.length > 0 ? (
          <View className="gap-sm">
            {plans.map((plan) => (
              <PaywallPlanCard
                key={plan.id}
                title={t(plan.id === 'yearly' ? 'paywall.plans.yearly' : 'paywall.plans.monthly')}
                priceNote={plan.priceString}
                periodLabel={t(plan.id === 'yearly' ? 'paywall.plans.perYear' : 'paywall.plans.perMonth')}
                selected={selectedPlan === plan.id}
                onPress={() => setSelectedPlan(plan.id)}
                testID={`paywall-plan-${plan.id}`}
              />
            ))}
            <Text className="text-text-tertiary text-[13px] leading-[18px]">
              {/* 📐 caption */}
              {t('paywall.pricing.fromStore')}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Footer FIXO: CTA + restore + legal sempre alcançáveis sem scroll.
          Conteúdo maior que o detent não rola de forma confiável dentro de
          formSheet nativo — ações críticas nunca podem depender disso. */}
      <View
        className="px-lg pt-sm gap-sm"
        style={{ borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.06)' }}
      >
        {/* Feedback das ações do footer — renderiza AQUI (visível), nunca no fim do scroll */}
        {!available || status === 'unavailable' ? (
          <View
            className="rounded-[14px] p-md gap-xxs"
            style={{ backgroundColor: 'rgba(91,168,217,0.12)' }}
            accessible
            accessibilityLabel={`${t('paywall.unavailable.title')}. ${t('paywall.unavailable.message')}`}
            testID="paywall-unavailable"
          >
            {/* style prop: azul clínico (info) a 12% — sem token Tailwind */}
            <Text className="text-text-primary text-[16px] font-semibold leading-[20px]">
              {t('paywall.unavailable.title')}
            </Text>
            <Text className="text-text-secondary text-[15px] leading-[24px]">
              {t('paywall.unavailable.message')}
            </Text>
          </View>
        ) : null}
        {purchaseError ? (
          <Text
            className="text-[15px] leading-[24px]"
            style={{ color: colors.semanticCritical }}
            testID="paywall-error"
          >
            {/* style prop: cor semântica de erro */}
            {t('paywall.errors.purchaseFailed')}
          </Text>
        ) : null}
        {restoreNotFound ? (
          <View className="gap-xxs" testID="paywall-restore-not-found">
            <Text className="text-text-primary text-[16px] font-semibold leading-[20px]">
              {t('paywall.restore.notFoundTitle')}
            </Text>
            <Text className="text-text-secondary text-[13px] leading-[18px]">
              {t('paywall.restore.notFoundMessage')}
            </Text>
          </View>
        ) : null}
        <Pressable
          onPress={() => void handleSubscribe()}
          disabled={processing}
          accessibilityRole="button"
          accessibilityLabel={t('paywall.cta.startTrial')}
          accessibilityHint="Inicia a assinatura Premium com período de teste."
          accessibilityState={{ disabled: processing, busy: processing }}
          testID="paywall-cta-subscribe"
          className="rounded-[14px] items-center justify-center min-h-[52px] active:opacity-90"
          style={{ backgroundColor: processing ? colors.brandDim : colors.brand }}
        >
          {processing ? (
            <View className="flex-row items-center gap-xs">
              <ActivityIndicator size="small" color={colors.textInverse} />
              <Text className="text-text-inverse text-[16px] font-semibold leading-[20px]">
                {t('paywall.cta.processing')}
              </Text>
            </View>
          ) : (
            <Text className="text-text-inverse text-[16px] font-semibold leading-[20px]">
              {t('paywall.cta.startTrial')}
            </Text>
          )}
        </Pressable>
        <Text className="text-text-secondary text-[13px] leading-[18px] text-center">
          {t('paywall.cta.trialNote')}
        </Text>

        {/* Restore — obrigatório de compliance, sempre visível sem scroll */}
        <Pressable
          onPress={() => void handleRestore()}
          disabled={processing}
          accessibilityRole="button"
          accessibilityLabel={t('paywall.cta.restorePurchases')}
          accessibilityHint="Restaura uma assinatura comprada anteriormente."
          testID="paywall-cta-restore"
          className="items-center justify-center min-h-[44px] active:opacity-70"
        >
          <Text
            className="text-[15px] font-semibold leading-[20px]"
            style={{ color: colors.brand }}
          >
            {t('paywall.cta.restorePurchases')}
          </Text>
        </Pressable>

        <View className="flex-row justify-center gap-lg">
          <Pressable
            onPress={() => void Linking.openURL(TERMS_URL)}
            accessibilityRole="link"
            accessibilityLabel={t('paywall.legal.terms')}
            className="min-h-[44px] justify-center active:opacity-70"
          >
            <Text className="text-text-tertiary text-[13px] leading-[18px] underline">
              {t('paywall.legal.terms')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => void Linking.openURL(PRIVACY_URL)}
            accessibilityRole="link"
            accessibilityLabel={t('paywall.legal.privacy')}
            className="min-h-[44px] justify-center active:opacity-70"
          >
            <Text className="text-text-tertiary text-[13px] leading-[18px] underline">
              {t('paywall.legal.privacy')}
            </Text>
          </Pressable>
        </View>
      </View>
    </PaywallShell>
  )
}

// Shell comum a todos os estados: fundo + botão fechar no topo.
function PaywallShell({
  children,
  onClose,
  closeLabel,
}: {
  children: React.ReactNode
  onClose: () => void
  closeLabel: string
}) {
  return (
    <SafeAreaView className="flex-1 bg-bg-base" edges={['bottom']}>
      <View className="flex-row justify-end px-md pt-md pb-xs">
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
          accessibilityHint="Fecha a tela de assinatura."
          hitSlop={10}
          testID="paywall-close"
          className="w-[44px] h-[44px] items-center justify-center rounded-full bg-bg-elevated active:opacity-70"
        >
          <SymbolView name="xmark" size={16} tintColor={colors.textSecondary} />
        </Pressable>
      </View>
      {children}
    </SafeAreaView>
  )
}
