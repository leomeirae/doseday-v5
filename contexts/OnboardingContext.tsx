import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import { useForm, type DefaultValues, type FieldValues, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import type { z } from 'zod'
import { useSession } from '@hooks/useSession'
import { showErrorToast } from '@lib/utils/showToast'
import { mapQueryError } from '@lib/supabase/queries/errors'
import {
  completeOnboarding,
  getOnboardingProgress,
  recordConsent,
  updateOnboardingStep,
} from '@lib/supabase/queries/onboarding'
import {
  ONBOARDING_STEPS,
  type OnboardingData,
  type OnboardingState,
  type OnboardingStep,
  type PersistableOnboardingData,
} from '@lib/types/onboarding'
import {
  getNextOnboardingStep,
  getPreviousOnboardingStep,
} from '@lib/validation/onboardingSchemas'

type OnboardingContextValue = {
  state: OnboardingState
  currentStep: OnboardingStep
  advance: () => void
  goBack: () => void
  setCurrentStep: (step: OnboardingStep) => void
  updateField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void
  submitStep: (step: OnboardingStep, data: Partial<OnboardingData>) => Promise<void>
  persist: (data: Partial<OnboardingData>) => Promise<void>
  complete: () => Promise<void>
}

type Action =
  | { type: 'hydrate'; data: Partial<OnboardingData>; completedSteps: Set<OnboardingStep> }
  | { type: 'set-step'; step: OnboardingStep }
  | { type: 'update-data'; data: Partial<OnboardingData> }
  | { type: 'mark-completed'; step: OnboardingStep }
  | { type: 'submitting'; isSubmitting: boolean }
  | { type: 'error'; error: Error | null }

const initialState: OnboardingState = {
  currentStep: 'welcome',
  completedSteps: new Set(),
  data: {},
  isHydrated: false,
  isSubmitting: false,
  error: null,
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

function reducer(state: OnboardingState, action: Action): OnboardingState {
  switch (action.type) {
    case 'hydrate':
      return {
        ...state,
        data: action.data,
        completedSteps: action.completedSteps,
        currentStep: getFirstIncompleteStep(action.completedSteps),
        isHydrated: true,
        error: null,
      }
    case 'set-step':
      return { ...state, currentStep: action.step }
    case 'update-data':
      return {
        ...state,
        data: { ...state.data, ...action.data },
      }
    case 'mark-completed': {
      const completedSteps = new Set(state.completedSteps)
      completedSteps.add(action.step)
      return { ...state, completedSteps }
    }
    case 'submitting':
      return { ...state, isSubmitting: action.isSubmitting }
    case 'error':
      return { ...state, error: action.error }
    default:
      return state
  }
}

function getFirstIncompleteStep(completedSteps: Set<OnboardingStep>): OnboardingStep {
  return ONBOARDING_STEPS.find((step) => !completedSteps.has(step)) ?? 'result'
}

function inferCompletedSteps(data: Partial<OnboardingData>): Set<OnboardingStep> {
  const completedSteps = new Set<OnboardingStep>()
  const hasAnyProgress = Object.values(data).some((value) => {
    if (Array.isArray(value)) return value.length > 0
    return value !== undefined && value !== null && value !== ''
  })

  if (hasAnyProgress) completedSteps.add('welcome')

  if (data.full_name && data.age && data.biological_sex) {
    completedSteps.add('personal-info')
  }
  if (data.initial_weight && data.current_weight && data.height) {
    completedSteps.add('weight')
  }
  if (data.goal_weight) completedSteps.add('goal-weight')
  if (data.treatment_status) completedSteps.add('treatment-status')
  if (data.treatment_status === 'planning' || data.treatment_duration) {
    completedSteps.add('treatment-duration')
  }
  if (data.current_medication) completedSteps.add('medication')
  if (data.current_dose !== undefined) completedSteps.add('dose')
  if (data.dose_frequency_days !== undefined) completedSteps.add('dose-frequency')
  if (data.has_medical_support) completedSteps.add('medical-support')
  if (data.has_medical_support === 'no' || data.doctor_name) completedSteps.add('doctor-name')
  if (data.main_concerns && data.main_concerns.length > 0) completedSteps.add('concerns')
  if (data.consent_given) completedSteps.add('consent')

  return completedSteps
}

function toPersistableData(data: Partial<OnboardingData>): Partial<PersistableOnboardingData> {
  const persistable: Partial<PersistableOnboardingData> = {}

  if (data.full_name !== undefined) persistable.full_name = data.full_name
  if (data.age !== undefined) persistable.age = data.age
  if (data.biological_sex !== undefined) persistable.biological_sex = data.biological_sex
  if (data.initial_weight !== undefined) persistable.initial_weight = data.initial_weight
  if (data.current_weight !== undefined) persistable.current_weight = data.current_weight
  if (data.height !== undefined) persistable.height = data.height
  if (data.goal_weight !== undefined) persistable.goal_weight = data.goal_weight
  if (data.treatment_status !== undefined) persistable.treatment_status = data.treatment_status
  if (data.treatment_duration !== undefined) persistable.treatment_duration = data.treatment_duration
  if (data.current_medication !== undefined) persistable.current_medication = data.current_medication
  if (data.current_dose !== undefined) persistable.current_dose = data.current_dose
  if (data.dose_frequency_days !== undefined) {
    persistable.dose_frequency_days = data.dose_frequency_days
  }
  if (data.doctor_name !== undefined) persistable.doctor_name = data.doctor_name
  if (data.has_medical_support !== undefined) {
    persistable.has_medical_support = data.has_medical_support
  }
  if (data.main_concerns !== undefined) persistable.main_concerns = data.main_concerns

  return persistable
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { session } = useSession()
  const userId = session?.user?.id
  const queryClient = useQueryClient()

  useEffect(() => {
    let cancelled = false

    async function hydrate() {
      if (!userId) {
        dispatch({ type: 'hydrate', data: {}, completedSteps: new Set() })
        return
      }

      try {
        const progress = await getOnboardingProgress(userId)
        if (cancelled) return
        const completedSteps = inferCompletedSteps(progress.data)
        dispatch({ type: 'hydrate', data: progress.data, completedSteps })
      } catch (err) {
        if (cancelled) return
        const error = err instanceof Error ? err : new Error('Erro ao carregar onboarding')
        dispatch({ type: 'error', error })
        dispatch({ type: 'hydrate', data: {}, completedSteps: new Set() })
      }
    }

    hydrate()

    return () => {
      cancelled = true
    }
  }, [userId])

  const persist = useCallback(
    async (data: Partial<OnboardingData>) => {
      if (!userId) throw new Error('No user')
      const persistable = toPersistableData(data)
      if (Object.keys(persistable).length === 0) return
      await updateOnboardingStep(userId, persistable)
    },
    [userId]
  )

  const submitStep = useCallback(
    async (step: OnboardingStep, data: Partial<OnboardingData>) => {
      dispatch({ type: 'update-data', data })
      dispatch({ type: 'mark-completed', step })
      dispatch({ type: 'set-step', step: getNextOnboardingStep(step) })

      try {
        await persist(data)
        dispatch({ type: 'error', error: null })
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erro ao salvar onboarding')
        dispatch({ type: 'error', error })
        showErrorToast(mapQueryError(error))
      }
    },
    [persist]
  )

  const complete = useCallback(async () => {
    if (!userId) throw new Error('No user')
    dispatch({ type: 'submitting', isSubmitting: true })

    try {
      if (state.data.consent_given) {
        await recordConsent(userId)
      }
      await completeOnboarding(userId)
      await queryClient.invalidateQueries({ queryKey: ['profile', userId] })
      dispatch({ type: 'error', error: null })
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao concluir onboarding')
      dispatch({ type: 'error', error })
      showErrorToast(mapQueryError(error))
      throw error
    } finally {
      dispatch({ type: 'submitting', isSubmitting: false })
    }
  }, [queryClient, state.data.consent_given, userId])

  const value = useMemo<OnboardingContextValue>(
    () => ({
      state,
      currentStep: state.currentStep,
      advance: () => dispatch({ type: 'set-step', step: getNextOnboardingStep(state.currentStep) }),
      goBack: () => dispatch({ type: 'set-step', step: getPreviousOnboardingStep(state.currentStep) }),
      setCurrentStep: (step) => dispatch({ type: 'set-step', step }),
      updateField: (key, fieldValue) => dispatch({ type: 'update-data', data: { [key]: fieldValue } }),
      submitStep,
      persist,
      complete,
    }),
    [complete, persist, state, submitStep]
  )

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}

export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used inside OnboardingProvider')
  }
  return context
}

export function useOnboardingForm<T extends FieldValues>(
  schema: z.ZodType<T, T>,
  defaultValues: DefaultValues<T>
): UseFormReturn<T, unknown, T> {
  return useForm<T, unknown, T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  })
}
