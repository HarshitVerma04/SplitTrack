export type Role = 'ROLE_OWNER' | 'ROLE_MEMBER'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: AuthUser
}
