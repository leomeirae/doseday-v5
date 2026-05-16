import { Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import type {
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
  AccessibilityRole,
  AccessibilityState,
} from 'react-native'

const ACTIVE_TINT = 'rgba(0, 212, 170, 0.12)' as const

type TabBarButtonProps = {
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
  onPress?: ((e: GestureResponderEvent) => void) | null | undefined
  onLongPress?: ((e: GestureResponderEvent) => void) | null | undefined
  accessibilityState?: AccessibilityState | undefined
  accessibilityLabel?: string | undefined
  accessibilityRole?: AccessibilityRole | undefined
  testID?: string | undefined
}

export function TabBarButton({
  children,
  style,
  onPress,
  onLongPress,
  accessibilityState,
  accessibilityLabel,
  accessibilityRole,
  testID,
}: TabBarButtonProps) {
  const scale = useSharedValue(1)
  const isSelected = accessibilityState?.selected === true

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: isSelected ? ACTIVE_TINT : 'transparent',
  }))

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withTiming(0.96, { duration: 100 })
        Haptics.selectionAsync()
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 150 })
      }}
      onPress={onPress ?? undefined}
      onLongPress={onLongPress ?? undefined}
      style={style}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      testID={testID}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  )
}
