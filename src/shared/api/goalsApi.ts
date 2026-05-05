import { apiClient } from './apiClient'

export interface ApiGoal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline?: string
  monthlyContribution?: number
  isCompleted?: boolean
}

interface ApiResponse<T> {
  data: T
  error: null | { code: string; message: string }
  meta: Record<string, unknown>
}

export interface CreateGoalDto {
  title: string
  targetAmount: number
  currentAmount?: number
  deadline?: string
  monthlyContribution?: number
}

export async function fetchGoalsRequest(): Promise<ApiGoal[]> {
  const { data } = await apiClient.get<
    ApiResponse<ApiGoal[]> | ApiGoal[]
  >('/goals')

  if (Array.isArray(data)) return data
  const payload = (data as ApiResponse<ApiGoal[]>).data
  return Array.isArray(payload) ? payload : []
}

export async function createGoalRequest(dto: CreateGoalDto): Promise<ApiGoal> {
  const { data } = await apiClient.post<ApiResponse<ApiGoal>>('/goals', dto)
  return data.data
}
