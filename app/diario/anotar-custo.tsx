import { useMemo, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { AuthButton } from '@components/ui/AuthButton'
import { useRegisterCost } from '@hooks/useRegisterCost'
import { mapQueryError } from '@lib/supabase/queries/errors'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'
import { showErrorToast, showSuccessToast } from '@lib/utils/showToast'
import { costNoteSchema } from '@lib/validation/diarioSchemas'

const DESCRIPTION_MAX_LENGTH = 200

function parsePriceInput(value: string): number | null {
  const normalized = value
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  if (normalized === '') return null
  const num = Number(normalized)
  if (!Number.isFinite(num) || num <= 0) return null
  return num
}

export default function AnotarCustoScreen() {
  const router = useRouter()
  const { mutate, isPending } = useRegisterCost()
  const [priceText, setPriceText] = useState('')
  const [description, setDescription] = useState('')
  const [savePressed, setSavePressed] = useState(false)

  const parsedPrice = useMemo(() => parsePriceInput(priceText), [priceText])
  const trimmedDescription = description.trim()
  const canSubmit =
    parsedPrice !== null && trimmedDescription.length > 0 && !isPending

  function dismiss() {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/')
    }
  }

  function handleSubmit() {
    if (parsedPrice === null) return

    const parsed = costNoteSchema.safeParse({
      price: parsedPrice,
      description: trimmedDescription,
      purchaseDate: new Date(),
    })
    if (!parsed.success) return

    mutate(
      {
        price: parsed.data.price,
        description: parsed.data.description,
        purchaseDate: parsed.data.purchaseDate,
      },
      {
        onSuccess: () => {
          showSuccessToast('Custo anotado')
          dismiss()
        },
        onError: (err) => {
          showErrorToast(mapQueryError(err))
        },
      },
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={dismiss}
          hitSlop={13}
          accessibilityLabel="Fechar"
          accessibilityRole="button"
        >
          <SymbolView name="xmark" size={18} tintColor={colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Anotar custo</Text>
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          hitSlop={13}
          accessibilityLabel="Salvar custo"
          accessibilityRole="button"
          onPressIn={() => setSavePressed(true)}
          onPressOut={() => setSavePressed(false)}
          style={[
            styles.saveHeaderButton,
            savePressed && styles.saveHeaderButtonPressed,
          ]}
        >
          <Text
            style={[
              styles.saveHeaderButtonText,
              !canSubmit && styles.saveHeaderButtonTextDisabled,
            ]}
          >
            Salvar
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Valor</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceCurrency}>R$</Text>
              <TextInput
                value={priceText}
                onChangeText={setPriceText}
                keyboardType="decimal-pad"
                placeholder="ex: 1.400,00"
                placeholderTextColor={colors.textTertiary}
                selectionColor={colors.brand}
                accessibilityLabel="Valor em reais"
                testID="anotar-custo-price"
                style={styles.priceInput}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Descrição</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={DESCRIPTION_MAX_LENGTH}
              placeholder="ex: caneta Mounjaro 5mg · Drogasil"
              placeholderTextColor={colors.textTertiary}
              selectionColor={colors.brand}
              autoCapitalize="sentences"
              autoCorrect
              textAlignVertical="top"
              accessibilityLabel="Descrição do custo"
              testID="anotar-custo-description"
              style={styles.descriptionInput}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <AuthButton
            label="Anotar"
            onPress={handleSubmit}
            loading={isPending}
            disabled={!canSubmit}
            testID="anotar-custo-submit"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
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
  saveHeaderButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  saveHeaderButtonPressed: {
    opacity: 0.7,
  },
  saveHeaderButtonText: {
    ...typography.body,
    color: colors.brand,
    fontWeight: '600',
  },
  saveHeaderButtonTextDisabled: {
    color: colors.textTertiary,
  },
  scrollContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  priceRow: {
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.md,
    borderWidth: 0.5,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  priceCurrency: {
    ...typography.body,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  priceInput: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    minHeight: 52,
    paddingVertical: 0,
  },
  descriptionInput: {
    ...typography.body,
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.md,
    borderWidth: 0.5,
    color: colors.textPrimary,
    minHeight: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  footer: {
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
})
