import { ScrollView, StyleSheet, Pressable, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { colors, spacing, typography } from '@lib/theme/tokens'
import { useSession } from '@hooks/useSession'
import { GreetingHeader } from '@components/home/GreetingHeader'
import { NextDoseCard } from '@components/home/NextDoseCard'
import { InsightCard } from '@components/home/InsightCard'

export default function HomeScreen() {
  const router = useRouter()
  const { session } = useSession()

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <GreetingHeader />
        <NextDoseCard />
        <InsightCard />
        {__DEV__ && !session && (
          <Pressable
            onPress={() => router.push('/(auth)/signin')}
            accessibilityLabel="Ir para tela de login (somente em desenvolvimento)"
          >
            <Text style={styles.devLink}>[DEV] Ir pra signin</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.xl,
    paddingBottom: spacing.xl,
  },
  devLink: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
})
