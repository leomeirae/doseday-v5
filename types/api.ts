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

export const memorySummaryContractSchema = z
  .object({
    schemaVersion: z.literal('memory_summary_v1'),
    periodSummary: z.string().trim().min(40).max(280),
    keyFacts: z.array(z.string().trim().min(15).max(120)).min(2).max(3),
    consultPoints: z.array(z.string().trim().min(20).max(150)).min(1).max(3),
    disclaimer: z.string().trim().min(1),
  })
  .strict()

export type MemorySummaryContract = z.infer<typeof memorySummaryContractSchema>
