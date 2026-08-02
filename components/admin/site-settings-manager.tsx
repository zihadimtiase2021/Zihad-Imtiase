'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Trash2, Image as ImageIcon, Loader2, X,
  User, FileText, Phone, Plus, Save, ImagePlus, MapPin, Globe, Link2,
  Mail, CheckCircle2, AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MediaPicker } from '@/components/media-picker'
import { ToastStack } from '@/components/admin/shared'
import { useToast } from '@/hooks/use-toast'
import type { SiteSettings } from '@/lib/types'

// ─── helpers ──────────────────────────────────────────────────────────────────

function mediaKind(url: string): 'image' | 'video' | 'audio' | 'none' {
  if (!url) return 'none'
  if (/\.(mp4|webm|mov)$/i.test(url)) return 'video'
  if (/\.(mp3|ogg|wav|aac|flac|m4a)$/i.test(url)) return 'audio'
  return 'image'
}

const EMPTY_SETTINGS: SiteSettings = {
  hero: {
    coverMedia: '', profileMedia: '', name: '', title: '', bio: '',
    tags: [], location: '', joinDate: '', stats: [], hireMeLink: '',
  },
  about: { media: [], introText: '', timeline: [], stack: [], values: [] },
  contact: { email: '', phone: '', address: '', shortText: '', socials: [] },
  meta: { title: '', description: '', favicon: '' },
}

/** Deep-clone via JSON — safe for plain objects with no cycles/functions */
function clone<T>(v: T): T { return JSON.parse(JSON.stringify(v)) }

// ─── input atoms ──────────────────────────────────────────────────────────────

function Field({ label, hint, children, className }: {
  label: string; hint?: string; children: React.ReactNode; className?: string
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground leading-relaxed">{hint}</p>}
    </div>
  )
}

const inputCls = (accent = '#f4a295') =>
  `w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border outline-none focus:border-[${accent}] focus:bg-background transition-colors text-sm min-w-0 placeholder:text-muted-foreground/40`

// ─── main component ────────────────────────────────────────────────────────────

