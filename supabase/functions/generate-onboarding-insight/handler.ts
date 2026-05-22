import OpenAI from 'npm:openai@4.104.0'
import { z } from 'npm:zod@4.4.3'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SCHEMA_VERSION = 'onboarding_insight_v2'
const PROMPT_VERSION = 'onboarding-insight-contract-v2'

export const FIXED_DISCLAIMER =
  'Isso é uma anotação inteligente, não orientação médica. Sempre fale com um profissional de saúde.'

const FALLBACK_SHORT_INSIGHT =
  'Vamos organizar seu tratamento e acompanhar sua rotina com calma. O DoseDay já está pronto para registrar o que importa.'
const FALLBACK_NEXT_STEP = 'Registre sua próxima dose para começar a memória do tratamento no app.'
const FALLBACK_CONTEXT_BULLETS = [
  'Anote a dose da semana e sintomas do dia.',
  'Use essa memória para conversar melhor em consulta.',
]

export const FORBIDDEN_OUTPUT_PATTERNS = [
  /\bSURMOUNT\b/i,
  /\bSURPASS\b/i,
  /\bSTEP\b/i,
  /\bclinical trial\b/i,
  /\bestudo clínico\b/i,
  /\bestudos clínicos\b/i,
]

export const FORBIDDEN_PHRASES = [
  'aumente a dose',
  'reduza a dose',
  'pare de tomar',
  'pare de usar',
  'substitua por',
  'troque para',
  'ajuste para',
  'você deve tomar',
  'você vai perder',
  'você perderá',
  'resultado garantido',
  'garantido',
  'perigo',
  'emergência',
  'preocupante',
  'alarmante',
  'grave',
  'parabéns por',
  'você consegue',
  'acredite em você',
  'jornada incrível',
  'você deveria',
  'no seu caso',
  'tratamento personalizado',
  'análise personalizada',
  'considere consultar',
  'marque uma consulta',
  'procure imediatamente',
  'recomendamos que',
  'recomendo que',
  'sintomas indicam',
  'sintomas sugerem',
  'sua condição',
  'seu quadro clínico',
  'foto',
  'fotos',
  'ciclo menstrual',
]

export const EducationalInsightContextSchema = z
  .object({
    profile_type: z.enum(['A', 'B', 'C', 'D', 'E']).optional(),
    medication: z.string().trim().min(1).nullable().optional(),
    dose_mg: z.number().positive().nullable().optional(),
    treatment_week: z.number().int().positive().nullable().optional(),
    current_weight: z.number().positive().nullable().optional(),
    initial_weight: z.number().positive().nullable().optional(),
    goal_weight: z.number().positive().nullable().optional(),
    mood: z.enum(['mal', 'ok', 'bem', 'otimo']).nullable().optional(),
    days_since_last_dose: z.number().int().nonnegative().nullable().optional(),
  })
  .strict()

// Mirror de types/api.ts. Mantido localmente porque a Edge Function roda em Deno.
export const onboardingInsightContractSchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    stageLabel: z.string().trim().min(1),
    medicationLabel: z.string().trim().min(1),
    goalLabel: z.string().trim().min(1),
    deltaLabel: z.string().trim().min(1),
    shortInsight: z.string().trim().min(40).max(320),
    nextStep: z.string().trim().min(20).max(220),
    contextBullets: z.array(z.string().trim().min(12).max(180)).min(2).max(3),
    disclaimer: z.string().trim().min(1),
  })
  .strict()

export const onboardingInsightRawSchema = onboardingInsightContractSchema.omit({
  schemaVersion: true,
})

export type EducationalInsightContext = z.infer<typeof EducationalInsightContextSchema>
export type OnboardingInsightContract = z.infer<typeof onboardingInsightContractSchema>
export type OnboardingInsightRaw = z.infer<typeof onboardingInsightRawSchema>

export type FallbackReason =
  | 'openai_fail'
  | 'json_invalid'
  | 'raw_zod_fail'
  | 'forbidden_text'
  | 'upsert_fail'

type ChatCompletionLike = {
  choices?: Array<{
    message?: {
      content?: unknown
    }
  }>
}

type OpenAIClientLike = {
  chat: {
    completions: {
      create: (args: Record<string, unknown>) => Promise<ChatCompletionLike>
    }
  }
}

