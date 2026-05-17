import { ScrollView, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, typography, spacing } from '@lib/theme/tokens'
import { mockNextDoses, mockHistoryDoses } from '@lib/mocks/doses'
import { DoseCard } from '@components/doses/DoseCard'
import { SectionHeader } from '@components/doses/SectionHeader'

export default function DosesScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>Doses</Text>

        <SectionHeader title="Próximas" />
        {mockNextDoses.map((dose, index) => (
          <DoseCard key={dose.id} dose={dose} isNext={index === 0} />
        ))}

        <SectionHeader title="Histórico" />
        {mockHistoryDoses.map(dose => (
          <DoseCard key={dose.id} dose={dose} />
        ))}
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: spacing.xxxl,
  },
  headline: {
    ...typography.headline,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
})
