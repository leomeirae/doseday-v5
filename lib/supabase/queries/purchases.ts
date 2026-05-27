import { supabase } from '@lib/supabase/client'

export type PurchaseSummary = {
  total: number
  count: number
  recentPurchase: PurchaseRecord | null
}

export type AddPurchaseInput = {
  price: number
  description: string
  purchaseDate: Date
}

export type PurchaseRecord = {
  id: string
  price: number
  description: string | null
  purchaseDate: Date
}

export async function getPurchaseSummary(userId: string): Promise<PurchaseSummary> {
  const { data, error } = await supabase
    .from('purchases')
    .select('id, price, notes, purchase_date')
    .eq('user_id', userId)
    .order('purchase_date', { ascending: false })

  if (error) throw error

  const rows = (data ?? []).map(mapPurchaseRow)
  return {
    total: rows.reduce((sum, row) => sum + row.price, 0),
    count: rows.length,
    recentPurchase: rows[0] ?? null,
  }
}

export async function getPurchases(userId: string): Promise<PurchaseRecord[]> {
  const { data, error } = await supabase
    .from('purchases')
    .select('id, price, notes, purchase_date')
    .eq('user_id', userId)
    .order('purchase_date', { ascending: false })
    .limit(50)

  if (error) throw error

  return (data ?? []).map(mapPurchaseRow)
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

function mapPurchaseRow(row: {
  id: string
  price: number | string
  notes: string | null
  purchase_date: string
}): PurchaseRecord {
  return {
    id: row.id,
    price: Number(row.price),
    description: row.notes,
    purchaseDate: fromDateOnly(row.purchase_date),
  }
}

function fromDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}
