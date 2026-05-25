import { useQuery } from '@tanstack/react-query'
import { useSession } from '@hooks/useSession'
import { fetchFrequentSymptoms } from '@lib/supabase/queries/symptoms'

export function useFrequentSymptoms() {
  const { session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['frequentSymptoms', userId],
    queryFn: () => {
      if (!userId) throw new Error('No user')
      return fetchFrequentSymptoms(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}