type UpsertResult = {
  error?: { message?: string } | null
}

type EducationalInsightsTable = {
  upsert: (
    values: Record<string, unknown>,
    options: { onConflict: string },
  ) => PromiseLike<UpsertResult>
}

type ServiceClientLike = {
  from: (table: 'educational_insights') => EducationalInsightsTable
}

export type HandlerDeps = {
  openai?: OpenAIClientLike
  serviceClient?: ServiceClientLike
  resolveUserId?: (req: Request) => Promise<string>
  model?: string
}

export const ONBOARDING_INSIGHT_RESPONSE_FORMAT = {
  name: 'onboarding_insight_contract',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      schemaVersion: { type: 'string' },
      stageLabel: { type: 'string' },
      medicationLabel: { type: 'string' },
      goalLabel: { type: 'string' },
      deltaLabel: { type: 'string' },
      shortInsight: { type: 'string' },
      nextStep: { type: 'string' },
      contextBullets: {
        type: 'array',
        items: { type: 'string' },
        minItems: 2,
        maxItems: 3,
      },
      disclaimer: { type: 'string' },
    },
    required: [
      'schemaVersion',
      'stageLabel',
      'medicationLabel',
      'goalLabel',
      'deltaLabel',
      'shortInsight',
      'nextStep',
      'contextBullets',
      'disclaimer',
    ],
    additionalProperties: false,
  },
} as const

export const SYSTEM_PROMPT = `Você escreve para o DoseDay, app que funciona como memória inteligente do tratamento com canetas GLP-1.

Tarefa: gerar um JSON estruturado para a tela de resultado do onboarding.

Regras obrigatórias:
- Escreva em português brasileiro, tom calmo, direto, clínico e cuidadoso.
- Não cite nomes de pesquisas, siglas ou referências científicas específicas.
- Não escreva sobre literatura médica, artigos ou publicações científicas.
- Não prescreva, não sugira mudança de dose, medicamento, dieta ou conduta médica.
- Não faça promessa pessoal de perda de peso.
- Não use tom motivacional, cobrança, gamificação ou culpa.
- Não use linguagem alarmista.
- "schemaVersion" deve ser preenchido, mas será substituído pelo servidor.
- "shortInsight" deve ter 1 ou 2 frases.
- "nextStep" deve ser uma ação de uso do app, não uma recomendação médica.
- "nextStep" só pode sugerir uma destas ações: registrar próxima aplicação, registrar peso semanal, anotar sintomas, anotar dúvidas ou ativar lembretes.
- "contextBullets" deve ter 2 ou 3 bullets curtos, educacionais e não prescritivos.
- Não mencione fotos, exames, dieta, treino, ciclo menstrual ou funcionalidades não listadas acima.
- Os campos stageLabel, medicationLabel, goalLabel, deltaLabel e disclaimer serão substituídos pelo servidor; preencha-os apenas para cumprir o schema JSON.`

function buildUserPrompt(ctx: EducationalInsightContext): string {
  const parts = [
    `Medicamento: ${ctx.medication ?? 'GLP-1 não especificado'}`,
    `Dose: ${ctx.dose_mg ? `${formatNumber(ctx.dose_mg)} mg` : 'não informada'}`,
    `Semana estimada: ${ctx.treatment_week ?? 'não informada'}`,
    `Peso inicial: ${ctx.initial_weight ? `${formatNumber(ctx.initial_weight)} kg` : 'não informado'}`,
    `Peso atual: ${ctx.current_weight ? `${formatNumber(ctx.current_weight)} kg` : 'não informado'}`,
    `Meta de peso: ${ctx.goal_weight ? `${formatNumber(ctx.goal_weight)} kg` : 'não informada'}`,
  ]

  return `${parts.join('\n')}\n\nGere o JSON de insight de onboarding respeitando o schema.`
}

