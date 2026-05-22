import { z } from 'zod'

export const onboardingInsightContractSchema = z
  .object({
    schemaVersion: z.literal('onboarding_insight_v2'),
    stageLabel: z.string().trim().min(1),
    medicationLabel: z.string().trim().min(1),
    goalLabel: z.string().trim().min(1),
    deltaLabel: z.string().trim().min(1),
    shortInsight: z.string().trim().min(40).max(320),
    nextStep: z.string().trim().min(20).max(220),
    contextBullets: z.array(z.string().trim().min(12).max(180)).min(2).max(3),
    disclaimer: z.string().trim().min(1),
  })
  .strict()

export const onboardingInsightRawSchema = onboardingInsightContractSchema.omit({
  schemaVersion: true,
})

export type OnboardingInsightContract = z.infer<typeof onboardingInsightContractSchema>
