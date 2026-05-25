import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from './useSession'
import { registerMemoryNote } from '@lib/supabase/queries/diario'
import type { MemoryNoteInput } from '@lib/validation/diarioSchemas'

export function useRegisterMemoryNote() {
  const { session } = useSession()
  const queryClient = useQueryClient()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: (input: MemoryNoteInput) => {
      if (!userId) throw new Error('No user')
      return registerMemoryNote(userId, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diarioSummary', userId] })
    },
  })
}
