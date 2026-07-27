import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// SHA-256 hash of a string using the Web Crypto API (available in Edge + Node)
async function sha256(text: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Constant-time string comparison to prevent timing attacks
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

const SESSION_COOKIE = 'admin_session'
// Simple token: SHA-256(username + password + secret)
async function makeSessionToken(username: string, password: string): Promise<string> {
  const secret = process.env.ADMIN_PASSWORD ?? 'fallback-secret'
  return sha256(`${username}:${password}:${secret}:nextzd-session`)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body as { username?: string; password?: string }

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    const envUsername = process.env.ADMIN_USERNAME ?? ''
    const envPassword = process.env.ADMIN_PASSWORD ?? ''

    if (!envUsername || !envPassword) {
      return NextResponse.json(
        { error: 'Admin credentials not configured on the server' },
        { status: 500 }
      )
    }

    const usernameMatch = safeEqual(username.trim(), envUsername.trim())
    const passwordMatch = safeEqual(password, envPassword)

    if (!usernameMatch || !passwordMatch) {
      // Artificial delay to further deter brute force
      await new Promise((r) => setTimeout(r, 500))
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    const token = await makeSessionToken(envUsername, envPassword)

    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Non-HttpOnly hint cookie so the client nav can read it synchronously
    // without a network round-trip. Security still relies solely on the
    // HttpOnly session cookie above — this is just a UI signal.
    cookieStore.set('admin_hint', '1', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // same lifetime as session
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
