import { useQuery } from '@tanstack/react-query'
import { useSession } from '@hooks/useSession'
import { getRecentSymptom } from '@lib/supabase/queries/symptoms'

export function useSymptomMemory() {
  const { session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['symptomMemory', userId],
    queryFn: () => {
      if (!userId) throw new Error('No user')
      return getRecentSymptom(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}
