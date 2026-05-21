import { useQuery } from '@tanstack/react-query'
import { useSession } from './useSession'
import { callMemoryDailyInsight } from '@lib/supabase/queries/insights'

export function useDailyInsight({ enabled = true }: { enabled?: boolean } = {}) {
  const { session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['dailyInsight', userId],
    queryFn: callMemoryDailyInsight,
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 60 * 12,
    retry: 1,
  })
}
