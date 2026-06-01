import { Pressable, Text, View } from 'react-native'
import { colors } from '@lib/theme/tokens'

// Card selecionável de plano (rádio visual). Preço é SEMPRE placeholder na
// Fase 1 — o valor real virá do RevenueCat/App Store na Fase 2.

type Props = {
  title: string
  pricePlaceholder: string
  periodLabel: string
  badgeLabel: string | null
  selected: boolean
  onPress: () => void
  testID?: string
}

export function PaywallPlanCard({
  title,
  pricePlaceholder,
  periodLabel,
  badgeLabel,
  selected,
  onPress,
  testID,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title}${badgeLabel ? `, ${badgeLabel}` : ''}`}
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
          <Text className="text-text-primary text-[16px] font-semibold leading-[20px]">
            {/* 📐 text-[16px] font-semibold = label */}
            {title}
          </Text>
          <View className="flex-row items-baseline gap-xxs mt-xxs">
            <Text className="text-text-primary text-[28px] font-bold leading-[34px]">
              {/* 📐 text-[28px] font-bold = number-medium */}
              {pricePlaceholder}
            </Text>
            <Text className="text-text-tertiary text-[13px] leading-[18px]">{periodLabel}</Text>
          </View>
        </View>
        <View className="items-end gap-xs">
          {badgeLabel ? (
            <View
              className="rounded-full px-sm py-xxs"
              style={{ backgroundColor: 'rgba(0,212,170,0.12)' }}
            >
              {/* style prop: mint a 12% (brand-fade) */}
              <Text
                className="text-[11px] font-semibold leading-[14px]"
                style={{ color: colors.brand }}
              >
                {badgeLabel}
              </Text>
            </View>
          ) : null}
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
      </View>
    </Pressable>
  )
}
