import { apiClient } from './apiClient'

interface ApiResponse<T> {
  data: T
  error: null | { code: string; message: string }
  meta: Record<string, unknown>
}

interface ItemsResponse<T> {
  items: T[]
}

interface FaqItemDto {
  id: string
  question: string
  answer: string
}

interface ContactsDto {
  email: string
  telegram: string
}

export interface SupportFaqItem {
  id: string
  question: string
  answer: string
}

export interface SupportContacts {
  email: string
  telegram: string
}

export interface SupportChatResponse {
  outputText: string
}

const FAQ_TRANSLATIONS: Record<string, { question: string; answer: string }> = {
  'how to connect partner': {
    question: 'Как подключить партнёра?',
    answer:
      'Откройте раздел «Настройки», нажмите «Создать пару», отправьте партнёру код приглашения. Партнёр регистрируется, входит в аккаунт и подключается по этому коду.'
  },
  'how to add transaction': {
    question: 'Как добавить транзакцию?',
    answer:
      'Перейдите в раздел «Транзакции», нажмите «Добавить», выберите тип операции, категорию, сумму и сохраните.'
  },
  'how to create goal': {
    question: 'Как создать финансовую цель?',
    answer:
      'Откройте раздел «Цели», нажмите «Создать цель», укажите название, целевую сумму и срок, затем сохраните.'
  },
  'how is financial load calculated': {
    question: 'Как считается финансовая нагрузка?',
    answer:
      'Показатель рассчитывается на основе ваших доходов и расходов за выбранный период и показывает, какая доля бюджета уходит на траты.'
  },
  'how do i invite a partner?': {
    question: 'Как пригласить партнёра?',
    answer:
      'Откройте «Настройки», создайте пару и отправьте партнёру код приглашения. После регистрации и входа партнёр вводит код и подключается.'
  },
  'can goals be shared?': {
    question: 'Можно ли делиться целями с партнёром?',
    answer:
      'Да. Цели в паре общие: оба партнёра видят прогресс и могут вносить вклад в достижение.'
  }
}

const DEFAULT_RU_FAQ: SupportFaqItem[] = [
  {
    id: 'connect-partner',
    question: 'Как подключить партнёра?',
    answer:
      'В «Настройках» нажмите «Создать пару», скопируйте код приглашения и отправьте его партнёру. Партнёру нужно зарегистрироваться, войти в аккаунт и подключиться по коду.'
  },
  {
    id: 'analytics-empty',
    question: 'Почему в аналитике могут быть пустые графики?',
    answer:
      'Графики строятся по операциям из базы данных. Если операций пока нет, сначала добавьте несколько транзакций в разделе «Транзакции».'
  },
  {
    id: 'registration-and-login',
    question: 'Почему после регистрации нужно входить отдельно?',
    answer:
      'В приложении сценарий такой: сначала регистрация, затем вход. После создания аккаунта выполните вход на странице авторизации.'
  },
  {
    id: 'invite-code-where',
    question: 'Где найти код приглашения для партнёра?',
    answer:
      'Код приглашения в разделе «Настройки», в блоке подключения партнёра. Его можно скопировать и отправить партнёру.'
  },
  {
    id: 'refresh-invite-code',
    question: 'Можно ли обновить код приглашения?',
    answer:
      'Да, в «Настройках» есть кнопка «Обновить код». После обновления старый код лучше не использовать.'
  },
  {
    id: 'partner-not-joined',
    question: 'Что делать, если партнёр не может подключиться?',
    answer:
      'Проверьте, что партнёр уже зарегистрирован и вошёл в аккаунт. Убедитесь, что код приглашения введён без ошибок и лишних пробелов.'
  },
  {
    id: 'who-can-edit-what',
    question: 'Кто может редактировать данные в паре?',
    answer:
      'Каждый партнёр может менять только свои личные данные (например, свой доход). Общие параметры пары видны обоим.'
  }
]

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function isLikelyEnglish(value: string): boolean {
  return /[a-z]/i.test(value)
}

function translateByPattern(item: FaqItemDto): SupportFaqItem | null {
  const key = normalizeText(item.question)

  if (key.includes('invite') && key.includes('partner')) {
    return {
      id: item.id,
      question: 'Как пригласить партнёра?',
      answer:
        'Откройте «Настройки», создайте пару и отправьте партнёру код приглашения. После регистрации и входа партнёр вводит код и подключается.'
    }
  }

  if (key.includes('financial load') || (key.includes('load') && key.includes('calculate'))) {
    return {
      id: item.id,
      question: 'Как считается финансовая нагрузка?',
      answer:
        'Показатель рассчитывается на основе ваших доходов и расходов за выбранный период и показывает, какая доля бюджета уходит на траты.'
    }
  }

  if (key.includes('goal') && (key.includes('share') || key.includes('shared'))) {
    return {
      id: item.id,
      question: 'Можно ли делиться целями с партнёром?',
      answer:
        'Да. Цели в паре общие: оба партнёра видят прогресс и могут вносить вклад в достижение.'
    }
  }

  if (key.includes('transaction') && (key.includes('add') || key.includes('create'))) {
    return {
      id: item.id,
      question: 'Как добавить транзакцию?',
      answer:
        'Перейдите в раздел «Транзакции», нажмите «Добавить», выберите тип операции, категорию, сумму и сохраните.'
    }
  }

  return null
}

function maybeTranslateFaq(item: FaqItemDto): SupportFaqItem {
  const key = normalizeText(item.question)
  const translated = FAQ_TRANSLATIONS[key]
  if (translated) {
    return {
      id: item.id,
      question: translated.question,
      answer: translated.answer
    }
  }

  const patternTranslated = translateByPattern(item)
  if (patternTranslated) {
    return patternTranslated
  }

  if (isLikelyEnglish(item.question) || isLikelyEnglish(item.answer)) {
    return {
      id: item.id,
      question: 'Как пользоваться этой функцией?',
      answer:
        'Этот вопрос относится к работе FinPair. Напишите в чат поддержки на этой странице, и мы поможем с подробной инструкцией.'
    }
  }

  return {
    id: item.id,
    question: item.question?.trim() || 'Вопрос',
    answer: item.answer?.trim() || 'Ответ появится позже.'
  }
}

export async function fetchSupportFaqRequest(): Promise<SupportFaqItem[]> {
  const { data } = await apiClient.get<ApiResponse<ItemsResponse<FaqItemDto>>>(
    '/support/faq'
  )
  const items = data.data.items ?? []
  const localized = items.map(maybeTranslateFaq)

  if (localized.length === 0) {
    return DEFAULT_RU_FAQ
  }

  // Объединяем FAQ с бэка и локальный расширенный FAQ, чтобы
  // пользователь всегда видел полный русскоязычный список.
  const merged = [...localized]
  const seenQuestions = new Set(
    localized.map((item) => normalizeText(item.question))
  )

  for (const fallbackItem of DEFAULT_RU_FAQ) {
    const key = normalizeText(fallbackItem.question)
    if (!seenQuestions.has(key)) {
      merged.push(fallbackItem)
      seenQuestions.add(key)
    }
  }

  return merged.slice(0, 6)
}

export async function fetchSupportContactsRequest(): Promise<SupportContacts> {
  const { data } = await apiClient.get<ApiResponse<ContactsDto>>(
    '/support/contacts'
  )
  return data.data
}

export async function sendSupportChatMessageRequest(payload: {
  message: string
}): Promise<SupportChatResponse> {
  const { data } = await apiClient.post<ApiResponse<SupportChatResponse>>(
    '/support/chat',
    payload
  )
  return data.data
}