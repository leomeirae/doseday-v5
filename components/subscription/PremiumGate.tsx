import { type ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { SymbolView } from 'expo-symbols'
import { useEntitlements } from '@contexts/SubscriptionContext'
import { colors } from '@lib/theme/tokens'

// Gate de conteúdo premium: premium vê o conteúdo, free vê preview de conversão
// com CTA pro paywall. Tom calmo, sem dark pattern — o conteúdo real NUNCA é
// renderizado escondido (free não dispara queries de dado premium).

type GateKey = 'reports' | 'dailyInsight'

type Props = {
  children: ReactNode
  gateKey: GateKey
  testID?: string
}

export function PremiumGate({ children, gateKey, testID }: Props) {
  const { isPremium, isLoading } = useEntitlements()
  const { t } = useTranslation('subscription')
  const router = useRouter()

  // Entitlement ainda resolvendo: não pisca conteúdo premium nem o gate.
  if (isLoading) return null

  if (isPremium) return <>{children}</>

  return (
    <View
      className="bg-bg-surface rounded-[20px] p-lg gap-md items-center"
      accessible
      accessibilityLabel={`${t(`gate.${gateKey}.title`)}. ${t(`gate.${gateKey}.description`)}`}
      testID={testID}
    >
      <View
        className="w-[56px] h-[56px] rounded-full items-center justify-center"
        style={{ backgroundColor: 'rgba(0,212,170,0.12)' }}
      >
        {/* style prop: mint a 12% (brand-fade) */}
        <SymbolView name="lock.fill" size={24} tintColor={colors.brand} />
      </View>
      <View className="gap-xs items-center">
        <Text className="text-text-primary text-[22px] font-semibold leading-[28px] text-center">
          {/* 📐 text-[22px] = title */}
          {t(`gate.${gateKey}.title`)}
        </Text>
        <Text className="text-text-secondary text-[15px] leading-[24px] text-center">
          {/* 📐 text-[15px] leading-[24px] = body-clinical */}
          {t(`gate.${gateKey}.description`)}
        </Text>
      </View>
      <Pressable
        onPress={() => router.push('/paywall')}
        accessibilityRole="button"
        accessibilityLabel={t(`gate.${gateKey}.cta`)}
        accessibilityHint="Abre os detalhes da assinatura Premium."
        testID={testID ? `${testID}-cta` : undefined}
        className="rounded-[14px] items-center justify-center min-h-[48px] px-xl self-stretch active:opacity-90"
        style={{ backgroundColor: colors.brand }}
      >
        <Text className="text-text-inverse text-[16px] font-semibold leading-[20px]">
          {t(`gate.${gateKey}.cta`)}
        </Text>
      </Pressable>
    </View>
  )
}
