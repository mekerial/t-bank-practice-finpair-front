import { apiClient } from './apiClient'

export interface ApiTransaction {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description?: string
  title?: string
  date: string
  userId?: string
}

export interface ApiCategory {
  id: string
  name: string
  type: 'income' | 'expense'
}

interface ApiResponse<T> {
  data: T
  error: null | { code: string; message: string }
  meta: Record<string, unknown>
}

interface PagedTransactionsPayload {
  items?: ApiTransaction[]
  Items?: ApiTransaction[]
  pagination?: Record<string, unknown>
  Pagination?: Record<string, unknown>
}

function parseTransactionsPage(
  body: unknown
): { items: ApiTransaction[]; totalPages: number } {
  const empty = { items: [] as ApiTransaction[], totalPages: 1 }

  if (Array.isArray(body)) {
    return { items: body, totalPages: 1 }
  }

  if (!body || typeof body !== 'object') return empty

  const root = body as Record<string, unknown>
  let payload: unknown = root.data ?? root.Data
  if (
    (payload === undefined || payload === null) &&
    (root.items != null || root.Items != null)
  ) {
    payload = root
  }

  if (Array.isArray(payload)) {
    return { items: payload as ApiTransaction[], totalPages: 1 }
  }

  if (!payload || typeof payload !== 'object') return empty

  const p = payload as PagedTransactionsPayload
  const rawItems = p.items ?? p.Items
  const items = Array.isArray(rawItems) ? rawItems : []

  const pagination = (p.pagination ?? p.Pagination) as
    | Record<string, unknown>
    | undefined
  const totalPagesRaw =
    pagination?.totalPages ?? pagination?.TotalPages
  let totalPages = 1
  if (typeof totalPagesRaw === 'number' && Number.isFinite(totalPagesRaw)) {
    totalPages = Math.max(1, Math.floor(totalPagesRaw))
  } else if (typeof totalPagesRaw === 'string' && totalPagesRaw.trim() !== '') {
    const n = Number.parseInt(totalPagesRaw, 10)
    if (Number.isFinite(n)) totalPages = Math.max(1, n)
  }

  return { items, totalPages }
}

export interface CreateTransactionDto {
  type: 'income' | 'expense'
  category: string
  amount: number
  description?: string
  title?: string
  date: string
}

export interface CreateHouseholdTransactionDto {
  householdId: string
  userId: string
  categoryId: string
  type: 'income' | 'expense'
  amount: number
  description?: string
  date: string
}

const FETCH_PAGE_SIZE = 100

/**
 * Загружает все операции пользователя: API отдаёт постранично, фронт запрашивает все страницы.
 * Дальнейшая разбивка по страницам списка — на экране «Транзакции» (клиентская пагинация).
 */
export async function fetchTransactionsRequest(params?: {
  type?: 'income' | 'expense'
}): Promise<ApiTransaction[]> {
  const all: ApiTransaction[] = []
  let page = 1
  let totalPages = 1

  do {
    const { data } = await apiClient.get<unknown>('/transactions', {
      params: {
        page,
        pageSize: FETCH_PAGE_SIZE,
        ...(params?.type ? { type: params.type } : {})
      }
    })

    const { items, totalPages: reportedTotal } = parseTransactionsPage(data)
    all.push(...items)
    totalPages = Math.max(1, reportedTotal)

    if (items.length === 0) {
      break
    }

    page += 1
    if (page > 200) {
      break
    }
  } while (page <= totalPages)

  return all
}

export async function createTransactionRequest(
  dto: CreateTransactionDto
): Promise<ApiTransaction> {
  const { data } = await apiClient.post<ApiResponse<ApiTransaction>>(
    '/transactions',
    dto
  )
  return data.data
}

export async function fetchCategoriesRequest(params?: {
  type?: 'income' | 'expense'
}): Promise<ApiCategory[]> {
  const { data } = await apiClient.get<
    ApiResponse<{ items?: ApiCategory[] } | ApiCategory[]>
  >('/categories', { params })
  const payload = data.data
  if (Array.isArray(payload)) return payload
  return payload.items ?? []
}

export async function createHouseholdTransactionRequest(
  dto: CreateHouseholdTransactionDto
): Promise<ApiTransaction> {
  const { data } = await apiClient.post<ApiTransaction>(
    `/households/${dto.householdId}/transactions`,
    {
      userId: dto.userId,
      categoryId: dto.categoryId,
      type: dto.type,
      amount: dto.amount,
      description: dto.description,
      date: dto.date
    }
  )

  return {
    id: data.id,
    type: data.type,
    category: '',
    amount: data.amount,
    description: data.description,
    date: data.date,
    userId: data.userId
  }
}
