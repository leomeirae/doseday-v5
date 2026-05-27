import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, type Href } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { AuthButton } from '@components/ui/AuthButton'
import { useMemoryNotes } from '@hooks/useMemoryNotes'
import { mapQueryError } from '@lib/supabase/queries/errors'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'

export default function TreatmentNotesScreen() {
  const router = useRouter()
  const notesQuery = useMemoryNotes()
  const notes = notesQuery.data ?? []

  function openAdd() {
    router.push('/diario/anotar-memoria' as Href)
  }

  function goBack() {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/memoria' as Href)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={goBack}
          hitSlop={13}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={styles.backButton}
        >
          <SymbolView name="chevron.left" size={18} tintColor={colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Notas sobre o tratamento</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Anotações livres sobre o que você quer lembrar depois.
        </Text>

        {notesQuery.isLoading && (
          <View style={styles.state}>
            <ActivityIndicator size="small" color={colors.textSecondary} />
            <Text style={styles.stateText}>Carregando notas.</Text>
          </View>
        )}

        {notesQuery.error && (
          <View style={styles.state}>
            <Text style={styles.stateText}>{mapQueryError(notesQuery.error)}</Text>
            <AuthButton
              label="Tentar novamente"
              variant="secondary"
              onPress={() => void notesQuery.refetch()}
            />
          </View>
        )}

        {!notesQuery.isLoading && !notesQuery.error && notes.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhuma nota ainda.</Text>
            <Text style={styles.emptyText}>
              Use este espaço para registrar algo importante sobre o tratamento.
            </Text>
          </View>
        )}

        {!notesQuery.isLoading && !notesQuery.error && notes.length > 0 && (
          <View style={styles.list}>
            {notes.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <Text style={styles.noteDate}>{formatRelativeDay(note.loggedAt)}</Text>
                <Text style={styles.noteText}>{note.notes}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <AuthButton label="Nova nota" onPress={openAdd} />
      </View>
    </SafeAreaView>
  )
}

function formatRelativeDay(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  const days = Math.max(0, Math.round((today.getTime() - target.getTime()) / 86_400_000))

  if (days === 0) return 'Hoje'
  if (days === 1) return 'Ontem'
  if (days < 7) return `Há ${days} dias`
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(date)
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  subtitle: {
    ...typography.bodyClinical,
    color: colors.textSecondary,
  },
  state: {
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  stateText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  emptyCard: {
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  emptyTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  emptyText: {
    ...typography.bodyClinical,
    color: colors.textSecondary,
  },
  list: {
    gap: spacing.md,
  },
  noteCard: {
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  noteDate: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  noteText: {
    ...typography.bodyClinical,
    color: colors.textPrimary,
  },
  footer: {
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
})
