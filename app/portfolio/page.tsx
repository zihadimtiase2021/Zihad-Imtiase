import { Suspense } from 'react'
import { PageShell } from '@/components/page-shell'
import { readPortfolioData } from '@/lib/data'
import { PortfolioClient } from '@/components/portfolio-client'

export default async function PortfolioPage() {
  const data = await readPortfolioData()
  const projects = data.projects || []
  
  // ক্যাটাগরিগুলো সার্ভারেই প্রসেস করে নেওয়া হচ্ছে
  const uniqueCategories = [
    ...new Set(projects.map((p) => p.category)),
  ] as string[]
  const categories = ['all', ...uniqueCategories]

  return (
    <Suspense
      fallback={
        <PageShell>
           <div className="p-4 space-y-4">
             {[1, 2, 3].map((n) => (
               <div key={n} className="animate-pulse h-40 rounded-2xl bg-muted" />
             ))}
           </div>
        </PageShell>
      }
    >
      <PortfolioClient initialProjects={projects} categories={categories} />
    </Suspense>
  )
}
