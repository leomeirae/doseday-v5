import { View, Text } from 'react-native'
import { colors } from '@lib/theme/tokens'

export default function RegistrarDoseScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBase, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: colors.textPrimary }}>Registrar dose</Text>
    </View>
  )
}
