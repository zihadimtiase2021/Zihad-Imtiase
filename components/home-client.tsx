'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { PageShell } from '@/components/page-shell'
import { ProfileHero, type HeroData, type ContactData } from '@/components/profile-hero'
import { FeedItem } from '@/components/feed-item'
import type { FeedItem as FeedItemType } from '@/lib/data'

interface HomeClientProps {
  initialItems: FeedItemType[]
  heroData: HeroData
  contactData?: ContactData
}

export function HomeClient({ initialItems, heroData, contactData = {} }: HomeClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // ?cat= drives the top-level tab (all | testimonials | projects)
  // ?sub= drives the project sub-category filter (only active when cat=projects)
  const activeFilter = searchParams.get('cat') ?? 'all'
  const activeSub = searchParams.get('sub') ?? 'all'

  // Determine items shown in the current tab
  const tabItems = (() => {
    let filtered: FeedItemType[]
    if (activeFilter === 'all') {
      filtered = initialItems
    } else if (activeFilter === 'projects') {
      filtered = initialItems.filter(
        (item) => item.type === 'project' || item.category === 'projects',
      )
    } else {
      filtered = initialItems.filter((item) => item.category === activeFilter)
    }
    // Pinned posts always appear first
    return [...filtered].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return 0
    })
  })()

  // Sub-category chips — only shown in Projects tab
  const projectSubCategories = (() => {
    if (activeFilter !== 'projects') return []
    const cats = new Set<string>()
    tabItems.forEach((item) => {
      // linkedProjectId items carry the portfolio category in their category field value
      // We derive sub-cats from the category field (e.g. 'development', 'webflow', etc.)
      // excluding the generic 'projects' bucket itself
      if (item.category && item.category !== 'projects') cats.add(item.category)
    })
    return Array.from(cats)
  })()

  // Apply sub-category filter on top of the projects tab
  const filteredItems = (() => {
    if (activeFilter !== 'projects' || activeSub === 'all') return tabItems
    return tabItems.filter((item) => item.category === activeSub)
  })()

  function handleFilterChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('cat')
    } else {
      params.set('cat', value)
    }
    params.delete('sub')
    const newUrl = params.size > 0 ? `/?${params.toString()}` : '/'
    router.replace(newUrl, { scroll: false })
  }

  function handleSubChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('sub')
    } else {
      params.set('sub', value)
    }
    router.replace(`/?${params.toString()}`, { scroll: false })
  }

  return (
    <PageShell>
      <ProfileHero
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        heroData={heroData}
        contactData={contactData}
      />

      {/* Project sub-category filter strip */}
      {activeFilter === 'projects' && projectSubCategories.length > 0 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none border-b border-border">
          {['all', ...projectSubCategories].map((sub) => {
            const active = activeSub === sub
            return (
              <button
                key={sub}
                onClick={() => handleSubChange(sub)}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border"
                style={
                  active
                    ? { backgroundColor: '#9db8e820', color: '#9db8e8', borderColor: '#9db8e840' }
                    : { backgroundColor: 'transparent', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }
                }
              >
                {sub === 'all' ? 'All Projects' : sub}
              </button>
            )
          })}
        </div>
      )}

      <section aria-label="Feed">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl">📭</span>
            </div>
            <p className="text-sm text-muted-foreground">No posts in this category yet.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <FeedItem
              key={item.id}
              id={item.id}
              type={item.type as 'testimonial' | 'project' | 'post'}
              title={item.title}
              body={item.type === 'testimonial' ? item.content : item.excerpt}
              author={item.type === 'testimonial' ? (item.clientName ?? item.author) : item.author}
              authorRole={item.type === 'testimonial' ? item.clientRole : undefined}
              date={item.date}
              initialLikes={item.likes}
              replies={item.replies}
              rating={item.rating}
              image={item.image}
              media={item.media}
              clientImage={item.clientImage}
              projectTech={item.tech}
              projectLink={item.link}
              linkedProjectId={item.linkedProjectId}
              pinned={item.pinned}
            />
          ))
        )}
      </section>
    </PageShell>
  )
}
