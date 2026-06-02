import { Text, View } from 'react-native'
import { SymbolView, type SymbolViewProps } from 'expo-symbols'
import { colors } from '@lib/theme/tokens'

// Linha de benefício do paywall: ícone em círculo + título + descrição.
// Texto antes de ícone (DESIGN.md): o ícone acompanha, nunca substitui.

type Props = {
  icon: SymbolViewProps['name']
  title: string
  description: string
}

export function PaywallFeatureRow({ icon, title, description }: Props) {
  return (
    <View
      className="flex-row gap-md items-start"
      accessible
      accessibilityLabel={`${title}. ${description}`}
    >
      {/* Ícone neutro (Vital Mint Rarity Rule: mint reservado pro CTA e seleção) */}
      <View className="w-[44px] h-[44px] rounded-full items-center justify-center bg-bg-elevated">
        <SymbolView name={icon} size={20} tintColor={colors.textSecondary} />
      </View>
      <View className="flex-1">
        <Text className="text-text-primary text-[18px] font-semibold leading-[24px]">
          {/* 📐 text-[18px] leading-[24px] = subtitle */}
          {title}
        </Text>
        <Text className="text-text-secondary text-[15px] leading-[24px] mt-xxs">
          {/* 📐 text-[15px] leading-[24px] = body-clinical */}
          {description}
        </Text>
      </View>
    </View>
  )
}
