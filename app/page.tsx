'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PageShell } from '@/components/page-shell'
import { ProfileHero, type HeroData } from '@/components/profile-hero'
import { FeedItem } from '@/components/feed-item'

interface FeedItemData {
  id: string
  type: string
  title: string
  excerpt: string
  content: string
  category: string
  image?: string
  media?: string[]
  author: string
  clientName?: string
  clientRole?: string
  clientImage?: string
  date: string
  likes: number
  replies: number
  rating?: number
  tech?: string[]
  link?: string
  featured?: boolean
  linkedProjectId?: string
}

function HomePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [items, setItems] = useState<FeedItemData[]>([])
  const [loading, setLoading] = useState(true)
  
  // পুরো ডায়নামিক প্রোফাইল ডেটা ধরে রাখার জন্য স্টেট
  const [heroData, setHeroData] = useState<HeroData>({})

  // Read active filter from URL search param ?cat=, fallback to 'all'
  const activeFilter = searchParams.get('cat') ?? 'all'

  const filteredItems =
    activeFilter === 'all' ? items : items.filter((item) => item.category === activeFilter)

  useEffect(() => {
    async function fetchFeedItems() {
      try {
        const res = await fetch('/api/feed')
        const data = await res.json()
        setItems(data.items || [])
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }

    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings')
        const data = await res.json()
        // ডেটাবেস থেকে আসা পুরো hero অবজেক্টটি স্টেটে সেভ করা হচ্ছে
        setHeroData(data?.hero ?? {})
      } catch { 
        /* non-critical */ 
      }
    }

    fetchFeedItems()
    fetchSettings()
  }, [])

  function handleFilterChange(value: string) {
    // Update the URL search param without navigating away — purely visual filtering
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
      {/* Profile hero এখন পুরো heroData অবজেক্টটি ডায়নামিক্যালি রিসিভ করছে */}
      <ProfileHero
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        heroData={heroData}
      />

      {/* Feed */}
      <section aria-label="Feed">
        {loading ? (
          <div className="flex flex-col gap-3 p-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse rounded-2xl bg-muted h-32" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
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

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <PageShell>
          <div className="p-4 space-y-4">
            <div className="animate-pulse rounded-2xl bg-muted h-64 w-full" />
            <div className="animate-pulse rounded-2xl bg-muted h-32 w-full" />
          </div>
        </PageShell>
      }
    >
      <HomePageInner />
    </Suspense>
  )
}
