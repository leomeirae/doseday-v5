import { useQuery } from '@tanstack/react-query'
import { useSession } from '@hooks/useSession'
import { getPurchases } from '@lib/supabase/queries/purchases'

export function usePurchases() {
  const { session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['purchases', userId],
    queryFn: () => {
      if (!userId) throw new Error('No user')
      return getPurchases(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  })
}
