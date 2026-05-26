import { supabase } from '@lib/supabase/client'
import {
  MEDICAL_SUPPORT_OPTIONS,
  type MedicalSupport,
} from '@lib/types/onboarding'

export type Profile = {
  id: string
  fullName: string | null
  currentMedication: string | null
  currentDose: number | null
  treatmentStatus: string | null
  treatmentStartDate: string | null
  currentWeight: number | null
  initialWeight: number | null
  goalWeight: number | null
  doseFrequencyDays: number | null
  doseFrequencySource: string | null
  doctorName: string | null
  hasMedicalSupport: MedicalSupport | null
  mainConcerns: string[] | null
  nextAppointmentDate: string | null
  onboardingCompletedAt: string | null
  hasSeenPushPermissionModal: boolean
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, full_name, current_medication, current_dose, treatment_status, treatment_start_date, current_weight, initial_weight, goal_weight, dose_frequency_days, dose_frequency_source, doctor_name, has_medical_support, main_concerns, next_appointment_date, onboarding_completed_at, has_seen_push_permission_modal')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    id: data.id,
    fullName: data.full_name,
    currentMedication: data.current_medication,
    currentDose: data.current_dose !== null ? Number(data.current_dose) : null,
    treatmentStatus: data.treatment_status ?? null,
    treatmentStartDate: data.treatment_start_date,
    currentWeight: data.current_weight !== null ? Number(data.current_weight) : null,
    initialWeight: data.initial_weight !== null ? Number(data.initial_weight) : null,
    goalWeight: data.goal_weight !== null ? Number(data.goal_weight) : null,
    doseFrequencyDays: data.dose_frequency_days,
    doseFrequencySource: data.dose_frequency_source,
    doctorName: data.doctor_name,
    hasMedicalSupport: isMedicalSupport(data.has_medical_support)
      ? data.has_medical_support
      : null,
    mainConcerns: data.main_concerns,
    nextAppointmentDate: data.next_appointment_date,
    onboardingCompletedAt: data.onboarding_completed_at,
    hasSeenPushPermissionModal: data.has_seen_push_permission_modal ?? false,
  }
}

function isMedicalSupport(value: string | null): value is MedicalSupport {
  return value !== null && MEDICAL_SUPPORT_OPTIONS.includes(value as MedicalSupport)
}
