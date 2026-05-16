import { apiClient } from './apiClient'
import axios from 'axios'

interface ApiResponse<T> {
  data: T
  error: null | { code: string; message: string }
  meta: Record<string, unknown>
}

export interface UserProfile {
  id: string
  email: string
  name?: string
  income: number
}

export interface CoupleMember {
  userId: string
  role: string
  email: string
  name: string
}

export interface CoupleDetails {
  id: string
  inviteCode: string
  currency: 'RUB' | 'USD' | 'EUR'
  splitType: 'equal' | 'income' | 'income_ratio' | 'custom'
  notifications: Record<string, boolean>
  members: CoupleMember[]
  users?: CoupleMember[]
}

export interface SettingsResult {
  currency: 'RUB' | 'USD' | 'EUR'
  notifications: Record<string, boolean>
}

export async function fetchUserProfileRequest(): Promise<UserProfile> {
  const { data } = await apiClient.get<ApiResponse<UserProfile>>('/users/me')
  return data.data
}

export async function updateUserProfileRequest(payload: {
  income?: number
  name?: string
}): Promise<UserProfile> {
  const { data } = await apiClient.patch<ApiResponse<UserProfile>>('/users/me', payload)
  return data.data
}

export async function updateUserIncomeRequest(income: number): Promise<void> {
  await updateUserProfileRequest({ income })
}

export async function fetchSettingsRequest(): Promise<SettingsResult> {
  try {
    const { data } = await apiClient.get<ApiResponse<SettingsResult>>('/settings')
    return data.data
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      return {
        currency: 'RUB',
        notifications: {
          newTransactions: true,
          goalsProgress: true,
          monthlyReports: false
        }
      }
    }
    throw e
  }
}

export async function updateSettingsRequest(payload: {
  currency?: 'RUB' | 'USD' | 'EUR'
  notifications?: Record<string, boolean>
}): Promise<void> {
  await apiClient.patch('/settings', payload)
}

export async function fetchCoupleRequest(): Promise<CoupleDetails> {
  const { data } = await apiClient.get<ApiResponse<CoupleDetails>>('/couple')
  const d = data.data
  const asRecord = d as unknown as Record<string, unknown>
  const invite =
    (typeof d.inviteCode === 'string' ? d.inviteCode : '') ||
    (typeof asRecord.InviteCode === 'string' ? asRecord.InviteCode : '') ||
    ''
  return {
    ...d,
    inviteCode: invite,
    members: d.members?.length ? d.members : d.users ?? [],
    users: d.users?.length ? d.users : d.members ?? []
  }
}

export async function updateCoupleSettingsRequest(payload: {
  splitType?: 'equal' | 'income' | 'income_ratio' | 'custom'
  currency?: 'RUB' | 'USD' | 'EUR'
  notifications?: Record<string, boolean>
}): Promise<void> {
  await apiClient.patch('/couple/settings', payload)
}

export async function regenerateInviteCodeRequest(): Promise<string> {
  const { data } = await apiClient.post<ApiResponse<{ inviteCode: string }>>(
    '/couple/invite-code/regenerate'
  )
  return data.data.inviteCode
}

export interface CreateCoupleResponse {
  coupleId: string
  inviteCode: string
}

export async function createCoupleRequest(): Promise<CreateCoupleResponse | undefined> {
  const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>('/couple/create')
  const payload = data?.data
  if (!payload || typeof payload !== 'object') return undefined
  const inviteCode =
    typeof payload.inviteCode === 'string'
      ? payload.inviteCode
      : typeof payload.InviteCode === 'string'
        ? payload.InviteCode
        : ''
  const coupleId =
    typeof payload.coupleId === 'string'
      ? payload.coupleId
      : typeof payload.CoupleId === 'string'
        ? payload.CoupleId
        : ''
  if (!inviteCode.trim() && !coupleId.trim()) return undefined
  return { coupleId, inviteCode }
}

export async function joinCoupleRequest(inviteCode: string): Promise<void> {
  await apiClient.post('/couple/join', { inviteCode })
}
