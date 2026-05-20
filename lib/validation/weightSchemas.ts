import { z } from 'zod'

export const weightLogSchema = z.object({
  weight: z
    .number()
    .min(30)
    .max(300),
  date: z
    .date()
    .refine((date) => isTodayOrPast(date)),
  notes: z
    .string()
    .trim()
    .max(500)
    .optional(),
})

export type WeightLogFormInput = z.infer<typeof weightLogSchema>

function isTodayOrPast(date: Date): boolean {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return date.getTime() <= today.getTime()
}
