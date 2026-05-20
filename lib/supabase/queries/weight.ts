import { supabase } from '@lib/supabase/client'
import type { WeightPoint } from './reports'

export type WeightLog = WeightPoint & {
  id: string
  createdAt: string | null
}

export type WeightLogInput = {
  weight: number
  date: Date
  notes?: string
}

export async function getWeightLogs(userId: string): Promise<WeightLog[]> {
  const { data, error } = await supabase
    .from('weight_logs')
    .select('id, weight, date, notes, created_at')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    date: fromDateOnly(row.date),
    weight: Number(row.weight),
    notes: row.notes,
    createdAt: row.created_at,
  }))
}

export async function addWeightLog(userId: string, input: WeightLogInput): Promise<WeightLog> {
  const { data, error } = await supabase
    .from('weight_logs')
    .upsert(
      {
        user_id: userId,
        weight: input.weight,
        date: dateOnly(input.date),
        notes: input.notes ?? null,
      },
      { onConflict: 'user_id,date' }
    )
    .select('id, weight, date, notes, created_at')
    .single()

  if (error) throw error

  return {
    id: data.id,
    date: fromDateOnly(data.date),
    weight: Number(data.weight),
    notes: data.notes,
    createdAt: data.created_at,
  }
}

export async function updateWeightLog(
  userId: string,
  id: string,
  input: WeightLogInput
): Promise<WeightLog> {
  const { data, error } = await supabase
    .from('weight_logs')
    .update({
      weight: input.weight,
      date: dateOnly(input.date),
      notes: input.notes ?? null,
    })
    .eq('user_id', userId)
    .eq('id', id)
    .select('id, weight, date, notes, created_at')
    .single()

  if (error) throw error

  return {
    id: data.id,
    date: fromDateOnly(data.date),
    weight: Number(data.weight),
    notes: data.notes,
    createdAt: data.created_at,
  }
}

export async function deleteWeightLog(userId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from('weight_logs')
    .delete()
    .eq('user_id', userId)
    .eq('id', id)

  if (error) throw error
}

function dateOnly(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function fromDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}
