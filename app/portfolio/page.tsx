'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { ExternalLink, Code, TrendingUp } from 'lucide-react'

interface Project {
  id: string
  title: string
  category: string
  description: string
  tech: string[]
  results: Record<string, string>
  link?: string
  github?: string
  featured: boolean
  image?: string
}

function PortfolioPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])

  // Read active filter from URL search param ?cat=, fallback to 'all'
  const activeFilter = searchParams.get('cat') ?? 'all'

  const filteredProjects =
    activeFilter === 'all' ? projects : projects.filter((p) => p.category === activeFilter)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/portfolio')
        const data = await res.json()
        setProjects(data.projects || [])
        const uniqueCategories = [
          ...new Set((data.projects || []).map((p: Project) => p.category)),
        ] as string[]
        setCategories(['all', ...uniqueCategories])
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  function handleFilterChange(cat: string) {
    // Update URL search param without navigating away — purely visual filtering
    const params = new URLSearchParams(searchParams.toString())
    if (cat === 'all') {
      params.delete('cat')
    } else {
      params.set('cat', cat)
    }
    const newUrl = params.size > 0 ? `/portfolio?${params.toString()}` : '/portfolio'
    router.replace(newUrl, { scroll: false })
  }

  return (
    <PageShell>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-4 py-3">
        <h1 className="font-bold text-lg text-foreground">Portfolio</h1>
        <p className="text-xs text-muted-foreground">{projects.length} projects delivered</p>
      </div>

      {/* Filter tabs — bottom-border style, consistent with home */}
      <div className="flex border-b border-border overflow-x-auto scrollbar-none">
        {categories.map((cat) => {
          const active = activeFilter === cat
          return (
            <button
              key={cat}
              onClick={() => handleFilterChange(cat)}
              className="flex-shrink-0 px-4 py-3 text-xs font-semibold capitalize transition-colors border-b-2"
              style={
                active
                  ? { borderColor: '#f4a295', color: '#f4a295' }
                  : { borderColor: 'transparent', color: 'var(--muted-foreground)' }
              }
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          )
        })}
      </div>

      {/* Project cards */}
      <div className="px-4 py-4 flex flex-col gap-4">
        {loading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse h-40 rounded-2xl bg-muted" />
          ))
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
            <p className="text-sm text-muted-foreground">No projects to display.</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/portfolio/${project.id}`}
              className="block rounded-2xl border border-border bg-card overflow-hidden hover:border-[#f4a295]/40 transition-colors group"
            >
              {/* Accent stripe */}
              <div className="h-1 w-full" style={{ backgroundColor: project.featured ? '#f4a295' : '#f4a29530' }} />

              {/* Image */}
              {project.image && (
                <div className="w-full h-40 overflow-hidden bg-muted">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-4">
                {/* Category + featured */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize"
                    style={{ backgroundColor: '#f4a29520', color: '#f4a295' }}
                  >
                    {project.category}
                  </span>
                  {project.featured && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      Featured
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-foreground mb-1 text-pretty">{project.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{project.description}</p>

                {/* Result */}
                <div className="flex items-center gap-1.5 mb-3">
                  <TrendingUp size={12} style={{ color: '#f4a295' }} />
                  <span className="text-xs font-medium" style={{ color: '#f4a295' }}>
                    {Object.values(project.results)[0]}
                  </span>
                </div>

                {/* Tech */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {project.tech.slice(0, 4).map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">{t}</span>
                  ))}
                </div>

                {/* Quick action links */}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <span className="text-xs font-semibold flex-1" style={{ color: '#f4a295' }}>
                    View full project →
                  </span>
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-full flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-[#f4a295]/40 transition-colors"
                      aria-label="Source code"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Code size={13} />
                    </a>
                  )}
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-full flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-[#f4a295]/40 transition-colors"
                      aria-label="Live site"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </PageShell>
  )
}

export default function PortfolioPage() {
  return (
    <Suspense>
      <PortfolioPageInner />
    </Suspense>
  )
}
