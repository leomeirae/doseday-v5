import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@lib/supabase/client'
import type { Profile } from '@lib/supabase/queries/profile'
import type { MedicalSupport } from '@lib/types/onboarding'

type UpdateDoseProtocolInput = {
  // string (não enum) de propósito: preserva nomes legados da V4 fora do enum
  // quando o usuário salva sem mexer na medicação.
  currentMedication: string | null
  currentDose: number | null
  doseFrequencyDays: number | null
}

type UpdateGoalWeightInput = {
  goalWeight: number
}

type UpdateMedicalContextInput = {
  hasMedicalSupport: MedicalSupport
  doctorName: string | null
  nextAppointmentDate: string | null
}

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

export function useUpdateDoseProtocol(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      currentMedication,
      currentDose,
      doseFrequencyDays,
    }: UpdateDoseProtocolInput) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          current_medication: currentMedication,
          current_dose: currentDose,
          dose_frequency_days: doseFrequencyDays,
          // null quando não há intervalo definido (mesma regra do onboarding).
          dose_frequency_source: doseFrequencyDays === null ? null : 'user_edited',
        })
        .eq('user_id', userId)
      if (error) throw error
    },
    onMutate: async ({ currentMedication, currentDose, doseFrequencyDays }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['profile', userId] }),
        queryClient.cancelQueries({ queryKey: ['doseSummary', userId] }),
      ])
      const previous = queryClient.getQueryData<Profile | null>(['profile', userId])
      queryClient.setQueryData<Profile | null>(['profile', userId], (old) =>
        old
          ? {
              ...old,
              currentMedication,
              currentDose,
              doseFrequencyDays,
              doseFrequencySource: doseFrequencyDays === null ? null : 'user_edited',
            }
          : old
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
      queryClient.invalidateQueries({ queryKey: ['doseSummary', userId] })
    },
  })
}

export function useUpdateGoalWeight(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ goalWeight }: UpdateGoalWeightInput) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({ goal_weight: goalWeight })
        .eq('user_id', userId)
      if (error) throw error
    },
    onMutate: async ({ goalWeight }) => {
      await queryClient.cancelQueries({ queryKey: ['profile', userId] })
      const previous = queryClient.getQueryData<Profile | null>(['profile', userId])
      queryClient.setQueryData<Profile | null>(['profile', userId], (old) =>
        old ? { ...old, goalWeight } : old
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

export function useUpdateMedicalContext(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      hasMedicalSupport,
      doctorName,
      nextAppointmentDate,
    }: UpdateMedicalContextInput) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          has_medical_support: hasMedicalSupport,
          doctor_name: doctorName,
          next_appointment_date: nextAppointmentDate,
        })
        .eq('user_id', userId)
      if (error) throw error
    },
    onMutate: async ({ hasMedicalSupport, doctorName, nextAppointmentDate }) => {
      await queryClient.cancelQueries({ queryKey: ['profile', userId] })
      const previous = queryClient.getQueryData<Profile | null>(['profile', userId])
      queryClient.setQueryData<Profile | null>(['profile', userId], (old) =>
        old
          ? {
              ...old,
              hasMedicalSupport,
              doctorName,
              nextAppointmentDate,
            }
          : old
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
