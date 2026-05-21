import { supabase } from '@lib/supabase/client'
import {
  onboardingInsightContractSchema,
  type OnboardingInsightContract,
} from '../../../types/api'

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
  input: GenerateCheckinInsightInput
): Promise<CheckinInsightOutput> {
  const { data, error } = await supabase.functions.invoke<CheckinInsightOutput>(
    'generate-checkin-insight',
    { body: input }
  )
  if (error) throw error
  if (!data) throw new Error('Empty response from generate-checkin-insight')
  return data
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
  input: GenerateOnboardingInsightInput
): Promise<OnboardingInsightContract> {
  const { data, error } = await supabase.functions.invoke<unknown>(
    'generate-onboarding-insight',
    { body: input }
  )
  if (error) throw error
  if (!data) throw new Error('Empty response from generate-onboarding-insight')
  return onboardingInsightContractSchema.parse(data)
}

export async function callMemoryDailyInsight(): Promise<DailyInsightResponse> {
  const { data, error } = await supabase.functions.invoke<{
    id?: string | null
    insight_text?: string | null
    generated_at?: string | null
    content?: null
    mode?: string
    placeholder_key?: string
  }>('memory-daily-insight', { body: {} })

  if (error) throw error
  if (!data) throw new Error('Empty response from memory-daily-insight')

  if (data.mode === 'free_placeholder' && data.placeholder_key) {
    return { kind: 'free_placeholder', placeholderKey: data.placeholder_key }
  }

  if (!data.id) {
    return {
      kind: 'fallback',
      insightText: data.insight_text ?? 'Sua memória será atualizada em breve.',
    }
  }

  return {
    kind: 'premium',
    id: data.id,
    insightText: data.insight_text ?? '',
    generatedAt: data.generated_at ?? new Date().toISOString(),
  }
}

// ── Fallback secundário: lê educational_insights diretamente ─────────────────

export async function getLatestEducationalInsight(
  userId: string
): Promise<CheckinInsightOutput | null> {
  const { data, error } = await supabase
    .from('educational_insights')
    .select('headline, body, disclaimer')
    .eq('user_id', userId)
    .eq('trigger_source', 'first_checkin')
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return { headline: data.headline, body: data.body, disclaimer: data.disclaimer }
}
