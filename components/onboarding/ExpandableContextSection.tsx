import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useReducedMotion,
} from 'react-native-reanimated'
import { SymbolView } from 'expo-symbols'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'

type Props = { label: string; bullets: string[] }

const ENTER = FadeIn.duration(200)
const EXIT = FadeOut.duration(150)

export function ExpandableContextSection({ label, bullets }: Props) {
  const [expanded, setExpanded] = useState(false)
  const reducedMotion = useReducedMotion()
  const containerAnimation = reducedMotion ? {} : { layout: LinearTransition }
  const bulletAnimation = reducedMotion ? {} : { entering: ENTER, exiting: EXIT }

  if (bullets.length === 0) return null

  return (
    <Animated.View
      style={styles.container}
      collapsable={false}
      {...containerAnimation}
    >
      <Pressable
        style={styles.header}
        onPress={() => setExpanded(prev => !prev)}
        hitSlop={{ top: 8, bottom: 8 }}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityHint={expanded ? 'Toque para recolher' : 'Toque para expandir'}
      >
        <SymbolView
          name={expanded ? 'chevron.up' : 'chevron.down'}
          size={14}
          tintColor={colors.textSecondary}
        />
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      {expanded && (
        <Animated.View
          style={styles.bulletsContainer}
          {...bulletAnimation}
        >
          {bullets.map((bullet, index) => (
            <View key={index} style={styles.bulletRow}>
              <View style={styles.dot} />
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </Animated.View>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  bulletRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  bulletText: {
    ...typography.bodyClinical,
    color: colors.textSecondary,
    flex: 1,
  },
  bulletsContainer: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  container: {
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.md,
    borderWidth: 0.5,
    padding: spacing.md,
  },
  dot: {
    backgroundColor: colors.textTertiary,
    borderRadius: 2,
    height: 4,
    marginTop: 7,
    width: 4,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 44,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    flex: 1,
  },
})
