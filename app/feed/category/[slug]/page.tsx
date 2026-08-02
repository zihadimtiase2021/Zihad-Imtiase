import { Suspense } from 'react'
import { readFeedData } from '@/lib/data'
import { FeedCategoryClient } from '@/components/feed-category-client'
import { PageShell } from '@/components/page-shell'

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Posts',
  articles: 'Articles',
  testimonials: 'Testimonials',
  projects: 'Projects',
}

export default async function FeedCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  // সরাসরি ডাটাবেস থেকে ডাটা ফেচ
  const data = await readFeedData()
  const allItems = data.items || []
  
  // সার্ভারেই ফিল্টার করে নেওয়া হচ্ছে
  const filteredItems = slug === 'all' ? allItems : allItems.filter((i) => i.category === slug)
  const label = CATEGORY_LABELS[slug] ?? slug

  return (
    <Suspense
      fallback={
        <PageShell>
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse h-28 rounded-2xl bg-muted" />
            ))}
          </div>
        </PageShell>
      }
    >
      <FeedCategoryClient items={filteredItems} label={label} />
    </Suspense>
  )
}
