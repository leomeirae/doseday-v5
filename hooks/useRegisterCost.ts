import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@hooks/useSession'
import { addPurchase, type AddPurchaseInput } from '@lib/supabase/queries/purchases'

export function useRegisterCost() {
  const { session } = useSession()
  const userId = session?.user?.id
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AddPurchaseInput) => {
      if (!userId) throw new Error('No user')
      return addPurchase(userId, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseSummary', userId] })
    },
  })
}
