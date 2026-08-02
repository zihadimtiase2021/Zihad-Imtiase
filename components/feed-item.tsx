'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Share2, BookOpen, Quote, Briefcase, TrendingUp, ExternalLink, Music, MoreHorizontal, Edit, Trash2, Pin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PostInteractions } from '@/components/post-interactions'

type FeedType = 'article' | 'testimonial' | 'project' | 'post' | 'general'

interface FeedItemProps {
  id?: string
  type: FeedType
  title?: string
  body: string
  author?: string
  authorRole?: string
  date: string
  tag?: string
  initialLikes?: number
  replies?: number
  rating?: number
  projectTech?: string[]
  projectLink?: string
  image?: string
  media?: string[]
  clientImage?: string
  linkedProjectId?: string
}

const TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  article: { label: 'Article', icon: BookOpen, color: '#f4a295' },
  testimonial: { label: 'Testimonial', icon: Quote, color: '#a8d5c2' },
  project: { label: 'Project', icon: Briefcase, color: '#9db8e8' },
  post: { label: 'Update', icon: BookOpen, color: '#9ca3af' },
  general: { label: 'Update', icon: BookOpen, color: '#9ca3af' },
}

function getMediaType(url: string): 'image' | 'video' | 'audio' {
  if (/\.(mp4|webm|mov)$/i.test(url)) return 'video'
  if (/\.(mp3|ogg|wav|aac|flac|m4a)$/i.test(url)) return 'audio'
  return 'image'
}

/** Twitter/X-style media grid — 1 full, 2 side-by-side, 3 left + right stack, 4 2×2 */
function MediaGrid({ urls, onClick }: { urls: string[]; onClick?: (e: React.MouseEvent) => void }) {
  const count = urls.length
  if (count === 0) return null

  const renderItem = (url: string, index: number, className?: string) => {
    const kind = getMediaType(url)

    if (kind === 'video') {
      return (
        <div key={index} className={cn('relative overflow-hidden bg-black rounded-xl', className)}>
          <video
            src={url}
            controls
            className="w-full h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )
    }

    if (kind === 'audio') {
      return (
        <div
          key={index}
          className={cn('flex flex-col items-center justify-center gap-2.5 rounded-xl bg-muted border border-border p-4', className)}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#f4a29520' }}
          >
            <Music size={18} style={{ color: '#f4a295' }} />
          </div>
          <audio
            src={url}
            controls
            className="w-full max-w-full h-8"
            style={{ accentColor: '#f4a295' }}
          />
        </div>
      )
    }

    // image
    return (
      <div key={index} className={cn('overflow-hidden bg-muted rounded-xl', className)}>
        <img
          src={url}
          alt=""
          className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
          loading="lazy"
        />
      </div>
    )
  }

  if (count === 1) {
    const kind = getMediaType(urls[0])
    const isAudio = kind === 'audio'
    return (
      <div
        className={cn('w-full rounded-xl overflow-hidden', !isAudio && 'bg-muted')}
        style={isAudio ? {} : { aspectRatio: '16/9' }}
        onClick={onClick}
      >
        {renderItem(urls[0], 0, 'w-full h-full')}
      </div>
    )
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }} onClick={onClick}>
        {urls.map((url, i) => renderItem(url, i, 'w-full h-full'))}
      </div>
    )
  }

  if (count === 3) {
    return (
      <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }} onClick={onClick}>
        <div className="row-span-2">{renderItem(urls[0], 0, 'w-full h-full')}</div>
        {renderItem(urls[1], 1, 'w-full h-full')}
        {renderItem(urls[2], 2, 'w-full h-full')}
      </div>
    )
  }

  // 4 — 2×2
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden" style={{ aspectRatio: '1/1' }} onClick={onClick}>
      {urls.slice(0, 4).map((url, i) => renderItem(url, i, 'w-full h-full'))}
    </div>
  )
}

