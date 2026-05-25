import { supabase } from '@lib/supabase/client'

export type RecentSymptom = {
  type: string
  date: Date
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

function fromDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}
