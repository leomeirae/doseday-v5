import { addDays } from 'date-fns'

export type DoseStatus = 'scheduled' | 'applied' | 'skipped'

export interface Dose {
  id: string
  date: Date
  medication: string
  dosage: string
  time: string // HH:mm
  status: DoseStatus
}

const today = new Date(2026, 4, 18) // 18 de maio 2026 (domingo) — alinha com Home mock

export const mockNextDoses: Dose[] = [
  { id: 'n1', date: today,              medication: 'Mounjaro', dosage: '5mg', time: '08:00', status: 'scheduled' },
  { id: 'n2', date: addDays(today, 7),  medication: 'Mounjaro', dosage: '5mg', time: '08:00', status: 'scheduled' },
  { id: 'n3', date: addDays(today, 14), medication: 'Mounjaro', dosage: '5mg', time: '08:00', status: 'scheduled' },
  { id: 'n4', date: addDays(today, 21), medication: 'Mounjaro', dosage: '5mg', time: '08:00', status: 'scheduled' },
]

export const mockHistoryDoses: Dose[] = [
  { id: 'h1', date: addDays(today, -7),  medication: 'Mounjaro', dosage: '5mg', time: '08:00', status: 'applied' },
  { id: 'h2', date: addDays(today, -14), medication: 'Mounjaro', dosage: '5mg', time: '08:00', status: 'applied' },
  { id: 'h3', date: addDays(today, -21), medication: 'Mounjaro', dosage: '5mg', time: '08:00', status: 'skipped' },
  { id: 'h4', date: addDays(today, -28), medication: 'Mounjaro', dosage: '5mg', time: '08:00', status: 'applied' },
]
