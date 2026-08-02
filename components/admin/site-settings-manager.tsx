'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Upload, Trash2, Image, Film, Music, Loader2, X, Check,
  Home, User, Info, Plus, Save, ImagePlus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MediaPickerModal } from './media-picker-modal'

interface SiteSettings {
  hero: {
    coverMedia: string
    profileMedia: string
    name: string
    title: string
    bio: string
    tags: string[]
    location: string
    joinDate: string
    stats: { value: string; label: string }[]
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

function SingleMediaSlot({
  label, hint, value, accept, onChange, onDelete, onPickExisting, uploading
}: {
  label: string, hint?: string, value: string, accept: string
  onChange: (file: File) => void, onDelete: () => void, onPickExisting: () => void, uploading?: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)
  const kind = mediaKind(value)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
        {hint && <span className="text-[11px] text-muted-foreground/60">{hint}</span>}
      </div>

      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-border bg-muted group">
          {kind === 'image' && <img src={value} alt={label} className="w-full h-36 object-cover" />}
          {kind === 'video' && <video src={value} className="w-full h-36 object-cover" muted autoPlay loop playsInline />}
          {kind === 'audio' && (
            <div className="flex items-center gap-3 p-4 h-20">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#f4a29520' }}><Music size={18} style={{ color: '#f4a295' }} /></div>
              <audio src={value} controls className="flex-1 h-8" style={{ accentColor: '#f4a295' }} />
            </div>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            <button type="button" onClick={() => ref.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 text-black text-xs font-semibold hover:bg-white transition-colors">
              <Upload size={12} /> Replace
            </button>
            <button type="button" onClick={onPickExisting} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 text-black text-xs font-semibold hover:bg-white transition-colors">
              <ImagePlus size={12} /> Choose Existing
            </button>
            <button type="button" onClick={onDelete} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/90 text-white text-xs font-semibold hover:bg-red-500 transition-colors">
              <Trash2 size={12} /> Delete
            </button>
          </div>
          <div className="absolute top-2 left-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-black/60 text-white pointer-events-none">{kind}</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => ref.current?.click()} disabled={uploading} className={cn('w-full border-2 border-dashed rounded-2xl flex flex-col items-center gap-2.5 py-6 transition-colors', uploading ? 'border-brand/40 bg-brand/5 cursor-not-allowed' : 'border-border hover:border-[#f4a295]/50 hover:bg-muted/30')}>
            {uploading ? <Loader2 size={24} className="animate-spin" style={{ color: '#f4a295' }} /> : <><div className="flex items-center gap-2 text-muted-foreground"><Image size={18} /><Film size={18} /></div><span className="text-xs text-muted-foreground">Upload New</span></>}
          </button>
          <button type="button" onClick={onPickExisting} className="w-full border-2 border-dashed rounded-2xl flex flex-col items-center gap-2.5 py-6 transition-colors border-border hover:border-[#f4a295]/50 hover:bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground"><ImagePlus size={18} /></div><span className="text-xs text-muted-foreground">Choose Existing</span>
          </button>
        </div>
      )}
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) onChange(file); e.target.value = '' }} />
    </div>
  )
}

