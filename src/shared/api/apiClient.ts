import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '../config/env'

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return config
})

let isRefreshing = false
let refreshQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processRefreshQueue(token: string | null, error: unknown) {
  refreshQueue.forEach((item) => {
    if (token) {
      item.resolve(token)
    } else {
      item.reject(error)
    }
  })
  refreshQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    const is401 = error.response?.status === 401
    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh')
    const alreadyRetried = originalRequest._retry

    if (!is401 || isRefreshEndpoint || alreadyRetried) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject })
      }).then((newToken) => {
        originalRequest._retry = true
        originalRequest.headers.set('Authorization', `Bearer ${newToken}`)
        return apiClient(originalRequest)
      })
    }

    isRefreshing = true
    originalRequest._retry = true

    try {
      const { data } = await apiClient.post<{
        data: { accessToken: string; expiresIn: number }
      }>('/auth/refresh')

      const newToken = data.data.accessToken
      setAccessToken(newToken)
      processRefreshQueue(newToken, null)

      originalRequest.headers.set('Authorization', `Bearer ${newToken}`)
      return apiClient(originalRequest)
    } catch (refreshError) {
      setAccessToken(null)
      processRefreshQueue(null, refreshError)
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)
