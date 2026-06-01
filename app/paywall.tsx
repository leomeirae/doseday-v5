import { useState } from 'react'
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { SymbolView } from 'expo-symbols'
import { PaywallFeatureRow } from '@components/paywall/PaywallFeatureRow'
import { PaywallPlanCard } from '@components/paywall/PaywallPlanCard'
import { useEntitlements } from '@contexts/SubscriptionContext'
import {
  getDevEntitlementOverride,
  setDevEntitlementOverride,
} from '@lib/subscription/devEntitlementStorage'
import { MOCK_PLANS, type PaywallPlanId } from '@lib/subscription/mockOfferings'
import { colors, spacing } from '@lib/theme/tokens'

// URLs publicadas (architecture.md §8 — LGPD checklist).
const TERMS_URL = 'https://getdoseday.com/terms'
const PRIVACY_URL = 'https://getdoseday.com/privacy'

// Dev-only: força o estado de erro de carregamento de planos pra QA de
// screenshot. Sempre false em commits (mesmo padrão de FORCE_INSIGHT_ERROR
// em hooks/useOnboardingInsight.ts).
const FORCE_LOAD_ERROR = false

// Mock: atraso artificial pra tornar o estado 'processing' visível em QA.
// Some na Fase 2 — o tempo real passa a ser o da transação StoreKit.
const MOCK_PROCESSING_DELAY_MS = 600

type PaywallStatus = 'idle' | 'processing' | 'success' | 'restored' | 'unavailable' | 'loadError'

export default function PaywallScreen() {
  const { t } = useTranslation('subscription')
  const router = useRouter()
  const { isPremium, refresh } = useEntitlements()
  const [status, setStatus] = useState<PaywallStatus>(FORCE_LOAD_ERROR ? 'loadError' : 'idle')
  const [selectedPlan, setSelectedPlan] = useState<PaywallPlanId>('yearly')
  const [purchaseError, setPurchaseError] = useState(false)
  const [restoreNotFound, setRestoreNotFound] = useState(false)

  function close() {
    router.back()
  }

  async function handleSubscribe() {
    setPurchaseError(false)
    setRestoreNotFound(false)

    // FASE 1 (sem SDK): em dev o CTA ativa o mock; em produção informa que a
    // assinatura ainda não está disponível (decisão #2 do plano aprovado).
    // FASE 2: aqui entra Purchases.purchasePackage(<plano selecionado>).
    if (!__DEV__) {
      setStatus('unavailable')
      return
    }

    setStatus('processing')
    try {
      await new Promise((resolve) => setTimeout(resolve, MOCK_PROCESSING_DELAY_MS))
      await setDevEntitlementOverride(true)
      await refresh()
      setStatus('success')
    } catch {
      setStatus('idle')
      setPurchaseError(true)
    }
  }

  async function handleRestore() {
    setPurchaseError(false)
    setRestoreNotFound(false)

    // FASE 2: aqui entra Purchases.restorePurchases().
    if (!__DEV__) {
      setStatus('unavailable')
      return
    }

    setStatus('processing')
    await new Promise((resolve) => setTimeout(resolve, MOCK_PROCESSING_DELAY_MS))
    const hasPurchase = await getDevEntitlementOverride()
    if (hasPurchase) {
      await refresh()
      setStatus('restored')
    } else {
      setStatus('idle')
      setRestoreNotFound(true)
    }
  }

  // Erro ao carregar planos → fallback amigável com retry (nunca tela quebrada).
  if (status === 'loadError') {
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
            onPress={() => setStatus('idle')}
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

  // Premium ativo (compra mock concluída, restore ou usuário já premium).
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

        {/* Planos (Fase 1: sem número de preço; valor real virá da App Store na Fase 2) */}
        <View className="gap-sm">
          {MOCK_PLANS.map((plan) => (
            <PaywallPlanCard
              key={plan.id}
              title={t(plan.titleKey)}
              priceNote={t('paywall.pricing.viaAppStore')}
              periodLabel={t(plan.periodKey)}
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

        {/* Estados de feedback inline */}
        {status === 'unavailable' ? (
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
            <Text className="text-text-secondary text-[15px] leading-[24px]">
              {t('paywall.restore.notFoundMessage')}
            </Text>
          </View>
        ) : null}

        {/* CTA principal */}
        <View className="gap-sm">
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

          {/* Restore — obrigatório de compliance, sempre visível */}
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
              className="text-[16px] font-semibold leading-[20px]"
              style={{ color: colors.brand }}
            >
              {t('paywall.cta.restorePurchases')}
            </Text>
          </Pressable>
        </View>

        {/* Footer legal */}
        <View className="items-center gap-xs">
          <View className="flex-row gap-lg">
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
      </ScrollView>
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
