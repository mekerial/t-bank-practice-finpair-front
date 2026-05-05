import axios from 'axios'

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

type ApiErrorPayload = {
  error?: { message?: string; details?: Record<string, string[]> }
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as ApiErrorPayload | undefined
    if (payload?.error) {
      const parts: string[] = []
      if (payload.error.message) {
        parts.push(payload.error.message)
      }
      if (payload.error.details) {
        const msgs = Object.values(payload.error.details).flat()
        parts.push(...msgs)
      }
      if (parts.length > 0) {
        return parts.join(' ')
      }
    }
    if (error.message) {
      return error.message
    }
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Произошла ошибка. Попробуйте ещё раз.'
}
