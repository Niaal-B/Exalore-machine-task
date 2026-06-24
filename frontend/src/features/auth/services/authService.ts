import axios from "axios"

import { apiClient } from "@/lib/api-client"
import { storeTokens } from "@/features/auth/services/authStorage"
import type { LoginCredentials, LoginResponse } from "@/features/auth/types/auth"

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    "/api/auth/token/",
    credentials,
  )
  storeTokens(response.data.access, response.data.refresh)
  return response.data
}

export function loginErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return "An unexpected login error occurred."
  if (!error.response) return "Unable to reach the server. Check your connection."
  if (error.response.status === 401) {
    return "Invalid credentials or administrator access is not permitted."
  }
  return "Unable to sign in. Please try again."
}
