import { useMutation } from '@tanstack/react-query'
import { supabase } from '@lib/supabase/client'
import { signOut } from '@lib/supabase/auth'
import { router } from 'expo-router'

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('delete-user-account')
      if (error) throw error
      if (!data?.success) throw new Error(data?.error ?? 'Failed to delete account')
    },
    onSuccess: async () => {
      await signOut()
      router.replace('/(auth)/signin')
    },
  })
}
