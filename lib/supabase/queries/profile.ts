import { supabase } from '@lib/supabase/client'

export type Profile = {
  id: string
  fullName: string | null
  currentMedication: string | null
  currentDose: number | null
  treatmentStartDate: string | null
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, full_name, current_medication, current_dose, treatment_start_date')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    id: data.id,
    fullName: data.full_name,
    currentMedication: data.current_medication,
    currentDose: data.current_dose !== null ? Number(data.current_dose) : null,
    treatmentStartDate: data.treatment_start_date,
  }
}
