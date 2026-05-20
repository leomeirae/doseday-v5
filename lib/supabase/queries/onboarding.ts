import { supabase } from '@lib/supabase/client'
import {
  CONCERN_OPTIONS,
  MEDICAL_SUPPORT_OPTIONS,
  MEDICATION_OPTIONS,
  TREATMENT_DURATION_OPTIONS,
  TREATMENT_STATUS_OPTIONS,
  type BiologicalSex,
  type MedicalSupport,
  type OnboardingConcern,
  type OnboardingData,
  type OnboardingMedication,
  type PersistableOnboardingData,
  type TreatmentDuration,
  type TreatmentStatus,
} from '@lib/types/onboarding'
import type { Database } from '../../../types/database'

type UserProfileRow = Database['public']['Tables']['user_profiles']['Row']
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']
type ConsentHistoryInsert = Database['public']['Tables']['consent_history']['Insert']
type OnboardingProfileRow = Pick<
  UserProfileRow,
  | 'full_name'
  | 'age'
  | 'biological_sex'
  | 'initial_weight'
  | 'current_weight'
  | 'height'
  | 'goal_weight'
  | 'treatment_status'
  | 'treatment_duration'
  | 'current_medication'
  | 'current_dose'
  | 'doctor_name'
  | 'has_medical_support'
  | 'main_concerns'
  | 'onboarding_completed_at'
>

export type OnboardingProgress = {
  completedAt: string | null
  data: Partial<OnboardingData>
}

function isOneOf<T extends string>(value: string | null, options: readonly T[]): value is T {
  return value !== null && options.includes(value as T)
}

function isConcern(value: string): value is OnboardingConcern {
  return CONCERN_OPTIONS.includes(value as OnboardingConcern)
}

function mapBiologicalSexFromDatabase(value: string | null): BiologicalSex | null {
  if (value === 'female') return 'F'
  if (value === 'male') return 'M'
  if (value === 'non_binary') return 'NB'
  if (value === 'prefer_not') return 'PREFER_NOT'
  return null
}

function mapBiologicalSexToDatabase(value: BiologicalSex): string {
  if (value === 'F') return 'female'
  if (value === 'M') return 'male'
  if (value === 'NB') return 'non_binary'
  if (value === 'PREFER_NOT') return 'prefer_not'
  return value
}

function mapHeightFromDatabase(value: number): number {
  return value < 3 ? Math.round(value * 100) : value
}

function mapHeightToDatabase(value: number): number {
  return value > 3 ? value / 100 : value
}

function mapProfileToOnboardingData(profile: OnboardingProfileRow): Partial<OnboardingData> {
  const data: Partial<OnboardingData> = {}

  if (profile.full_name !== null) data.full_name = profile.full_name
  if (profile.age !== null) data.age = profile.age
  const biologicalSex = mapBiologicalSexFromDatabase(profile.biological_sex)
  if (biologicalSex !== null) data.biological_sex = biologicalSex
  if (profile.initial_weight !== null) data.initial_weight = Number(profile.initial_weight)
  if (profile.current_weight !== null) data.current_weight = Number(profile.current_weight)
  if (profile.height !== null) data.height = mapHeightFromDatabase(profile.height)
  if (profile.goal_weight !== null) data.goal_weight = Number(profile.goal_weight)
  if (isOneOf<TreatmentStatus>(profile.treatment_status, TREATMENT_STATUS_OPTIONS)) {
    data.treatment_status = profile.treatment_status
  }
  if (isOneOf<TreatmentDuration>(profile.treatment_duration, TREATMENT_DURATION_OPTIONS)) {
    data.treatment_duration = profile.treatment_duration
  }
  if (isOneOf<OnboardingMedication>(profile.current_medication, MEDICATION_OPTIONS)) {
    data.current_medication = profile.current_medication
  }
  if (profile.current_dose !== null) data.current_dose = Number(profile.current_dose)
  if (profile.doctor_name !== null) data.doctor_name = profile.doctor_name
  if (isOneOf<MedicalSupport>(profile.has_medical_support, MEDICAL_SUPPORT_OPTIONS)) {
    data.has_medical_support = profile.has_medical_support
  }
  if (profile.main_concerns !== null) {
    data.main_concerns = profile.main_concerns.filter(isConcern)
  }

  return data
}

function toProfileUpdate(data: Partial<PersistableOnboardingData>): UserProfileUpdate {
  const update: UserProfileUpdate = {
    updated_at: new Date().toISOString(),
  }

  if (data.full_name !== undefined) update.full_name = data.full_name.trim()
  if (data.age !== undefined) update.age = data.age
  if (data.biological_sex !== undefined) {
    update.biological_sex = mapBiologicalSexToDatabase(data.biological_sex)
  }
  if (data.initial_weight !== undefined) update.initial_weight = data.initial_weight
  if (data.current_weight !== undefined) update.current_weight = data.current_weight
  if (data.height !== undefined) update.height = mapHeightToDatabase(data.height)
  if (data.goal_weight !== undefined) update.goal_weight = data.goal_weight
  if (data.treatment_status !== undefined) update.treatment_status = data.treatment_status
  if (data.treatment_duration !== undefined) {
    update.treatment_duration = data.treatment_duration
  }
  if (data.current_medication !== undefined) update.current_medication = data.current_medication
  if (data.current_dose !== undefined) update.current_dose = data.current_dose
  if (data.doctor_name !== undefined) {
    const doctorName = data.doctor_name.trim()
    update.doctor_name = doctorName.length > 0 ? doctorName : null
  }
  if (data.has_medical_support !== undefined) {
    update.has_medical_support = data.has_medical_support
  }
  if (data.main_concerns !== undefined) update.main_concerns = data.main_concerns

  return update
}

export async function getOnboardingProgress(userId: string): Promise<OnboardingProgress> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      full_name,
      age,
      biological_sex,
      initial_weight,
      current_weight,
      height,
      goal_weight,
      treatment_status,
      treatment_duration,
      current_medication,
      current_dose,
      doctor_name,
      has_medical_support,
      main_concerns,
      onboarding_completed_at
    `)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error

  return {
    completedAt: data?.onboarding_completed_at ?? null,
    data: data ? mapProfileToOnboardingData(data) : {},
  }
}

export async function updateOnboardingStep(
  userId: string,
  data: Partial<PersistableOnboardingData>
): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .update(toProfileUpdate(data))
    .eq('user_id', userId)

  if (error) throw error
}

export async function completeOnboarding(userId: string): Promise<void> {
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('user_profiles')
    .update({
      onboarding_completed_at: now,
      updated_at: now,
    })
    .eq('user_id', userId)

  if (error) throw error
}

// O consentimento LGPD do onboarding cobre Termos de Uso + Política de
// Privacidade. A coluna consent_type tem CHECK ('terms','privacy','data_collection');
// por isso registramos uma linha para cada tipo aceito.
export async function recordConsent(userId: string): Promise<void> {
  const version = '1.0'
  const rows: ConsentHistoryInsert[] = [
    { user_id: userId, consent_type: 'terms', version, granted: true },
    { user_id: userId, consent_type: 'privacy', version, granted: true },
  ]

  const { error } = await supabase.from('consent_history').insert(rows)
  if (error) throw error
}
