export type OnboardingStep =
  | 'welcome'
  | 'treatment-status'
  | 'treatment-duration'
  | 'medication'
  | 'dose'
  | 'weight'
  | 'medical-support'
  | 'concerns'
  | 'consent'
  | 'loading'
  | 'result'

export const ONBOARDING_STEPS: OnboardingStep[] = [
  'welcome',
  'treatment-status',
  'treatment-duration',
  'medication',
  'dose',
  'weight',
  'medical-support',
  'concerns',
  'consent',
  'loading',
  'result',
]

// Telas de pergunta contadas no "Passo X de N". welcome (intro), loading
// (transição) e result (recompensa) não contam.
export const COUNTED_STEPS: OnboardingStep[] = [
  'treatment-status',
  'treatment-duration',
  'medication',
  'dose',
  'weight',
  'medical-support',
  'concerns',
  'consent',
]

// dose engloba a frequência (lembrete), weight engloba a meta (goal_weight),
// medical-support engloba o nome do médico (opcional).
export const REQUIRED_STEPS: ReadonlySet<OnboardingStep> = new Set([
  'treatment-status',
  'medication',
  'dose',
  'weight',
  'medical-support',
  'consent',
])

export const OPTIONAL_STEPS: ReadonlySet<OnboardingStep> = new Set([
  'concerns',
])

export const BIOLOGICAL_SEX_OPTIONS = ['F', 'M', 'NB', 'PREFER_NOT'] as const
export type BiologicalSex = (typeof BIOLOGICAL_SEX_OPTIONS)[number]

export const TREATMENT_STATUS_OPTIONS = [
  'starting',
  'ongoing',
  'restart',
  'planning',
] as const
export type TreatmentStatus = (typeof TREATMENT_STATUS_OPTIONS)[number]

export const TREATMENT_DURATION_OPTIONS = ['<1m', '1-3m', '3-6m', '6m+'] as const
export type TreatmentDuration = (typeof TREATMENT_DURATION_OPTIONS)[number]

export const MEDICATION_OPTIONS = [
  'Mounjaro',
  'Ozempic',
  'Wegovy',
  'Saxenda',
  'Trulicity',
] as const
export type OnboardingMedication = (typeof MEDICATION_OPTIONS)[number]

export const MEDICAL_SUPPORT_OPTIONS = ['yes', 'no', 'sometimes'] as const
export type MedicalSupport = (typeof MEDICAL_SUPPORT_OPTIONS)[number]

export const CONCERN_OPTIONS = [
  'nausea',
  'weight',
  'side_effects',
  'dose_timing',
  'cost',
  'appointment',
  'energy',
  'sleep',
  'mood',
] as const
export type OnboardingConcern = (typeof CONCERN_OPTIONS)[number]

export interface OnboardingData {
  full_name: string
  age: number
  biological_sex: BiologicalSex
  initial_weight: number
  current_weight: number
  height: number
  goal_weight: number
  treatment_status: TreatmentStatus
  treatment_duration?: TreatmentDuration | null
  current_medication: OnboardingMedication
  current_dose?: number | null
  dose_frequency_days?: number | null
  doctor_name?: string
  has_medical_support: MedicalSupport
  main_concerns?: OnboardingConcern[]
  consent_given: boolean
  consent_timestamp?: string
}

export type PersistableOnboardingData = Omit<
  OnboardingData,
  'consent_given' | 'consent_timestamp'
>

export interface OnboardingState {
  currentStep: OnboardingStep
  completedSteps: Set<OnboardingStep>
  data: Partial<OnboardingData>
  isHydrated: boolean
  isSubmitting: boolean
  error: Error | null
}
