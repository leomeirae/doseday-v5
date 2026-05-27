import { useQuery } from '@tanstack/react-query'
import { useSession } from '@hooks/useSession'
import { getSymptoms } from '@lib/supabase/queries/symptoms'

export function useSymptoms() {
  const { session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['symptoms', userId],
    queryFn: () => {
      if (!userId) throw new Error('No user')
      return getSymptoms(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}
