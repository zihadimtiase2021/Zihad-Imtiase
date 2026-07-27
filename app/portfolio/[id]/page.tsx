import type { Metadata } from 'next'
import { readPortfolioData } from '@/lib/data'
import { ProjectDetailClient } from '@/components/project-detail-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const data = await readPortfolioData()
  const project = data.projects.find((p) => p.id === id)
  if (!project) return { title: 'Project not found' }
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://zihadimtiase.com'
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      url: `${base}/portfolio/${id}`,
      ...(project.image ? { images: [{ url: project.image }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
    },
  }
}

export default function ProjectDetailPage() {
  return <ProjectDetailClient />
}
