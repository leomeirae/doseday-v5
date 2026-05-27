import { supabase } from '@lib/supabase/client'

export type RecentSymptom = {
  type: string
  date: Date
}

export type SymptomRecord = RecentSymptom & {
  id: string
  notes: string | null
}

export type FrequentSymptom = {
  type: string
  count: number
}

const FREQUENT_SYMPTOM_LIMIT = 5
const FREQUENT_SYMPTOM_WINDOW_DAYS = 30

export async function fetchFrequentSymptoms(userId: string): Promise<FrequentSymptom[]> {
  const since = new Date(Date.now() - FREQUENT_SYMPTOM_WINDOW_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const { data, error } = await supabase
    .from('symptom_logs')
    .select('symptom_type')
    .eq('user_id', userId)
    .neq('symptom_type', 'other')
    .gte('symptom_date', since)

  if (error) throw error

  const counts = (data ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.symptom_type] = (acc[row.symptom_type] ?? 0) + 1
    return acc
  }, {})

  return Object.entries(counts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, FREQUENT_SYMPTOM_LIMIT)
}

export async function getRecentSymptom(userId: string): Promise<RecentSymptom | null> {
  const { data, error } = await supabase
    .from('symptom_logs')
    .select('symptom_type, symptom_date')
    .eq('user_id', userId)
    .order('symptom_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    type: data.symptom_type,
    date: fromDateOnly(data.symptom_date),
  }
}

export async function getSymptoms(userId: string): Promise<SymptomRecord[]> {
  const { data, error } = await supabase
    .from('symptom_logs')
    .select('id, symptom_type, symptom_date, notes')
    .eq('user_id', userId)
    .order('symptom_date', { ascending: false })
    .limit(50)

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    type: row.symptom_type,
    date: fromDateOnly(row.symptom_date),
    notes: row.notes,
  }))
}

function fromDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}
