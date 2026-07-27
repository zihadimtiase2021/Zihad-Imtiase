import { type NextRequest } from 'next/server'

const SESSION_COOKIE = 'admin_session'

async function sha256(text: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function makeSessionToken(username: string, password: string): Promise<string> {
  const secret = password
  return sha256(`${username}:${password}:${secret}:nextzd-session`)
}

/**
 * Returns true if the request carries a valid admin session cookie.
 * Used to guard all mutating admin API routes.
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE)
  if (!sessionCookie?.value) return false

  const envUsername = process.env.ADMIN_USERNAME ?? ''
  const envPassword = process.env.ADMIN_PASSWORD ?? ''
  if (!envUsername || !envPassword) return false

  try {
    const expected = await makeSessionToken(envUsername, envPassword)
    return sessionCookie.value === expected
  } catch {
    return false
  }
}
