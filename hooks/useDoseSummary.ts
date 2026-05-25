import { useQuery } from '@tanstack/react-query'
import { useSession } from './useSession'
import { getDoseSummary } from '@lib/supabase/queries/doses'

export function doseSummaryQueryKey(userId: string | undefined) {
  return ['doseSummary', userId, 'protocol-v2'] as const
}

export function useDoseSummary() {
  const { session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: doseSummaryQueryKey(userId),
    queryFn: () => {
      if (!userId) throw new Error('No user')
      return getDoseSummary(userId)
    },
    enabled: !!userId,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  })
}
