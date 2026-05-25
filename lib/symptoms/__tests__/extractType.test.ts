import { extractIntensity, extractSymptomType } from '../extractType'

describe('extractSymptomType', () => {
  it('matches náusea/enjoo as nausea', () => {
    expect(extractSymptomType('náusea hoje')).toBe('nausea')
    expect(extractSymptomType('to com enjoo')).toBe('nausea')
    expect(extractSymptomType('me sinto enjoada')).toBe('nausea')
  })

  it('matches dor de cabeça variants as headache', () => {
    expect(extractSymptomType('dor de cabeça forte')).toBe('headache')
    expect(extractSymptomType('crise de enxaqueca')).toBe('headache')
    expect(extractSymptomType('cefaleia ontem')).toBe('headache')
  })

  it('matches azia / refluxo as heartburn', () => {
    expect(extractSymptomType('azia ao deitar')).toBe('heartburn')
    expect(extractSymptomType('com refluxo')).toBe('heartburn')
  })

  it('matches cansaço variants as fatigue', () => {
    expect(extractSymptomType('to cansada')).toBe('fatigue')
    expect(extractSymptomType('exausto hoje')).toBe('fatigue')
    expect(extractSymptomType('sem energia o dia inteiro')).toBe('fatigue')
  })

  it('matches diarréia as diarrhea', () => {
    expect(extractSymptomType('diarréia depois da dose')).toBe('diarrhea')
    expect(extractSymptomType('diarreia leve')).toBe('diarrhea')
  })

  it('matches constipação variants as constipation', () => {
    expect(extractSymptomType('constipação a semana toda')).toBe('constipation')
    expect(extractSymptomType('prisão de ventre')).toBe('constipation')
    expect(extractSymptomType('intestino preso')).toBe('constipation')
  })

  it('matches dor na aplicação as injection_pain', () => {
    expect(extractSymptomType('dor na aplicação')).toBe('injection_pain')
    expect(extractSymptomType('dor no local da injeção')).toBe('injection_pain')
  })

  it('matches vômito variants as vomiting', () => {
    expect(extractSymptomType('vômito de manhã')).toBe('vomiting')
    expect(extractSymptomType('vomitando depois da dose')).toBe('vomiting')
  })

  it('returns other for unrecognized text', () => {
    expect(extractSymptomType('voltei a usar calça 38')).toBe('other')
    expect(extractSymptomType('domingo foi difícil')).toBe('other')
  })
})

describe('extractIntensity', () => {
  it('returns 3 for strong qualifiers', () => {
    expect(extractIntensity('dor forte')).toBe(3)
    expect(extractIntensity('azia muito intensa')).toBe(3)
    expect(extractIntensity('vômito severo')).toBe(3)
  })

  it('returns 1 for weak qualifiers', () => {
    expect(extractIntensity('náusea leve')).toBe(1)
    expect(extractIntensity('dor fraca')).toBe(1)
    expect(extractIntensity('um pouco de azia')).toBe(1)
  })

  it('returns 2 for moderate qualifier', () => {
    expect(extractIntensity('dor moderada')).toBe(2)
  })

  it('returns 2 as default when no qualifier is present', () => {
    expect(extractIntensity('náusea hoje')).toBe(2)
    expect(extractIntensity('to com enjoo')).toBe(2)
  })

  it('prefers strong over moderate when both terms appear', () => {
    expect(extractIntensity('dor moderada que ficou forte')).toBe(3)
  })
})
