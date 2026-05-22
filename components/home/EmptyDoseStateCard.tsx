import { View, Text, Pressable, StyleSheet } from 'react-native'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

interface Props {
  onPressRegister: () => void
  treatmentStatus?: string | null | undefined
  medicationName?: string | null | undefined
  currentDose?: number | null | undefined
}

type Content = { headline: string; body: string; ctaLabel: string }

function getContent(
  treatmentStatus: string | null | undefined,
  medicationName: string | null | undefined,
  currentDose: number | null | undefined
): Content {
  if (treatmentStatus === 'planning') {
    return {
      headline: 'Nenhuma dose anotada ainda.',
      body: 'Você vai começar em breve. Quando fizer a primeira aplicação, registre aqui.',
      ctaLabel: 'Registrar primeira dose quando começar',
    }
  }

  if (medicationName) {
    const medLine =
      currentDose != null
        ? `${medicationName} ${currentDose}mg`
        : medicationName
    const suffix = currentDose == null ? ' Dose pode ser completada depois.' : ''
    return {
      headline: 'Sua dose ainda não foi anotada.',
      body: `Registre quando foi a última aplicação de ${medLine}.${suffix}`,
      ctaLabel: 'Registrar minha última dose',
    }
  }

  return {
    headline: 'Sua dose ainda não foi anotada.',
    body: 'Registre quando foi sua última aplicação.',
    ctaLabel: 'Registrar minha última dose',
  }
}

export function EmptyDoseStateCard({
  onPressRegister,
  treatmentStatus,
  medicationName,
  currentDose,
}: Props) {
  const { headline, body, ctaLabel } = getContent(treatmentStatus, medicationName, currentDose)

  return (
    <View style={styles.card}>
      <Text style={styles.headline}>{headline}</Text>
      <Text style={styles.body}>{body}</Text>
      <Pressable
        onPress={onPressRegister}
        accessibilityRole="button"
        accessibilityLabel={ctaLabel}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
      >
        <Text style={styles.ctaLabel}>{ctaLabel}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSurface,
    borderColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  headline: {
    ...typography.title,
    color: colors.textPrimary,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
  cta: {
    backgroundColor: colors.brand,
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  ctaPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: colors.brandDim,
  },
  ctaLabel: {
    ...typography.label,
    color: colors.textInverse,
  },
})
