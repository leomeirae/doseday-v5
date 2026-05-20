import { useQuery } from '@tanstack/react-query'
import { useSession } from './useSession'
import {
  callGenerateOnboardingInsight,
  type GenerateOnboardingInsightInput,
} from '@lib/supabase/queries/insights'
import type { OnboardingData, TreatmentDuration } from '@lib/types/onboarding'

// Dev-only: força falha da Edge Function para validar o fallback da tela loading.
// Sempre false em commits — flipar manualmente apenas durante QA da screenshot de erro.
const FORCE_INSIGHT_ERROR = false

function deriveTreatmentWeek(duration: TreatmentDuration | undefined): number | null {
  switch (duration) {
    case '<1m':
      return 2
    case '1-3m':
      return 8
    case '3-6m':
      return 18
    case '6m+':
      return 30
    default:
      return null
  }
}

export function buildOnboardingInsightInput(
  data: Partial<OnboardingData>
): GenerateOnboardingInsightInput {
  return {
    medication: data.current_medication ?? null,
    dose_mg: data.current_dose ?? null,
    treatment_week: deriveTreatmentWeek(data.treatment_duration),
    current_weight: data.current_weight ?? null,
    initial_weight: data.initial_weight ?? null,
    goal_weight: data.goal_weight ?? null,
  }
}

// Paciente pré-tratamento ('planning') não tem semana de tratamento — a IA não
// consegue contextualizar a fase. Nesse caso pulamos a invocação da Edge Function.
export function shouldRequestInsight(data: Partial<OnboardingData>): boolean {
  return data.treatment_status !== 'planning'
}

export function useOnboardingInsight(data: Partial<OnboardingData>, enabled: boolean) {
  const { session } = useSession()
  const userId = session?.user?.id
  const input = buildOnboardingInsightInput(data)

  return useQuery({
    queryKey: ['onboardingInsight', userId],
    queryFn: () => {
      if (__DEV__ && FORCE_INSIGHT_ERROR) {
        throw new Error('Forced onboarding insight error (QA)')
      }
      return callGenerateOnboardingInsight(input)
    },
    enabled: enabled && !!userId && shouldRequestInsight(data),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  })
}
