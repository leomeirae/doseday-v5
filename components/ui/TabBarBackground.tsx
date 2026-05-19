import { StyleSheet } from 'react-native'
import { BlurView } from 'expo-blur'
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect'

export function TabBarBackground() {
  if (isGlassEffectAPIAvailable()) {
    return (
      <GlassView
        glassEffectStyle="regular"
        colorScheme="dark"
        style={StyleSheet.absoluteFill}
      />
    )
  }

  return <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
}
