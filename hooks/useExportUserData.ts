import { useMutation } from '@tanstack/react-query'
import { supabase } from '@lib/supabase/client'
import type { Tables } from '../types/database'

type QueryResult = {
  error: { message: string } | null
}

type PagedQueryResult<T> = QueryResult & {
  count: number | null
  data: T[] | null
}

const EXPORT_PAGE_SIZE = 500

export type UserDataExport = {
  export_version: 1
  export_scope: 'all_stored_rows'
  exported_at: string
  user_id: string
  tables: {
    consent_history: Tables<'consent_history'>[]
    daily_checkins: Tables<'daily_checkins'>[]
    educational_insights: Tables<'educational_insights'>[]
    lifestyle_logs: Tables<'lifestyle_logs'>[]
    lifestyle_triggers: Tables<'lifestyle_triggers'>[]
    medical_reports: Tables<'medical_reports'>[]
    medical_visits: Tables<'medical_visits'>[]
    medication_applications: Tables<'medication_applications'>[]
    memory_daily_insights: Tables<'memory_daily_insights'>[]
    memory_summaries: Tables<'memory_summaries'>[]
    onboarding_events: Tables<'onboarding_events'>[]
    pending_ai_questions: Tables<'pending_ai_questions'>[]
    purchases: Tables<'purchases'>[]
    quick_logs: Tables<'quick_logs'>[]
    symptom_logs: Tables<'symptom_logs'>[]
    user_profiles: Tables<'user_profiles'> | null
    user_settings: Tables<'user_settings'> | null
    user_subscriptions: Tables<'user_subscriptions'>[]
    weight_logs: Tables<'weight_logs'>[]
  }
}

export function useExportUserData(userId: string | undefined) {
  return useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('No user')
      return exportUserData(userId)
    },
  })
}

