import { z } from 'zod'

export const INJECTION_SITES = [
  'abdome',
  'coxa_direita',
  'coxa_esquerda',
  'braco_direito',
  'braco_esquerdo',
] as const

export const SIDE_EFFECTS = [
  'nausea',
  'headache',
  'fatigue',
  'diarrhea',
  'constipation',
  'injection_pain',
  'other',
] as const

export type InjectionSite = (typeof INJECTION_SITES)[number]
export type SideEffect = (typeof SIDE_EFFECTS)[number]

export const INJECTION_SITE_LABELS: Record<InjectionSite, string> = {
  abdome: 'Abdome',
  coxa_direita: 'Coxa direita',
  coxa_esquerda: 'Coxa esquerda',
  braco_direito: 'Braço direito',
  braco_esquerdo: 'Braço esquerdo',
}

export const SIDE_EFFECT_LABELS: Record<SideEffect, string> = {
  nausea: 'Náusea',
  headache: 'Dor de cabeça',
  fatigue: 'Cansaço',
  diarrhea: 'Diarreia',
  constipation: 'Constipação',
  injection_pain: 'Dor na injeção',
  other: 'Outro',
}

export const registerDoseSchema = z.object({
  dose: z
    .number()
    .positive('Dose deve ser maior que zero')
    .max(20, 'Dose máxima é 20mg'),
  applicationDate: z
    .date()
    .refine((d) => d.getTime() <= Date.now(), {
      message: 'Não é possível registrar doses futuras',
    }),
  injectionSite: z.enum(INJECTION_SITES).optional(),
  sideEffects: z.array(z.enum(SIDE_EFFECTS)).default([]),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
})

export type RegisterDoseInput = z.infer<typeof registerDoseSchema>
