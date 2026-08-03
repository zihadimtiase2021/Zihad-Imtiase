import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { readFeedData, readPortfolioData } from '@/lib/data'
import { FeedDetailClient } from '@/components/feed-detail-client'
import type { FeedItem, Project } from '@/lib/types'

// Allow Next.js router cache to serve this page without re-fetching
// on repeated navigations. Revalidate every 60 seconds in the background.
export const revalidate = 60

export async function generateStaticParams() {
  const data = await readFeedData()
  return data.items.map((item) => ({ id: item.id }))
}

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

export default async function FeedDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [feedData, portfolioData] = await Promise.all([
    readFeedData(),
    readPortfolioData(),
  ])

  const item = feedData.items.find((i) => i.id === id) as FeedItem | undefined
  if (!item) notFound()

  let linkedProject: Project | null = null
  let relatedProjects: Project[] = []

  if (item.linkedProjectId) {
    linkedProject =
      portfolioData.projects.find((p) => p.id === item.linkedProjectId) ?? null

    if (linkedProject) {
      relatedProjects = portfolioData.projects.filter(
        (p) => p.category === linkedProject!.category && p.id !== linkedProject!.id,
      )
    }
  }

  return (
    <FeedDetailClient
      initialItem={item}
      initialLinkedProject={linkedProject}
      initialRelatedProjects={relatedProjects}
    />
  )
}
