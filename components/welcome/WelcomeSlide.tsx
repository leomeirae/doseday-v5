import { StyleSheet, Text, View } from 'react-native'
import { SymbolView } from 'expo-symbols'
import type { SFSymbol } from 'sf-symbols-typescript'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'

type WelcomeSlideProps = {
  iconName: SFSymbol
  headline: string
  body: string
  width: number
  accessibilityLabel: string
  testID: string
}

export function WelcomeSlide({
  iconName,
  headline,
  body,
  width,
  accessibilityLabel,
  testID,
}: WelcomeSlideProps) {
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      style={[styles.container, { width }]}
      testID={testID}
    >
      <View style={styles.iconShell}>
        <SymbolView
          name={iconName}
          size={42}
          tintColor={colors.semanticInfo}
          weight="semibold"
        />
      </View>

      <View style={styles.copy}>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  iconShell: {
    width: 96,
    height: 96,
    borderRadius: radius.xl,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  copy: {
    gap: spacing.md,
  },
  headline: {
    ...typography.display,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})