export function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings>(EMPTY_SETTINGS)
  const [activeTab, setActiveTab] = useState<'profile' | 'about' | 'contact'>('profile')
  const [tagsInput, setTagsInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const { toasts, addToast } = useToast()

  // ── fetch ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false
    async function fetchSettings() {
      setLoading(true)
      try {
        const res = await fetch('/api/settings')
        if (!res.ok) throw new Error('fetch failed')
        const data = await res.json()
        if (cancelled) return
        const s: SiteSettings = {
          hero: {
            coverMedia: data.hero?.coverMedia ?? '',
            profileMedia: data.hero?.profileMedia ?? '',
            name: data.hero?.name ?? '',
            title: data.hero?.title ?? '',
            bio: data.hero?.bio ?? '',
            tags: Array.isArray(data.hero?.tags) ? data.hero.tags : [],
            location: data.hero?.location ?? '',
            joinDate: data.hero?.joinDate ?? '',
            stats: Array.isArray(data.hero?.stats) ? data.hero.stats : [],
            hireMeLink: data.hero?.hireMeLink ?? '',
          },
          about: {
            media: Array.isArray(data.about?.media) ? data.about.media : [],
            introText: data.about?.introText ?? '',
            timeline: Array.isArray(data.about?.timeline) ? data.about.timeline : [],
            stack: Array.isArray(data.about?.stack) ? data.about.stack : [],
            values: Array.isArray(data.about?.values) ? data.about.values : [],
          },
          contact: {
            email: data.contact?.email ?? '',
            phone: data.contact?.phone ?? '',
            address: data.contact?.address ?? '',
            shortText: data.contact?.shortText ?? '',
            socials: Array.isArray(data.contact?.socials) ? data.contact.socials : [],
          },
          meta: {
            title: data.meta?.title ?? '',
            description: data.meta?.description ?? '',
            favicon: data.meta?.favicon ?? '',
          },
        }
        setSettings(s)
        setTagsInput(s.hero.tags.join(', '))
        setDirty(false)
      } catch {
        addToast('Failed to load settings', false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchSettings()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── save ─────────────────────────────────────────────────────────────────────

  const saveSettings = useCallback(async (override?: SiteSettings) => {
    setSaving(true)
    const src = override ?? settings
    const tagsArray = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    const payload: SiteSettings = { ...src, hero: { ...src.hero, tags: tagsArray } }
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        addToast('Settings saved!')
        setDirty(false)
      } else {
        addToast('Failed to save settings', false)
      }
    } catch {
      addToast('Network error — settings not saved', false)
    } finally {
      setSaving(false)
    }
  }, [settings, tagsInput, addToast])

  // ── generic array helpers ─────────────────────────────────────────────────────

  const updateField = useCallback(<S extends keyof SiteSettings>(
    section: S,
    field: keyof SiteSettings[S],
    value: SiteSettings[S][keyof SiteSettings[S]],
  ) => {
    setSettings((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
    setDirty(true)
  }, [])

  const updateArrayItem = useCallback(<S extends 'hero' | 'about' | 'contact'>(
    section: S, field: string, index: number, key: string, val: unknown,
  ) => {
    setSettings((prev) => {
      const next = clone(prev)
      const arr = (next[section] as unknown as Record<string, unknown[]>)[field]
      arr[index] = { ...(arr[index] as object), [key]: val }
      return next
    })
    setDirty(true)
  }, [])

  const addArrayItem = useCallback(<S extends 'hero' | 'about' | 'contact'>(
    section: S, field: string, emptyItem: unknown,
  ) => {
    setSettings((prev) => {
      const next = clone(prev)
      const bucket = (next[section] as unknown as Record<string, unknown[]>)[field]
      ;(next[section] as unknown as Record<string, unknown[]>)[field] = [...bucket, emptyItem]
      return next
    })
    setDirty(true)
  }, [])

  const removeArrayItem = useCallback(<S extends 'hero' | 'about' | 'contact'>(
    section: S, field: string, index: number,
  ) => {
    setSettings((prev) => {
      const next = clone(prev)
      const bucket = (next[section] as unknown as Record<string, unknown[]>)[field]
      ;(next[section] as unknown as Record<string, unknown[]>)[field] = bucket.filter((_, i) => i !== index)
      return next
    })
    setDirty(true)
  }, [])

  // ── media helpers ─────────────────────────────────────────────────────────────

  function updateMediaField(slot: 'hero.coverMedia' | 'hero.profileMedia' | 'meta.favicon', url: string) {
    setSettings((prev) => {
      const next = clone(prev)
      if (slot === 'hero.coverMedia') next.hero.coverMedia = url
      if (slot === 'hero.profileMedia') next.hero.profileMedia = url
      if (slot === 'meta.favicon') next.meta.favicon = url
      saveSettings(next)
      return next
    })
  }

  function appendAboutMedia(urls: string[]) {
    setSettings((prev) => {
      const next = clone(prev)
      next.about.media = [...next.about.media, ...urls]
      saveSettings(next)
      return next
    })
  }

  function deleteMedia(slot: string, index?: number) {
    setSettings((prev) => {
      const next = clone(prev)
      if (slot === 'hero.coverMedia') next.hero.coverMedia = ''
      else if (slot === 'hero.profileMedia') next.hero.profileMedia = ''
      else if (slot === 'meta.favicon') next.meta.favicon = ''
      else if (slot === 'about.media' && index !== undefined) {
        next.about.media = next.about.media.filter((_, i) => i !== index)
      }
      saveSettings(next)
      return next
    })
  }

  // ── location syncs to contact.address ────────────────────────────────────────

  function handleLocationChange(val: string) {
    setSettings((prev) => ({
      ...prev,
      hero: { ...prev.hero, location: val },
      contact: { ...prev.contact, address: val },
    }))
    setDirty(true)
  }

  // ─────────────────────────────────────────────────────────────────────────────

  const TABS = [
    { id: 'profile' as const, label: 'Profile & SEO',    icon: User,     accent: '#f4a295' },
    { id: 'about'   as const, label: 'About & Stack',    icon: FileText, accent: '#9db8e8' },
    { id: 'contact' as const, label: 'Contact & Socials',icon: Phone,    accent: '#a8d5c2' },
  ]
  const accent = TABS.find((t) => t.id === activeTab)?.accent ?? '#f4a295'

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="animate-spin" style={{ color: '#f4a295' }} size={28} />
        <p className="text-sm text-muted-foreground">Loading settings…</p>
      </div>
    )
  }

  return (
    <div className="relative pb-28 sm:pb-10">
      <ToastStack toasts={toasts} />

      {/* ── header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-foreground">Global Settings</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Change in one place, update everywhere.</p>
        </div>
        <button
          onClick={() => saveSettings()}
          disabled={saving || !dirty}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 transition-all active:scale-95 shrink-0"
          style={{ backgroundColor: '#f4a295', color: '#1a1a1a' }}
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* ── tabs ── */}
      <div className="flex p-1 bg-muted/50 border border-border rounded-2xl overflow-x-auto scrollbar-none mb-5">
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap',
                active ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <tab.icon size={13} style={{ color: active ? tab.accent : undefined }} />
              <span className="hidden xs:inline sm:hidden md:inline">{tab.label}</span>
              <span className="xs:hidden sm:inline md:hidden">
                {tab.id === 'profile' ? 'Profile' : tab.id === 'about' ? 'About' : 'Contact'}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── panels ── */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">

        {/* ── 1. PROFILE & SEO ── */}
        {activeTab === 'profile' && (
          <div className="p-4 sm:p-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-200">

            {/* Visual identity */}
            <section>
              <SectionHeading icon={ImageIcon} label="Visual Identity" accent="#f4a295" />
              <div className="relative rounded-2xl border border-border bg-muted h-44 sm:h-56 mb-14 sm:mb-16 group/cover overflow-hidden">
                {settings.hero.coverMedia
                  ? mediaKind(settings.hero.coverMedia) === 'video'
                    ? <video src={settings.hero.coverMedia} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                    : <img src={settings.hero.coverMedia} className="w-full h-full object-cover" alt="cover" />
                  : <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <ImagePlus size={28} className="opacity-40" />
                      <span className="text-xs">No cover image</span>
                    </div>
                }
                <div className="absolute top-2 right-2 flex gap-2 opacity-100 sm:opacity-0 group-hover/cover:opacity-100 transition-opacity">
                  <div className="bg-black/60 backdrop-blur rounded-full">
                    <MediaPicker onSelect={(m) => updateMediaField('hero.coverMedia', m[0].url)} />
                  </div>
                  {settings.hero.coverMedia && (
                    <button onClick={() => deleteMedia('hero.coverMedia')} className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Avatar */}
                <div className="absolute -bottom-12 left-4 sm:left-5 group/avatar">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-card bg-muted overflow-hidden relative shadow-lg">
                    {settings.hero.profileMedia
                      ? mediaKind(settings.hero.profileMedia) === 'video'
                        ? <video src={settings.hero.profileMedia} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                        : <img src={settings.hero.profileMedia} className="w-full h-full object-cover" alt="profile" />
                      : <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <User size={28} />
                        </div>
                    }
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                      <MediaPicker onSelect={(m) => updateMediaField('hero.profileMedia', m[0].url)} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Basic info */}
            <section>
              <SectionHeading icon={User} label="Basic Information" accent="#f4a295" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name">
                  <input
                    className={inputCls()}
                    value={settings.hero.name}
                    onChange={(e) => updateField('hero', 'name', e.target.value)}
                    placeholder="Your Name"
                  />
                </Field>
                <Field label="Professional Title">
                  <input
                    className={inputCls()}
                    value={settings.hero.title}
                    onChange={(e) => updateField('hero', 'title', e.target.value)}
                    placeholder="e.g. Frontend Developer"
                  />
                </Field>
                <Field label="Short Bio" className="sm:col-span-2">
                  <textarea
                    rows={3}
                    className={cn(inputCls(), 'resize-y')}
                    value={settings.hero.bio}
                    onChange={(e) => updateField('hero', 'bio', e.target.value)}
                    placeholder="One-line professional summary…"
                  />
                </Field>

                <Field
                  label="Hire Me Button Link"
                  hint="Icon changes automatically: mailto: → Mail, wa.me → WhatsApp, else Briefcase."
                  className="sm:col-span-2"
                >
                  <div className="relative">
                    <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      className={cn(inputCls(), 'pl-8')}
                      value={settings.hero.hireMeLink}
                      onChange={(e) => updateField('hero', 'hireMeLink', e.target.value)}
                      placeholder="mailto:you@email.com OR https://wa.me/880…"
                    />
                  </div>
                </Field>

                <Field label="Keywords / Hashtags" className="sm:col-span-2">
                  <input
                    className={inputCls()}
                    value={tagsInput}
                    onChange={(e) => { setTagsInput(e.target.value); setDirty(true) }}
                    placeholder="#frontend, #webflow, #react"
                  />
                </Field>

                <Field label="Global Location">
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      className={cn(inputCls(), 'pl-8')}
                      value={settings.hero.location}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      placeholder="Dhaka, Bangladesh"
                    />
                  </div>
                </Field>
                <Field label="Join Date / Experience">
                  <input
                    className={inputCls()}
                    value={settings.hero.joinDate}
                    onChange={(e) => updateField('hero', 'joinDate', e.target.value)}
                    placeholder="Joined March 2022"
                  />
                </Field>
              </div>
            </section>

            {/* SEO & Metadata */}
            <section className="border-t border-border pt-6">
              <SectionHeading icon={Globe} label="SEO & Metadata" accent="#f4a295" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2 space-y-4">
                  <Field label="Meta Title">
                    <input
                      className={inputCls()}
                      value={settings.meta.title}
                      onChange={(e) => updateField('meta', 'title', e.target.value)}
                      placeholder="e.g. Zihad Imtiase — Portfolio"
                    />
                  </Field>
                  <Field label="Meta Description">
                    <textarea
                      rows={3}
                      className={cn(inputCls(), 'resize-none')}
                      value={settings.meta.description}
                      onChange={(e) => updateField('meta', 'description', e.target.value)}
                      placeholder="Brief description for search engines…"
                    />
                  </Field>
                </div>

                <Field label="Website Favicon" hint="Recommended: 512×512 PNG or SVG.">
                  <div className="flex flex-row sm:flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0">
                      {settings.meta.favicon
                        ? <img src={settings.meta.favicon} alt="Favicon" className="w-full h-full object-cover" />
                        : <Globe size={20} className="text-muted-foreground opacity-40" />
                      }
                    </div>
                    <div className="flex-1 sm:flex-none w-full space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={settings.meta.favicon}
                          onChange={(e) => updateField('meta', 'favicon', e.target.value)}
                          placeholder="Favicon URL…"
                          className={cn(inputCls(), 'flex-1')}
                        />
                        <div className="bg-muted border border-border rounded-full shrink-0">
                          <MediaPicker onSelect={(m) => updateMediaField('meta.favicon', m[0].url)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Field>
              </div>
            </section>
          </div>
        )}

        {/* ── 2. ABOUT & STACK ── */}
        {activeTab === 'about' && (
          <div className="p-4 sm:p-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-200">

            {/* About gallery */}
            <section>
              <SectionHeading icon={ImageIcon} label="About Gallery (5:7)" accent="#9db8e8" />
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                {settings.about.media.map((url, i) => (
                  <div key={i} className="relative aspect-[5/7] rounded-xl overflow-hidden border border-border group bg-muted">
                    {mediaKind(url) === 'video'
                      ? <video src={url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                      : <img src={url} className="w-full h-full object-cover" alt="" />
                    }
                    {i === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Cover</span>
                    )}
                    <button
                      onClick={() => deleteMedia('about.media', i)}
                      className="absolute top-1.5 right-1.5 p-1.5 bg-red-500/90 text-white rounded-lg opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <div className="aspect-[5/7] flex items-center justify-center border-2 border-dashed border-border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="bg-background rounded-full shadow-sm border border-border">
                    <MediaPicker onSelect={(m) => appendAboutMedia(m.map((x) => x.url))} />
                  </div>
                </div>
              </div>
            </section>

            {/* Introduction */}
            <section className="border-t border-border pt-6">
              <Field label="Detailed Introduction">
                <textarea
                  rows={6}
                  className={cn(inputCls('#9db8e8'), 'resize-y')}
                  value={settings.about.introText}
                  onChange={(e) => updateField('about', 'introText', e.target.value)}
                  placeholder="Write your full story here…"
                />
              </Field>
            </section>

            {/* Stats + Stack */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-border pt-6">
              <ArraySection
                title="Highlight Stats"
                accent="#9db8e8"
                onAdd={() => addArrayItem('hero', 'stats', { value: '', label: '' })}
                addLabel="Add Stat"
              >
                {settings.hero.stats.map((st, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted/30 p-2 rounded-xl border border-border">
                    <input
                      value={st.value}
                      onChange={(e) => updateArrayItem('hero', 'stats', i, 'value', e.target.value)}
                      placeholder="50+"
                      className="w-16 px-2.5 py-1.5 rounded-lg bg-background border text-sm font-bold outline-none focus:border-[#9db8e8] min-w-0"
                    />
                    <input
                      value={st.label}
                      onChange={(e) => updateArrayItem('hero', 'stats', i, 'label', e.target.value)}
                      placeholder="Projects"
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-background border text-sm outline-none focus:border-[#9db8e8] min-w-0"
                    />
                    <DeleteBtn onClick={() => removeArrayItem('hero', 'stats', i)} />
                  </div>
                ))}
              </ArraySection>

              <ArraySection
                title="Tech Stack"
                accent="#9db8e8"
                onAdd={() => addArrayItem('about', 'stack', { name: '', level: 50 })}
                addLabel="Add Skill"
              >
                {settings.about.stack.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted/30 p-2 rounded-xl border border-border">
                    <input
                      value={item.name}
                      onChange={(e) => updateArrayItem('about', 'stack', i, 'name', e.target.value)}
                      placeholder="React"
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-background border text-sm outline-none focus:border-[#9db8e8] min-w-0"
                    />
                    <input
                      type="number"
                      value={item.level}
                      onChange={(e) => updateArrayItem('about', 'stack', i, 'level', Number(e.target.value))}
                      className="w-14 px-2 py-1.5 rounded-lg bg-background border text-sm outline-none focus:border-[#9db8e8] text-center min-w-0"
                    />
                    <span className="text-xs text-muted-foreground font-semibold shrink-0">%</span>
                    <DeleteBtn onClick={() => removeArrayItem('about', 'stack', i)} />
                  </div>
                ))}
              </ArraySection>
            </div>

            {/* Values + Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-border pt-6">
              <ArraySection
                title="Core Values"
                accent="#9db8e8"
                onAdd={() => addArrayItem('about', 'values', { title: '', desc: '' })}
                addLabel="Add Value"
              >
                {settings.about.values.map((item, i) => (
                  <div key={i} className="bg-muted/30 p-3 rounded-xl border border-border space-y-2 relative">
                    <input
                      value={item.title}
                      onChange={(e) => updateArrayItem('about', 'values', i, 'title', e.target.value)}
                      placeholder="Title"
                      className="w-full pr-8 px-2.5 py-1.5 rounded-lg bg-background border text-sm font-bold outline-none focus:border-[#9db8e8] min-w-0"
                    />
                    <textarea
                      rows={2}
                      value={item.desc}
                      onChange={(e) => updateArrayItem('about', 'values', i, 'desc', e.target.value)}
                      placeholder="Description"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-background border text-sm resize-y outline-none focus:border-[#9db8e8] min-w-0"
                    />
                    <DeleteBtn onClick={() => removeArrayItem('about', 'values', i)} className="absolute top-2 right-2" />
                  </div>
                ))}
              </ArraySection>

              <ArraySection
                title="Timeline"
                accent="#9db8e8"
                onAdd={() => addArrayItem('about', 'timeline', { year: '', title: '', place: '', desc: '' })}
                addLabel="Add Event"
              >
                {settings.about.timeline.map((item, i) => (
                  <div key={i} className="bg-muted/30 p-3 rounded-xl border border-border space-y-2 relative">
                    <div className="flex gap-2 pr-8">
                      <input
                        value={item.year}
                        onChange={(e) => updateArrayItem('about', 'timeline', i, 'year', e.target.value)}
                        placeholder="2024"
                        className="w-20 px-2.5 py-1.5 rounded-lg bg-background border text-sm font-bold outline-none focus:border-[#9db8e8] min-w-0"
                      />
                      <input
                        value={item.title}
                        onChange={(e) => updateArrayItem('about', 'timeline', i, 'title', e.target.value)}
                        placeholder="Job Title"
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-background border text-sm font-semibold outline-none focus:border-[#9db8e8] min-w-0"
                      />
                    </div>
                    <input
                      value={item.place}
                      onChange={(e) => updateArrayItem('about', 'timeline', i, 'place', e.target.value)}
                      placeholder="Company / Location"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-background border text-sm outline-none focus:border-[#9db8e8] min-w-0"
                    />
                    <textarea
                      rows={2}
                      value={item.desc}
                      onChange={(e) => updateArrayItem('about', 'timeline', i, 'desc', e.target.value)}
                      placeholder="Description…"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-background border text-sm resize-y outline-none focus:border-[#9db8e8] min-w-0"
                    />
                    <DeleteBtn onClick={() => removeArrayItem('about', 'timeline', i)} className="absolute top-2 right-2" />
                  </div>
                ))}
              </ArraySection>
            </div>
          </div>
        )}

        {/* ── 3. CONTACT & SOCIALS ── */}
        {activeTab === 'contact' && (
          <div className="p-4 sm:p-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <section>
              <SectionHeading icon={Phone} label="Direct Contact Info" accent="#a8d5c2" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email Address">
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      className={cn(inputCls('#a8d5c2'), 'pl-8')}
                      value={settings.contact.email}
                      onChange={(e) => updateField('contact', 'email', e.target.value)}
                      placeholder="hello@domain.com"
                    />
                  </div>
                </Field>
                <Field label="Phone / WhatsApp">
                  <input
                    type="text"
                    className={inputCls('#a8d5c2')}
                    value={settings.contact.phone}
                    onChange={(e) => updateField('contact', 'phone', e.target.value)}
                    placeholder="+880 1…"
                  />
                </Field>
                <Field label="Contact Page Message" className="sm:col-span-2">
                  <textarea
                    rows={4}
                    className={cn(inputCls('#a8d5c2'), 'resize-y')}
                    value={settings.contact.shortText}
                    onChange={(e) => updateField('contact', 'shortText', e.target.value)}
                    placeholder="Got a project in mind?…"
                  />
                </Field>
              </div>
            </section>

            <section className="border-t border-border pt-6">
              <ArraySection
                title="Social Media Links"
                accent="#a8d5c2"
                onAdd={() => addArrayItem('contact', 'socials', { platform: '', url: '' })}
                addLabel="Add Link"
              >
                <div className="grid sm:grid-cols-2 gap-3">
                  {settings.contact.socials.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 border border-border rounded-xl">
                      <input
                        value={item.platform}
                        onChange={(e) => updateArrayItem('contact', 'socials', i, 'platform', e.target.value)}
                        placeholder="LinkedIn"
                        className="w-1/3 min-w-0 px-2.5 py-1.5 rounded-lg bg-background border text-sm outline-none focus:border-[#a8d5c2]"
                      />
                      <input
                        value={item.url}
                        onChange={(e) => updateArrayItem('contact', 'socials', i, 'url', e.target.value)}
                        placeholder="https://…"
                        className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-background border text-sm outline-none focus:border-[#a8d5c2]"
                      />
                      <DeleteBtn onClick={() => removeArrayItem('contact', 'socials', i)} />
                    </div>
                  ))}
                </div>
              </ArraySection>
            </section>
          </div>
        )}
      </div>

      {/* ── sticky mobile save bar ── */}
      <div className="sm:hidden fixed bottom-16 left-0 right-0 z-30 px-4 pb-2 pointer-events-none">
        <button
          onClick={() => saveSettings()}
          disabled={saving || !dirty}
          className="pointer-events-auto w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold shadow-2xl disabled:opacity-40 active:scale-[0.98] transition-all"
          style={{ backgroundColor: accent, color: '#1a1a1a' }}
        >
          {saving ? (
            <><Loader2 size={15} className="animate-spin" /> Saving…</>
          ) : dirty ? (
            <><Save size={15} /> Save Changes</>
          ) : (
            <><CheckCircle2 size={15} /> All saved</>
          )}
        </button>
      </div>

      {/* ── unsaved indicator ── */}
      {dirty && !saving && (
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-500 mt-3">
          <AlertCircle size={12} />
          You have unsaved changes
        </div>
      )}
    </div>
  )
}

// ─── tiny reusable atoms (file-local) ─────────────────────────────────────────

function SectionHeading({ icon: Icon, label, accent }: {
  icon: React.ElementType; label: string; accent: string
}) {
  return (
    <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
      <Icon size={15} style={{ color: accent }} />
      {label}
    </h3>
  )
}

function DeleteBtn({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn('p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0', className)}
    >
      <Trash2 size={14} />
    </button>
  )
}

function ArraySection({ title, accent, onAdd, addLabel, children }: {
  title: string; accent: string; onAdd: () => void; addLabel: string; children: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <button
          onClick={onAdd}
          className="text-xs font-semibold hover:underline flex items-center gap-1 shrink-0"
          style={{ color: accent }}
        >
          <Plus size={13} /> {addLabel}
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}
