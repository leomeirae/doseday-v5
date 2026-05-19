import { useQuery } from '@tanstack/react-query'
import { useSession } from './useSession'
import { getSymptomDistribution } from '@lib/supabase/queries/reports'

export function useSymptomDistribution() {
  const { session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['symptomDistribution', userId],
    queryFn: () => {
      if (!userId) throw new Error('No user')
      return getSymptomDistribution(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  })
}
