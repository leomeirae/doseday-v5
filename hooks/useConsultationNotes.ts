export type ConsultationNote = {
  id: string
  text: string
  completed: boolean
}

/** v1 placeholder; source pendente. */
export function useConsultationNotes() {
  return {
    data: [] as ConsultationNote[],
    isLoading: false,
    error: null,
  }
}
