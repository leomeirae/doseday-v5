export function mapQueryError(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase()
    if (msg.includes('fetch') || msg.includes('network')) {
      return 'Sem conexão. Verifique sua internet.'
    }
    if (msg.includes('jwt') || msg.includes('401')) {
      return 'Sua sessão expirou. Faça login novamente.'
    }
  }
  return 'Não foi possível carregar. Tente novamente.'
}
