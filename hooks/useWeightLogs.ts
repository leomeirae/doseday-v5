import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@hooks/useSession'
import {
  addWeightLog,
  deleteWeightLog,
  getWeightLogs,
  updateWeightLog,
  type WeightLog,
  type WeightLogInput,
} from '@lib/supabase/queries/weight'

type UpdateWeightLogVariables = {
  id: string
  input: WeightLogInput
}

type DeleteWeightLogVariables = {
  id: string
}

type OptimisticContext = {
  previous: WeightLog[] | undefined
}

export function useWeightLogs() {
  const { session } = useSession()
  const userId = session?.user?.id
  const queryClient = useQueryClient()
  const queryKey = ['weightLogs', userId] as const

  const query = useQuery({
    queryKey,
    queryFn: () => {
      if (!userId) throw new Error('No user')
      return getWeightLogs(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  })

  const addMutation = useMutation<WeightLog, Error, WeightLogInput, OptimisticContext>({
    mutationFn: (input) => {
      if (!userId) throw new Error('No user')
      return addWeightLog(userId, input)
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<WeightLog[]>(queryKey)
      const optimisticLog = toOptimisticLog(input)

      queryClient.setQueryData<WeightLog[]>(queryKey, (current = []) =>
        sortLogs([
          optimisticLog,
          ...current.filter((log) => dateKey(log.date) !== dateKey(input.date)),
        ])
      )

      return { previous }
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
    },
    onSettled: () => {
      void invalidateWeightQueries(queryClient, userId)
    },
  })

  const updateMutation = useMutation<WeightLog, Error, UpdateWeightLogVariables, OptimisticContext>({
    mutationFn: ({ id, input }) => {
      if (!userId) throw new Error('No user')
      return updateWeightLog(userId, id, input)
    },
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<WeightLog[]>(queryKey)

      queryClient.setQueryData<WeightLog[]>(queryKey, (current = []) =>
        sortLogs(
          current.map((log) =>
            log.id === id
              ? {
                  ...log,
                  date: input.date,
                  weight: input.weight,
                  notes: input.notes ?? null,
                }
              : log
          )
        )
      )

      return { previous }
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
    },
    onSettled: () => {
      void invalidateWeightQueries(queryClient, userId)
    },
  })

  const deleteMutation = useMutation<void, Error, DeleteWeightLogVariables, OptimisticContext>({
    mutationFn: ({ id }) => {
      if (!userId) throw new Error('No user')
      return deleteWeightLog(userId, id)
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<WeightLog[]>(queryKey)

      queryClient.setQueryData<WeightLog[]>(queryKey, (current = []) =>
        current.filter((log) => log.id !== id)
      )

      return { previous }
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
    },
    onSettled: () => {
      void invalidateWeightQueries(queryClient, userId)
    },
  })

  return {
    ...query,
    addWeightLog: addMutation.mutate,
    updateWeightLog: updateMutation.mutate,
    deleteWeightLog: deleteMutation.mutate,
    addWeightLogAsync: addMutation.mutateAsync,
    updateWeightLogAsync: updateMutation.mutateAsync,
    deleteWeightLogAsync: deleteMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

function toOptimisticLog(input: WeightLogInput): WeightLog {
  return {
    id: `optimistic-${dateKey(input.date)}`,
    date: input.date,
    weight: input.weight,
    notes: input.notes ?? null,
    createdAt: null,
  }
}

function sortLogs(logs: WeightLog[]): WeightLog[] {
  return [...logs].sort((a, b) => b.date.getTime() - a.date.getTime())
}

function dateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function invalidateWeightQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string | undefined
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['weightLogs', userId] }),
    queryClient.invalidateQueries({ queryKey: ['weightHistory', userId] }),
    queryClient.invalidateQueries({ queryKey: ['profile', userId] }),
  ])
}
