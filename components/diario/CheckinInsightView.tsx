import { View, Text, ActivityIndicator, ScrollView, Pressable, StyleSheet } from 'react-native'
import { SymbolView } from 'expo-symbols'
import { AuthButton } from '@components/ui/AuthButton'
import { InsightDisclaimer } from '@components/ui/InsightDisclaimer'
import { colors, typography, spacing } from '@lib/theme/tokens'
import type { CheckinInsightOutput } from '@lib/supabase/queries/insights'

type Props = {
  insight: CheckinInsightOutput | null
  isLoading: boolean
  onClose: () => void
}

export function CheckinInsightView({ insight, isLoading, onClose }: Props) {
  return (
    <>
      <View style={styles.header}>
        <Pressable
          onPress={onClose}
          hitSlop={13}
          accessibilityLabel="Fechar"
          accessibilityRole="button"
        >
          <SymbolView name="xmark" size={18} tintColor={colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Insight do dia</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.textBrand} />
          <Text style={styles.loadingText}>Gerando seu insight do tratamento...</Text>
        </View>
      ) : insight ? (
        <>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <InsightDisclaimer />
            <Text style={styles.headline}>{insight.headline}</Text>
            <Text style={styles.body}>{insight.body}</Text>
          </ScrollView>
          <View style={styles.footer}>
            <AuthButton
              label="Voltar"
              variant="secondary"
              onPress={onClose}
            />
          </View>
        </>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 18,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scrollContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  headline: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footer: {
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
})
