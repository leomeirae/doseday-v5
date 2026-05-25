import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@hooks/useSession'
import { supabase } from '@lib/supabase/client'
import { extractIntensity, extractSymptomType } from '@lib/symptoms/extractType'

type RegisterSymptomInput = {
  rawText: string
}

// Schema constraint: symptom_type NOT NULL, intensity int NOT NULL, symptom_date NOT NULL.
// Free-text input is preserved verbatim in `notes`; canonical fields are derived
// via regex (extractSymptomType / extractIntensity) — zero AI. `context.source`
// marks the row origin for a future migration if a dedicated column is ever added.
async function insertSymptom(userId: string, input: RegisterSymptomInput): Promise<void> {
  const today = new Date().toISOString().slice(0, 10)

  const { error } = await supabase.from('symptom_logs').insert({
    user_id: userId,
    symptom_type: extractSymptomType(input.rawText),
    intensity: extractIntensity(input.rawText),
    symptom_date: today,
    notes: input.rawText,
    context: { schema_version: 1, source: 'free_text_v1' },
  })

  if (error) throw error
}

export function useRegisterSymptom() {
  const { session } = useSession()
  const userId = session?.user?.id
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RegisterSymptomInput) => {
      if (!userId) throw new Error('No user')
      return insertSymptom(userId, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frequentSymptoms', userId] })
      queryClient.invalidateQueries({ queryKey: ['symptomMemory', userId] })
      queryClient.invalidateQueries({ queryKey: ['diarioSummary', userId] })
    },
  })
}
