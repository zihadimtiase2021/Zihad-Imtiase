import { NextRequest, NextResponse } from 'next/server'
import { makeSessionToken, safeEqual, SESSION_COOKIE } from '@/lib/auth'

const LOGIN_PAGE = '/login'

// ✅ এখানে ফাংশনের নাম middleware থেকে পরিবর্তন করে proxy করা হয়েছে
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE)

  if (!sessionCookie?.value) {
    const loginUrl = new URL(LOGIN_PAGE, request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const envUsername = process.env.ADMIN_USERNAME ?? ''
  const envPassword = process.env.ADMIN_PASSWORD ?? ''

  // If credentials are not yet configured, allow through to avoid lockout
  if (!envUsername || !envPassword) {
    return NextResponse.next()
  }

  try {
    const expectedToken = await makeSessionToken(envUsername, envPassword)
    if (!safeEqual(sessionCookie.value, expectedToken)) {
      const loginUrl = new URL(LOGIN_PAGE, request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  } catch {
    const loginUrl = new URL(LOGIN_PAGE, request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
