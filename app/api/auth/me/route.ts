import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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

export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE)

    if (!sessionCookie?.value) {
      return NextResponse.json({ authenticated: false })
    }

    const envUsername = process.env.ADMIN_USERNAME ?? ''
    const envPassword = process.env.ADMIN_PASSWORD ?? ''

    if (!envUsername || !envPassword) {
      return NextResponse.json({ authenticated: false })
    }

    const expectedToken = await makeSessionToken(envUsername, envPassword)

    if (sessionCookie.value === expectedToken) {
      return NextResponse.json({ authenticated: true })
    }

    return NextResponse.json({ authenticated: false })
  } catch {
    return NextResponse.json({ authenticated: false })
  }
}
