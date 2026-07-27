'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Upload, Trash2, Image, Film, Music, Loader2, X, Check,
  Home, User, FileImage, Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SiteSettings {
  hero: {
    coverMedia: string
    profileMedia: string
  }
  about: {
    media: string[]
  }
}

type Toast = { id: number; msg: string; ok: boolean }

function mediaKind(url: string): 'image' | 'video' | 'audio' | 'none' {
  if (!url) return 'none'
  if (/\.(mp4|webm|mov)$/i.test(url)) return 'video'
  if (/\.(mp3|ogg|wav|aac|flac|m4a)$/i.test(url)) return 'audio'
  return 'image'
}

// ── Single-slot media uploader ──────────────────────────────────────────────
function SingleMediaSlot({
  label,
  hint,
  value,
  accept,
  onChange,
  onDelete,
  uploading,
}: {
  label: string
  hint?: string
  value: string
  accept: string
  onChange: (file: File) => void
  onDelete: () => void
  uploading?: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)
  const kind = mediaKind(value)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </label>
        {hint && <span className="text-[11px] text-muted-foreground/60">{hint}</span>}
      </div>

      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-border bg-muted group">
          {kind === 'image' && (
            <img src={value} alt={label} className="w-full h-36 object-cover" />
          )}
          {kind === 'video' && (
            <video src={value} className="w-full h-36 object-cover" muted autoPlay loop playsInline />
          )}
          {kind === 'audio' && (
            <div className="flex items-center gap-3 p-4 h-20">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#f4a29520' }}
              >
                <Music size={18} style={{ color: '#f4a295' }} />
              </div>
              <audio src={value} controls className="flex-1 h-8" style={{ accentColor: '#f4a295' }} />
            </div>
          )}

          {/* Action overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => ref.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 text-black text-xs font-semibold hover:bg-white transition-colors"
            >
              <Upload size={12} /> Replace
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/90 text-white text-xs font-semibold hover:bg-red-500 transition-colors"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>

          {/* Kind badge */}
          <div className="absolute top-2 left-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-black/60 text-white pointer-events-none">
            {kind}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className={cn(
            'w-full border-2 border-dashed rounded-2xl flex flex-col items-center gap-2.5 py-8 transition-colors',
            uploading
              ? 'border-brand/40 bg-brand/5 cursor-not-allowed'
              : 'border-border hover:border-[#f4a295]/50 hover:bg-muted/30'
          )}
        >
          {uploading ? (
            <Loader2 size={24} className="animate-spin" style={{ color: '#f4a295' }} />
          ) : (
            <>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Image size={18} />
                <Film size={18} />
              </div>
              <span className="text-xs text-muted-foreground">Click to upload image or video</span>
            </>
          )}
        </button>
      )}

      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onChange(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

// ── Multi-slot media uploader (About page) ──────────────────────────────────
function MultiMediaSlot({
  value,
  uploading,
  onAdd,
  onDelete,
}: {
  value: string[]
  uploading: boolean
  onAdd: (file: File) => void
  onDelete: (i: number) => void
}) {
  const ref = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          About Page Media
        </label>
        <span className="text-[11px] text-muted-foreground/60">
          {value.length} file{value.length !== 1 ? 's' : ''} — images &amp; video
        </span>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {value.map((url, i) => {
            const kind = mediaKind(url)
            return (
              <div key={url + i} className="relative rounded-xl overflow-hidden border border-border bg-muted group/m">
                {kind === 'image' && (
                  <img src={url} alt="" className="w-full h-28 object-cover" />
                )}
                {kind === 'video' && (
                  <video src={url} className="w-full h-28 object-cover" muted autoPlay loop playsInline />
                )}
                {kind === 'audio' && (
                  <div className="w-full h-28 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Music size={22} />
                    <span className="text-[10px]">Audio</span>
                  </div>
                )}

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => onDelete(i)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover/m:opacity-100 transition-opacity hover:bg-black"
                  aria-label="Remove"
                >
                  <X size={11} />
                </button>
                <div className="absolute bottom-1.5 left-1.5 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/60 text-white pointer-events-none">
                  {kind}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className={cn(
          'w-full border-2 border-dashed rounded-xl flex items-center justify-center gap-2 py-4 transition-colors',
          uploading
            ? 'border-brand/40 bg-brand/5 cursor-not-allowed'
            : 'border-border hover:border-[#f4a295]/50 hover:bg-muted/30'
        )}
      >
        {uploading ? (
          <Loader2 size={18} className="animate-spin" style={{ color: '#f4a295' }} />
        ) : (
          <>
            <Upload size={15} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {value.length === 0 ? 'Add media for about page' : 'Add more media'}
            </span>
          </>
        )}
      </button>

      <input
        ref={ref}
        type="file"
        accept="image/*,video/mp4,video/webm,audio/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onAdd(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

// ── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  icon: Icon,
  title,
  description,
  children,
  accent,
}: {
  icon: React.FC<{ size?: number; style?: React.CSSProperties }>
  title: string
  description: string
  children: React.ReactNode
  accent?: string
}) {
  const color = accent ?? '#f4a295'
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Section header */}
      <div
        className="flex items-center gap-3 px-5 py-4 border-b border-border"
        style={{ background: color + '0a' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: color + '20' }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">{title}</p>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings>({
    hero: { coverMedia: '', profileMedia: '' },
    about: { media: [] },
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => { fetchSettings() }, [])

  function addToast(msg: string, ok = true) {
    const id = Date.now()
    setToasts((t) => [...t, { id, msg, ok }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000)
  }

  async function fetchSettings() {
    setLoading(true)
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setSettings({
        hero: { coverMedia: data.hero?.coverMedia ?? '', profileMedia: data.hero?.profileMedia ?? '' },
        about: { media: Array.isArray(data.about?.media) ? data.about.media : [] },
      })
    } catch {
      addToast('Failed to load settings', false)
    } finally {
      setLoading(false)
    }
  }

  async function uploadFile(file: File, slot: string): Promise<string | null> {
    setUploadingSlot(slot)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) return data.url as string
      addToast(`Upload failed: ${file.name}`, false)
      return null
    } catch {
      addToast(`Upload failed: ${file.name}`, false)
      return null
    } finally {
      setUploadingSlot(null)
    }
  }

  async function saveSettings(next: SiteSettings) {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        addToast('Settings saved')
      } else {
        addToast('Failed to save settings', false)
      }
    } catch {
      addToast('Failed to save settings', false)
    } finally {
      setSaving(false)
    }
  }

  // Hero handlers
  async function handleHeroSlot(file: File, field: 'coverMedia' | 'profileMedia') {
    const url = await uploadFile(file, `hero.${field}`)
    if (!url) return
    const next: SiteSettings = { ...settings, hero: { ...settings.hero, [field]: url } }
    setSettings(next)
    await saveSettings(next)
  }

  function deleteHeroSlot(field: 'coverMedia' | 'profileMedia') {
    const next: SiteSettings = { ...settings, hero: { ...settings.hero, [field]: '' } }
    setSettings(next)
    saveSettings(next)
  }

  // About handlers
  async function handleAboutAdd(file: File) {
    const url = await uploadFile(file, 'about.media')
    if (!url) return
    const next: SiteSettings = {
      ...settings,
      about: { media: [...settings.about.media, url] },
    }
    setSettings(next)
    await saveSettings(next)
  }

  function handleAboutDelete(index: number) {
    const next: SiteSettings = {
      ...settings,
      about: { media: settings.about.media.filter((_, i) => i !== index) },
    }
    setSettings(next)
    saveSettings(next)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2].map((n) => (
          <div key={n} className="animate-pulse rounded-2xl bg-muted h-48" />
        ))}
      </div>
    )
  }

  return (
    <div className="relative space-y-5">
      {/* Toast stack */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg pointer-events-auto',
              t.ok ? 'bg-foreground text-background' : 'bg-destructive text-white'
            )}
          >
            {t.msg}
          </div>
        ))}
      </div>

      {/* ── Home Hero ─────────────────────────────────────────── */}
      <Section
        icon={Home}
        title="Home Hero"
        description="Profile photo/video and cover banner shown on the home feed"
      >
        {/* Cover media */}
        <SingleMediaSlot
          label="Cover Banner"
          hint="Shown as the header banner — image or video"
          value={settings.hero.coverMedia}
          accept="image/*,video/mp4,video/webm"
          uploading={uploadingSlot === 'hero.coverMedia'}
          onChange={(f) => handleHeroSlot(f, 'coverMedia')}
          onDelete={() => deleteHeroSlot('coverMedia')}
        />

        {/* Profile media */}
        <SingleMediaSlot
          label="Profile Photo / Video"
          hint="Displayed as the avatar on the hero card"
          value={settings.hero.profileMedia}
          accept="image/*,video/mp4,video/webm"
          uploading={uploadingSlot === 'hero.profileMedia'}
          onChange={(f) => handleHeroSlot(f, 'profileMedia')}
          onDelete={() => deleteHeroSlot('profileMedia')}
        />

        <div
          className="flex items-start gap-2.5 p-3 rounded-xl text-[11px] text-muted-foreground leading-relaxed"
          style={{ backgroundColor: '#f4a29510', border: '1px solid #f4a29520' }}
        >
          <Info size={13} style={{ color: '#f4a295', flexShrink: 0, marginTop: 1 }} />
          Changes are saved automatically. The home page will reflect the new media on next load.
        </div>
      </Section>

      {/* ── About Page ─────────────────────────────────────────── */}
      <Section
        icon={User}
        title="About Page"
        description="Images or videos shown in the photo section of the About page"
        accent="#9db8e8"
      >
        <MultiMediaSlot
          value={settings.about.media}
          uploading={uploadingSlot === 'about.media'}
          onAdd={handleAboutAdd}
          onDelete={handleAboutDelete}
        />

        <div
          className="flex items-start gap-2.5 p-3 rounded-xl text-[11px] text-muted-foreground leading-relaxed"
          style={{ backgroundColor: '#9db8e810', border: '1px solid #9db8e820' }}
        >
          <Info size={13} style={{ color: '#9db8e8', flexShrink: 0, marginTop: 1 }} />
          First media file is featured prominently. Additional files appear in a scrollable row. Supports images and video.
        </div>
      </Section>
    </div>
  )
}
