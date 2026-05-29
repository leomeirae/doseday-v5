import { colors } from '@lib/theme/tokens'
import { QUICK_LOG_LABELS } from '@lib/validation/diarioSchemas'

export type MemorySource = 'dose' | 'peso' | 'nota' | 'sintoma' | 'custo' | 'registro'

export const SOURCE_COLORS: Record<MemorySource, string> = {
  dose: colors.clinicalDose,
  peso: colors.mintSoft,
  nota: '#B8AECF',
  sintoma: colors.semanticWarning,
  custo: '#D7B56D',
  registro: colors.semanticMuted,
}

export const symptomQuickLogTypes = new Set([
  'nausea',
  'headache',
  'fatigue',
  'diarrhea',
  'constipation',
  'heartburn',
  'injection_pain',
])

export function getQuickLogSource(
  logType: keyof typeof QUICK_LOG_LABELS
): MemorySource {
  if (logType === 'other') return 'nota'
  if (symptomQuickLogTypes.has(logType)) return 'sintoma'
  return 'registro'
}
