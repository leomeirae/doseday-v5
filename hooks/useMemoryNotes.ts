import { useQuery } from '@tanstack/react-query'
import { useSession } from '@hooks/useSession'
import { getMemoryNotes } from '@lib/supabase/queries/diario'

export function useMemoryNotes() {
  const { session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['memoryNotes', userId],
    queryFn: () => {
      if (!userId) throw new Error('No user')
      return getMemoryNotes(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}
