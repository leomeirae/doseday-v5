import { supabase } from '@lib/supabase/client'
import type {
  CheckinInput,
  EmotionalState,
  QuickLogInput,
  QuickLogType,
  SymptomType,
  Trigger,
} from '@lib/validation/diarioSchemas'

export type QuickLogRecord = {
  id: string
  logType: QuickLogType
  intensity: 1 | 2 | 3
  notes: string | null
  loggedAt: Date
}

export type CheckinRecord = {
  id: string
  date: string
  emotionalState: EmotionalState | null
  emotionalIntensity: number | null
  symptoms: SymptomType[]
  symptomTriggers: Trigger[]
  hasAdverseReaction: boolean
  notes: string | null
  createdAt: Date
}

export type DiarioSummary = {
  todayCheckin: CheckinRecord | null
  recentQuickLogs: QuickLogRecord[]
  recentCheckins: CheckinRecord[]
}

export type TreatmentContext = {
  daysSinceLastDose: number | null
  treatmentWeek: number | null
  currentDoseMg: number | null
}

export async function getDiarioSummary(userId: string): Promise<DiarioSummary> {
  const todayISO = new Date().toISOString().slice(0, 10)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const [todayRes, qlRes, ckRes] = await Promise.all([
    supabase
      .from('daily_checkins')
      .select(
        'id, date, emotional_state, emotional_intensity, symptoms, symptom_triggers, has_adverse_reaction, notes, created_at'
      )
      .eq('user_id', userId)
      .eq('date', todayISO)
      .maybeSingle(),

    supabase
      .from('quick_logs')
      .select('id, log_type, intensity, notes, logged_at')
      .eq('user_id', userId)
      .gte('logged_at', sevenDaysAgo)
      .order('logged_at', { ascending: false })
      .limit(50),

    supabase
      .from('daily_checkins')
      .select(
        'id, date, emotional_state, emotional_intensity, symptoms, symptom_triggers, has_adverse_reaction, notes, created_at'
      )
      .eq('user_id', userId)
      .neq('date', todayISO)
      .gte('date', thirtyDaysAgo)
      .order('date', { ascending: false })
      .limit(30),
  ])

  if (todayRes.error) throw todayRes.error
  if (qlRes.error) throw qlRes.error
  if (ckRes.error) throw ckRes.error

  return {
    todayCheckin: todayRes.data ? mapCheckinRow(todayRes.data) : null,
    recentQuickLogs: (qlRes.data ?? []).map(mapQuickLogRow),
    recentCheckins: (ckRes.data ?? []).map(mapCheckinRow),
  }
}

export async function registerQuickLog(
  userId: string,
  input: QuickLogInput
): Promise<void> {
  const { error } = await supabase.from('quick_logs').insert({
    user_id: userId,
    log_type: input.logType,
    intensity: input.intensity,
    notes: input.notes ?? null,
    logged_at: input.loggedAt.toISOString(),
  })

  if (error) throw error
}

export async function registerCheckin(
  userId: string,
  input: CheckinInput,
  ctx: TreatmentContext
): Promise<void> {
  const hasAdverseReaction = input.symptoms.length > 0

  const { error } = await supabase.from('daily_checkins').insert({
    user_id: userId,
    date: input.date.toISOString().slice(0, 10),
    emotional_state: input.emotionalState,
    emotional_intensity: input.emotionalIntensity,
    symptoms: input.symptoms,
    symptom_triggers: input.symptomTriggers,
    has_adverse_reaction: hasAdverseReaction,
    notes: input.notes ?? null,
    days_since_last_dose: ctx.daysSinceLastDose,
    treatment_week: ctx.treatmentWeek,
    current_dose_mg: ctx.currentDoseMg,
    data_quality_score: hasAdverseReaction ? 2 : 1,
  })

  if (error) throw error
}

export function buildTreatmentContext(
  profile: { currentDose: number | null; treatmentStartDate: string | null } | null,
  lastDoseDate: Date | null
): TreatmentContext {
  const currentDoseMg = profile?.currentDose ?? null

  const treatmentWeek = profile?.treatmentStartDate
    ? Math.floor(
        (Date.now() - new Date(profile.treatmentStartDate).getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      ) + 1
    : null

  const daysSinceLastDose = lastDoseDate
    ? Math.floor((Date.now() - lastDoseDate.getTime()) / (24 * 60 * 60 * 1000))
    : null

  return { currentDoseMg, treatmentWeek, daysSinceLastDose }
}

function mapCheckinRow(row: {
  id: string
  date: string
  emotional_state: string | null
  emotional_intensity: number | null
  symptoms: string[] | null
  symptom_triggers: string[] | null
  has_adverse_reaction: boolean | null
  notes: string | null
  created_at: string | null
}): CheckinRecord {
  return {
    id: row.id,
    date: row.date,
    emotionalState: row.emotional_state as EmotionalState | null,
    emotionalIntensity: row.emotional_intensity,
    symptoms: (row.symptoms ?? []) as SymptomType[],
    symptomTriggers: (row.symptom_triggers ?? []) as Trigger[],
    hasAdverseReaction: row.has_adverse_reaction ?? false,
    notes: row.notes,
    createdAt: new Date(row.created_at ?? Date.now()),
  }
}

function mapQuickLogRow(row: {
  id: string
  log_type: string
  intensity: number | null
  notes: string | null
  logged_at: string
}): QuickLogRecord {
  return {
    id: row.id,
    logType: row.log_type as QuickLogType,
    intensity: (row.intensity ?? 2) as 1 | 2 | 3,
    notes: row.notes,
    loggedAt: new Date(row.logged_at),
  }
}
