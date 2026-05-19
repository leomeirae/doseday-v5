import { useQuery } from '@tanstack/react-query'
import { useSession } from './useSession'
import { getAdherenceStats, getDoseHistoryByWeek } from '@lib/supabase/queries/reports'

export function useDoseAdherence() {
  const { session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['doseAdherence', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user')
      const [history, stats] = await Promise.all([
        getDoseHistoryByWeek(userId),
        getAdherenceStats(userId),
      ])
      return { history, stats }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  })
}
