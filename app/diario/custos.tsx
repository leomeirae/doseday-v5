import { useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, type Href } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { AuthButton } from '@components/ui/AuthButton'
import { usePurchases } from '@hooks/usePurchases'
import { mapQueryError } from '@lib/supabase/queries/errors'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'

export default function TreatmentCostsScreen() {
  const router = useRouter()
  const [pressed, setPressed] = useState(false)
  const purchasesQuery = usePurchases()
  const purchases = purchasesQuery.data ?? []
  const total = purchases.reduce((sum, purchase) => sum + purchase.price, 0)

  function openAdd() {
    router.push('/diario/anotar-custo' as Href)
  }

  function goBack() {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/memoria' as Href)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={goBack}
          hitSlop={13}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={styles.backButton}
        >
          <SymbolView name="chevron.left" size={18} tintColor={colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Custos do tratamento</Text>
        <Pressable
          onPress={openAdd}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Registrar custo"
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          style={[styles.plusButton, pressed && { opacity: 0.7 }]}
        >
          <SymbolView name="plus" size={22} tintColor={colors.brand} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total registrado</Text>
          <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
        </View>

        {purchasesQuery.isLoading && (
          <View style={styles.state}>
            <ActivityIndicator size="small" color={colors.textSecondary} />
            <Text style={styles.stateText}>Carregando custos.</Text>
          </View>
        )}

        {purchasesQuery.error && (
          <View style={styles.state}>
            <Text style={styles.stateText}>{mapQueryError(purchasesQuery.error)}</Text>
            <AuthButton
              label="Tentar novamente"
              variant="secondary"
              onPress={() => void purchasesQuery.refetch()}
            />
          </View>
        )}

        {!purchasesQuery.isLoading && !purchasesQuery.error && purchases.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhum custo registrado ainda.</Text>
            <Text style={styles.emptyText}>
              Registre compras de medicação, consulta ou itens ligados ao tratamento.
            </Text>
          </View>
        )}

        {!purchasesQuery.isLoading && !purchasesQuery.error && purchases.length > 0 && (
          <View style={styles.list}>
            {purchases.map((purchase) => (
              <View key={purchase.id} style={styles.costCard}>
                <View style={styles.costRow}>
                  <Text style={styles.costValue}>{formatCurrency(purchase.price)}</Text>
                  <Text style={styles.costDate}>{formatDate(purchase.purchaseDate)}</Text>
                </View>
                {purchase.description && (
                  <Text style={styles.costDescription}>{purchase.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>


    </SafeAreaView>
  )
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(date)
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  plusButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  totalCard: {
    backgroundColor: colors.bgSurface,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  totalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  totalValue: {
    ...typography.numberMedium,
    color: colors.textPrimary,
  },
  state: {
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  stateText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  emptyCard: {
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  emptyTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  emptyText: {
    ...typography.bodyClinical,
    color: colors.textSecondary,
  },
  list: {
    gap: spacing.md,
  },
  costCard: {
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  costRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  costValue: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  costDate: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  costDescription: {
    ...typography.bodyClinical,
    color: colors.textSecondary,
  },

})
