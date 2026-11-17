import { api, ApiError } from './api'

export type CurrentAccount = {
  id: string
  email: string
  username: string
  displayName: string | null
  name: string
}

export async function accountStatus(): Promise<{ account: CurrentAccount; adultConfirmed: boolean }> {
  const [account, adult] = await Promise.all([
    api<CurrentAccount>('/api/auth/profile'),
    api<{ confirmed: boolean }>('/api/auth/adult-confirmation'),
  ])
  return { account, adultConfirmed: adult.confirmed }
}

export const accountAuth = {
  signIn: (identifier: string, password: string) =>
    api('/api/auth/signin', { method: 'POST', body: JSON.stringify({ identifier: identifier.trim(), password }) }),
  signUp: (username: string, email: string, password: string) =>
    api('/api/auth/signup', { method: 'POST', body: JSON.stringify({ username: username.trim(), email: email.trim(), password }) }),
  confirmAdult: () => api<{ confirmed: boolean }>('/api/auth/adult-confirmation', { method: 'POST' }),
  signOut: () => api<{ success: boolean }>('/api/auth/signout', { method: 'POST' }),
  deleteAccount: (password: string) => api<{ success: boolean }>('/api/auth/account', { method: 'DELETE', body: JSON.stringify({ password }) }),
}

export function isAuthFailure(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401
}
