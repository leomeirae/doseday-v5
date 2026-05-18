import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@hooks/useSession'
import { useProfile } from '@hooks/useProfile'
import { registerDose } from '@lib/supabase/queries/doses'
import type { RegisterDoseInput } from '@lib/validation/doseSchemas'

export function useRegisterDose() {
  const { session } = useSession()
  const { data: profile } = useProfile()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RegisterDoseInput) => {
      if (!session?.user?.id) throw new Error('Sem sessão')
      return registerDose(
        session.user.id,
        input,
        profile?.currentMedication ?? 'Medicamento desconhecido'
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doseSummary'] })
    },
  })
}
