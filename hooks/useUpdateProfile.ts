import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@lib/supabase/client'
import type { Profile } from '@lib/supabase/queries/profile'

export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (fullName: string) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({ full_name: fullName.trim() })
        .eq('user_id', userId)
      if (error) throw error
    },
    onMutate: async (fullName) => {
      await queryClient.cancelQueries({ queryKey: ['profile', userId] })
      const previous = queryClient.getQueryData<Profile | null>(['profile', userId])
      queryClient.setQueryData<Profile | null>(['profile', userId], (old) =>
        old ? { ...old, fullName: fullName.trim() } : old
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['profile', userId], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
    },
  })
}
