import { useQuery } from '@tanstack/react-query'
import { useSession } from './useSession'
import { getDoseSummary } from '@lib/supabase/queries/doses'

export function useDoseSummary() {
  const { session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['doseSummary', userId],
    queryFn: () => {
      if (!userId) throw new Error('No user')
      return getDoseSummary(userId)
    },
    enabled: !!userId,
  })
}