export function FeedItem({
  id,
  type,
  title,
  body,
  author,
  authorRole,
  date,
  tag,
  initialLikes = 0,
  replies = 0,
  rating,
  projectTech = [],
  projectLink,
  image,
  media,
  clientImage,
  linkedProjectId,
}: FeedItemProps) {
  const router = useRouter()
  const meta = TYPE_META[type] || TYPE_META['general']
  const TypeIcon = meta.icon
  const detailHref = id ? `/feed/${id}` : undefined

  // Admin Controls State
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fetch admin status
  useEffect(() => {
    fetch('/api/auth/status')
      .then(res => res.json())
      .then(data => setIsAdmin(data.authenticated))
      .catch(() => setIsAdmin(false))
  }, [])

  // Close admin menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const allMedia: string[] = (() => {
    const arr = media && media.length > 0 ? media : image ? [image] : []
    return Array.from(new Set(arr.filter(Boolean)))
  })()

  function handleShare(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (navigator.share && detailHref) {
      navigator.share({ title: title ?? 'Zihad Imtiase', url: window.location.origin + detailHref })
    }
  }

  // --- Admin Action Handlers ---
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMenuOpen(false)
    // Add edit logic here
    alert('Edit feature coming soon!')
  }

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMenuOpen(false)
    // Add pin logic here
    alert('Post pinned successfully!')
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMenuOpen(false)
    
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        const res = await fetch(`/api/feed?id=${id}`, { method: 'DELETE' })
        if (res.ok) {
          window.location.reload()
        } else {
          alert('Failed to delete post.')
        }
      } catch (error) {
        alert('Error deleting post.')
      }
    }
  }

  const inner = (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
        style={{ backgroundColor: '#f4a295', color: '#1a1a1a' }}
      >
        {(author || 'Z').slice(0, 2).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        
        {/* Author + Date + Admin Menu */}
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="font-semibold text-sm text-foreground">{author || 'Zihad Imtiase'}</span>
          {authorRole && <span className="text-xs text-muted-foreground">{authorRole}</span>}
          <span className="text-xs text-muted-foreground ml-auto shrink-0">{date}</span>

          {/* Admin Menu (Three Dots) */}
          {isAdmin && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(!isMenuOpen) }}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors ml-1"
                aria-label="Admin options"
              >
                <MoreHorizontal size={16} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95">
                  <button onClick={handleEdit} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition-colors text-left">
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={handlePin} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition-colors text-left">
                    <Pin size={14} /> Pin to top
                  </button>
                  <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors text-left">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Type badge */}
        <div className="flex items-center gap-1.5 mb-3">
          <TypeIcon size={11} style={{ color: meta.color }} />
          <span className="text-[11px] font-medium" style={{ color: meta.color }}>{meta.label}</span>
          {tag && (
            <>
              <span className="text-muted-foreground text-[11px]">·</span>
              <span className="text-[11px] text-muted-foreground">#{tag}</span>
            </>
          )}
        </div>

        {/* Title */}
        {title && (
          <h3 className="font-bold text-base text-foreground mb-2 text-pretty leading-snug">{title}</h3>
        )}

        {/* Star rating */}
        {type === 'testimonial' && rating && (
          <div className="flex gap-0.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-xs" style={{ color: i < rating ? '#f4a295' : '#555' }}>★</span>
            ))}
          </div>
        )}

        {/* Body */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3 whitespace-pre-wrap">{body}</p>

        {/* Media grid */}
        {allMedia.length > 0 && (
          <div className="mb-3">
            <MediaGrid urls={allMedia} onClick={(e) => e.preventDefault()} />
          </div>
        )}

        {/* Tech tags */}
        {projectTech.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {projectTech.map((tech) => (
              <span key={tech} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">{tech}</span>
            ))}
          </div>
        )}

        {/* Project link */}
        {projectLink && (
          <a
            href={projectLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium mb-3 transition-colors hover:opacity-80"
            style={{ color: '#f4a295' }}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={11} />
            View project
          </a>
        )}

        {/* Linked portfolio project card */}
        {linkedProjectId && (
          <Link
            href={`/portfolio/${linkedProjectId}`}
            className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl border border-border bg-muted/50 hover:border-[#f4a295]/50 transition-colors group"
            onClick={(e) => e.stopPropagation()}
          >
            <TrendingUp size={13} style={{ color: '#f4a295' }} className="shrink-0" />
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              View related portfolio project
            </span>
            <span className="ml-auto text-xs font-semibold" style={{ color: '#f4a295' }}>→</span>
          </Link>
        )}

        {/* Real-time Interaction Row */}
        <div className="relative cursor-default mt-1" onClick={(e) => e.stopPropagation()}>
          {/* Share and Read More */}
          <div className="absolute top-4 right-0 flex items-center gap-5 pt-3 z-10 bg-background pl-2">
            {detailHref && (
              <Link
                href={detailHref}
                className="text-xs font-semibold transition-colors hover:underline"
                style={{ color: '#f4a295' }}
              >
                Read more →
              </Link>
            )}
            <button
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Share"
              onClick={handleShare}
            >
              <Share2 size={15} />
            </button>
          </div>

          <PostInteractions 
            postId={id || `post-${Date.now()}`} 
            initialLikes={initialLikes} 
            initialComments={[]} 
          />
        </div>

      </div>
    </div>
  )

  return (
    <article
      className={cn(
        'px-4 py-5 border-b border-border transition-colors',
        detailHref ? 'cursor-pointer hover:bg-muted/30' : ''
      )}
      onClick={detailHref ? () => router.push(detailHref) : undefined}
      role={detailHref ? 'button' : undefined}
      tabIndex={detailHref ? 0 : undefined}
      onKeyDown={detailHref ? (e) => { if (e.key === 'Enter') router.push(detailHref) } : undefined}
      aria-label={detailHref && title ? `Read full post: ${title}` : undefined}
    >
      {inner}
    </article>
  )
}