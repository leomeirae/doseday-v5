import { isToday, isTomorrow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDoseDate(date: Date): string {
  if (isToday(date)) {
    return `Hoje, ${format(date, "d 'de' MMMM", { locale: ptBR })}`
  }
  if (isTomorrow(date)) {
    return `Amanhã, ${format(date, "d 'de' MMMM", { locale: ptBR })}`
  }
  return format(date, "EEEE, d 'de' MMMM", { locale: ptBR })
}
