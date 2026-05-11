import { apiClient } from './apiClient'

export interface ApiGoal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  /** Остаток с сервера (decimal → JSON); предпочтительнее, чем target − current в JS. */
  remainingAmount?: number
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

export type UpdateGoalPayload = {
  title?: string
  targetAmount?: number
  currentAmount?: number
  monthlyContribution?: number
  deadline?: string
  isShared?: boolean
}

export async function updateGoalRequest(
  goalId: string,
  payload: UpdateGoalPayload
): Promise<ApiGoal> {
  const { data } = await apiClient.patch<ApiResponse<ApiGoal>>(`/goals/${goalId}`, payload)
  return data.data
}

export async function deleteGoalRequest(goalId: string): Promise<void> {
  await apiClient.delete(`/goals/${goalId}`)
}
