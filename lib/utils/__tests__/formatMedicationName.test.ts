import { formatMedicationName } from '../formatMedicationName'

describe('formatMedicationName', () => {
  it('removes parenthetical content', () => {
    expect(formatMedicationName('Mounjaro (Tirzepatida)')).toBe('Mounjaro')
  })

  it('returns original name when no parentheses', () => {
    expect(formatMedicationName('Wegovy')).toBe('Wegovy')
  })

  it('handles multiple words before parenthesis', () => {
    expect(formatMedicationName('Saxenda 6mg/mL (Liraglutida)')).toBe('Saxenda 6mg/mL')
  })
})
