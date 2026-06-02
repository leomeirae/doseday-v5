import { Pressable, ScrollView, Text, View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, type Href } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { colors, spacing, typography } from '@lib/theme/tokens'
import { PremiumGate } from '@components/subscription/PremiumGate'
import { WeightChartCard } from '@components/relatorios/WeightChartCard'
import { DoseAdherenceCard } from '@components/relatorios/DoseAdherenceCard'
import { SymptomDistributionCard } from '@components/relatorios/SymptomDistributionCard'
import { AdherenceRingCard } from '@components/relatorios/AdherenceRingCard'
import { useWeightHistory } from '@hooks/useWeightHistory'
import { useDoseAdherence } from '@hooks/useDoseAdherence'
import { useSymptomDistribution } from '@hooks/useSymptomDistribution'
import { useMemorySummary } from '@hooks/useMemorySummary'
import { MemorySummaryBlock } from '@components/relatorios/MemorySummaryBlock'
import { mapQueryError } from '@lib/supabase/queries/errors'

export default function RelatoriosScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          {/* Back chevron — a tab bar é oculta; navegação chega via card da Home (mesmo padrão de doses.tsx) */}
          <View style={styles.headlineRow}>
            <Pressable
              onPress={() => {
                if (router.canGoBack()) {
                  router.back()
                } else {
                  router.replace('/(tabs)/index' as Href)
                }
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
            >
              <SymbolView name="chevron.left" size={22} tintColor={colors.textPrimary} />
            </Pressable>
            <Text style={styles.headline}>Memória do tratamento</Text>
            <View style={styles.headlineSpacer} />
          </View>
          <Text style={styles.subtitle}>Sua memória do tratamento organizada para a consulta.</Text>
        </View>

        <PremiumGate gateKey="reports" testID="reports-premium-gate">
          <RelatoriosContent />
        </PremiumGate>
      </ScrollView>
    </SafeAreaView>
  )
}

// Os hooks de dados vivem AQUI — só executam quando o gate renderiza o filho
// (premium). Usuário free não dispara nenhuma query de relatório.
function RelatoriosContent() {
  const weight = useWeightHistory()
  const dose = useDoseAdherence()
  const symptoms = useSymptomDistribution()
  const summary = useMemorySummary()

  return (
    <>
      <MemorySummaryBlock
        data={summary.data}
        isLoading={summary.isLoading}
        error={summary.error ? mapQueryError(summary.error) : null}
      />

      <WeightChartCard
        data={weight.data ?? []}
        isLoading={weight.isLoading}
        error={weight.error ? mapQueryError(weight.error) : null}
        onRetry={() => {
          void weight.refetch()
        }}
      />

      <DoseAdherenceCard
        data={dose.data?.history ?? []}
        isLoading={dose.isLoading}
        error={dose.error ? mapQueryError(dose.error) : null}
        onRetry={() => {
          void dose.refetch()
        }}
      />

      <SymptomDistributionCard
        data={symptoms.data ?? []}
        isLoading={symptoms.isLoading}
        error={symptoms.error ? mapQueryError(symptoms.error) : null}
        onRetry={() => {
          void symptoms.refetch()
        }}
      />

      <AdherenceRingCard
        stats={dose.data?.stats ?? null}
        isLoading={dose.isLoading}
        error={dose.error ? mapQueryError(dose.error) : null}
        onRetry={() => {
          void dose.refetch()
        }}
      />
    </>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  headlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headlineSpacer: {
    width: 22,
  },
  headline: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
})
