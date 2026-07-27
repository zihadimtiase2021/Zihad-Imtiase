'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, Share2, BookOpen, Quote, Briefcase, TrendingUp, ExternalLink, Music } from 'lucide-react'
import { cn } from '@/lib/utils'

type FeedType = 'article' | 'testimonial' | 'project'

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

const TYPE_META: Record<FeedType, { label: string; icon: React.ElementType; color: string }> = {
  article: { label: 'Article', icon: BookOpen, color: '#f4a295' },
  testimonial: { label: 'Testimonial', icon: Quote, color: '#a8d5c2' },
  project: { label: 'Project', icon: Briefcase, color: '#9db8e8' },
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
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(initialLikes)
  const meta = TYPE_META[type]
  const TypeIcon = meta.icon
  const detailHref = id ? `/feed/${id}` : undefined

  // Merge legacy image + media array, dedup
  const allMedia: string[] = (() => {
    const arr = media && media.length > 0 ? media : image ? [image] : []
    return Array.from(new Set(arr.filter(Boolean)))
  })()

  function handleLike(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setLiked((prev) => !prev)
    setLikes((prev) => (liked ? prev - 1 : prev + 1))
  }

  function handleShare(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (navigator.share && detailHref) {
      navigator.share({ title: title ?? 'Zihad Imtiase', url: window.location.origin + detailHref })
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
        {/* Author + date */}
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="font-semibold text-sm text-foreground">{author || 'Zihad Imtiase'}</span>
          {authorRole && <span className="text-xs text-muted-foreground">{authorRole}</span>}
          <span className="text-xs text-muted-foreground ml-auto shrink-0">{date}</span>
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
        <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">{body}</p>

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

        {/* Action row */}
        <div className="flex items-center gap-6 mt-1">
          <button
            onClick={handleLike}
            className={cn(
              'flex items-center gap-1.5 text-xs transition-colors group',
              liked ? 'text-rose-400' : 'text-muted-foreground hover:text-rose-400'
            )}
            aria-label="Like"
          >
            <Heart size={15} className={cn('transition-transform group-active:scale-125', liked && 'fill-rose-400')} />
            <span>{likes}</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageCircle size={15} />
            <span>{replies}</span>
          </div>

          {detailHref && (
            <Link
              href={detailHref}
              className="text-xs font-semibold transition-colors ml-1"
              style={{ color: '#f4a295' }}
              onClick={(e) => e.stopPropagation()}
            >
              Read more →
            </Link>
          )}

          <button
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
            aria-label="Share"
            onClick={handleShare}
          >
            <Share2 size={15} />
          </button>
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
