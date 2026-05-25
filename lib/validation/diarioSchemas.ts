import { z } from 'zod'

/**
 * 'other' é tipo de storage legado (rows históricas em `quick_logs`).
 * A UI redireciona pra /diario/anotar-memoria via guard em quick-log.tsx.
 */
export const QUICK_LOG_TYPES = [
  'nausea',
  'headache',
  'fatigue',
  'diarrhea',
  'constipation',
  'heartburn',
  'injection_pain',
  'alcohol',
  'feeling_good',
  'other',
] as const

export type QuickLogType = (typeof QUICK_LOG_TYPES)[number]

export const QUICK_LOG_LABELS: Record<QuickLogType, string> = {
  nausea: 'Náusea',
  headache: 'Dor de cabeça',
  fatigue: 'Cansaço',
  diarrhea: 'Diarreia',
  constipation: 'Constipação',
  heartburn: 'Azia',
  injection_pain: 'Dor na injeção',
  alcohol: 'Bebi álcool',
  feeling_good: 'Bem hoje',
  other: 'Outro',
}

export const INTENSITY_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Leve',
  2: 'Moderado',
  3: 'Forte',
}

export const SYMPTOM_TYPES = [
  'nausea',
  'headache',
  'fatigue',
  'diarrhea',
  'constipation',
  'heartburn',
  'injection_pain',
  'other',
] as const satisfies readonly QuickLogType[]

export type SymptomType = (typeof SYMPTOM_TYPES)[number]

export const EMOTIONAL_STATES = ['terrible', 'bad', 'ok', 'good', 'great'] as const
export type EmotionalState = (typeof EMOTIONAL_STATES)[number]

export const EMOTIONAL_LABELS: Record<EmotionalState, string> = {
  terrible: 'Péssimo',
  bad: 'Mal',
  ok: 'Ok',
  good: 'Bem',
  great: 'Ótimo',
}

export const EMOTIONAL_EMOJIS: Record<EmotionalState, string> = {
  terrible: '😣',
  bad: '😕',
  ok: '😐',
  good: '🙂',
  great: '😊',
}

export type MoodValue = 'mal' | 'ok' | 'bem' | 'otimo'

export const EMOTIONAL_TO_MOOD_MAP: Record<EmotionalState, MoodValue> = {
  terrible: 'mal',
  bad: 'mal',
  ok: 'ok',
  good: 'bem',
  great: 'otimo',
}

export function emotionalStateToMood(state: EmotionalState): MoodValue {
  return EMOTIONAL_TO_MOOD_MAP[state]
}

export const TRIGGERS = [
  'alcohol',
  'fatty_food',
  'sweet_excess',
  'fasting',
  'poor_water',
  'fast_eating',
  'stress',
] as const

export type Trigger = (typeof TRIGGERS)[number]

export const TRIGGER_LABELS: Record<Trigger, string> = {
  alcohol: 'Álcool',
  fatty_food: 'Comida gordurosa',
  sweet_excess: 'Excesso de doces',
  fasting: 'Jejum',
  poor_water: 'Pouca água',
  fast_eating: 'Comer rápido',
  stress: 'Estresse',
}

export const quickLogSchema = z.object({
  logType: z.enum(QUICK_LOG_TYPES),
  intensity: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2),
  notes: z.string().max(500).optional(),
  loggedAt: z
    .date()
    .refine((date) => date.getTime() <= Date.now(), {
      message: 'Não é possível registrar no futuro',
    })
    .default(() => new Date()),
})

export const checkinSchema = z.object({
  date: z
    .date()
    .refine(
      (date) =>
        date.toISOString().slice(0, 10) <= new Date().toISOString().slice(0, 10),
      { message: 'Não é possível fazer check-in pra data futura' }
    )
    .default(() => new Date()),
  emotionalState: z.enum(EMOTIONAL_STATES),
  emotionalIntensity: z.number().int().min(1).max(5).default(3),
  symptoms: z.array(z.enum(SYMPTOM_TYPES)).default([]),
  symptomTriggers: z.array(z.enum(TRIGGERS)).default([]),
  notes: z.string().max(1000).optional(),
})

export const memoryNoteSchema = z.object({
  notes: z.string().trim().min(1, 'Anote algo antes de registrar').max(500),
})

export type QuickLogInput = z.infer<typeof quickLogSchema>
export type CheckinInput = z.infer<typeof checkinSchema>
export type MemoryNoteInput = z.infer<typeof memoryNoteSchema>
