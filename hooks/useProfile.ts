import { useQuery } from '@tanstack/react-query'
import { useSession } from './useSession'
import { getProfile } from '@lib/supabase/queries/profile'

export function useProfile() {
  const { session } = useSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => {
      if (!userId) throw new Error('No user')
      return getProfile(userId)
    },
    enabled: !!userId,
  })
}
