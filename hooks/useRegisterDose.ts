import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@hooks/useSession'
import { useProfile } from '@hooks/useProfile'
import { registerDose } from '@lib/supabase/queries/doses'
import { cancelDoseNotifications, scheduleLocalNotification } from '@lib/notifications'
import type { RegisterDoseInput } from '@lib/validation/doseSchemas'
import type { DoseSummary } from '@lib/supabase/queries/doses'

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
        profile?.currentMedication ?? 'Medicamento desconhecido',
        profile?.doseFrequencyDays ?? null
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['doseSummary'] })

      // Cancel old T0 notification and reschedule based on new nextDose
      await cancelDoseNotifications()

      const userId = session?.user?.id
      const updatedSummary = queryClient.getQueryData<DoseSummary>(['doseSummary', userId])
      if (updatedSummary?.nextDose) {
        const userSettings = queryClient.getQueryData<{ notificationsEnabled: boolean; notificationTime: string }>(
          ['userSettings', userId]
        )
        if (userSettings?.notificationsEnabled !== false) {
          const notifTime = userSettings?.notificationTime ?? '20:00:00'
          scheduleLocalNotification(updatedSummary.nextDose, notifTime, updatedSummary.history[0]?.id).catch((err) => {
            console.warn('[useRegisterDose] reschedule error:', err)
          })
        }
      }
    },
  })
}
