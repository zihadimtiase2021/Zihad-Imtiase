'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, Code, TrendingUp, CheckCircle2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ContentBlock {
  id: string
  type: 'paragraph' | 'heading' | 'image' | 'divider'
  text?: string
  url?: string
  caption?: string
}

interface Project {
  id: string
  title: string
  category: string
  description: string
  tech: string[]
  results: Record<string, string>
  link?: string
  github?: string
  image?: string
  images?: string[]
  content?: ContentBlock[]
  featured: boolean
}

/** Full-screen lightbox for gallery images */
function Lightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: string[]
  initialIndex: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(initialIndex)

  function prev(e: React.MouseEvent) {
    e.stopPropagation()
    setIndex((i) => (i - 1 + images.length) % images.length)
  }
  function next(e: React.MouseEvent) {
    e.stopPropagation()
    setIndex((i) => (i + 1) % images.length)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        onClick={onClose}
        aria-label="Close"
      >
        <X size={18} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {index + 1} / {images.length}
      </div>

      {/* Prev */}
      {images.length > 1 && (
        <button
          className="absolute left-3 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          onClick={prev}
          aria-label="Previous"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      {/* Image */}
      <img
        src={images[index]}
        alt={`Gallery image ${index + 1}`}
        className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next */}
      {images.length > 1 && (
        <button
          className="absolute right-3 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          onClick={next}
          aria-label="Next"
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-6 flex items-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIndex(i) }}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all',
                i === index ? 'bg-white scale-125' : 'bg-white/40'
              )}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function ProjectDetailClient() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/portfolio/${id}`)
        if (!res.ok) { router.push('/portfolio'); return }
        setProject(await res.json())
      } catch {
        router.push('/portfolio')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, router])

  if (loading) {
    return (
      <PageShell>
        <div className="flex flex-col gap-4 p-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse h-8 rounded-xl bg-muted" />
          ))}
        </div>
      </PageShell>
    )
  }

  if (!project) return null

  // Normalise gallery: prefer images[] over legacy image
  const gallery: string[] = project.images && project.images.length > 0
    ? project.images
    : project.image
    ? [project.image]
    : []

  const coverImage = gallery[0]

  return (
    <PageShell>
      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={gallery}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="font-bold text-base text-foreground leading-tight line-clamp-1">{project.title}</h1>
          <p className="text-xs text-muted-foreground capitalize">{project.category}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
              aria-label="Source code"
            >
              <Code size={15} />
            </a>
          )}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: '#f4a295', color: '#1a1a1a' }}
            >
              <ExternalLink size={12} />
              Live site
            </a>
          )}
        </div>
      </div>

      {/* ── Hero / cover image ── */}
      {coverImage ? (
        <div
          className="w-full bg-muted overflow-hidden cursor-pointer"
          style={{ aspectRatio: '16/9' }}
          onClick={() => setLightboxIndex(0)}
          role="button"
          tabIndex={0}
          aria-label="Open image gallery"
          onKeyDown={(e) => e.key === 'Enter' && setLightboxIndex(0)}
        >
          <img src={coverImage} alt={project.title} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" />
        </div>
      ) : (
        <div
          className="w-full flex items-center justify-center"
          style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, #f4a29518 0%, #f4a29508 100%)' }}
        >
          <span className="font-bold text-4xl" style={{ color: '#f4a29540' }}>
            {project.title.slice(0, 2).toUpperCase()}
          </span>
        </div>
      )}

      {/* ── Gallery strip (2+ images) ── */}
      {gallery.length > 1 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
          {gallery.map((url, i) => (
            <button
              key={url + i}
              onClick={() => setLightboxIndex(i)}
              className={cn(
                'shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all',
                i === 0 ? 'border-[#f4a295]' : 'border-transparent hover:border-[#f4a295]/50'
              )}
              aria-label={`View image ${i + 1}`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
          <span className="shrink-0 flex items-center text-[11px] text-muted-foreground pl-1">
            {gallery.length} photos
          </span>
        </div>
      )}

      <div className="px-5 py-6">
        {/* Category + featured */}
        <div className="flex items-center gap-2 mb-3">
          <Link
            href={`/portfolio/category/${project.category}`}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#f4a29520', color: '#f4a295' }}
          >
            {project.category}
          </Link>
          {project.featured && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
              Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="font-bold text-2xl text-foreground mb-3 text-pretty leading-snug">
          {project.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{project.description}</p>

        {/* Results */}
        <div className="rounded-2xl border border-border bg-card p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} style={{ color: '#f4a295' }} />
            <p className="text-sm font-bold text-foreground">Results</p>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(project.results).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <CheckCircle2 size={13} style={{ color: '#f4a295' }} className="shrink-0" />
                <span className="text-xs text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="text-xs font-semibold text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Tech Stack</p>
          <div className="flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <span
                key={t}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-card text-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── Rich content blocks ── */}
        {project.content && project.content.length > 0 && (
          <div className="space-y-5 mb-8">
            <div className="h-px bg-border" />
            {project.content.map((block) => {
              if (block.type === 'heading') {
                return (
                  <h3 key={block.id} className="font-bold text-lg text-foreground text-pretty leading-snug">
                    {block.text}
                  </h3>
                )
              }
              if (block.type === 'paragraph') {
                return (
                  <p key={block.id} className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {block.text}
                  </p>
                )
              }
              if (block.type === 'image' && block.url) {
                return (
                  <figure key={block.id} className="space-y-2">
                    <div
                      className="rounded-2xl overflow-hidden bg-muted cursor-pointer"
                      onClick={() => {
                        // open in lightbox if it's a gallery image, else just expand
                        const idx = gallery.indexOf(block.url!)
                        setLightboxIndex(idx >= 0 ? idx : 0)
                      }}
                    >
                      <img
                        src={block.url}
                        alt={block.caption ?? ''}
                        className="w-full object-cover max-h-80 hover:scale-[1.01] transition-transform duration-300"
                      />
                    </div>
                    {block.caption && (
                      <figcaption className="text-xs text-center text-muted-foreground">{block.caption}</figcaption>
                    )}
                  </figure>
                )
              }
              if (block.type === 'divider') {
                return <div key={block.id} className="h-px bg-border" />
              }
              return null
            })}
          </div>
        )}

        {/* CTAs */}
        <div className="flex gap-3">
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: '#f4a295', color: '#1a1a1a' }}
            >
              <ExternalLink size={14} />
              View live site
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold border border-border transition-all hover:bg-muted"
            >
              <Code size={14} />
              Source code
            </a>
          )}
        </div>
      </div>
    </PageShell>
  )
}
