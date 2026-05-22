import { Alert, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, type Href } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useTranslation } from 'react-i18next'
import { FlatList, RectButton } from 'react-native-gesture-handler'
import { AuthButton } from '@components/ui/AuthButton'
import { WeightHistoryRow } from '@components/peso/WeightHistoryRow'
import { WeightStatsCard } from '@components/peso/WeightStatsCard'
import { useProfile } from '@hooks/useProfile'
import { useWeightLogs } from '@hooks/useWeightLogs'
import { showErrorToast } from '@lib/utils/showToast'
import { colors, elevation, radius, spacing, typography } from '@lib/theme/tokens'
import type { WeightLog } from '@lib/supabase/queries/weight'

export default function PesoHistoricoScreen() {
  const router = useRouter()
  const { t } = useTranslation('weight')
  const { t: tCommon } = useTranslation('common')
  const { data: profile } = useProfile()
  const {
    data: weightLogs = [],
    isLoading,
    deleteWeightLog,
    isDeleting,
  } = useWeightLogs()

  function openAdd() {
    router.push('/peso/registrar' as Href)
  }

  function openEdit(log: WeightLog) {
    router.push(`/peso/registrar?id=${log.id}` as Href)
  }

  function confirmDelete(log: WeightLog) {
    Alert.alert(
      t('historyModal.deleteConfirm.title'),
      t('historyModal.deleteConfirm.message'),
      [
        { text: t('historyModal.deleteConfirm.cancel'), style: 'cancel' },
        {
          text: t('historyModal.deleteConfirm.confirm'),
          style: 'destructive',
          onPress: () => {
            deleteWeightLog(
              { id: log.id },
              {
                onError: () => {
                  showErrorToast(t('historyModal.errors.deleteFailed'))
                },
              }
            )
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <RectButton
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={tCommon('buttons.back')}
        >
          <SymbolView name="chevron.left" size={18} tintColor={colors.textSecondary} />
        </RectButton>
        <Text style={styles.headerTitle}>{t('historyModal.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={weightLogs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={(
          <WeightStatsCard weightLogs={weightLogs} userProfile={profile} />
        )}
        ListEmptyComponent={!isLoading ? <EmptyState onAdd={openAdd} /> : null}
        renderItem={({ item }) => (
          <WeightHistoryRow
            log={item}
            onPress={() => openEdit(item)}
            onDelete={() => confirmDelete(item)}
          />
        )}
      />

      {weightLogs.length > 0 && (
        <RectButton
          style={[styles.floatingButton, isDeleting && styles.disabled]}
          onPress={openAdd}
          enabled={!isDeleting}
          accessibilityRole="button"
          accessibilityLabel={t('addModal.fabAdd')}
        >
          <SymbolView name="plus" size={18} tintColor={colors.textInverse} />
          <Text style={styles.floatingButtonText}>{t('addModal.fabAdd')}</Text>
        </RectButton>
      )}
    </SafeAreaView>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation('weight')

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <SymbolView name="scalemass" size={24} tintColor={colors.semanticInfo} />
      </View>
      <Text style={styles.emptyText}>{t('historyModal.empty')}</Text>
      <AuthButton
        label={t('addModal.titleAdd')}
        variant="secondary"
        onPress={onAdd}
        accessibilityLabel={t('addModal.titleAdd')}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  headerTitle: {
    ...typography.subtitle,
    flex: 1,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 124,
  },
  emptyState: {
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  emptyIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: 'rgba(91,168,217,0.12)',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    ...elevation[2],
  },
  floatingButtonText: {
    ...typography.label,
    color: colors.textInverse,
  },
  disabled: {
    opacity: 0.5,
  },
})
