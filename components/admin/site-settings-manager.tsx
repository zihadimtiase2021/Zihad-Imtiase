'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, FileText, Save, CheckCircle2, AlertCircle } from 'lucide-react'
import { ToastStack } from '@/components/admin/shared'
import { useToast } from '@/hooks/use-toast'
import type { SiteSettings } from '@/lib/types'

// Tab Components
import { AboutTab } from './site-settings/about-tab'

function clone<T>(v: T): T { return JSON.parse(JSON.stringify(v)) }

const EMPTY_SETTINGS: SiteSettings = {
  hero: {
    coverMedia: '', profileMedia: '', firstName: '', lastName: '', nickname: '',
    name: '', title: '', bio: '', tags: [], country: '', city: '', location: '',
    joinDate: '', stats: [], hireMeLink: '', profileButtonText: '', profileButtonLink: '',
  },
  about: { media: [], introText: '', timeline: [], stack: [], values: [] },
  contact: { email: '', phone: '', whatsapp: '', address: '', shortText: '', contactHeading: '', contactSubHeading: '', socials: [] },
  meta: { title: '', description: '', favicon: '' },
}

export function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings>(EMPTY_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const { toasts, addToast } = useToast()

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
            firstName: data.hero?.firstName ?? '',
            lastName: data.hero?.lastName ?? '',
            nickname: data.hero?.nickname ?? '',
            name: data.hero?.name ?? '',
            title: data.hero?.title ?? '',
            bio: data.hero?.bio ?? '',
            tags: Array.isArray(data.hero?.tags) ? data.hero.tags : [],
            country: data.hero?.country ?? '',
            city: data.hero?.city ?? '',
            location: data.hero?.location ?? '',
            joinDate: data.hero?.joinDate ?? '',
            stats: Array.isArray(data.hero?.stats) ? data.hero.stats : [],
            hireMeLink: data.hero?.hireMeLink ?? '',
            profileButtonText: data.hero?.profileButtonText ?? '',
            profileButtonLink: data.hero?.profileButtonLink ?? '',
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
            whatsapp: data.contact?.whatsapp ?? '',
            address: data.contact?.address ?? '',
            shortText: data.contact?.shortText ?? '',
            contactHeading: data.contact?.contactHeading ?? '',
            contactSubHeading: data.contact?.contactSubHeading ?? '',
            socials: Array.isArray(data.contact?.socials) ? data.contact.socials : [],
          },
          meta: {
            title: data.meta?.title ?? '',
            description: data.meta?.description ?? '',
            favicon: data.meta?.favicon ?? '',
          },
        }
        setSettings(s)
        setDirty(false)
      } catch {
        addToast('Failed to load settings', false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchSettings()
    return () => { cancelled = true }
  }, [addToast])

  const saveSettings = useCallback(async (override?: SiteSettings) => {
    setSaving(true)
    const src = override ?? settings
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(src),
      })
      if (res.ok) { addToast('Settings saved!'); setDirty(false) }
      else addToast('Failed to save settings', false)
    } catch { addToast('Network error — settings not saved', false) }
    finally { setSaving(false) }
  }, [settings, addToast])

  const updateField = useCallback(<S extends keyof SiteSettings>(section: S, field: keyof SiteSettings[S], value: SiteSettings[S][keyof SiteSettings[S]]) => {
    setSettings((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
    setDirty(true)
  }, [])

  const updateArrayItem = useCallback(<S extends 'hero' | 'about' | 'contact'>(section: S, field: string, index: number, key: string, val: unknown) => {
    setSettings((prev) => {
      const next = clone(prev)
      const arr = (next[section] as any)[field]; arr[index] = { ...arr[index], [key]: val }
      return next
    })
    setDirty(true)
  }, [])

  const addArrayItem = useCallback(<S extends 'hero' | 'about' | 'contact'>(section: S, field: string, emptyItem: unknown) => {
    setSettings((prev) => {
      const next = clone(prev)
      ;(next[section] as any)[field] = [...(next[section] as any)[field], emptyItem]
      return next
    })
    setDirty(true)
  }, [])

  const removeArrayItem = useCallback(<S extends 'hero' | 'about' | 'contact'>(section: S, field: string, index: number) => {
    setSettings((prev) => {
      const next = clone(prev)
      ;(next[section] as any)[field] = (next[section] as any)[field].filter((_: any, i: number) => i !== index)
      return next
    })
    setDirty(true)
  }, [])

  function appendAboutMedia(urls: string[]) {
    setSettings((prev) => {
      const next = clone(prev); next.about.media = [...next.about.media, ...urls]
      saveSettings(next); return next
    })
  }

  function deleteMedia(slot: string, index?: number) {
    setSettings((prev) => {
      const next = clone(prev)
      if (slot === 'about.media' && index !== undefined) next.about.media = next.about.media.filter((_, i) => i !== index)
      saveSettings(next); return next
    })
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <Loader2 className="animate-spin" style={{ color: '#f4a295' }} size={28} />
      <p className="text-sm text-muted-foreground">Loading settings…</p>
    </div>
  )

  return (
    <div className="relative pb-28 sm:pb-10">
      <ToastStack toasts={toasts} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-foreground">Global Settings</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Profile & Contact editing is available directly on the home page (admin only).
          </p>
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

      {/* Single tab: About & Stack */}
      <div className="flex p-1 bg-muted/50 border border-border rounded-2xl mb-5">
        <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-background shadow-sm text-foreground">
          <FileText size={13} style={{ color: '#9db8e8' }} />
          About &amp; Stack
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm">
        <AboutTab
          settings={settings}
          updateField={updateField}
          updateArrayItem={updateArrayItem}
          addArrayItem={addArrayItem}
          removeArrayItem={removeArrayItem}
          appendAboutMedia={appendAboutMedia}
          deleteMedia={deleteMedia}
        />
      </div>

      {/* Mobile sticky save button */}
      <div className="sm:hidden fixed bottom-16 left-0 right-0 z-30 px-4 pb-2 pointer-events-none">
        <button
          onClick={() => saveSettings()}
          disabled={saving || !dirty}
          className="pointer-events-auto w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold shadow-2xl disabled:opacity-40 active:scale-[0.98] transition-all"
          style={{ backgroundColor: '#9db8e8', color: '#1a1a1a' }}
        >
          {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
            : dirty ? <><Save size={15} /> Save Changes</>
            : <><CheckCircle2 size={15} /> All saved</>}
        </button>
      </div>

      {dirty && !saving && (
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-500 mt-3">
          <AlertCircle size={12} /> You have unsaved changes
        </div>
      )}
    </div>
  )
}
