export type OnboardingStep =
  | 'welcome'
  | 'personal-info'
  | 'weight'
  | 'goal-weight'
  | 'treatment-status'
  | 'treatment-duration'
  | 'medication'
  | 'dose'
  | 'doctor-name'
  | 'medical-support'
  | 'concerns'
  | 'consent'
  | 'loading'
  | 'result'

export const ONBOARDING_STEPS: OnboardingStep[] = [
  'welcome',
  'personal-info',
  'weight',
  'goal-weight',
  'treatment-status',
  'treatment-duration',
  'medication',
  'dose',
  'doctor-name',
  'medical-support',
  'concerns',
  'consent',
  'loading',
  'result',
]

export const REQUIRED_STEPS: ReadonlySet<OnboardingStep> = new Set([
  'personal-info',
  'weight',
  'goal-weight',
  'treatment-status',
  'treatment-duration',
  'medication',
  'dose',
  'medical-support',
  'consent',
])

export const OPTIONAL_STEPS: ReadonlySet<OnboardingStep> = new Set([
  'doctor-name',
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
  'side-effects',
  'cost',
  'routine',
  'weight-plateau',
  'medical-follow-up',
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
  treatment_duration: TreatmentDuration
  current_medication: OnboardingMedication
  current_dose: number
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
