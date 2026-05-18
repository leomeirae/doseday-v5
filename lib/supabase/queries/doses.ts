import { supabase } from '@lib/supabase/client'

export type DoseStatus = 'scheduled' | 'applied' | 'skipped'

export type DoseRecord = {
  id: string
  medicationName: string
  dose: number
  applicationDate: Date
  daysUntilNextDose: number
  status: DoseStatus
}

export type NextDoseData = {
  daysUntil: number
  isOverdue: boolean
  overdueBy: number
  scheduledDate: Date
  medicationName: string
  dose: number | null
}

export type DoseSummary = {
  nextDose: NextDoseData | null
  history: DoseRecord[]
}

export async function getDoseSummary(userId: string): Promise<DoseSummary> {
  const { data, error } = await supabase
    .from('medication_applications')
    .select('id, medication_name, dose, application_date, days_until_next_dose')
    .eq('user_id', userId)
    .order('application_date', { ascending: false })
    .limit(20)

  if (error) throw error
  if (!data || data.length === 0) {
    return { nextDose: null, history: [] }
  }

  const history: DoseRecord[] = data.map((row) => ({
    id: row.id,
    medicationName: row.medication_name,
    dose: Number(row.dose),
    applicationDate: new Date(row.application_date),
    daysUntilNextDose: row.days_until_next_dose,
    status: 'applied' as DoseStatus,
  }))

  const last = history[0]
  const nextDate = new Date(last.applicationDate)
  nextDate.setDate(nextDate.getDate() + last.daysUntilNextDose)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const nextDateMidnight = new Date(nextDate)
  nextDateMidnight.setHours(0, 0, 0, 0)
  const diffMs = nextDateMidnight.getTime() - today.getTime()
  const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24))

  return {
    nextDose: {
      daysUntil: Math.max(daysUntil, 0),
      isOverdue: daysUntil < 0,
      overdueBy: daysUntil < 0 ? Math.abs(daysUntil) : 0,
      scheduledDate: nextDate,
      medicationName: last.medicationName,
      dose: last.dose,
    },
    history,
  }
}
