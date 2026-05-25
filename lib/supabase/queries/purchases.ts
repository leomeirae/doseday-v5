import { supabase } from '@lib/supabase/client'

export type PurchaseSummary = {
  total: number
  count: number
}

export type AddPurchaseInput = {
  price: number
  description: string
  purchaseDate: Date
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

// `description` is stored in `notes` and the date in `purchase_date` (date column).
// `quantity` is required NOT NULL — defaulted to 1 since the sheet captures one
// receipt at a time. `unit` and `category` use schema defaults ('caneta', 'medication').
export async function addPurchase(userId: string, input: AddPurchaseInput): Promise<void> {
  const { error } = await supabase.from('purchases').insert({
    user_id: userId,
    price: input.price,
    notes: input.description,
    purchase_date: input.purchaseDate.toISOString().slice(0, 10),
    quantity: 1,
  })

  if (error) throw error
}
