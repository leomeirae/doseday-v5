import {
  containsForbiddenPatientFacingText,
  FIXED_DISCLAIMER,
  MEMORY_DISABLED_TEXT,
} from './patient-facing-ai-safety.ts'

Deno.test('detects trial names and study language', () => {
  assertEquals(
    containsForbiddenPatientFacingText('Texto com SURPASS e estudo clínico.'),
    '\\bSURPASS\\b',
  )
})

Deno.test('detects medical guidance and dose-symptom causality', () => {
  assertEquals(
    containsForbiddenPatientFacingText('A dose causou enjoo, reduza a dose.'),
    '\\bcausou\\b',
  )
})

Deno.test('detects coach and motivational tone', () => {
  assertEquals(containsForbiddenPatientFacingText('Seu coach motivacional'), '\\bcoach\\b')
})

Deno.test('static containment text is safe', () => {
  assertEquals(
    containsForbiddenPatientFacingText({
      disclaimer: FIXED_DISCLAIMER,
      insight_text: MEMORY_DISABLED_TEXT,
      body: 'Registro salvo na memória do tratamento.',
    }),
    null,
  )
})

function assertEquals(actual: unknown, expected: unknown): void {
  const actualJson = JSON.stringify(actual)
  const expectedJson = JSON.stringify(expected)
  if (actualJson !== expectedJson) {
    throw new Error(`Expected ${expectedJson}, got ${actualJson}`)
  }
}
