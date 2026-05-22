import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { colors, spacing } from '@lib/theme/tokens'
import { GreetingHeader } from '@components/home/GreetingHeader'
import { NextDoseCard } from '@components/home/NextDoseCard'
import { EmptyDoseStateCard } from '@components/home/EmptyDoseStateCard'
import { InsightCard } from '@components/home/InsightCard'
import { HomeQuickActions } from '@components/home/HomeQuickActions'
import { useProfile } from '@hooks/useProfile'
import { useDoseSummary } from '@hooks/useDoseSummary'
import { mapQueryError } from '@lib/supabase/queries/errors'

export default function HomeScreen() {
  const router = useRouter()
  const { data: profile } = useProfile()
  const { data: dose, isLoading: doseLoading, error: doseError, refetch } = useDoseSummary()

  const firstName = profile?.fullName?.split(' ')[0] ?? 'você'
  const errorMessage = doseError ? mapQueryError(doseError) : null
  const hasDose = (dose?.history.length ?? 0) > 0

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <GreetingHeader name={firstName} />
        {doseLoading || errorMessage || hasDose ? (
          <NextDoseCard
            nextDose={dose?.nextDose ?? null}
            isLoading={doseLoading}
            error={errorMessage}
            onRetry={refetch}
          />
        ) : (
          <EmptyDoseStateCard
            onPressRegister={() => router.push('/dose/registrar')}
            treatmentStatus={profile?.treatmentStatus}
            medicationName={profile?.currentMedication}
            currentDose={profile?.currentDose}
          />
        )}
        <HomeQuickActions
          hasDose={hasDose}
          onPressDose={() => router.push('/dose/registrar')}
          onPressWeight={() => router.push('/peso/registrar')}
        />
        <InsightCard source={hasDose ? 'daily' : 'onboarding'} />
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
