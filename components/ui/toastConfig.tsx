import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import type { ToastConfig } from 'react-native-toast-message'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

function ToastBase({
  message,
  borderColor,
}: {
  message: string
  borderColor: string
}) {
  return (
    <View style={[styles.container, { borderLeftColor: borderColor }]}>
      <Text style={styles.text} numberOfLines={2}>
        {message}
      </Text>
    </View>
  )
}

export const toastConfig: ToastConfig = {
  success: ({ text1 }) => (
    <ToastBase message={text1 ?? ''} borderColor={colors.semanticPositive} />
  ),
  error: ({ text1 }) => (
    <ToastBase message={text1 ?? ''} borderColor={colors.semanticCritical} />
  ),
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    ...typography.body,
    color: colors.textPrimary,
  },
})
