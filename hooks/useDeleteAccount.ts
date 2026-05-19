import { useMutation } from '@tanstack/react-query'
import { deleteAccount } from '@lib/supabase/queries/account'

export function useDeleteAccount() {
  return useMutation({
    mutationFn: deleteAccount,
    retry: false,
  })
}

