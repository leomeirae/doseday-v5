import { useQuery } from '@tanstack/react-query'
import { useSession } from './useSession'
import { getDiarioSummary } from '@lib/supabase/queries/diario'

export function useDiarioSummary() {
  const { session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['diarioSummary', userId],
    queryFn: () => {
      if (!userId) throw new Error('No user')
      return getDiarioSummary(userId)
    },
    enabled: !!userId,
  })
}
