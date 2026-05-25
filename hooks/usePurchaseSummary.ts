import { useQuery } from '@tanstack/react-query'
import { useSession } from '@hooks/useSession'
import { getPurchaseSummary } from '@lib/supabase/queries/purchases'

export function usePurchaseSummary() {
  const { session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['purchaseSummary', userId],
    queryFn: () => {
      if (!userId) throw new Error('No user')
      return getPurchaseSummary(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  })
}
