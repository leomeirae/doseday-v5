import { useState, useEffect } from 'react'
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { SymbolView } from 'expo-symbols'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

const DISMISSED_KEY = 'notif_denied_banner_dismissed'

type Props = {
  visible: boolean
}

export function PermissionDeniedBanner({ visible }: Props) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    SecureStore.getItemAsync(DISMISSED_KEY).then((val) => {
      if (val === 'true') setDismissed(true)
    })
  }, [])

  async function handleDismiss() {
    await SecureStore.setItemAsync(DISMISSED_KEY, 'true')
    setDismissed(true)
  }

  async function handleOpenSettings() {
    await Linking.openSettings()
  }

  if (!visible || dismissed) return null

  return (
    <View style={styles.container} accessibilityRole="alert">
      <View style={styles.row}>
        <SymbolView name="bell.slash.fill" size={18} tintColor={colors.semanticWarning} />
        <View style={styles.textWrap}>
          <Text style={styles.title}>Notificações desativadas</Text>
          <Text style={styles.body}>
            Ative nas configurações do iPhone para receber lembretes da dose.
          </Text>
        </View>
        <Pressable
          onPress={handleDismiss}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Fechar aviso"
        >
          <SymbolView name="xmark" size={14} tintColor={colors.textTertiary} />
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [styles.ctaButton, pressed && styles.pressed]}
        onPress={handleOpenSettings}
        accessibilityRole="button"
        accessibilityLabel="Abrir Configurações do iPhone"
      >
        <Text style={styles.ctaLabel}>Abrir Configurações</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${colors.semanticWarning}14`,
    borderWidth: 1,
    borderColor: `${colors.semanticWarning}30`,
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  textWrap: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    ...typography.label,
    color: colors.textPrimary,
    fontSize: 14,
  },
  body: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: `${colors.semanticWarning}20`,
  },
  ctaLabel: {
    ...typography.label,
    color: colors.semanticWarning,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.7,
  },
})
