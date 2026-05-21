import { useQuery } from '@tanstack/react-query'
import { useSession } from './useSession'
import { getOnboardingInsightContract } from '@lib/supabase/queries/insights'

// Home D0 reaproveita o insight gerado no onboarding lendo direto do DB.
// O contrato é imutável depois de persistido — staleTime infinito.
export function useOnboardingInsightFromDB() {
  const { session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['onboardingInsightFromDB', userId],
    queryFn: () => {
      if (!userId) throw new Error('No user')
      return getOnboardingInsightContract(userId)
    },
    enabled: !!userId,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}
