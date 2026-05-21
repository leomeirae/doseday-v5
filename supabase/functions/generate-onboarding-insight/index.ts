import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import OpenAI from 'npm:openai@4.104.0'
import { z } from 'npm:zod@4.4.3'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MODEL = Deno.env.get('ONBOARDING_INSIGHT_MODEL') || 'gpt-5'
const PROMPT_VERSION = 'onboarding-insight-contract-v2'
const FIXED_DISCLAIMER =
  'Isso é uma anotação inteligente, não orientação médica. Sempre fale com um profissional de saúde.'

const FORBIDDEN_OUTPUT_PATTERNS = [
  /\bSURMOUNT\b/i,
  /\bSURPASS\b/i,
  /\bSTEP\b/i,
  /\bclinical trial\b/i,
  /\bestudo clínico\b/i,
  /\bestudos clínicos\b/i,
]

const FORBIDDEN_PHRASES = [
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

const EducationalInsightContextSchema = z
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

const OnboardingInsightContractSchema = z
  .object({
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

type EducationalInsightContext = z.infer<typeof EducationalInsightContextSchema>
type OnboardingInsightContract = z.infer<typeof OnboardingInsightContractSchema>

const ONBOARDING_INSIGHT_RESPONSE_FORMAT = {
  name: 'onboarding_insight_contract',
  strict: true,
  schema: {
    type: 'object',
    properties: {
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

const SYSTEM_PROMPT = `Você escreve para o DoseDay, app que funciona como memória inteligente do tratamento com canetas GLP-1.

Tarefa: gerar um JSON estruturado para a tela de resultado do onboarding.

Regras obrigatórias:
- Escreva em português brasileiro, tom calmo, direto, clínico e cuidadoso.
- Não cite nomes de estudos, trials ou siglas como SURMOUNT, SURPASS ou STEP.
- Não escreva "estudo clínico" nem "clinical trial".
- Não prescreva, não sugira mudança de dose, medicamento, dieta ou conduta médica.
- Não faça promessa pessoal de perda de peso.
- Não use tom motivacional, cobrança, gamificação ou culpa.
- Não use linguagem alarmista.
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

function deriveDeterministicLabels(ctx: EducationalInsightContext) {
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

function containsForbiddenText(contract: OnboardingInsightContract): string | null {
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

async function resolveAuthenticatedUserId(req: Request): Promise<string> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Authenticated user not resolved')
  }

  return user.id
}

function buildLegacyBody(contract: OnboardingInsightContract): string {
  return [
    contract.shortInsight,
    contract.nextStep,
    ...contract.contextBullets.map((bullet) => `- ${bullet}`),
  ].join('\n')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  try {
    const userId = await resolveAuthenticatedUserId(req)
    const ctx = EducationalInsightContextSchema.parse(await req.json())

    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })
    const completion = await openai.chat.completions.create({
      model: MODEL,
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

    const raw = completion.choices[0]?.message?.content
    if (typeof raw !== 'string' || raw.trim().length === 0) {
      throw new Error('OpenAI returned empty onboarding insight')
    }

    const parsed = JSON.parse(raw)
    const deterministicLabels = deriveDeterministicLabels(ctx)
    const contract = OnboardingInsightContractSchema.parse({
      ...parsed,
      ...deterministicLabels,
    })

    const forbidden = containsForbiddenText(contract)
    if (forbidden) {
      throw new Error(`Output validation failed: forbidden text "${forbidden}"`)
    }

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { error: upsertError } = await serviceClient
      .from('educational_insights')
      .upsert(
        {
          user_id: userId,
          trigger_source: 'onboarding',
          context: {
            contract_version: 'v2',
            input: ctx,
            output: contract,
          },
          headline: contract.stageLabel,
          body: buildLegacyBody(contract),
          disclaimer: contract.disclaimer,
          model: MODEL,
          prompt_version: PROMPT_VERSION,
        },
        { onConflict: 'user_id,trigger_source' }
      )

    if (upsertError) throw new Error(`Upsert failed: ${upsertError.message}`)

    console.log(
      `[generate-onboarding-insight] ok model=${MODEL} prompt=${PROMPT_VERSION}`
    )

    return new Response(JSON.stringify(contract), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[generate-onboarding-insight] error=${message}`)

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})
