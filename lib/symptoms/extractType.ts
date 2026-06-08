// Regex-only PT-BR symptom extractor. Zero AI.
// Used by useRegisterSymptom to map free-text input into the existing
// symptom_logs schema (symptom_type NOT NULL, intensity NOT NULL) without
// requiring a migration. Source of the original text is preserved in `notes`.

export type SymptomCanonicalType =
  | 'nausea'
  | 'headache'
  | 'heartburn'
  | 'fatigue'
  | 'diarrhea'
  | 'constipation'
  | 'injection_pain'
  | 'vomiting'
  | 'other'

export type SymptomIntensity = 1 | 2 | 3

export const SYMPTOM_PATTERNS: readonly {
  type: SymptomCanonicalType
  regex: RegExp
}[] = [
  { type: 'nausea', regex: /\b(n[aá]usea|enjoo|enjoad[ao])/i },
  { type: 'headache', regex: /\b(dor de cabe[çc]a|cefaleia|enxaqueca)/i },
  { type: 'heartburn', regex: /\b(azia|refluxo|queima[çc][aã]o)/i },
  { type: 'fatigue', regex: /\b(cansa[çc]o|cansad[ao]|fadiga|sem energia|exaust[ao])/i },
  { type: 'diarrhea', regex: /\bdiarr[ée]ia/i },
  { type: 'constipation', regex: /\b(constipa[çc][aã]o|pris[aã]o de ventre|intestino preso)/i },
  { type: 'injection_pain', regex: /\b(dor na aplica[çc][aã]o|dor da inje[çc][aã]o|dor no local)/i },
  { type: 'vomiting', regex: /\b(v[oô]mit|vomit[ao]ndo)/i },
]

const INTENSITY_PATTERNS: readonly { value: SymptomIntensity; regex: RegExp }[] = [
  { value: 3, regex: /\b(forte|sever[ao]|intens[ao]|muito|grave|insuport[aá]vel)/i },
  { value: 1, regex: /\b(leve|frac[oa]|fraqu[ií]nho|pouco|sutil)/i },
  { value: 2, regex: /\bmoderad[ao]/i },
]

/**
 * Extracts a canonical symptom_type from free-text input.
 * Returns 'other' when no pattern matches — the row still persists,
 * preserving the original phrase in `notes`.
 */
export function extractSymptomType(text: string): SymptomCanonicalType {
  for (const { type, regex } of SYMPTOM_PATTERNS) {
    if (regex.test(text)) return type
  }
  return 'other'
}

/**
 * Extracts symptom intensity (1=leve, 2=moderado, 3=forte) from free-text.
 * Defaults to 2 (moderado) when no intensity keyword is found — satisfies
 * the NOT NULL constraint on symptom_logs.intensity without forcing a UI chip.
 */
export function extractIntensity(text: string): SymptomIntensity {
  for (const { value, regex } of INTENSITY_PATTERNS) {
    if (regex.test(text)) return value
  }
  return 2
}
