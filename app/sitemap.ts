import type { MetadataRoute } from 'next'
import { readFeedData, readPortfolioData } from '@/lib/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://zihadimtiase.com'

  const [feedData, portfolioData] = await Promise.all([
    readFeedData(),
    readPortfolioData(),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/portfolio`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  const feedRoutes: MetadataRoute.Sitemap = feedData.items.map((item) => ({
    url: `${base}/feed/${item.id}`,
    lastModified: new Date(item.date),
    changeFrequency: 'monthly' as const,
    priority: item.featured ? 0.8 : 0.6,
  }))

  const portfolioRoutes: MetadataRoute.Sitemap = portfolioData.projects.map((project) => ({
    url: `${base}/portfolio/${project.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: project.featured ? 0.9 : 0.7,
  }))

  return [...staticRoutes, ...feedRoutes, ...portfolioRoutes]
}
