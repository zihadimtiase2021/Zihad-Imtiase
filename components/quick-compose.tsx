'use client'

import { useState, useEffect } from 'react'
import { PenLine } from 'lucide-react'
import { NewPostComposer } from '@/components/admin/new-post-composer'

/**
 * QuickCompose
 * ─────────────────────────────────────────────────────────────────────────────
 * Floating action button visible to authenticated admins site-wide.
 * All creation logic (post / testimonial / project) is handled by
 * NewPostComposer in floatingMode, keeping this component minimal.
 */
export function QuickCompose() {
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    fetch('/api/auth/status')
      .then((res) => res.json())
      .then((data) => setIsAuth(data.authenticated))
      .catch(() => setIsAuth(false))
  }, [])

  if (!isAuth) return null

  return (
    <div className="fixed bottom-24 right-5 md:bottom-28 md:right-8 z-40">
      <NewPostComposer
        floatingMode
        trigger={
          <button
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-[0_8px_30px_rgba(244,162,149,0.3)] hover:shadow-[0_8px_30px_rgba(244,162,149,0.5)]"
            style={{ backgroundColor: '#f4a295', color: '#1a1a1a' }}
            aria-label="Create Post"
          >
            <PenLine size={24} strokeWidth={2.5} />
          </button>
        }
        onSuccess={() => {
          // Reload the current page to reflect new content everywhere
          window.location.reload()
        }}
      />
    </div>
  )
}
