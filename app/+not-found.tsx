import { View, Text, StyleSheet } from 'react-native'
import { Link } from 'expo-router'
import { colors } from '@lib/theme/tokens'

export default function NotFound() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela não encontrada</Text>
      <Link href="/" style={styles.link}>
        Voltar ao início
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  text: {
    color: colors.text,
    fontSize: 18,
    marginBottom: 16,
  },
  link: {
    color: colors.primary,
    fontSize: 16,
  },
})
