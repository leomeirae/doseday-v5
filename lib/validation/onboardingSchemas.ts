import { z } from 'zod'
import {
  BIOLOGICAL_SEX_OPTIONS,
  CONCERN_OPTIONS,
  MEDICAL_SUPPORT_OPTIONS,
  MEDICATION_OPTIONS,
  ONBOARDING_STEPS,
  TREATMENT_DURATION_OPTIONS,
  TREATMENT_STATUS_OPTIONS,
  type OnboardingData,
  type OnboardingStep,
} from '@lib/types/onboarding'

export const welcomeSchema = z.object({})

export const personalInfoSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Pelo menos 2 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  age: z.coerce
    .number()
    .int('Use um número inteiro')
    .min(18, 'Mínimo 18 anos')
    .max(99, 'Máximo 99 anos'),
  biological_sex: z.enum(BIOLOGICAL_SEX_OPTIONS),
})

export const weightSchema = z
  .object({
    initial_weight: z.coerce
      .number()
      .min(30, 'Mínimo 30 kg')
      .max(300, 'Máximo 300 kg'),
    current_weight: z.coerce
      .number()
      .min(30, 'Mínimo 30 kg')
      .max(300, 'Máximo 300 kg'),
    height: z.coerce
      .number()
      .int('Use centímetros')
      .min(120, 'Mínimo 120 cm')
      .max(220, 'Máximo 220 cm'),
  })
  .refine((data) => Math.abs(data.initial_weight - data.current_weight) <= 120, {
    message: 'Confira os pesos informados',
    path: ['current_weight'],
  })

export const goalWeightSchema = z.object({
  goal_weight: z.coerce
    .number()
    .min(30, 'Mínimo 30 kg')
    .max(300, 'Máximo 300 kg'),
})

export const treatmentStatusSchema = z.object({
  treatment_status: z.enum(TREATMENT_STATUS_OPTIONS),
})

export const treatmentDurationSchema = z.object({
  treatment_duration: z.enum(TREATMENT_DURATION_OPTIONS),
})

export const medicationSchema = z.object({
  current_medication: z.enum(MEDICATION_OPTIONS),
})

export const doseSchema = z.object({
  current_dose: z.coerce
    .number()
    .positive('Dose deve ser maior que zero')
    .max(20, 'Dose máxima é 20 mg'),
})

export const doctorNameSchema = z.object({
  doctor_name: z
    .string()
    .trim()
    .max(100, 'Máximo 100 caracteres')
    .optional()
    .or(z.literal('')),
})

export const medicalSupportSchema = z.object({
  has_medical_support: z.enum(MEDICAL_SUPPORT_OPTIONS),
})

export const concernsSchema = z.object({
  main_concerns: z.array(z.enum(CONCERN_OPTIONS)).max(3, 'Escolha até 3').optional(),
})

export const consentSchema = z.object({
  consent_given: z.literal(true, {
    error: 'Você precisa aceitar para continuar',
  }),
})

export const loadingSchema = z.object({})
export const resultSchema = z.object({})

export const ONBOARDING_STEP_SCHEMAS = {
  welcome: welcomeSchema,
  'personal-info': personalInfoSchema,
  weight: weightSchema,
  'goal-weight': goalWeightSchema,
  'treatment-status': treatmentStatusSchema,
  'treatment-duration': treatmentDurationSchema,
  medication: medicationSchema,
  dose: doseSchema,
  'doctor-name': doctorNameSchema,
  'medical-support': medicalSupportSchema,
  concerns: concernsSchema,
  consent: consentSchema,
  loading: loadingSchema,
  result: resultSchema,
} satisfies Record<OnboardingStep, z.ZodType>

export type WelcomeInput = z.infer<typeof welcomeSchema>
export type PersonalInfoInput = z.infer<typeof personalInfoSchema>
export type WeightInput = z.infer<typeof weightSchema>
export type GoalWeightInput = z.infer<typeof goalWeightSchema>
export type TreatmentStatusInput = z.infer<typeof treatmentStatusSchema>
export type TreatmentDurationInput = z.infer<typeof treatmentDurationSchema>
export type MedicationInput = z.infer<typeof medicationSchema>
export type DoseInput = z.infer<typeof doseSchema>
export type DoctorNameInput = z.infer<typeof doctorNameSchema>
export type MedicalSupportInput = z.infer<typeof medicalSupportSchema>
export type ConcernsInput = z.infer<typeof concernsSchema>
export type ConsentInput = z.infer<typeof consentSchema>

export type OnboardingStepData = Partial<OnboardingData>

export function getOnboardingStepNumber(step: OnboardingStep): number {
  return ONBOARDING_STEPS.indexOf(step) + 1
}

export function getNextOnboardingStep(step: OnboardingStep): OnboardingStep {
  const index = ONBOARDING_STEPS.indexOf(step)
  return ONBOARDING_STEPS[Math.min(index + 1, ONBOARDING_STEPS.length - 1)]
}

export function getPreviousOnboardingStep(step: OnboardingStep): OnboardingStep {
  const index = ONBOARDING_STEPS.indexOf(step)
  return ONBOARDING_STEPS[Math.max(index - 1, 0)]
}
