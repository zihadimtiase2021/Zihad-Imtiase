'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import { FeedItem } from '@/components/feed-item'

interface FeedItemData {
  id: string
  type: string
  title: string
  excerpt: string
  content: string
  category: string
  image?: string
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

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Posts',
  articles: 'Articles',
  testimonials: 'Testimonials',
  projects: 'Projects',
}

export default function FeedCategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [items, setItems] = useState<FeedItemData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/feed')
        const data = await res.json()
        const all: FeedItemData[] = data.items || []
        setItems(slug === 'all' ? all : all.filter((i) => i.category === slug))
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  const label = CATEGORY_LABELS[slug] ?? slug

  return (
    <PageShell>
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="font-bold text-base text-foreground">{label}</h1>
          <p className="text-xs text-muted-foreground">{items.length} {items.length === 1 ? 'post' : 'posts'}</p>
        </div>
      </div>

      <section>
        {loading ? (
          <div className="flex flex-col gap-3 p-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse h-28 rounded-2xl bg-muted" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <p className="text-sm text-muted-foreground">No posts in this category yet.</p>
          </div>
        ) : (
          items.map((item) => (
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
