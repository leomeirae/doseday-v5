import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from './useSession'
import { registerCheckin } from '@lib/supabase/queries/diario'
import type { TreatmentContext } from '@lib/supabase/queries/diario'
import type { CheckinInput } from '@lib/validation/diarioSchemas'

export function useRegisterCheckin() {
  const { session } = useSession()
  const queryClient = useQueryClient()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: ({ input, ctx }: { input: CheckinInput; ctx: TreatmentContext }) => {
      if (!userId) throw new Error('No user')
      return registerCheckin(userId, input, ctx)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diarioSummary', userId] })
    },
  })
}
