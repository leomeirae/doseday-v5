import { Pressable, Text, View } from 'react-native'
import { colors } from '@lib/theme/tokens'

// Card selecionável de plano (rádio visual). Na Fase 1 o preço NÃO é exibido
// como número: o título do plano é o destaque e a linha de preço informa que o
// valor vem da App Store (evita parecer bug ou preço escondido — Apple 3.1.1).
// Fase 2: a linha de preço passa a mostrar o valor real do offering + badge de
// economia calculada (ex.: "Economize 40%").

type Props = {
  title: string
  priceNote: string
  periodLabel: string
  selected: boolean
  onPress: () => void
  testID?: string
}

export function PaywallPlanCard({
  title,
  priceNote,
  periodLabel,
  selected,
  onPress,
  testID,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
      accessibilityHint="Seleciona este plano de assinatura."
      testID={testID}
      className="bg-bg-elevated rounded-[14px] p-md active:opacity-80"
      style={{
        borderWidth: selected ? 1.5 : 0.5,
        borderColor: selected ? colors.brand : 'rgba(255,255,255,0.08)',
      }}
    >
      {/* style prop: borda condicional por seleção (brand vs hairline) */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-text-primary text-[18px] font-semibold leading-[24px]">
            {/* 📐 text-[18px] leading-[24px] = subtitle — o plano é o destaque, não o preço */}
            {title}
          </Text>
          <Text className="text-text-tertiary text-[13px] leading-[18px] mt-xxs">
            {/* 📐 caption */}
            {priceNote} {periodLabel}
          </Text>
        </View>
        <View
          className="w-[22px] h-[22px] rounded-full items-center justify-center"
          style={{
            borderWidth: selected ? 0 : 1.5,
            borderColor: 'rgba(255,255,255,0.25)',
            backgroundColor: selected ? colors.brand : 'transparent',
          }}
        >
          {selected ? <View className="w-[8px] h-[8px] rounded-full bg-bg-base" /> : null}
        </View>
      </View>
    </Pressable>
  )
}