export async function exportUserData(userId: string): Promise<UserDataExport> {
  const [
    profileResult,
    settingsResult,
    consentHistoryResult,
    dailyCheckinsResult,
    educationalInsightsResult,
    lifestyleLogsResult,
    lifestyleTriggersResult,
    medicalReportsResult,
    medicalVisitsResult,
    medicationApplicationsResult,
    memoryDailyInsightsResult,
    memorySummariesResult,
    onboardingEventsResult,
    pendingAiQuestionsResult,
    purchasesResult,
    quickLogsResult,
    symptomLogsResult,
    userSubscriptionsResult,
    weightLogsResult,
  ] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle(),
    fetchAllRows<Tables<'consent_history'>>((from, to) =>
      supabase.from('consent_history').select('*', { count: 'exact' }).eq('user_id', userId).order('id').range(from, to)
    ),
    fetchAllRows<Tables<'daily_checkins'>>((from, to) =>
      supabase.from('daily_checkins').select('*', { count: 'exact' }).eq('user_id', userId).order('id').range(from, to)
    ),
    fetchAllRows<Tables<'educational_insights'>>((from, to) =>
      supabase.from('educational_insights').select('*', { count: 'exact' }).eq('user_id', userId).order('id').range(from, to)
    ),
    fetchAllRows<Tables<'lifestyle_logs'>>((from, to) =>
      supabase.from('lifestyle_logs').select('*', { count: 'exact' }).eq('user_id', userId).order('id').range(from, to)
    ),
    fetchAllRows<Tables<'lifestyle_triggers'>>((from, to) =>
      supabase.from('lifestyle_triggers').select('*', { count: 'exact' }).eq('user_id', userId).order('id').range(from, to)
    ),
    fetchAllRows<Tables<'medical_reports'>>((from, to) =>
      supabase.from('medical_reports').select('*', { count: 'exact' }).eq('user_id', userId).order('id').range(from, to)
    ),
    fetchAllRows<Tables<'medical_visits'>>((from, to) =>
      supabase.from('medical_visits').select('*', { count: 'exact' }).eq('user_id', userId).order('id').range(from, to)
    ),
    fetchAllRows<Tables<'medication_applications'>>((from, to) =>
      supabase.from('medication_applications').select('*', { count: 'exact' }).eq('user_id', userId).order('id').range(from, to)
    ),
    fetchAllRows<Tables<'memory_daily_insights'>>((from, to) =>
      supabase.from('memory_daily_insights').select('*', { count: 'exact' }).eq('user_id', userId).order('id').range(from, to)
    ),
    fetchAllRows<Tables<'memory_summaries'>>((from, to) =>
      supabase.from('memory_summaries').select('*', { count: 'exact' }).eq('user_id', userId).order('id').range(from, to)
    ),
    fetchAllRows<Tables<'onboarding_events'>>((from, to) =>
      supabase.from('onboarding_events').select('*', { count: 'exact' }).eq('user_id', userId).order('id').range(from, to)
    ),
    fetchAllRows<Tables<'pending_ai_questions'>>((from, to) =>
      supabase.from('pending_ai_questions').select('*', { count: 'exact' }).eq('user_id', userId).order('id').range(from, to)
    ),
    fetchAllRows<Tables<'purchases'>>((from, to) =>
      supabase.from('purchases').select('*', { count: 'exact' }).eq('user_id', userId).order('id').range(from, to)
    ),
    fetchAllRows<Tables<'quick_logs'>>((from, to) =>
      supabase.from('quick_logs').select('*', { count: 'exact' }).eq('user_id', userId).order('id').range(from, to)
    ),
    fetchAllRows<Tables<'symptom_logs'>>((from, to) =>
      supabase.from('symptom_logs').select('*', { count: 'exact' }).eq('user_id', userId).order('id').range(from, to)
    ),
    fetchAllRows<Tables<'user_subscriptions'>>((from, to) =>
      supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact' })
        .or(`user_id.eq.${userId},app_user_id.eq.${userId}`)
        .order('id')
        .range(from, to)
    ),
    fetchAllRows<Tables<'weight_logs'>>((from, to) =>
      supabase.from('weight_logs').select('*', { count: 'exact' }).eq('user_id', userId).order('id').range(from, to)
    ),
  ])

  throwFirstQueryError([
    profileResult,
    settingsResult,
    consentHistoryResult,
    dailyCheckinsResult,
    educationalInsightsResult,
    lifestyleLogsResult,
    lifestyleTriggersResult,
    medicalReportsResult,
    medicalVisitsResult,
    medicationApplicationsResult,
    memoryDailyInsightsResult,
    memorySummariesResult,
    onboardingEventsResult,
    pendingAiQuestionsResult,
    purchasesResult,
    quickLogsResult,
    symptomLogsResult,
    userSubscriptionsResult,
    weightLogsResult,
  ])

  return {
    export_version: 1,
    export_scope: 'all_stored_rows',
    exported_at: new Date().toISOString(),
    user_id: userId,
    tables: {
      consent_history: consentHistoryResult.data ?? [],
      daily_checkins: dailyCheckinsResult.data ?? [],
      educational_insights: educationalInsightsResult.data ?? [],
      lifestyle_logs: lifestyleLogsResult.data ?? [],
      lifestyle_triggers: lifestyleTriggersResult.data ?? [],
      medical_reports: medicalReportsResult.data ?? [],
      medical_visits: medicalVisitsResult.data ?? [],
      medication_applications: medicationApplicationsResult.data ?? [],
      memory_daily_insights: memoryDailyInsightsResult.data ?? [],
      memory_summaries: memorySummariesResult.data ?? [],
      onboarding_events: onboardingEventsResult.data ?? [],
      pending_ai_questions: pendingAiQuestionsResult.data ?? [],
      purchases: purchasesResult.data ?? [],
      quick_logs: quickLogsResult.data ?? [],
      symptom_logs: symptomLogsResult.data ?? [],
      user_profiles: profileResult.data,
      user_settings: settingsResult.data,
      user_subscriptions: userSubscriptionsResult.data ?? [],
      weight_logs: weightLogsResult.data ?? [],
    },
  }
}

async function fetchAllRows<T>(
  loadPage: (from: number, to: number) => PromiseLike<PagedQueryResult<T>>
): Promise<PagedQueryResult<T>> {
  const rows: T[] = []
  let total: number | null = null

  while (true) {
    const result = await loadPage(rows.length, rows.length + EXPORT_PAGE_SIZE - 1)
    if (result.error) return { count: total, data: null, error: result.error }

    const pageRows = result.data ?? []
    rows.push(...pageRows)
    total ??= result.count

    if (pageRows.length === 0 || (total !== null && rows.length >= total)) {
      return { count: total, data: rows, error: null }
    }

    if (total === null && pageRows.length < EXPORT_PAGE_SIZE) {
      return { count: null, data: rows, error: null }
    }
  }
}

function throwFirstQueryError(results: readonly QueryResult[]): void {
  const failedResult = results.find((result) => result.error)
  if (failedResult?.error) {
    throw new Error(failedResult.error.message)
  }
}