function MultiMediaSlot({
  value, uploading, onAdd, onDelete, onPickExisting
}: {
  value: string[], uploading: boolean, onAdd: (file: File) => void, onDelete: (i: number) => void, onPickExisting: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">About Page Media</label>
        <span className="text-[11px] text-muted-foreground/60">{value.length} file{value.length !== 1 ? 's' : ''} — images & video</span>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {value.map((url, i) => {
            const kind = mediaKind(url)
            return (
              <div key={url + i} className="relative rounded-xl overflow-hidden border border-border bg-muted group/m">
                {kind === 'image' && <img src={url} alt="" className="w-full h-28 object-cover" />}
                {kind === 'video' && <video src={url} className="w-full h-28 object-cover" muted autoPlay loop playsInline />}
                {kind === 'audio' && <div className="w-full h-28 flex flex-col items-center justify-center gap-2 text-muted-foreground"><Music size={22} /><span className="text-[10px]">Audio</span></div>}
                <button type="button" onClick={() => onDelete(i)} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover/m:opacity-100 transition-opacity hover:bg-black"><X size={11} /></button>
                <div className="absolute bottom-1.5 left-1.5 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/60 text-white pointer-events-none">{kind}</div>
              </div>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading} className={cn('w-full border-2 border-dashed rounded-xl flex items-center justify-center gap-2 py-4 transition-colors', uploading ? 'border-brand/40 bg-brand/5 cursor-not-allowed' : 'border-border hover:border-[#f4a295]/50 hover:bg-muted/30')}>
          {uploading ? <Loader2 size={18} className="animate-spin" style={{ color: '#f4a295' }} /> : <><Upload size={15} className="text-muted-foreground" /><span className="text-xs text-muted-foreground">Upload New</span></>}
        </button>
        <button type="button" onClick={onPickExisting} className="w-full border-2 border-dashed rounded-xl flex items-center justify-center gap-2 py-4 transition-colors border-border hover:border-[#f4a295]/50 hover:bg-muted/30">
          <ImagePlus size={15} className="text-muted-foreground" /><span className="text-xs text-muted-foreground">Choose Existing</span>
        </button>
      </div>

      <input ref={ref} type="file" accept="image/*,video/mp4,video/webm,audio/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) onAdd(file); e.target.value = '' }} />
    </div>
  )
}

function Section({ icon: Icon, title, description, children, accent }: { icon: any, title: string, description: string, children: React.ReactNode, accent?: string }) {
  const color = accent ?? '#f4a295'
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border" style={{ background: color + '0a' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + '20' }}><Icon size={18} style={{ color }} /></div>
        <div><p className="font-semibold text-foreground text-sm">{title}</p><p className="text-[11px] text-muted-foreground">{description}</p></div>
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </div>
  )
}

export function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings>({
    hero: { coverMedia: '', profileMedia: '', name: '', title: '', bio: '', tags: [], location: '', joinDate: '', stats: [] },
    about: { media: [] },
  })
  
  const [tagsInput, setTagsInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null)
  const [pickingSlot, setPickingSlot] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

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
      
      const hero = {
        coverMedia: data.hero?.coverMedia ?? '',
        profileMedia: data.hero?.profileMedia ?? '',
        name: data.hero?.name ?? 'Zihad Imtiase',
        title: data.hero?.title ?? 'Frontend Developer & Webflow Specialist',
        bio: data.hero?.bio ?? 'Crafting websites that drive engagement, conversions & success.',
        tags: Array.isArray(data.hero?.tags) ? data.hero.tags : ['#frontend', '#webflow', '#react', '#landingpage', '#CRO'],
        location: data.hero?.location ?? 'Dhaka Cantonment, Bangladesh',
        joinDate: data.hero?.joinDate ?? 'Joined March 2022',
        stats: Array.isArray(data.hero?.stats) ? data.hero.stats : [{ value: '50+', label: 'Projects' }, { value: '40+', label: 'Clients' }, { value: '4+', label: 'Years' }]
      }

      setSettings({ hero, about: { media: Array.isArray(data.about?.media) ? data.about.media : [] } })
      setTagsInput(hero.tags.join(', '))
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
      const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) })
      if (res.ok) addToast('Settings saved successfully!')
      else addToast('Failed to save settings', false)
    } catch {
      addToast('Failed to save settings', false)
    } finally {
      setSaving(false)
    }
  }

  async function handleHeroSlot(file: File, field: 'coverMedia' | 'profileMedia') {
    const url = await uploadFile(file, `hero.${field}`)
    if (!url) return
    const next: SiteSettings = { ...settings, hero: { ...settings.hero, [field]: url } }
    setSettings(next)
    await saveSettings(next)
  }

  function handleHeroExisting(urls: string[], field: 'coverMedia' | 'profileMedia') {
    if (urls.length === 0) return
    const url = urls[0]
    const next: SiteSettings = { ...settings, hero: { ...settings.hero, [field]: url } }
    setSettings(next)
    saveSettings(next)
  }

  function deleteHeroSlot(field: 'coverMedia' | 'profileMedia') {
    const next: SiteSettings = { ...settings, hero: { ...settings.hero, [field]: '' } }
    setSettings(next)
    saveSettings(next)
  }

  async function handleAboutAdd(file: File) {
    const url = await uploadFile(file, 'about.media')
    if (!url) return
    const next: SiteSettings = { ...settings, about: { media: [...settings.about.media, url] } }
    setSettings(next)
    await saveSettings(next)
  }

  function handleAboutExisting(urls: string[]) {
    if (urls.length === 0) return
    const next: SiteSettings = { ...settings, about: { media: [...settings.about.media, ...urls] } }
    setSettings(next)
    saveSettings(next)
  }

  function handleAboutDelete(index: number) {
    const next: SiteSettings = { ...settings, about: { media: settings.about.media.filter((_, i) => i !== index) } }
    setSettings(next)
    saveSettings(next)
  }

  function handleHeroTextChange(field: string, value: string) {
    setSettings(prev => ({ ...prev, hero: { ...prev.hero, [field]: value } }))
  }

  function handleStatChange(index: number, key: 'value' | 'label', val: string) {
    const newStats = [...settings.hero.stats]
    newStats[index] = { ...newStats[index], [key]: val }
    setSettings(prev => ({ ...prev, hero: { ...prev.hero, stats: newStats } }))
  }

  function addStat() {
    setSettings(prev => ({ ...prev, hero: { ...prev.hero, stats: [...prev.hero.stats, { value: '', label: '' }] } }))
  }

  function removeStat(index: number) {
    setSettings(prev => ({ ...prev, hero: { ...prev.hero, stats: prev.hero.stats.filter((_, i) => i !== index) } }))
  }

  function handleSaveTextInfo(e: React.FormEvent) {
    e.preventDefault()
    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    const updatedSettings = { ...settings, hero: { ...settings.hero, tags: tagsArray } }
    setSettings(updatedSettings)
    saveSettings(updatedSettings)
  }

  if (loading) {
    return <div className="flex flex-col gap-4">{[1, 2].map((n) => <div key={n} className="animate-pulse rounded-2xl bg-muted h-48" />)}</div>
  }

  return (
    <div className="relative space-y-5 pb-10">
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className={cn('px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg pointer-events-auto', t.ok ? 'bg-foreground text-background' : 'bg-destructive text-white')}>{t.msg}</div>
        ))}
      </div>

      <Section icon={Home} title="Hero Media Banner & Avatar" description="Profile photo/video and cover banner shown on the home feed">
        <SingleMediaSlot
          label="Cover Banner" hint="Shown as the header banner — image or video"
          value={settings.hero.coverMedia} accept="image/*,video/mp4,video/webm"
          uploading={uploadingSlot === 'hero.coverMedia'}
          onChange={(f) => handleHeroSlot(f, 'coverMedia')}
          onDelete={() => deleteHeroSlot('coverMedia')}
          onPickExisting={() => setPickingSlot('hero.coverMedia')}
        />
        <SingleMediaSlot
          label="Profile Photo / Video" hint="Displayed as the avatar on the hero card"
          value={settings.hero.profileMedia} accept="image/*,video/mp4,video/webm"
          uploading={uploadingSlot === 'hero.profileMedia'}
          onChange={(f) => handleHeroSlot(f, 'profileMedia')}
          onDelete={() => deleteHeroSlot('profileMedia')}
          onPickExisting={() => setPickingSlot('hero.profileMedia')}
        />
      </Section>

      <Section icon={User} title="Hero Profile Information" description="Edit your name, bio, tags, location, and stats displayed on the home page" accent="#e8806f">
        <form onSubmit={handleSaveTextInfo} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label><input type="text" value={settings.hero.name} onChange={(e) => handleHeroTextChange('name', e.target.value)} placeholder="Zihad Imtiase" className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:border-[#f4a295]" /></div>
            <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Professional Title</label><input type="text" value={settings.hero.title} onChange={(e) => handleHeroTextChange('title', e.target.value)} placeholder="Frontend Developer & Webflow Specialist" className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:border-[#f4a295]" /></div>
          </div>
          <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Short Bio</label><textarea rows={2} value={settings.hero.bio} onChange={(e) => handleHeroTextChange('bio', e.target.value)} placeholder="Crafting websites that drive engagement..." className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:border-[#f4a295]" /></div>
          <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hashtags (Comma separated)</label><input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="#frontend, #webflow, #react, #landingpage" className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:border-[#f4a295]" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</label><input type="text" value={settings.hero.location} onChange={(e) => handleHeroTextChange('location', e.target.value)} placeholder="Dhaka Cantonment, Bangladesh" className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:border-[#f4a295]" /></div>
            <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Join Date / Experience Info</label><input type="text" value={settings.hero.joinDate} onChange={(e) => handleHeroTextChange('joinDate', e.target.value)} placeholder="Joined March 2022" className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:border-[#f4a295]" /></div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stats Counters</label><button type="button" onClick={addStat} className="flex items-center gap-1 text-xs text-[#f4a295] font-semibold hover:underline"><Plus size={14} /> Add Stat</button></div>
            <div className="space-y-2">
              {settings.hero.stats.map((st, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="text" value={st.value} onChange={(e) => handleStatChange(i, 'value', e.target.value)} placeholder="50+" className="w-24 px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-sm font-bold focus:outline-none focus:border-[#f4a295]" />
                  <input type="text" value={st.label} onChange={(e) => handleStatChange(i, 'label', e.target.value)} placeholder="Projects" className="flex-1 px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:border-[#f4a295]" />
                  <button type="button" onClick={() => removeStat(i)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors"><X size={16} /></button>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-3">
            <button type="submit" disabled={saving} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity active:scale-95 text-[#1a1a1a] bg-[#f4a295] hover:opacity-90 disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Profile Info
            </button>
          </div>
        </form>
      </Section>

      <Section icon={User} title="About Page Media" description="Images or videos shown in the photo section of the About page" accent="#9db8e8">
        <MultiMediaSlot
          value={settings.about.media} uploading={uploadingSlot === 'about.media'}
          onAdd={handleAboutAdd} onDelete={handleAboutDelete} onPickExisting={() => setPickingSlot('about.media')}
        />
      </Section>

      <MediaPickerModal 
        isOpen={pickingSlot !== null} 
        onClose={() => setPickingSlot(null)} 
        multiple={pickingSlot === 'about.media'}
        onSelect={(urls) => {
          if (pickingSlot === 'hero.coverMedia') handleHeroExisting(urls, 'coverMedia')
          else if (pickingSlot === 'hero.profileMedia') handleHeroExisting(urls, 'profileMedia')
          else if (pickingSlot === 'about.media') handleAboutExisting(urls)
        }} 
      />
    </div>
  )
}
