import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { SymbolView } from 'expo-symbols'
import { useEntitlements } from '@contexts/SubscriptionContext'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'

// Teaser de conversão no result do onboarding (Subfase 5 do plano
// 2026-06-01-release-readiness-paywall-freemium). Copy de gate.resultTeaser
// (subscription.json, pré-criada no PR #103). NUNCA bloqueia a conclusão do
// onboarding — é um card secundário com CTA suave que abre o paywall.
// Auto-esconde pra usuário premium e enquanto o entitlement resolve (sem flash).

type Props = {
  testID?: string
}

export function PremiumTeaserCard({ testID }: Props) {
  const { isPremium, isLoading } = useEntitlements()
  const { t } = useTranslation('subscription')
  const router = useRouter()
  const [pressed, setPressed] = useState(false)

  // Premium não vê upsell; entitlement carregando não pisca o card.
  if (isLoading || isPremium) return null

  return (
    // Sem `accessible` no container: título/descrição/CTA ficam como elementos
    // de acessibilidade separados — o CTA precisa ser ativável por VoiceOver.
    <View style={styles.card} testID={testID}>
      <View style={styles.titleRow}>
        <SymbolView name="sparkles" size={16} tintColor={colors.brand} />
        <Text style={styles.title}>{t('gate.resultTeaser.title')}</Text>
      </View>
      <Text style={styles.description}>{t('gate.resultTeaser.description')}</Text>
      <Pressable
        onPress={() => router.push('/paywall')}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t('gate.resultTeaser.cta')}
        accessibilityHint="Abre os detalhes da assinatura Premium."
        testID={testID ? `${testID}-cta` : undefined}
        style={[styles.cta, pressed && styles.ctaPressed]}
      >
        <Text style={styles.ctaLabel}>{t('gate.resultTeaser.cta')}</Text>
        <SymbolView name="chevron.right" size={12} tintColor={colors.textBrand} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: spacing.md,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
    flex: 1,
  },
  description: {
    ...typography.bodyClinical,
    color: colors.textSecondary,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xxs,
    minHeight: 44,
    paddingRight: spacing.xs,
  },
  ctaPressed: {
    opacity: 0.7,
  },
  ctaLabel: {
    ...typography.label,
    color: colors.textBrand,
  },
})
