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
