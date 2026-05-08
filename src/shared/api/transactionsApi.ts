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

interface TransactionListResponse {
  items: ApiTransaction[]
  total?: number
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

export async function fetchTransactionsRequest(params?: {
  type?: 'income' | 'expense'
  page?: number
  pageSize?: number
}): Promise<ApiTransaction[]> {
  const { data } = await apiClient.get<
    ApiResponse<TransactionListResponse> | ApiTransaction[]
  >('/transactions', { params })

  if (Array.isArray(data)) {
    return data
  }

  const payload = (data as ApiResponse<TransactionListResponse>).data
  if (Array.isArray(payload)) return payload
  return payload.items ?? []
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
