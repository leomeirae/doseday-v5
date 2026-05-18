import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing } from '@lib/theme/tokens'
import { GreetingHeader } from '@components/home/GreetingHeader'
import { NextDoseCard } from '@components/home/NextDoseCard'
import { InsightCard } from '@components/home/InsightCard'
import { useProfile } from '@hooks/useProfile'
import { useDoseSummary } from '@hooks/useDoseSummary'
import { mapQueryError } from '@lib/supabase/queries/errors'

export default function HomeScreen() {
  const { data: profile } = useProfile()
  const { data: dose, isLoading: doseLoading, error: doseError, refetch } = useDoseSummary()

  const firstName = profile?.fullName?.split(' ')[0] ?? 'você'
  const errorMessage = doseError ? mapQueryError(doseError) : null

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <GreetingHeader name={firstName} />
        <NextDoseCard
          nextDose={dose?.nextDose ?? null}
          isLoading={doseLoading}
          error={errorMessage}
          onRetry={refetch}
        />
        <InsightCard />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.xl,
    paddingBottom: spacing.xl,
  },
})
