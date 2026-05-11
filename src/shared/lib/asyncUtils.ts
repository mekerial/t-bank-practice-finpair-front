import axios from 'axios'

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

type ApiErrorPayload = {
  error?: {
    code?: string
    message?: string
    details?: Record<string, string[]>
  }
}

const KNOWN_ENGLISH_API_MESSAGES: Record<string, string> = {
  'Invalid password.': 'Неверный пароль. Проверьте раскладку и Caps Lock.',
  'Invalid email or password.': 'Неверный email или пароль.',
  'Email already exists.': 'Этот адрес почты уже занят.',
  'Invalid request.': 'Некорректный запрос.',
  'Bearer access token is required.': 'Требуется авторизация. Войдите снова.',
  'User was not found.': 'Пользователь не найден.',
  'Password is required.': 'Введите пароль.',
  'Password must contain at least 8 characters.': 'Пароль: не меньше 8 символов.',
  'Password must contain at least one letter.': 'В пароле должна быть хотя бы одна буква.',
  'Password must contain at least one digit.': 'В пароле должна быть хотя бы одна цифра.',
  'Email is invalid.': 'Некорректный адрес почты.'
}

function translateApiErrorText(code: string | undefined, message: string): string {
  const trimmed = message.trim()
  if (code === 'INVALID_CREDENTIALS') {
    return trimmed.startsWith('Неверный')
      ? trimmed
      : 'Неверный пароль. Проверьте раскладку, Caps Lock и пароль от этого аккаунта.'
  }
  if (code === 'EMAIL_ALREADY_EXISTS') {
    return 'Этот адрес почты уже занят.'
  }
  if (code === 'UNAUTHORIZED' && trimmed) {
    return KNOWN_ENGLISH_API_MESSAGES[trimmed] ?? trimmed
  }
  return KNOWN_ENGLISH_API_MESSAGES[trimmed] ?? message
}

function stripInternalUrls(text: string): string {
  return text
    .replace(/https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?[^\s)'"]*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function humanizeAxiosMessage(raw: string): string {
  const t = raw.trim()
  if (!t) return 'Произошла ошибка. Попробуйте ещё раз.'
  if (/^Network Error$/i.test(t)) {
    return 'Нет соединения с сервером. Проверьте интернет и доступность API.'
  }
  if (/timeout|timed out/i.test(t)) {
    return 'Превышено время ожидания ответа. Попробуйте снова.'
  }
  if (/localhost|127\.0\.0\.1/i.test(t)) {
    return 'Ошибка при обращении к серверу. Проверьте настройки подключения.'
  }
  return stripInternalUrls(t) || 'Произошла ошибка. Попробуйте ещё раз.'
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return humanizeAxiosMessage(error.message || 'Network Error')
    }
    const payload = error.response?.data as ApiErrorPayload | undefined
    if (payload?.error) {
      const parts: string[] = []
      const code = payload.error.code
      if (payload.error.message) {
        const raw = stripInternalUrls(payload.error.message)
        parts.push(translateApiErrorText(code, raw))
      }
      if (payload.error.details) {
        const msgs = Object.values(payload.error.details)
          .flat()
          .map((m) => translateApiErrorText(undefined, stripInternalUrls(m)))
        parts.push(...msgs)
      }
      const joined = parts.filter(Boolean).join(' ').trim()
      if (joined.length > 0) {
        return humanizeAxiosMessage(joined)
      }
    }
    if (error.message) {
      return humanizeAxiosMessage(error.message)
    }
  }
  if (error instanceof Error && error.message) {
    return humanizeAxiosMessage(error.message)
  }
  if (typeof error === 'string') {
    return humanizeAxiosMessage(error)
  }
  return 'Произошла ошибка. Попробуйте ещё раз.'
}