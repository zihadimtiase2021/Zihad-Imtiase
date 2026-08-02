'use client'

import Link from 'next/link'
import { MapPin, Calendar, MessageCircle, Mail, Briefcase } from 'lucide-react'

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'Articles', value: 'articles' },
  { label: 'Testimonials', value: 'testimonials' },
  { label: 'Projects', value: 'projects' },
]

export interface HeroData {
  coverMedia?: string
  profileMedia?: string
  name?: string
  title?: string
  bio?: string
  tags?: string[]
  location?: string
  joinDate?: string
  stats?: { value: string; label: string }[]
  hireMeLink?: string
}

interface ProfileHeroProps {
  activeFilter?: string
  onFilterChange?: (value: string) => void
  heroData?: HeroData
}

function isVideo(url: string) { 
  return /\.(mp4|webm|mov)$/i.test(url) 
}

export function ProfileHero({
  activeFilter = 'all',
  onFilterChange,
  heroData = {},
}: ProfileHeroProps) {
  // ফলব্যাক (Fallback) বা ডিফল্ট ভ্যালু
  const coverMedia = heroData.coverMedia || ''
  const profileMedia = heroData.profileMedia || ''
  const name = heroData.name || 'Zihad Imtiase'
  const title = heroData.title || 'Frontend Developer & Webflow Specialist'
  const bio = heroData.bio || 'Crafting websites that drive engagement, conversions & success.'
  const tags = heroData.tags?.length ? heroData.tags : ['#frontend', '#webflow', '#react', '#landingpage', '#CRO']
  const location = heroData.location || 'Dhaka Cantonment, Bangladesh'
  const joinDate = heroData.joinDate || 'Joined March 2022'
  const stats = heroData.stats?.length ? heroData.stats : [
    { value: '50+', label: 'Projects' },
    { value: '40+', label: 'Clients' },
    { value: '4+', label: 'Years' },
  ]
  
  // Dynamic Hire Me Link & Icon Logic
  const hireMeLink = heroData.hireMeLink || '/contact'
  const isMail = hireMeLink.startsWith('mailto:')
  const isWhatsApp = hireMeLink.includes('wa.me') || hireMeLink.includes('whatsapp')
  
  const HireIcon = isMail ? Mail : isWhatsApp ? MessageCircle : Briefcase
  const isExternal = hireMeLink.startsWith('http') || hireMeLink.startsWith('mailto:')

  return (
    <div className="border-b border-border">
      {/* Banner Area */}
      <div className="h-32 md:h-40 w-full relative overflow-hidden bg-muted/30">
        {coverMedia ? (
          isVideo(coverMedia) ? (
            <video
              src={coverMedia}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <img
              src={coverMedia}
              alt="Cover"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, #f4a29520 0%, #e8806f18 50%, #f4a29508 100%)' }}
          />
        )}

        {/* Overlays (Applies to both placeholder and uploaded cover) */}
        <div
          className="absolute inset-0 opacity-[0.08] z-10 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: 'radial-gradient(circle, #f4a295 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Soft bottom gradient to blend image with the background naturally */}
        {coverMedia && (
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent pointer-events-none" />
        )}
      </div>

      <div className="px-5 pb-5">
        {/* Avatar and Button Row */}
        <div className="flex justify-between items-start mb-4">
          
          {/* Avatar (Pulled up using negative margin) */}
          <div className="relative -mt-12 md:-mt-16 z-20">
            {profileMedia ? (
              isVideo(profileMedia) ? (
                <video
                  src={profileMedia}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-20 h-20 md:w-[88px] md:h-[88px] rounded-full border-[4px] border-background object-cover shadow-sm bg-background"
                />
              ) : (
                <img
                  src={profileMedia}
                  alt={name}
                  className="w-20 h-20 md:w-[88px] md:h-[88px] rounded-full border-[4px] border-background object-cover shadow-sm bg-background"
                />
              )
            ) : (
              <div
                className="w-20 h-20 md:w-[88px] md:h-[88px] rounded-full border-[4px] border-background flex items-center justify-center font-bold text-2xl shadow-sm uppercase bg-background"
                style={{ backgroundColor: '#f4a295', color: '#1a1a1a' }}
              >
                {name.slice(0, 2)}
              </div>
            )}
            <span className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-background" />
          </div>

          {/* Hire Me Button (Sits naturally below the banner) */}
          <div className="pt-3 relative z-20">
            {isExternal ? (
              <a
                href={hireMeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-95 shadow-sm"
                style={{ backgroundColor: '#f4a295', color: '#1a1a1a' }}
              >
                <HireIcon size={15} strokeWidth={2.5} />
                Hire Me
              </a>
            ) : (
              <Link
                href={hireMeLink}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-95 shadow-sm"
                style={{ backgroundColor: '#f4a295', color: '#1a1a1a' }}
              >
                <HireIcon size={15} strokeWidth={2.5} />
                Hire Me
              </Link>
            )}
          </div>
        </div>

        {/* Name & Title */}
        <h1 className="font-bold text-xl md:text-2xl text-foreground leading-tight tracking-tight">{name}</h1>
        <p className="text-sm font-medium text-muted-foreground mt-0.5 mb-3">
          {title}
        </p>

        {/* Bio */}
        <p className="text-sm text-foreground leading-relaxed mb-4 whitespace-pre-wrap">
          {bio}{' '}
          <span className="text-muted-foreground inline-block mt-1">
            {tags.map((t, idx) => (
              <span key={idx} style={{ color: '#f4a295' }} className="mr-1.5 font-medium">
                {t.startsWith('#') ? t : `#${t}`}
              </span>
            ))}
          </span>
        </p>

        {/* Location & Date */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground mb-5">
          <span className="flex items-center gap-1.5">
            <MapPin size={13} style={{ color: '#f4a295' }} />
            {location}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={13} style={{ color: '#f4a295' }} />
            {joinDate}
          </span>
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-sm">
          {stats.map(({ value, label }, index) => (
            <div key={index} className="flex items-baseline gap-1.5">
              <span className="font-bold text-foreground text-base">{value}</span>
              <span className="text-muted-foreground text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tab bar */}
      <div className="flex border-t border-border mt-2">
        {TABS.map((tab) => {
          const active = activeFilter === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => onFilterChange?.(tab.value)}
              className="flex-1 py-3.5 text-xs font-semibold transition-all border-b-2"
              style={
                active
                  ? { borderColor: '#f4a295', color: '#f4a295' }
                  : { borderColor: 'transparent', color: 'var(--muted-foreground)' }
              }
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}