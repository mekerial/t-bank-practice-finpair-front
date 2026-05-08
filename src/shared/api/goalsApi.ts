import { apiClient } from './apiClient'

export interface ApiGoal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline?: string
  monthlyContribution?: number
  isShared?: boolean
  isCompleted?: boolean
}

interface ApiResponse<T> {
  data: T
  error: null | { code: string; message: string }
  meta: Record<string, unknown>
}

interface ItemsResponse<T> {
  items: T[]
}

export interface CreateGoalDto {
  title: string
  targetAmount: number
  currentAmount?: number
  deadline?: string
  monthlyContribution?: number
  isShared?: boolean
}

export async function fetchGoalsRequest(): Promise<ApiGoal[]> {
  const { data } = await apiClient.get<
    ApiResponse<ApiGoal[] | ItemsResponse<ApiGoal>> | ApiGoal[]
  >('/goals')

  if (Array.isArray(data)) return data
  const payload = data.data
  if (Array.isArray(payload)) return payload
  return payload.items ?? []
}

export async function createGoalRequest(dto: CreateGoalDto): Promise<ApiGoal> {
  const { data } = await apiClient.post<ApiResponse<ApiGoal>>('/goals', dto)
  return data.data
}
