import type { Metadata } from 'next'
import { readFeedData } from '@/lib/data'
import { FeedDetailClient } from '@/components/feed-detail-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const data = await readFeedData()
  const item = data.items.find((i) => i.id === id)
  if (!item) return { title: 'Post not found' }
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://zihadimtiase.com'
  return {
    title: item.title,
    description: item.excerpt,
    openGraph: {
      title: item.title,
      description: item.excerpt,
      url: `${base}/feed/${id}`,
      ...(item.image ? { images: [{ url: item.image }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: item.excerpt,
    },
  }
}

export default function FeedDetailPage() {
  return <FeedDetailClient />
}
