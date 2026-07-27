'use client'

import Link from 'next/link'
import { MapPin, Calendar, MessageCircle } from 'lucide-react'

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'Articles', value: 'articles' },
  { label: 'Testimonials', value: 'testimonials' },
  { label: 'Projects', value: 'projects' },
]

interface ProfileHeroProps {
  activeFilter?: string
  onFilterChange?: (value: string) => void
  coverMedia?: string
  profileMedia?: string
}

function isVideo(url: string) { return /\.(mp4|webm|mov)$/i.test(url) }

export function ProfileHero({
  activeFilter = 'all',
  onFilterChange,
  coverMedia = '',
  profileMedia = '',
}: ProfileHeroProps) {
  return (
    <div className="border-b border-border">
      {/* Banner */}
      <div className="h-28 md:h-36 w-full relative overflow-hidden">
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
          <>
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, #f4a29520 0%, #e8806f18 50%, #f4a29508 100%)' }}
            />
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: 'radial-gradient(circle, #f4a295 1.5px, transparent 1.5px)',
                backgroundSize: '28px 28px',
              }}
            />
          </>
        )}
      </div>

      <div className="px-4 pb-4">
        {/* Avatar row */}
        <div className="flex items-end justify-between -mt-9 mb-3">
          <div className="relative">
            {profileMedia ? (
              isVideo(profileMedia) ? (
                <video
                  src={profileMedia}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-full border-4 border-background object-cover shadow-sm"
                />
              ) : (
                <img
                  src={profileMedia}
                  alt="Zihad Imtiase"
                  className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-full border-4 border-background object-cover shadow-sm"
                />
              )
            ) : (
              <div
                className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-full border-4 border-background flex items-center justify-center font-bold text-xl shadow-sm"
                style={{ backgroundColor: '#f4a295', color: '#1a1a1a' }}
              >
                ZI
              </div>
            )}
            <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
          </div>

          <Link
            href="/contact"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: '#f4a295', color: '#1a1a1a' }}
          >
            <MessageCircle size={14} />
            Hire Me
          </Link>
        </div>

        {/* Name + handle */}
        <h1 className="font-bold text-xl text-foreground leading-tight">Zihad Imtiase</h1>
        <p className="text-sm text-muted-foreground mb-2">
          Frontend Developer &amp; Webflow Specialist
        </p>

        {/* Bio */}
        <p className="text-sm text-foreground leading-relaxed mb-3">
          Crafting websites that drive engagement, conversions &amp; success.{' '}
          <span className="text-muted-foreground">
            {['#frontend', '#webflow', '#react', '#landingpage', '#CRO'].map((t) => (
              <span key={t} style={{ color: '#f4a295' }} className="mr-1">
                {t}
              </span>
            ))}
          </span>
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <MapPin size={11} style={{ color: '#f4a295' }} />
            Dhaka Cantonment, Bangladesh
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={11} style={{ color: '#f4a295' }} />
            Joined March 2022
          </span>
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-sm">
          {[
            { value: '50+', label: 'Projects' },
            { value: '40+', label: 'Clients' },
            { value: '4+', label: 'Years' },
          ].map(({ value, label }) => (
            <div key={label} className="flex items-baseline gap-1">
              <span className="font-bold text-foreground">{value}</span>
              <span className="text-muted-foreground text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tab bar — single row, bottom-border style */}
      <div className="flex border-t border-border">
        {TABS.map((tab) => {
          const active = activeFilter === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => onFilterChange?.(tab.value)}
              className="flex-1 py-3 text-xs font-semibold transition-colors border-b-2"
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
