import { z } from 'zod'

export const DELETE_ACCOUNT_CONFIRMATION = 'EXCLUIR'

export const deleteAccountConfirmSchema = z.object({
  confirmation: z.literal(DELETE_ACCOUNT_CONFIRMATION),
})

export type DeleteAccountConfirmInput = z.infer<typeof deleteAccountConfirmSchema>