export function deriveDeterministicLabels(ctx: EducationalInsightContext) {
  const stageLabel = ctx.treatment_week
    ? `Semana ${ctx.treatment_week} do tratamento`
    : 'Fase inicial do tratamento'

  const medicationLabel = ctx.medication
    ? `${ctx.medication}${ctx.dose_mg ? ` ${formatNumber(ctx.dose_mg)} mg` : ''}`
    : 'GLP-1 em acompanhamento'

  const goalLabel = ctx.goal_weight
    ? `Meta: ${formatNumber(ctx.goal_weight)} kg`
    : 'Meta ainda não informada'

  const deltaLabel =
    ctx.initial_weight && ctx.current_weight
      ? formatWeightDelta(ctx.initial_weight, ctx.current_weight)
      : 'Variação ainda não calculada'

  return {
    stageLabel,
    medicationLabel,
    goalLabel,
    deltaLabel,
    disclaimer: FIXED_DISCLAIMER,
  }
}

function formatWeightDelta(initialWeight: number, currentWeight: number): string {
  const delta = initialWeight - currentWeight
  if (Math.abs(delta) < 0.05) return 'Peso estável desde o início'
  if (delta > 0) return `${formatNumber(delta)} kg abaixo do peso inicial`
  return `${formatNumber(Math.abs(delta))} kg acima do peso inicial`
}

function formatNumber(value: number): string {
  return Number.isInteger(value)
    ? String(value)
    : value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
}

export function buildContractFromModelOutput(
  modelOutput: Record<string, unknown>,
  ctx: EducationalInsightContext,
): OnboardingInsightContract {
  const deterministicLabels = deriveDeterministicLabels(ctx)

  // `omit()` herda `.strict()`: se o LLM enviar schemaVersion, o raw parse
  // rejeitaria campo desconhecido antes de o servidor injetar a versão canônica.
  const { schemaVersion: _ignoredSchemaVersion, ...modelOutputWithoutVersion } = modelOutput

  const parsedRaw = onboardingInsightRawSchema.parse({
    ...modelOutputWithoutVersion,
    ...deterministicLabels,
  })

  return buildCanonicalContract(parsedRaw)
}

export function buildFallbackContract(
  ctx: EducationalInsightContext,
  _reason: FallbackReason,
): OnboardingInsightContract {
  const raw = onboardingInsightRawSchema.parse({
    ...deriveDeterministicLabels(ctx),
    shortInsight: FALLBACK_SHORT_INSIGHT,
    nextStep: FALLBACK_NEXT_STEP,
    contextBullets: FALLBACK_CONTEXT_BULLETS,
  })

  return buildCanonicalContract(raw)
}

function buildCanonicalContract(raw: OnboardingInsightRaw): OnboardingInsightContract {
  return onboardingInsightContractSchema.parse({
    ...raw,
    schemaVersion: SCHEMA_VERSION,
  })
}

export function containsForbiddenText(contract: OnboardingInsightContract): string | null {
  const text = [
    contract.stageLabel,
    contract.medicationLabel,
    contract.goalLabel,
    contract.deltaLabel,
    contract.shortInsight,
    contract.nextStep,
    ...contract.contextBullets,
    contract.disclaimer,
  ]
    .join(' ')
    .toLowerCase()

  for (const pattern of FORBIDDEN_OUTPUT_PATTERNS) {
    if (pattern.test(text)) return pattern.source
  }

  for (const phrase of FORBIDDEN_PHRASES) {
    if (text.includes(phrase)) return phrase
  }

  return null
}

export async function resolveAuthenticatedUserId(req: Request): Promise<string> {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Authenticated user not resolved')
  }

  return user.id
}

export function buildLegacyBody(contract: OnboardingInsightContract): string {
  return [
    contract.shortInsight,
    contract.nextStep,
    ...contract.contextBullets.map((bullet) => `- ${bullet}`),
  ].join('\n')
}

