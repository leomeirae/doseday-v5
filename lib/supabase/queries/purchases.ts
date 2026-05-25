import { supabase } from '@lib/supabase/client'

export type PurchaseSummary = {
  total: number
  count: number
}

export async function getPurchaseSummary(userId: string): Promise<PurchaseSummary> {
  const { data, error } = await supabase
    .from('purchases')
    .select('price')
    .eq('user_id', userId)

  if (error) throw error

  const rows = data ?? []
  return {
    total: rows.reduce((sum, row) => sum + Number(row.price), 0),
    count: rows.length,
  }
}
