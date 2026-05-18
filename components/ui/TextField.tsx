import { useState } from 'react'
import { View, Text, TextInput, StyleSheet, KeyboardTypeOptions, TextInputProps } from 'react-native'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

type Props = {
  label: string
  value: string
  onChangeText: (v: string) => void
  error?: string
  secureTextEntry?: boolean
  keyboardType?: KeyboardTypeOptions
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  placeholder?: string
  accessibilityLabel?: string
  testID?: string
  returnKeyType?: TextInputProps['returnKeyType']
  textContentType?: TextInputProps['textContentType']
  onSubmitEditing?: () => void
  blurOnSubmit?: boolean
  maxLength?: number
  multiline?: boolean
  numberOfLines?: number
}

export function TextField({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  placeholder,
  accessibilityLabel,
  testID,
  returnKeyType,
  textContentType,
  onSubmitEditing,
  blurOnSubmit,
  maxLength,
  multiline = false,
  numberOfLines,
}: Props) {
  const [focused, setFocused] = useState(false)

  const borderColor = error
    ? colors.semanticCritical
    : focused
      ? colors.brand
      : 'rgba(255,255,255,0.06)'

  const borderWidth = error || focused ? 1 : 0.5

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        selectionColor={colors.brand}
        returnKeyType={returnKeyType}
        textContentType={textContentType}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={blurOnSubmit}
        maxLength={maxLength}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={error}
        testID={testID}
        multiline={multiline}
        numberOfLines={multiline ? (numberOfLines ?? 3) : undefined}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, { borderColor, borderWidth }]}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
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
  input: {
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  error: {
    ...typography.caption,
    color: colors.semanticCritical,
    marginTop: spacing.xxs,
  },
})
