import { Suspense } from 'react'
import { readPortfolioData } from '@/lib/data'
import { PortfolioCategoryClient } from '@/components/portfolio-category-client'
import { PageShell } from '@/components/page-shell'

export default async function PortfolioCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  // সরাসরি ডাটাবেস থেকে ডাটা ফেচ
  const data = await readPortfolioData()
  const allProjects = data.projects || []
  
  // সার্ভারেই ফিল্টার করে নেওয়া হচ্ছে
  const filteredProjects = slug === 'all' ? allProjects : allProjects.filter((p) => p.category === slug)

  return (
    <Suspense
      fallback={
        <PageShell>
          <div className="px-4 py-4 flex flex-col gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse h-40 rounded-2xl bg-muted" />
            ))}
          </div>
        </PageShell>
      }
    >
      <PortfolioCategoryClient projects={filteredProjects} slug={slug} />
    </Suspense>
  )
}
