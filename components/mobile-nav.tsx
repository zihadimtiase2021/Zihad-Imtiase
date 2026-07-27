'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, Briefcase, Mail, Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

const PUBLIC_NAV = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'About', href: '/about', icon: User },
  { label: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { label: 'Contact', href: '/contact', icon: Mail },
]

function readAdminHint(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some((c) => c.trim().startsWith('admin_hint=1'))
}

export function MobileNav() {
  const pathname = usePathname()
  
  // হাইড্রেশন মিসম্যাচ রোখার জন্য isMounted স্টেট
  const [isMounted, setIsMounted] = useState(false)
  // Initialise synchronously from the hint cookie — no flash on navigation
  const [isAdmin, setIsAdmin] = useState<boolean>(() => readAdminHint())

  useEffect(() => {
    setIsMounted(true)

    // One-time integrity check against the real session on mount only
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.authenticated === true))
      .catch(() => setIsAdmin(readAdminHint()))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally no pathname dep — hint cookie handles route changes

  const navItems = isMounted && isAdmin
    ? [...PUBLIC_NAV, { label: 'Admin', href: '/admin', icon: Database }]
    : PUBLIC_NAV

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active =
            href === '/'
              ? pathname === '/'
              : href === '/admin'
              ? pathname.startsWith('/admin')
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all',
                active ? 'text-brand' : 'text-muted-foreground'
              )}
              style={active ? { color: '#f4a295' } : {}}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}