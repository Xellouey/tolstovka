import { cookies } from 'next/headers'

const sessions = new Set<string>()
let ADMIN_USER = process.env.ADMIN_USER || 'admin'
let ADMIN_PASS = process.env.ADMIN_PASS || 'admin'

function randomToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
}

export function isAdmin(): boolean {
  const token = cookies().get('admin_session')?.value
  return !!(token && sessions.has(token))
}

export function requireAdminOrThrow() {
  if (!isAdmin()) {
    const err = new Error('Unauthorized')
    // @ts-expect-error custom status
    err.status = 401
    throw err
  }
}

export function login(username: string, password: string): { ok: boolean; token?: string } {
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = randomToken()
    sessions.add(token)
    cookies().set('admin_session', token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' })
    return { ok: true, token }
  }
  return { ok: false }
}

export function logout() {
  const token = cookies().get('admin_session')?.value
  if (token) sessions.delete(token)
  cookies().set('admin_session', '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
}

export function getAdminUsername() {
  return ADMIN_USER
}

export function updateAdminCredentials(username: string, password: string) {
  ADMIN_USER = username || ADMIN_USER
  ADMIN_PASS = password || ADMIN_PASS
}