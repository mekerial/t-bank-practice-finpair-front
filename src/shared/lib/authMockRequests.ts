import { delay } from './asyncUtils'
import { mockUser } from './mocks'

/** Задержка «сети» при входе/регистрации (мс). 0 — мгновенно. */
const AUTH_DELAY_MS = 0

/** Текст для блока быстрого доступа на странице входа */
export const LOGIN_ACCESS_REFERENCE = `Доступ к аккаунтам:
• ${mockUser.email} — пароль Demo-finpair-24
• maria.volkova@yandex.ru — пароль Demo-finpair-24`

/** Подсказка под формой регистрации */
export const REGISTER_INFO_TEXT =
  'После регистрации можно пригласить партнёра по коду из настроек. Профиль создаётся сразу после отправки формы.'

const MOCK_PASSWORD_BY_EMAIL: Record<string, string> = {
  [mockUser.email.toLowerCase()]: 'Demo-finpair-24',
  'maria.volkova@yandex.ru': 'Demo-finpair-24'
}

const MOCK_DISPLAY_NAME_BY_EMAIL: Record<string, string> = {
  [mockUser.email.toLowerCase()]: mockUser.name,
  'maria.volkova@yandex.ru': 'Мария Волкова'
}

export interface MockAuthUser {
  email: string
  displayName: string
}

function shouldSimulateAuthFailure(): boolean {
  return import.meta.env.VITE_SIMULATE_AUTH_ERROR === 'true'
}

function validateMockLogin(payload: {
  email: string
  password: string
}): MockAuthUser {
  const email = payload.email.trim().toLowerCase()
  const expected = MOCK_PASSWORD_BY_EMAIL[email]
  if (!expected || expected !== payload.password) {
    throw new Error(
      'Неверный email или пароль. Проверьте раскладку и Caps Lock.'
    )
  }
  const displayName =
    MOCK_DISPLAY_NAME_BY_EMAIL[email] ??
    (payload.email.trim().split('@')[0] || 'Пользователь')
  return {
    email: payload.email.trim(),
    displayName
  }
}

export async function mockLoginRequest(payload: {
  email: string
  password: string
}): Promise<MockAuthUser> {
  await delay(AUTH_DELAY_MS)
  if (shouldSimulateAuthFailure()) {
    throw new Error('Не удалось войти. Проверьте данные или попробуйте позже.')
  }
  return validateMockLogin(payload)
}

export async function mockRegisterRequest(payload: {
  name: string
  email: string
  password: string
}): Promise<MockAuthUser> {
  await delay(AUTH_DELAY_MS)
  if (shouldSimulateAuthFailure()) {
    throw new Error('Регистрация временно недоступна.')
  }
  const email = payload.email.trim().toLowerCase()
  if (MOCK_PASSWORD_BY_EMAIL[email]) {
    throw new Error(
      'Этот адрес уже зарегистрирован. Войдите с существующим паролем или укажите другой email.'
    )
  }
  return {
    email: payload.email.trim(),
    displayName: payload.name.trim()
  }
}
