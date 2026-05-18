import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from './useSession'
import { registerQuickLog } from '@lib/supabase/queries/diario'
import type { QuickLogInput } from '@lib/validation/diarioSchemas'

export function useRegisterQuickLog() {
  const { session } = useSession()
  const queryClient = useQueryClient()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: (input: QuickLogInput) => {
      if (!userId) throw new Error('No user')
      return registerQuickLog(userId, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diarioSummary', userId] })
    },
  })
}
