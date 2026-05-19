import { useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { DeleteAccountModal } from '@components/perfil/DeleteAccountModal'
import { signOut } from '@lib/supabase/auth'
import { showErrorToast, showSuccessToast } from '@lib/utils/showToast'
import { deleteAccountConfirmSchema } from '@lib/validation/accountSchemas'
import { useDeleteAccount } from '@hooks/useDeleteAccount'

export default function ExcluirContaScreen() {
  const router = useRouter()
  const [confirmation, setConfirmation] = useState('')
  const { mutateAsync, isPending } = useDeleteAccount()

  const canDelete = useMemo(() => (
    deleteAccountConfirmSchema.safeParse({ confirmation }).success
  ), [confirmation])

  async function handleDelete() {
    if (!canDelete || isPending) return

    try {
      await mutateAsync()
      showSuccessToast('Conta excluída')
      await signOut()
    } catch {
      showErrorToast('Não foi possível excluir. Tente novamente.')
    }
  }

  return (
    <DeleteAccountModal
      confirmation={confirmation}
      onChangeConfirmation={setConfirmation}
      onDelete={handleDelete}
      onCancel={() => router.back()}
      canDelete={canDelete}
      loading={isPending}
    />
  )
}

