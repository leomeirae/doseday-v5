import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@lib/supabase/client'
import type { Profile } from '@lib/supabase/queries/profile'
import type { MedicalSupport } from '@lib/types/onboarding'

type UpdateDoseProtocolInput = {
  doseFrequencyDays: number
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
    mutationFn: async ({ doseFrequencyDays }: UpdateDoseProtocolInput) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          dose_frequency_days: doseFrequencyDays,
          dose_frequency_source: 'user_edited',
        })
        .eq('user_id', userId)
      if (error) throw error
    },
    onMutate: async ({ doseFrequencyDays }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['profile', userId] }),
        queryClient.cancelQueries({ queryKey: ['doseSummary', userId] }),
      ])
      const previous = queryClient.getQueryData<Profile | null>(['profile', userId])
      queryClient.setQueryData<Profile | null>(['profile', userId], (old) =>
        old
          ? {
              ...old,
              doseFrequencyDays,
              doseFrequencySource: 'user_edited',
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
