import { supabase } from '@lib/supabase/client'

const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS

export type WeightPoint = {
  date: Date
  weight: number
  notes: string | null
}

export type DoseWeek = {
  weekStart: Date
  applied: number
}

export type SymptomCount = {
  type: string
  count: number
}

export type AdherenceStats = {
  startDate: Date | null
  totalExpected: number
  totalApplied: number
  percentage: number
}

export async function getWeightHistory(userId: string, daysBack = 90): Promise<WeightPoint[]> {
  const since = dateOnly(new Date(Date.now() - daysBack * DAY_MS))

  const { data, error } = await supabase
    .from('weight_logs')
    .select('weight, date, notes')
    .eq('user_id', userId)
    .gte('date', since)
    .order('date', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row) => ({
    date: fromDateOnly(row.date),
    weight: Number(row.weight),
    notes: row.notes,
  }))
}

export async function getDoseHistoryByWeek(userId: string, weeksBack = 8): Promise<DoseWeek[]> {
  const weeks = buildWeekBuckets(weeksBack)
  const since = weeks[0]?.weekStart.toISOString() ?? new Date(Date.now() - weeksBack * WEEK_MS).toISOString()

  const { data, error } = await supabase
    .from('medication_applications')
    .select('application_date')
    .eq('user_id', userId)
    .gte('application_date', since)
    .order('application_date', { ascending: true })

  if (error) throw error

  const byWeek = new Map(weeks.map((week) => [dateOnly(week.weekStart), week]))

  for (const row of data ?? []) {
    const monday = startOfWeek(new Date(row.application_date))
    const bucket = byWeek.get(dateOnly(monday))
    if (bucket) bucket.applied += 1
  }

  return weeks
}

export async function getSymptomDistribution(userId: string, daysBack = 30): Promise<SymptomCount[]> {
  const sinceDate = new Date(Date.now() - daysBack * DAY_MS)
  const sinceTimestamp = sinceDate.toISOString()
  const sinceDay = dateOnly(sinceDate)

  const [quickLogs, checkins] = await Promise.all([
    supabase
      .from('quick_logs')
      .select('log_type')
      .eq('user_id', userId)
      .gte('logged_at', sinceTimestamp),
    supabase
      .from('daily_checkins')
      .select('symptoms')
      .eq('user_id', userId)
      .gte('date', sinceDay),
  ])

  if (quickLogs.error) throw quickLogs.error
  if (checkins.error) throw checkins.error

  const counts = new Map<string, number>()

  for (const row of quickLogs.data ?? []) {
    counts.set(row.log_type, (counts.get(row.log_type) ?? 0) + 1)
  }

  for (const row of checkins.data ?? []) {
    for (const symptom of row.symptoms ?? []) {
      counts.set(symptom, (counts.get(symptom) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
}

export async function getAdherenceStats(userId: string): Promise<AdherenceStats> {
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('treatment_start_date')
    .eq('user_id', userId)
    .maybeSingle()

  if (profileError) throw profileError

  const startDate = profile?.treatment_start_date ? fromDateOnly(profile.treatment_start_date) : null
  if (!startDate) {
    return { startDate: null, totalExpected: 0, totalApplied: 0, percentage: 0 }
  }

  const { count, error: countError } = await supabase
    .from('medication_applications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('application_date', startDate.toISOString())

  if (countError) throw countError

  const weeksElapsed = Math.floor((Date.now() - startDate.getTime()) / WEEK_MS)
  const totalExpected = Math.max(1, weeksElapsed + 1)
  const totalApplied = count ?? 0
  const percentage = totalExpected > 0
    ? Math.min(100, Math.round((totalApplied / totalExpected) * 100))
    : 0

  return { startDate, totalExpected, totalApplied, percentage }
}

function buildWeekBuckets(weeksBack: number): DoseWeek[] {
  const currentMonday = startOfWeek(new Date())
  const buckets: DoseWeek[] = []

  for (let i = weeksBack - 1; i >= 0; i -= 1) {
    const weekStart = new Date(currentMonday)
    weekStart.setDate(currentMonday.getDate() - i * 7)
    buckets.push({ weekStart, applied: 0 })
  }

  return buckets
}

function startOfWeek(date: Date): Date {
  const monday = new Date(date)
  const day = monday.getDay()
  const diff = day === 0 ? -6 : 1 - day
  monday.setDate(monday.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function dateOnly(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function fromDateOnly(value: string): Date {
  return new Date(`${value}T12:00:00`)
}
