'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Save, Loader2, User, Hash, Calendar, BarChart2,
  MapPin, Phone, ChevronDown, ChevronUp, CheckCircle2,
  MousePointerClick, ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SiteSettings } from '@/lib/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clone<T>(v: T): T { return JSON.parse(JSON.stringify(v)) }

const inputCls = cn(
  'w-full px-3 py-2.5 rounded-xl bg-muted/60 border border-border',
  'outline-none focus:border-[#f4a295] focus:bg-background transition-colors',
  'text-sm placeholder:text-muted-foreground/40 text-foreground'
)

const labelCls = 'block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5'

function Field({ label, hint, children, className }: {
  label: string; hint?: string; children: React.ReactNode; className?: string
}) {
  return (
    <div className={cn('space-y-0', className)}>
      <label className={labelCls}>{label}</label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{hint}</p>}
    </div>
  )
}

function SectionHeader({ icon: Icon, label, accent = '#f4a295', open, onToggle }: {
  icon: React.ElementType; label: string; accent?: string; open: boolean; onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between py-3 border-b border-border/60 group"
    >
      <span className="flex items-center gap-2 text-sm font-bold text-foreground">
        <Icon size={15} style={{ color: accent }} />
        {label}
      </span>
      {open
        ? <ChevronUp size={15} className="text-muted-foreground group-hover:text-foreground transition-colors" />
        : <ChevronDown size={15} className="text-muted-foreground group-hover:text-foreground transition-colors" />
      }
    </button>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditProfilePageProps {
  settings: SiteSettings
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EditProfilePage({ settings }: EditProfilePageProps) {
  const router = useRouter()
  const [form, setForm] = useState<SiteSettings>(() => clone(settings))
  const [tagsInput, setTagsInput] = useState(settings.hero.tags.join(', '))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [openSections, setOpenSections] = useState({
    basic: true,
    talks: true,
    joined: true,
    status: true,
    location: true,
    contact: true,
    button: true,
  })

  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

  const setHero = useCallback(<K extends keyof SiteSettings['hero']>(key: K, val: SiteSettings['hero'][K]) => {
    setForm(prev => ({ ...prev, hero: { ...prev.hero, [key]: val } }))
  }, [])

  const setContact = useCallback(<K extends keyof SiteSettings['contact']>(key: K, val: SiteSettings['contact'][K]) => {
    setForm(prev => ({ ...prev, contact: { ...prev.contact, [key]: val } }))
  }, [])

  const setStatField = useCallback((index: number, key: 'value' | 'label', val: string) => {
    setForm(prev => {
      const next = clone(prev)
      // Ensure stats array has at least 3 entries
      while (next.hero.stats.length < 3) {
        next.hero.stats.push({ value: '', label: '' })
      }
      next.hero.stats[index] = { ...next.hero.stats[index], [key]: val }
      return next
    })
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    setError('')
    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(Boolean)

    const firstName = form.hero.firstName.trim()
    const lastName = form.hero.lastName.trim()
    const nickname = form.hero.nickname.trim()
    const name = [firstName, lastName].filter(Boolean).join(' ') || form.hero.name
    const city = form.hero.city.trim()
    const country = form.hero.country.trim()
    const location = [city, country].filter(Boolean).join(', ')

    const normalizedStats = form.hero.stats.map(s => ({
      ...s,
      value: s.value && !s.value.includes('+') && /^\d+$/.test(s.value.trim())
        ? `${s.value.trim()}+`
        : s.value,
    }))

    const payload: SiteSettings = {
      ...form,
      hero: {
        ...form.hero,
        name,
        firstName,
        lastName,
        nickname,
        tags: tagsArray,
        city,
        country,
        location,
        stats: normalizedStats,
      },
      contact: { ...form.contact, address: location || form.contact.address },
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => router.push('/'), 800)
      } else if (res.status === 401) {
        setError('Session expired. Please log in again.')
        setTimeout(() => router.push('/admin'), 1500)
      } else {
        setError('Failed to save. Please try again.')
      }
    } catch {
      setError('Network error — please try again.')
    } finally {
      setSaving(false)
    }
  }, [form, tagsInput, router])

  const statsLabels = ['Projects count', 'Clients count', 'Years of experience']

  // Ensure stats always has 3 entries for the form
  const formStats = form.hero.stats.length >= 3
    ? form.hero.stats
    : [
        form.hero.stats[0] ?? { value: '', label: 'Projects' },
        form.hero.stats[1] ?? { value: '', label: 'Clients' },
        form.hero.stats[2] ?? { value: '', label: 'Years' },
      ]

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-foreground leading-tight">Edit Profile</h1>
            <p className="text-[11px] text-muted-foreground leading-tight hidden sm:block">Changes go live on your public profile.</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 shadow-sm shrink-0',
            saved ? 'bg-green-500 text-white' : 'text-[#1a1a1a]'
          )}
          style={saved ? {} : { backgroundColor: '#f4a295' }}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="mx-4 mt-3 px-4 py-2.5 rounded-xl bg-destructive/10 border border-destructive/30 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ── Form Body ── */}
      <div className="max-w-2xl mx-auto px-4 py-5 pb-28 space-y-1">

        {/* ── Basic Info ── */}
        <SectionHeader icon={User} label="Basic Info" open={openSections.basic} onToggle={() => toggleSection('basic')} />
        {openSections.basic && (
          <div className="pt-4 pb-5 grid grid-cols-2 gap-3">
            <Field label="First Name">
              <input
                className={inputCls}
                value={form.hero.firstName}
                onChange={e => setHero('firstName', e.target.value)}
                placeholder="Zihad"
              />
            </Field>
            <Field label="Last Name">
              <input
                className={inputCls}
                value={form.hero.lastName}
                onChange={e => setHero('lastName', e.target.value)}
                placeholder="Imtiase"
              />
            </Field>
            <Field label="Nickname / Additional name" className="col-span-2">
              <input
                className={inputCls}
                value={form.hero.nickname}
                onChange={e => setHero('nickname', e.target.value)}
                placeholder="e.g. Munna"
              />
            </Field>
            <Field label="Headline / Professional Title" className="col-span-2">
              <input
                className={inputCls}
                value={form.hero.title}
                onChange={e => setHero('title', e.target.value)}
                placeholder="Frontend Developer & Webflow Specialist"
              />
            </Field>
            <Field label="Short Bio" className="col-span-2">
              <textarea
                rows={3}
                className={cn(inputCls, 'resize-y leading-relaxed')}
                value={form.hero.bio}
                onChange={e => setHero('bio', e.target.value)}
                placeholder="Crafting websites that drive engagement…"
              />
            </Field>
          </div>
        )}

        {/* ── Talks About ── */}
        <SectionHeader icon={Hash} label="Talks About" accent="#9db8e8" open={openSections.talks} onToggle={() => toggleSection('talks')} />
        {openSections.talks && (
          <div className="pt-4 pb-5">
            <Field label="Hashtag / Tag titles" hint="Comma-separated. Prefix with # or leave plain — both work.">
              <input
                className={inputCls}
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="#frontend, #webflow, #react"
              />
            </Field>
          </div>
        )}

        {/* ── Joined Date ── */}
        <SectionHeader icon={Calendar} label="Joined Date" accent="#a8d5c2" open={openSections.joined} onToggle={() => toggleSection('joined')} />
        {openSections.joined && (
          <div className="pt-4 pb-5">
            <Field label="Join Date" hint='Pick a date — displayed as "Joined Month YYYY" on the profile.'>
              <input
                type="date"
                className={inputCls}
                value={(() => {
                  const raw = form.hero.joinDate
                  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
                  const parsed = new Date(raw.replace('Joined ', ''))
                  if (!isNaN(parsed.getTime())) {
                    return parsed.toISOString().split('T')[0]
                  }
                  return ''
                })()}
                onChange={e => {
                  const d = new Date(e.target.value)
                  if (!isNaN(d.getTime())) {
                    const formatted = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    setHero('joinDate', `Joined ${formatted}`)
                  } else {
                    setHero('joinDate', e.target.value)
                  }
                }}
              />
            </Field>
          </div>
        )}

        {/* ── Current Status (Stats) ── */}
        <SectionHeader icon={BarChart2} label="Current Status" open={openSections.status} onToggle={() => toggleSection('status')} />
        {openSections.status && (
          <div className="pt-4 pb-5 grid grid-cols-1 gap-3">
            <p className="text-[11px] text-muted-foreground -mt-1">
              Enter numbers only — a <span className="text-foreground font-semibold">+</span> sign is appended automatically on the public profile.
            </p>
            {formStats.map((stat, i) => (
              <div key={i} className="flex items-center gap-3 bg-muted/30 border border-border rounded-xl px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className={labelCls}>{statsLabels[i] ?? stat.label}</p>
                  <input
                    type="number"
                    min={0}
                    className={cn(inputCls, 'mt-0')}
                    value={stat.value.replace(/\+$/, '')}
                    onChange={e => setStatField(i, 'value', e.target.value)}
                    placeholder={i === 0 ? '50' : i === 1 ? '40' : '4'}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Location ── */}
        <SectionHeader icon={MapPin} label="Location" accent="#f4a295" open={openSections.location} onToggle={() => toggleSection('location')} />
        {openSections.location && (
          <div className="pt-4 pb-5 grid grid-cols-2 gap-3">
            <Field label="Country">
              <input
                className={inputCls}
                value={form.hero.country}
                onChange={e => setHero('country', e.target.value)}
                placeholder="Bangladesh"
              />
            </Field>
            <Field label="City">
              <input
                className={inputCls}
                value={form.hero.city}
                onChange={e => setHero('city', e.target.value)}
                placeholder="Dhaka Cantonment"
              />
            </Field>
          </div>
        )}

        {/* ── Contact Info ── */}
        <SectionHeader icon={Phone} label="Contact Info" accent="#a8d5c2" open={openSections.contact} onToggle={() => toggleSection('contact')} />
        {openSections.contact && (
          <div className="pt-4 pb-6 grid grid-cols-1 gap-3">
            <Field label="Email Address">
              <input
                type="email"
                className={inputCls}
                value={form.contact.email}
                onChange={e => setContact('email', e.target.value)}
                placeholder="hello@domain.com"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone No">
                <input
                  className={inputCls}
                  value={form.contact.phone}
                  onChange={e => setContact('phone', e.target.value)}
                  placeholder="+880 1…"
                />
              </Field>
              <Field label="WhatsApp No">
                <input
                  className={inputCls}
                  value={form.contact.whatsapp}
                  onChange={e => setContact('whatsapp', e.target.value)}
                  placeholder="+880 1…"
                />
              </Field>
            </div>
            <Field label="Contact Heading">
              <input
                className={inputCls}
                value={form.contact.contactHeading}
                onChange={e => setContact('contactHeading', e.target.value)}
                placeholder="Got a project in mind?"
              />
            </Field>
            <Field label="Contact Sub-details Heading">
              <textarea
                rows={2}
                className={cn(inputCls, 'resize-y leading-relaxed')}
                value={form.contact.contactSubHeading}
                onChange={e => setContact('contactSubHeading', e.target.value)}
                placeholder="Let's build something great together…"
              />
            </Field>
          </div>
        )}

        {/* ── Profile Button ── */}
        <SectionHeader icon={MousePointerClick} label="Profile Button" accent="#f4a295" open={openSections.button} onToggle={() => toggleSection('button')} />
        {openSections.button && (
          <div className="pt-4 pb-6 grid grid-cols-1 gap-3">
            <p className="text-[11px] text-muted-foreground -mt-1">This button appears on your public profile. Leave blank to hide it.</p>
            <Field label="Button Text">
              <input
                className={inputCls}
                value={form.hero.profileButtonText ?? ''}
                onChange={e => setHero('profileButtonText', e.target.value)}
                placeholder="Hire Me"
              />
            </Field>
            <Field label="Button Link / URL" hint="Use a full URL (https://…), mailto:, or an internal path like /contact.">
              <input
                className={inputCls}
                value={form.hero.profileButtonLink ?? ''}
                onChange={e => setHero('profileButtonLink', e.target.value)}
                placeholder="/contact  or  https://wa.me/…"
              />
            </Field>
          </div>
        )}
      </div>

      {/* ── Sticky Mobile Footer Save ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-2 bg-background/95 backdrop-blur border-t border-border sm:hidden">
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] shadow-sm',
            saved ? 'bg-green-500 text-white' : 'text-[#1a1a1a]'
          )}
          style={saved ? {} : { backgroundColor: '#f4a295' }}
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
