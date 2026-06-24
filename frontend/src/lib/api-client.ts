import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
} from "@/features/auth/services/authStorage"
import type { RefreshResponse } from "@/features/auth/types/auth"

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  timeout: 15_000,
  headers: {
    Accept: "application/json",
  },
})

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean }
let refreshRequest: Promise<string> | null = null

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken()
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken()
  if (!refresh) throw new Error("No refresh token is available.")

  const response = await axios.post<RefreshResponse>(
    "/api/auth/token/refresh/",
    { refresh },
    { baseURL: import.meta.env.VITE_API_BASE_URL || "" },
  )
  updateAccessToken(response.data.access)
  return response.data.access
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryableRequest | undefined
    const isAuthRequest = request?.url?.includes("/api/auth/token/")
    if (error.response?.status !== 401 || !request || request._retry || isAuthRequest) {
      return Promise.reject(error)
    }

    request._retry = true
    try {
      refreshRequest ??= refreshAccessToken().finally(() => {
        refreshRequest = null
      })
      const access = await refreshRequest
      request.headers.Authorization = `Bearer ${access}`
      return apiClient(request)
    } catch (refreshError: unknown) {
      clearTokens()
      if (window.location.pathname !== "/login") window.location.assign("/login")
      return Promise.reject(refreshError)
    }
  },
)