export async function handleRequest(req: Request, deps: HandlerDeps = {}): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  const resolveUserId = deps.resolveUserId ?? resolveAuthenticatedUserId

  let userId: string
  try {
    userId = await resolveUserId(req)
  } catch (err) {
    console.warn(`[generate-onboarding-insight] auth_fail=${toLogMessage(err)}`)
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  let ctx: EducationalInsightContext
  try {
    ctx = EducationalInsightContextSchema.parse(await req.json())
  } catch (err) {
    console.warn(`[generate-onboarding-insight] input_invalid=${toLogMessage(err)}`)
    return jsonResponse({ error: 'Invalid input' }, 400)
  }

  const openai =
    deps.openai ??
    (new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') }) as unknown as OpenAIClientLike)
  const model = deps.model ?? getModel()

  try {
    const contract = await generateContractFromOpenAI(openai, ctx, model)
    const forbidden = containsForbiddenText(contract)
    if (forbidden) {
      return await returnFallback(userId, ctx, 'forbidden_text', deps)
    }

    await upsertContract(userId, ctx, contract, deps).catch((err) => {
      console.error(`[generate-onboarding-insight] upsert_fail=${toLogMessage(err)}`)
    })

    console.log(`[generate-onboarding-insight] ok model=${model} prompt=${PROMPT_VERSION}`)

    return jsonResponse(contract, 200)
  } catch (err) {
    return await returnFallback(userId, ctx, classifyFallbackReason(err), deps)
  }
}

async function generateContractFromOpenAI(
  openai: OpenAIClientLike,
  ctx: EducationalInsightContext,
  model: string,
): Promise<OnboardingInsightContract> {
  let completion: ChatCompletionLike
  try {
    completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(ctx) },
      ],
      max_completion_tokens: 2000,
      reasoning_effort: 'low',
      response_format: {
        type: 'json_schema',
        json_schema: ONBOARDING_INSIGHT_RESPONSE_FORMAT,
      },
    })
  } catch (err) {
    throw new FallbackPathError('openai_fail', err)
  }

  const raw = completion.choices?.[0]?.message?.content
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    throw new FallbackPathError('openai_fail', 'OpenAI returned empty content')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    throw new FallbackPathError('json_invalid', err)
  }

  if (!isRecord(parsed)) {
    throw new FallbackPathError('raw_zod_fail', 'OpenAI output is not an object')
  }

  try {
    return buildContractFromModelOutput(parsed, ctx)
  } catch (err) {
    throw new FallbackPathError('raw_zod_fail', err)
  }
}

async function returnFallback(
  userId: string,
  ctx: EducationalInsightContext,
  reason: FallbackReason,
  deps: HandlerDeps,
): Promise<Response> {
  console.warn(`[generate-onboarding-insight] fallback_reason=${reason}`)
  const contract = buildFallbackContract(ctx, reason)

  const forbidden = containsForbiddenText(contract)
  if (forbidden) {
    console.error(`[generate-onboarding-insight] fallback_forbidden=${forbidden}`)
  }

  await upsertContract(userId, ctx, contract, deps, reason).catch((err) => {
    console.error(`[generate-onboarding-insight] fallback_upsert_fail=${toLogMessage(err)}`)
  })

  return jsonResponse(contract, 200)
}

async function upsertContract(
  userId: string,
  ctx: EducationalInsightContext,
  contract: OnboardingInsightContract,
  deps: HandlerDeps,
  fallbackReason?: FallbackReason,
): Promise<void> {
  const serviceClient = deps.serviceClient ?? createServiceClient()
  const context: Record<string, unknown> = {
    schemaVersion: SCHEMA_VERSION,
    // Campo legado mantido por compatibilidade com ADR 0002; usar schemaVersion.
    contract_version: 'v2',
    input: ctx,
    output: contract,
  }

  if (fallbackReason) {
    context.fallback_reason = fallbackReason
  }

  const { error } = await serviceClient.from('educational_insights').upsert(
    {
      user_id: userId,
      trigger_source: 'onboarding',
      context,
      headline: contract.stageLabel,
      body: buildLegacyBody(contract),
      disclaimer: contract.disclaimer,
      model: deps.model ?? getModel(),
      prompt_version: PROMPT_VERSION,
    },
    { onConflict: 'user_id,trigger_source' },
  )

  if (error) {
    throw new Error(error.message ?? 'Upsert failed')
  }
}

function createServiceClient(): ServiceClientLike {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  ) as unknown as ServiceClientLike
}

function getModel(): string {
  return Deno.env.get('ONBOARDING_INSIGHT_MODEL') || 'gpt-5'
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function classifyFallbackReason(err: unknown): FallbackReason {
  if (err instanceof FallbackPathError) return err.reason
  return 'openai_fail'
}

function toLogMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

class FallbackPathError extends Error {
  constructor(
    readonly reason: FallbackReason,
    cause: unknown,
  ) {
    super(toLogMessage(cause))
  }
}
