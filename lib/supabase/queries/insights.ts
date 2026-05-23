import { supabase } from '@lib/supabase/client'
import { onboardingInsightContractSchema, type OnboardingInsightContract } from '../../../types/api'

export type { MoodValue } from '@lib/validation/diarioSchemas'
export { emotionalStateToMood } from '@lib/validation/diarioSchemas'

// ── Edge Function input/output types ────────────────────────────────────────

export type GenerateCheckinInsightInput = {
  medication: string | null
  dose_mg: number | null
  treatment_week: number | null
  current_weight: number | null
  initial_weight: number | null
  goal_weight: number | null
  mood: 'mal' | 'ok' | 'bem' | 'otimo'
  days_since_last_dose: number | null
}

export type CheckinInsightOutput = {
  headline: string
  body: string
  disclaimer: string
}

// Discriminated union — captura os 3 caminhos do memory-daily-insight
export type DailyInsightResponse =
  | { kind: 'premium'; id: string; insightText: string; generatedAt: string }
  | { kind: 'free_placeholder'; placeholderKey: string }
  | { kind: 'fallback'; insightText: string }

// ── Edge Function calls ──────────────────────────────────────────────────────

export async function callGenerateCheckinInsight(
  input: GenerateCheckinInsightInput,
): Promise<CheckinInsightOutput> {
  void input
  // P0 containment: post-check-in AI is disabled until the function is
  // rewritten to the PRODUCT_COHERENCE contract.
  return {
    headline: 'Check-in registrado',
    body: 'Anotamos esse registro na memória do seu tratamento.',
    disclaimer:
      'Isso é uma anotação inteligente, não orientação médica. Sempre fale com um profissional de saúde.',
  }
}

export type GenerateOnboardingInsightInput = {
  medication: string | null
  dose_mg: number | null
  treatment_week: number | null
  current_weight: number | null
  initial_weight: number | null
  goal_weight: number | null
}

export async function callGenerateOnboardingInsight(
  input: GenerateOnboardingInsightInput,
): Promise<OnboardingInsightContract> {
  const { data, error } = await supabase.functions.invoke<unknown>('generate-onboarding-insight', {
    body: input,
  })
  if (error) throw error
  if (!data) throw new Error('Empty response from generate-onboarding-insight')
  return onboardingInsightContractSchema.parse(data)
}

export async function callMemoryDailyInsight(): Promise<DailyInsightResponse> {
  // P0 containment: memory-daily-insight is still being rewritten to the
  // PRODUCT_COHERENCE contract. Keep the UI path alive without invoking AI.
  return { kind: 'fallback', insightText: 'Sua memória será atualizada em breve.' }
}

// ── Fallback secundário: lê educational_insights diretamente ─────────────────

export async function getLatestEducationalInsight(
  userId: string,
): Promise<CheckinInsightOutput | null> {
  void userId
  // P0 containment: first_checkin rows may contain legacy patient-facing AI.
  // Do not surface them from the client while cleanup remains a gated prod task.
  return null
}

// Lê o contrato completo gerado no onboarding direto do DB (jsonb context.output).
// Não chama a Edge Function de novo — o insight já foi gerado e persistido (ADR 0002).
// Zod garante que dado corrompido no DB retorne null em vez de quebrar a UI.
export async function getOnboardingInsightContract(
  userId: string,
): Promise<OnboardingInsightContract | null> {
  const { data, error } = await supabase
    .from('educational_insights')
    .select('context')
    .eq('user_id', userId)
    .eq('trigger_source', 'onboarding')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error

  const output = (data?.context as { output?: unknown } | null)?.output
  if (output == null) return null

  const parsed = onboardingInsightContractSchema.safeParse(output)
  if (!parsed.success || parsed.data.schemaVersion !== 'onboarding_insight_v2') {
    return null
  }

  return parsed.data
}
