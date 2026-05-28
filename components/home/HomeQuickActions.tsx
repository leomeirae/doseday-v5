import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SymbolView } from 'expo-symbols'
import { useTranslation } from 'react-i18next'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'

type Props = {
  hasDose: boolean
  onPressDose: () => void
  onPressWeight: () => void
}

export function HomeQuickActions({ hasDose, onPressDose, onPressWeight }: Props) {
  const { t } = useTranslation('home')
  const [dosePressed, setDosePressed] = useState(false)
  const [weightPressed, setWeightPressed] = useState(false)

  return (
    <View style={styles.row}>
      {hasDose && (
        <Pressable
          onPress={onPressDose}
          onPressIn={() => setDosePressed(true)}
          onPressOut={() => setDosePressed(false)}
          accessibilityRole="button"
          accessibilityLabel={t('quickActions.registerDose')}
          style={[
            styles.button,
            styles.buttonPrimary,
            dosePressed && styles.buttonPrimaryPressed,
          ]}
        >
          <SymbolView name="syringe" size={20} tintColor={colors.textInverse} />
          <Text style={styles.labelPrimary}>{t('quickActions.registerDose')}</Text>
        </Pressable>
      )}

      <Pressable
        onPress={onPressWeight}
        onPressIn={() => setWeightPressed(true)}
        onPressOut={() => setWeightPressed(false)}
        accessibilityRole="button"
        accessibilityLabel={t('quickActions.registerWeight')}
        style={[
          styles.button,
          styles.buttonSecondary,
          weightPressed && styles.buttonSecondaryPressed,
        ]}
      >
        <SymbolView name="scalemass" size={20} tintColor={colors.textPrimary} />
        <Text style={styles.labelSecondary}>{t('quickActions.registerWeight')}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    minHeight: 72,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  buttonPrimary: {
    backgroundColor: colors.brand,
  },
  buttonPrimaryPressed: {
    backgroundColor: colors.brandDim,
    transform: [{ scale: 0.97 }],
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.semanticMuted,
  },
  buttonSecondaryPressed: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    transform: [{ scale: 0.97 }],
  },
  labelPrimary: {
    ...typography.label,
    color: colors.textInverse,
    textAlign: 'center',
  },
  labelSecondary: {
    ...typography.label,
    color: colors.textPrimary,
    textAlign: 'center',
  },
})
