import {
  buildContractFromModelOutput,
  buildFallbackContract,
  containsForbiddenText,
  handleRequest,
  type EducationalInsightContext,
  type HandlerDeps,
} from './handler.ts'

const COMPLETE_CTX: EducationalInsightContext = {
  medication: 'Mounjaro',
  dose_mg: 5,
  treatment_week: 8,
  current_weight: 90,
  initial_weight: 100,
  goal_weight: 80,
}

const VALID_MODEL_OUTPUT = {
  schemaVersion: 'banana',
  stageLabel: 'ignored',
  medicationLabel: 'ignored',
  goalLabel: 'ignored',
  deltaLabel: 'ignored',
  shortInsight:
    'O DoseDay vai organizar seus registros para acompanhar sua rotina com mais clareza.',
  nextStep: 'Registre sua próxima aplicação para manter a memória atualizada.',
  contextBullets: [
    'Acompanhe a dose da semana no mesmo lugar.',
    'Registre sintomas do dia para comparar depois.',
  ],
  disclaimer: 'ignored',
}

Deno.test('buildFallbackContract returns a canonical contract for complete context', () => {
  const contract = buildFallbackContract(COMPLETE_CTX, 'openai_fail')

  assertEquals(contract.schemaVersion, 'onboarding_insight_v2')
  assertEquals(contract.stageLabel, 'Semana 8 do tratamento')
  assertEquals(contract.medicationLabel, 'Mounjaro 5 mg')
  assertEquals(contract.goalLabel, 'Meta: 80 kg')
  assertEquals(contract.deltaLabel, '10 kg abaixo do peso inicial')
  assertEquals(
    contract.shortInsight,
    'Vamos organizar seu tratamento e acompanhar sua rotina com calma. O DoseDay já está pronto para registrar o que importa.',
  )
  assertEquals(
    contract.nextStep,
    'Registre sua próxima dose para começar a memória do tratamento no app.',
  )
  assertEquals(contract.contextBullets, [
    'Anote a dose da semana e sintomas do dia.',
    'Use essa memória para conversar melhor em consulta.',
  ])
})

Deno.test('buildFallbackContract returns a canonical contract for empty context', () => {
  const contract = buildFallbackContract({}, 'json_invalid')

  assertEquals(contract.schemaVersion, 'onboarding_insight_v2')
  assertEquals(contract.stageLabel, 'Fase inicial do tratamento')
  assertEquals(contract.medicationLabel, 'GLP-1 em acompanhamento')
  assertEquals(contract.goalLabel, 'Meta ainda não informada')
  assertEquals(contract.deltaLabel, 'Variação ainda não calculada')
})

Deno.test('fallback contract does not match forbidden text filters', () => {
  const contract = buildFallbackContract({ medication: 'Mounjaro', dose_mg: 5 }, 'forbidden_text')

  assertEquals(containsForbiddenText(contract), null)
})

Deno.test('handleRequest returns fallback 200 when OpenAI fails', async () => {
  const service = createServiceClientMock()
  const response = await handleRequest(createRequest(COMPLETE_CTX), {
    openai: {
      chat: {
        completions: {
          create: () => {
            throw new Error('OpenAI down')
          },
        },
      },
    },
    resolveUserId: async () => 'fake-user-id-uuid',
    serviceClient: service.client,
    model: 'gpt-5',
  })
  const body = await response.json()

  assertEquals(response.status, 200)
  assertEquals(body.schemaVersion, 'onboarding_insight_v2')
  assertEquals('error' in body, false)
  assertEquals(service.calls.length, 1)
  assertEquals(getRecordedContext(service.calls[0]).fallback_reason, 'openai_fail')
})

Deno.test('model schemaVersion is ignored and replaced by server literal', async () => {
  const service = createServiceClientMock()
  const response = await handleRequest(createRequest(COMPLETE_CTX), {
    openai: createOpenAIMock(JSON.stringify(VALID_MODEL_OUTPUT)),
    resolveUserId: async () => 'fake-user-id-uuid',
    serviceClient: service.client,
    model: 'gpt-5',
  })
  const body = await response.json()

  assertEquals(response.status, 200)
  assertEquals(body.schemaVersion, 'onboarding_insight_v2')
  assertEquals(body.stageLabel, 'Semana 8 do tratamento')
  assertEquals(
    getOutputFromContext(getRecordedContext(service.calls[0])).schemaVersion,
    'onboarding_insight_v2',
  )
})

Deno.test('successful OpenAI contract is returned even if upsert fails', async () => {
  const response = await handleRequest(createRequest(COMPLETE_CTX), {
    openai: createOpenAIMock(JSON.stringify(VALID_MODEL_OUTPUT)),
    resolveUserId: async () => 'fake-user-id-uuid',
    serviceClient: createServiceClientMock('database unavailable').client,
    model: 'gpt-5',
  })
  const body = await response.json()

  assertEquals(response.status, 200)
  assertEquals(body.schemaVersion, 'onboarding_insight_v2')
  assertEquals(body.shortInsight, VALID_MODEL_OUTPUT.shortInsight)
})

Deno.test('buildContractFromModelOutput strips adversarial schemaVersion before raw parse', () => {
  const contract = buildContractFromModelOutput(VALID_MODEL_OUTPUT, COMPLETE_CTX)

  assertEquals(contract.schemaVersion, 'onboarding_insight_v2')
  assertEquals(contract.stageLabel, 'Semana 8 do tratamento')
})

function createRequest(ctx: EducationalInsightContext): Request {
  return new Request('https://example.test/generate-onboarding-insight', {
    method: 'POST',
    headers: { Authorization: 'Bearer test-token' },
    body: JSON.stringify(ctx),
  })
}

function createOpenAIMock(content: string): HandlerDeps['openai'] {
  return {
    chat: {
      completions: {
        create: () =>
          Promise.resolve({
            choices: [{ message: { content } }],
          }),
      },
    },
  }
}

function createServiceClientMock(errorMessage?: string): {
  calls: Array<Record<string, unknown>>
  client: NonNullable<HandlerDeps['serviceClient']>
} {
  const calls: Array<Record<string, unknown>> = []

  return {
    calls,
    client: {
      from: () => ({
        upsert: (values: Record<string, unknown>) => {
          calls.push(values)
          return Promise.resolve({
            error: errorMessage ? { message: errorMessage } : null,
          })
        },
      }),
    },
  }
}

function assertEquals(actual: unknown, expected: unknown): void {
  const actualJson = JSON.stringify(actual)
  const expectedJson = JSON.stringify(expected)
  if (actualJson !== expectedJson) {
    throw new Error(`Expected ${expectedJson}, got ${actualJson}`)
  }
}

function getRecordedContext(call: Record<string, unknown>): Record<string, unknown> {
  const { context } = call
  if (!isRecord(context)) {
    throw new Error('Expected recorded upsert context')
  }
  return context
}

function getOutputFromContext(context: Record<string, unknown>): Record<string, unknown> {
  const { output } = context
  if (!isRecord(output)) {
    throw new Error('Expected recorded context output')
  }
  return output
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
