import { supabase } from '@lib/supabase/client'

type DeleteAccountResponse =
  | { success: true; message: string }
  | { success: false; error: string }

export async function deleteAccount(): Promise<void> {
  const { data, error } = await supabase.functions.invoke<DeleteAccountResponse>(
    'delete-user-account',
    { body: {} }
  )

  if (error) throw error
  if (!data) throw new Error('Empty response from delete-user-account')
  if (!data.success) throw new Error(data.error)
}

