import { StyleSheet, View, type ViewProps } from 'react-native'
import { colors, radius } from '@lib/theme/tokens'

type SettingsGroupProps = ViewProps & {
  children: React.ReactNode
}

export function SettingsGroup({ children, style, ...rest }: SettingsGroupProps) {
  return (
    <View style={[styles.group, style]} {...rest}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  group: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
})
