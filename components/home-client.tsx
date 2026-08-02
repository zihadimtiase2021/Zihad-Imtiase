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

  // Read active filter from URL search param ?cat=, fallback to 'all'
  const activeFilter = searchParams.get('cat') ?? 'all'

  const filteredItems =
    activeFilter === 'all'
      ? initialItems
      : initialItems.filter((item) => item.category === activeFilter)

  function handleFilterChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('cat')
    } else {
      params.set('cat', value)
    }
    const newUrl = params.size > 0 ? `/?${params.toString()}` : '/'
    router.replace(newUrl, { scroll: false })
  }

  return (
    <PageShell>
      <ProfileHero
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        heroData={heroData}
        contactData={contactData}
      />

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
              type={item.type as 'article' | 'testimonial' | 'project'}
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
            />
          ))
        )}
      </section>
    </PageShell>
  )
}
