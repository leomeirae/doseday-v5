import { supabase } from '@lib/supabase/client'

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
  onboardingCompletedAt: string | null
  hasSeenPushPermissionModal: boolean
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, full_name, current_medication, current_dose, treatment_status, treatment_start_date, current_weight, initial_weight, goal_weight, onboarding_completed_at, has_seen_push_permission_modal')
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
    onboardingCompletedAt: data.onboarding_completed_at,
    hasSeenPushPermissionModal: data.has_seen_push_permission_modal ?? false,
  }
}
