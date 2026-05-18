import { View, Text, StyleSheet } from 'react-native'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { colors, typography, spacing } from '@lib/theme/tokens'

interface Props {
  name: string
}

function getGreeting(name: string): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return `Bom dia, ${name}`
  if (hour >= 12 && hour < 18) return `Boa tarde, ${name}`
  return `Boa noite, ${name}`
}

function formatCurrentDate(): string {
  const raw = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

export function GreetingHeader({ name }: Props) {
  const greeting = getGreeting(name)
  const dateLabel = formatCurrentDate()

  return (
    <View>
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.date}>{dateLabel}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  greeting: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
})
