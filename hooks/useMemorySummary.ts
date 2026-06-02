import { useQuery } from '@tanstack/react-query'
import { useSession } from './useSession'
import { supabase } from '@lib/supabase/client'
import {
  callMemorySummary,
  type MemorySummaryInput,
} from '@lib/supabase/queries/insights'
import {
  getDoseHistoryByWeek,
  getWeightHistory,
  getSymptomDistribution,
} from '@lib/supabase/queries/reports'
import { getDoseSummary } from '@lib/supabase/queries/doses'
import { buildTreatmentContext } from '@lib/supabase/queries/diario'
import { useEntitlements } from '@contexts/SubscriptionContext'

async function assembleMemorySummaryInput(userId: string): Promise<MemorySummaryInput> {
  const [doses, weightPoints, symptoms, doseSummary, profileRow] = await Promise.all([
    getDoseHistoryByWeek(userId, 8),
    getWeightHistory(userId, 90),
    getSymptomDistribution(userId, 30),
    getDoseSummary(userId),
    supabase
      .from('user_profiles')
      .select('current_dose, treatment_start_date')
      .eq('user_id', userId)
      .maybeSingle()
      .then((r) => r.data ?? null),
  ])

  const profile = profileRow
    ? {
        currentDose: (profileRow as { current_dose: number | null }).current_dose,
        treatmentStartDate: (profileRow as { treatment_start_date: string | null })
          .treatment_start_date,
      }
    : null

  const lastDoseDate = doseSummary.history[0]?.applicationDate ?? null
  const treatmentCtx = buildTreatmentContext(profile, lastDoseDate)
  const medicationName = doseSummary.history[0]?.medicationName ?? null

  return {
    period_days: 30,
    doses,
    weight_points: weightPoints,
    symptom_counts: symptoms,
    treatment_context: {
      treatmentWeek: treatmentCtx.treatmentWeek,
      daysSinceLastDose: treatmentCtx.daysSinceLastDose,
      currentDoseMg: treatmentCtx.currentDoseMg,
      medication_name: medicationName,
    },
  }
}

export function useMemorySummary() {
  const { session } = useSession()
  const { isPremium } = useEntitlements()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['memorySummary', userId],
    queryFn: () => assembleMemorySummaryInput(userId!).then(callMemorySummary),
    enabled: !!userId && isPremium,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 48 * 60 * 60 * 1000,
    retry: 1,
  })
}
