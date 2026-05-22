import { useMemo, useState } from 'react'
import { InputAccessoryView, Platform, StyleSheet, Text, TextInput, View } from 'react-native'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'

const NOOP_ACCESSORY_ID = 'onboarding-numeric-noop'

type Props = {
  label: string
  value?: number | string | undefined
  onChangeText: (value: string) => void
  suffix: string
  error?: string | undefined
  caption?: string | undefined
  placeholder?: string | undefined
  decimals?: boolean
  accessibilityLabel?: string | undefined
  testID?: string | undefined
  returnKeyType?: 'done' | 'next'
}

function normalizeNumericText(value: string, decimals: boolean): string {
  const normalized = value.replace(',', '.').replace(/[^\d.]/g, '')
  if (!decimals) return normalized.replace(/\./g, '')

  const [integer = '', ...rest] = normalized.split('.')
  const decimal = rest.join('')
  return rest.length > 0 ? `${integer}.${decimal}` : integer
}

export function NumericInput({
  label,
  value,
  onChangeText,
  suffix,
  error,
  caption,
  placeholder,
  decimals = true,
  accessibilityLabel,
  testID,
  returnKeyType = 'next',
}: Props) {
  const [focused, setFocused] = useState(false)
  const textValue = value === undefined || value === null ? '' : String(value)

  const inputBorderStyle = useMemo(() => {
    if (error) return styles.inputError
    if (focused) return styles.inputFocused
    return styles.inputDefault
  }, [error, focused])

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      <View style={[styles.inputWrap, inputBorderStyle]}>
        <TextInput
          value={textValue}
          onChangeText={(nextValue) => onChangeText(normalizeNumericText(nextValue, decimals))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType={decimals ? 'decimal-pad' : 'number-pad'}
          returnKeyType={returnKeyType}
          inputAccessoryViewID={Platform.OS === 'ios' ? NOOP_ACCESSORY_ID : undefined}
          autoCorrect={false}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.brand}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityHint={error}
          testID={testID}
          style={styles.input}
        />
        <Text style={styles.suffix}>{suffix}</Text>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {Platform.OS === 'ios' && <InputAccessoryView nativeID={NOOP_ACCESSORY_ID} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  caption: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  inputWrap: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  inputDefault: {
    borderColor: colors.semanticMuted,
  },
  inputFocused: {
    borderColor: colors.brand,
  },
  inputError: {
    borderColor: colors.semanticCritical,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  suffix: {
    ...typography.label,
    color: colors.textSecondary,
  },
  error: {
    ...typography.caption,
    color: colors.semanticCritical,
  },
})
