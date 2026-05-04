import { apiClient } from './apiClient'

export interface AuthUser {
  id: string
  email: string
  emailVerified: boolean
  hasPartner: boolean
  displayName?: string
}

export interface AuthResult {
  user: AuthUser
  accessToken: string
  expiresIn: number
}

export interface RefreshResult {
  accessToken: string
  expiresIn: number
}

interface ApiResponse<T> {
  data: T
  error: null | { code: string; message: string }
  meta: Record<string, unknown>
}

export async function loginRequest(payload: {
  email: string
  password: string
}): Promise<AuthResult> {
  const { data } = await apiClient.post<ApiResponse<AuthResult>>(
    '/auth/login',
    payload
  )
  return data.data
}

export async function registerRequest(payload: {
  email: string
  password: string
  name: string
}): Promise<AuthResult> {
  const { data } = await apiClient.post<ApiResponse<AuthResult>>(
    '/auth/register',
    payload
  )
  return data.data
}

export async function refreshRequest(): Promise<RefreshResult> {
  const { data } = await apiClient.post<ApiResponse<RefreshResult>>(
    '/auth/refresh'
  )
  return data.data
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function getMeRequest(): Promise<AuthUser> {
  const { data } = await apiClient.get<ApiResponse<AuthUser>>('/auth/me')
  return data.data
}
