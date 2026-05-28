import { useState } from 'react'
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native'
import { SymbolView } from 'expo-symbols'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@hooks/useSession'
import { requestPermissions } from '@lib/notifications'
import { supabase } from '@lib/supabase/client'
import { colors, typography, spacing, radius, elevation } from '@lib/theme/tokens'

type Props = {
  visible: boolean
  onDismiss: () => void
}

async function markPermissionModalSeen(userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .update({ has_seen_push_permission_modal: true })
    .eq('user_id', userId)

  if (error) throw error
}

export function PermissionRequestModal({ visible, onDismiss }: Props) {
  const { session } = useSession()
  const userId = session?.user?.id
  const queryClient = useQueryClient()
  const [allowPressed, setAllowPressed] = useState(false)
  const [skipPressed, setSkipPressed] = useState(false)

  const { mutate: dismiss } = useMutation({
    mutationFn: async () => {
      if (!userId) return
      await markPermissionModalSeen(userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
    },
    onError: (err) => {
      console.warn('[PermissionRequestModal] error marking seen:', err)
    },
  })

  async function handleAllow() {
    dismiss()
    onDismiss()
    await requestPermissions()
  }

  function handleSkip() {
    dismiss()
    onDismiss()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleSkip}
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        <View style={styles.sheet} accessibilityLabel="Ativar notificações">
          {/* Icon */}
          <View style={styles.iconWrap}>
            <SymbolView name="bell.badge.fill" size={32} tintColor={colors.semanticInfo} />
          </View>

          <Text style={styles.title}>Lembre-se da sua dose</Text>
          <Text style={styles.body}>
            Ative as notificações para receber um lembrete no horário da sua dose semanal.
          </Text>

          <Pressable
            style={[styles.btnPrimary, allowPressed && styles.pressed]}
            onPress={handleAllow}
            onPressIn={() => setAllowPressed(true)}
            onPressOut={() => setAllowPressed(false)}
            accessibilityRole="button"
            accessibilityLabel="Ativar notificações"
          >
            <Text style={styles.btnPrimaryLabel}>Ativar notificações</Text>
          </Pressable>

          <Pressable
            style={[styles.btnSecondary, skipPressed && styles.pressed]}
            onPress={handleSkip}
            onPressIn={() => setSkipPressed(true)}
            onPressOut={() => setSkipPressed(false)}
            accessibilityRole="button"
            accessibilityLabel="Agora não"
          >
            <Text style={styles.btnSecondaryLabel}>Agora não</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
    ...elevation[2],
    shadowColor: '#000',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: `${colors.semanticInfo}18`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xxs,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: colors.semanticInfo,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  btnPrimaryLabel: {
    ...typography.label,
    color: '#fff',
  },
  btnSecondary: {
    width: '100%',
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  btnSecondaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.75,
  },
})
