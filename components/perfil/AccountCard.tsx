import { View, Text, StyleSheet } from 'react-native'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

type Props = {
  fullName: string
  email: string
  createdAt: string | undefined
  userId: string
}

function formatMemberSince(createdAt?: string): string {
  if (!createdAt) return 'Membro desde hoje'

  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return 'Membro desde hoje'

  return `Membro desde ${format(date, "d 'de' MMMM", { locale: ptBR })}`
}

export function AccountCard({ fullName, email, createdAt, userId }: Props) {
  const supportId = userId.slice(-8)

  return (
    <View
      style={styles.card}
      accessibilityLabel={`Conta de ${fullName}. Email ${email}. ID de suporte ${supportId}`}
    >
      <Text style={styles.name} numberOfLines={1}>
        {fullName}
      </Text>
      <Text style={styles.email} numberOfLines={1} testID="perfil-email">
        {email}
      </Text>
      <Text style={styles.meta}>{formatMemberSince(createdAt)}</Text>
      <Text style={styles.supportId}>ID: {supportId}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  name: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  email: {
    ...typography.body,
    color: colors.textSecondary,
  },
  meta: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  supportId: {
    ...typography.monoData,
    color: colors.textSecondary,
  },
})
