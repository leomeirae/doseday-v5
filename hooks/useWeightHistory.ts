import { useQuery } from '@tanstack/react-query'
import { useSession } from './useSession'
import { getWeightHistory } from '@lib/supabase/queries/reports'

export function useWeightHistory() {
  const { session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['weightHistory', userId],
    queryFn: () => {
      if (!userId) throw new Error('No user')
      return getWeightHistory(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  })
}
