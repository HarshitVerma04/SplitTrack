import type { AuthResponse, AuthUser } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const hasBody = init.body !== undefined && init.body !== null
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    let message = 'Request failed'
    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) {
        message = body.message
      }
    } catch {
      // Ignore non-json bodies and use fallback message.
    }
    throw new Error(message)
  }

  return (await response.json()) as T
}

export async function signup(payload: { name: string; email: string; password: string }): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function login(payload: { email: string; password: string }): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function refresh(payload: { refreshToken: string }): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function me(accessToken: string): Promise<AuthUser> {
  return request<AuthUser>('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export async function updateMe(accessToken: string, payload: { name: string }): Promise<AuthUser> {
  return request<AuthUser>('/auth/me', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  })
}
