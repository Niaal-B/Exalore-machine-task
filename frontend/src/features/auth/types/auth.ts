export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  access: string
  refresh: string
  username: string
}

export interface RefreshResponse {
  access: string
}
