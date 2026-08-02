'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Upload, Trash2, Image as ImageIcon, Film, Music, Loader2, X, Check,
  Home, User, Info, Plus, Save, ImagePlus, Settings2, Phone
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MediaPickerModal } from './media-picker-modal'
import { ImageCropperModal } from './image-cropper-modal'

// --- Interfaces ---
interface TimelineItem { year: string; title: string; place: string; desc: string }
interface StackItem { name: string; level: number }
interface ValueItem { title: string; desc: string }
interface SocialItem { platform: string; url: string }

interface SiteSettings {
  hero: {
    coverMedia: string; profileMedia: string; name: string; title: string; bio: string;
    tags: string[]; location: string; joinDate: string; stats: { value: string; label: string }[];
  }
  about: {
    media: string[]; introText: string; timeline: TimelineItem[]; stack: StackItem[]; values: ValueItem[];
  }
  contact: {
    email: string; phone: string; address: string; shortText: string; socials: SocialItem[];
  }
}

type Toast = { id: number; msg: string; ok: boolean }

// --- Utility Functions ---
function mediaKind(url: string): 'image' | 'video' | 'audio' | 'none' {
  if (!url) return 'none'
  if (/\.(mp4|webm|mov)$/i.test(url)) return 'video'
  if (/\.(mp3|ogg|wav|aac|flac|m4a)$/i.test(url)) return 'audio'
  return 'image'
}

function Section({ icon: Icon, title, description, children, accent }: any) {
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

// --- Main Component ---
export function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings>({
    hero: { coverMedia: '', profileMedia: '', name: '', title: '', bio: '', tags: [], location: '', joinDate: '', stats: [] },
    about: { media: [], introText: '', timeline: [], stack: [], values: [] },
    contact: { email: '', phone: '', address: '', shortText: '', socials: [] }
  })
  
  const [tagsInput, setTagsInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadFormat, setUploadFormat] = useState<'original' | 'webp' | 'avif'>('webp')
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null)
  
  const [pickingSlot, setPickingSlot] = useState<string | null>(null) // For Existing Media
  const [cropConfig, setCropConfig] = useState<{ file: File; slot: string; ratio: number } | null>(null) // For Cropper

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
        coverMedia: data.hero?.coverMedia ?? '', profileMedia: data.hero?.profileMedia ?? '',
        name: data.hero?.name ?? '', title: data.hero?.title ?? '', bio: data.hero?.bio ?? '',
        tags: Array.isArray(data.hero?.tags) ? data.hero.tags : [],
        location: data.hero?.location ?? '', joinDate: data.hero?.joinDate ?? '',
        stats: Array.isArray(data.hero?.stats) ? data.hero.stats : []
      }
      const about = {
        media: Array.isArray(data.about?.media) ? data.about.media : [],
        introText: data.about?.introText ?? '',
        timeline: Array.isArray(data.about?.timeline) ? data.about.timeline : [],
        stack: Array.isArray(data.about?.stack) ? data.about.stack : [],
        values: Array.isArray(data.about?.values) ? data.about.values : []
      }
      const contact = {
        email: data.contact?.email ?? '', phone: data.contact?.phone ?? '', address: data.contact?.address ?? '',
        shortText: data.contact?.shortText ?? '', socials: Array.isArray(data.contact?.socials) ? data.contact?.socials : []
      }

      setSettings({ hero, about, contact })
      setTagsInput(hero.tags.join(', '))
    } catch {
      addToast('Failed to load settings', false)
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings(next: SiteSettings = settings) {
    setSaving(true)
    // Sync tags before saving
    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    const payload = { ...next, hero: { ...next.hero, tags: tagsArray } }
    
    try {
      const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) addToast('Settings saved successfully!')
      else addToast('Failed to save settings', false)
    } catch {
      addToast('Failed to save settings', false)
    } finally {
      setSaving(false)
    }
  }

  // --- File Upload & Crop Handlers ---
  async function uploadActualFile(file: File, slot: string) {
    setUploadingSlot(slot)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('format', uploadFormat)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) {
        let next = { ...settings }
        if (slot === 'hero.coverMedia') next.hero.coverMedia = data.url
        else if (slot === 'hero.profileMedia') next.hero.profileMedia = data.url
        else if (slot === 'about.media') next.about.media = [...next.about.media, data.url]
        
        setSettings(next)
        await saveSettings(next)
      } else addToast(`Upload failed: ${file.name}`, false)
    } catch {
      addToast(`Upload failed: ${file.name}`, false)
    } finally {
      setUploadingSlot(null)
    }
  }

  function handleFileIntent(file: File, slot: string, ratio: number) {
    if (file.type.startsWith('image/')) setCropConfig({ file, slot, ratio })
    else uploadActualFile(file, slot) // Video/Audio
  }

  // --- Existing Media Select ---
  function handleExistingMedia(urls: string[], slot: string) {
    if (urls.length === 0) return
    let next = { ...settings }
    if (slot === 'hero.coverMedia') next.hero.coverMedia = urls[0]
    else if (slot === 'hero.profileMedia') next.hero.profileMedia = urls[0]
    else if (slot === 'about.media') next.about.media = [...next.about.media, ...urls]
    
    setSettings(next)
    saveSettings(next)
  }

  // --- Delete Media ---
  function deleteMedia(slot: string, index?: number) {
    let next = { ...settings }
    if (slot === 'hero.coverMedia') next.hero.coverMedia = ''
    else if (slot === 'hero.profileMedia') next.hero.profileMedia = ''
    else if (slot === 'about.media' && index !== undefined) next.about.media.splice(index, 1)
    
    setSettings(next)
    saveSettings(next)
  }

  // --- Dynamic Array Updaters ---
  function updateArray(section: 'about' | 'contact', field: string, index: number, key: string, val: any) {
    let next = { ...settings }
    ;(next[section] as any)[field][index][key] = val
    setSettings(next)
  }
  function addArrayItem(section: 'about' | 'contact', field: string, emptyItem: any) {
    let next = { ...settings }
    ;(next[section] as any)[field].push(emptyItem)
    setSettings(next)
  }
  function removeArrayItem(section: 'about' | 'contact', field: string, index: number) {
    let next = { ...settings }
    ;(next[section] as any)[field].splice(index, 1)
    setSettings(next)
  }

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#f4a295]" /></div>

  return (
    <div className="relative space-y-5 pb-10">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => <div key={t.id} className={cn('px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg pointer-events-auto', t.ok ? 'bg-foreground text-background' : 'bg-destructive text-white')}>{t.msg}</div>)}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Site Settings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage full website content, images, and texts.</p>
        </div>
        <button onClick={() => saveSettings()} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#1a1a1a] bg-[#f4a295] hover:opacity-90 disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save All Changes
        </button>
      </div>

      {/* --- HERO SECTION --- */}
      <Section icon={Home} title="Home Page - Hero Banner" description="Cover photo (16:9) and Profile avatar (1:1)" accent="#f4a295">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cover Media */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cover Banner</label>
            {settings.hero.coverMedia ? (
              <div className="relative rounded-xl overflow-hidden bg-muted group border border-border h-40">
                {mediaKind(settings.hero.coverMedia) === 'video' ? <video src={settings.hero.coverMedia} className="w-full h-full object-cover" autoPlay loop muted /> : <img src={settings.hero.coverMedia} className="w-full h-full object-cover" alt="cover"/>}
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setPickingSlot('hero.coverMedia')} className="p-1.5 bg-black/60 text-white rounded hover:bg-black" title="Choose Existing"><ImagePlus size={14}/></button>
                  <button onClick={() => document.getElementById('cov-up')?.click()} className="p-1.5 bg-black/60 text-white rounded hover:bg-black"><Upload size={14}/></button>
                  <button onClick={() => deleteMedia('hero.coverMedia')} className="p-1.5 bg-red-500/80 text-white rounded hover:bg-red-600"><Trash2 size={14}/></button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 h-40">
                <button onClick={() => document.getElementById('cov-up')?.click()} className="flex-1 border-2 border-dashed border-border hover:border-[#f4a295] rounded-xl flex flex-col items-center justify-center text-muted-foreground"><Upload size={18} className="mb-2"/><span className="text-xs">Upload New</span></button>
                <button onClick={() => setPickingSlot('hero.coverMedia')} className="flex-1 border-2 border-dashed border-border hover:border-[#f4a295] rounded-xl flex flex-col items-center justify-center text-muted-foreground"><ImagePlus size={18} className="mb-2"/><span className="text-xs">Choose Existing</span></button>
              </div>
            )}
            <input id="cov-up" type="file" accept="image/*,video/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileIntent(e.target.files[0], 'hero.coverMedia', 16/9)} />
          </div>

          {/* Profile Media */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Profile Photo / Avatar</label>
            {settings.hero.profileMedia ? (
              <div className="relative rounded-xl overflow-hidden bg-muted group border border-border h-40 w-40 mx-auto md:mx-0">
                {mediaKind(settings.hero.profileMedia) === 'video' ? <video src={settings.hero.profileMedia} className="w-full h-full object-cover" autoPlay loop muted /> : <img src={settings.hero.profileMedia} className="w-full h-full object-cover" alt="profile"/>}
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => document.getElementById('pro-up')?.click()} className="p-1.5 bg-black/60 text-white rounded hover:bg-black"><Upload size={14}/></button>
                  <button onClick={() => deleteMedia('hero.profileMedia')} className="p-1.5 bg-red-500/80 text-white rounded hover:bg-red-600"><Trash2 size={14}/></button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 h-40">
                <button onClick={() => document.getElementById('pro-up')?.click()} className="flex-1 border-2 border-dashed border-border hover:border-[#f4a295] rounded-xl flex flex-col items-center justify-center text-muted-foreground"><Upload size={18} className="mb-2"/><span className="text-xs">Upload New</span></button>
                <button onClick={() => setPickingSlot('hero.profileMedia')} className="flex-1 border-2 border-dashed border-border hover:border-[#f4a295] rounded-xl flex flex-col items-center justify-center text-muted-foreground"><ImagePlus size={18} className="mb-2"/><span className="text-xs">Existing</span></button>
              </div>
            )}
            <input id="pro-up" type="file" accept="image/*,video/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileIntent(e.target.files[0], 'hero.profileMedia', 1)} />
          </div>
        </div>
      </Section>

      {/* --- HERO TEXTS --- */}
      <Section icon={User} title="Home Page - Profile Details" description="Bio, tags, location, and stats" accent="#e8806f">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-xs text-muted-foreground uppercase">Full Name</label><input type="text" value={settings.hero.name} onChange={(e) => setSettings({...settings, hero: {...settings.hero, name: e.target.value}})} className="w-full px-3 py-2 rounded-xl bg-background border focus:border-[#f4a295] outline-none" /></div>
            <div className="space-y-1.5"><label className="text-xs text-muted-foreground uppercase">Professional Title</label><input type="text" value={settings.hero.title} onChange={(e) => setSettings({...settings, hero: {...settings.hero, title: e.target.value}})} className="w-full px-3 py-2 rounded-xl bg-background border focus:border-[#f4a295] outline-none" /></div>
            <div className="space-y-1.5 md:col-span-2"><label className="text-xs text-muted-foreground uppercase">Short Bio</label><textarea rows={2} value={settings.hero.bio} onChange={(e) => setSettings({...settings, hero: {...settings.hero, bio: e.target.value}})} className="w-full px-3 py-2 rounded-xl bg-background border focus:border-[#f4a295] outline-none" /></div>
            <div className="space-y-1.5 md:col-span-2"><label className="text-xs text-muted-foreground uppercase">Hashtags (Comma separated)</label><input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-background border focus:border-[#f4a295] outline-none" /></div>
            <div className="space-y-1.5"><label className="text-xs text-muted-foreground uppercase">Location</label><input type="text" value={settings.hero.location} onChange={(e) => setSettings({...settings, hero: {...settings.hero, location: e.target.value}})} className="w-full px-3 py-2 rounded-xl bg-background border focus:border-[#f4a295] outline-none" /></div>
            <div className="space-y-1.5"><label className="text-xs text-muted-foreground uppercase">Join Date / Experience</label><input type="text" value={settings.hero.joinDate} onChange={(e) => setSettings({...settings, hero: {...settings.hero, joinDate: e.target.value}})} className="w-full px-3 py-2 rounded-xl bg-background border focus:border-[#f4a295] outline-none" /></div>
          </div>
          
          <div className="space-y-2 pt-4">
            <div className="flex items-center justify-between"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stats Counters</label><button type="button" onClick={() => addArrayItem('hero', 'stats', {value: '', label: ''})} className="text-xs text-[#f4a295] hover:underline flex items-center gap-1"><Plus size={14}/> Add Stat</button></div>
            {settings.hero.stats.map((st, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={st.value} onChange={(e) => { let next = {...settings}; next.hero.stats[i].value = e.target.value; setSettings(next) }} placeholder="50+" className="w-20 px-3 py-1.5 rounded-lg bg-background border text-sm" />
                <input value={st.label} onChange={(e) => { let next = {...settings}; next.hero.stats[i].label = e.target.value; setSettings(next) }} placeholder="Projects" className="flex-1 px-3 py-1.5 rounded-lg bg-background border text-sm" />
                <button type="button" onClick={() => { let next = {...settings}; next.hero.stats.splice(i,1); setSettings(next) }} className="text-red-500 p-2 hover:bg-red-500/10 rounded"><X size={16}/></button>
              </div>
            ))}
          </div>
      </Section>

      {/* --- ABOUT PAGE MEDIA --- */}
      <Section icon={ImageIcon} title="About Page - Media Gallery" description="Main image (5:7 ratio) and extra gallery images." accent="#9db8e8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {settings.about.media.map((url, i) => (
            <div key={i} className="relative aspect-[5/7] rounded-xl overflow-hidden border border-border group bg-muted">
              {mediaKind(url) === 'video' ? <video src={url} className="w-full h-full object-cover" autoPlay loop muted /> : <img src={url} className="w-full h-full object-cover" alt="" />}
              {i === 0 && <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">Cover</span>}
              <button onClick={() => deleteMedia('about.media', i)} className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded hover:bg-red-600 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
            </div>
          ))}
          <div className="aspect-[5/7] flex flex-col gap-2">
            <button onClick={() => document.getElementById('abt-up')?.click()} className="flex-1 border-2 border-dashed border-border hover:border-[#f4a295] rounded-xl flex flex-col items-center justify-center text-muted-foreground"><Upload size={18} className="mb-1"/><span className="text-[10px]">Upload</span></button>
            <button onClick={() => setPickingSlot('about.media')} className="flex-1 border-2 border-dashed border-border hover:border-[#f4a295] rounded-xl flex flex-col items-center justify-center text-muted-foreground"><ImagePlus size={18} className="mb-1"/><span className="text-[10px]">Existing</span></button>
          </div>
          <input id="abt-up" type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => Array.from(e.target.files || []).forEach(f => handleFileIntent(f, 'about.media', 5/7))} />
        </div>
      </Section>

      {/* --- ABOUT PAGE CONTENT --- */}
      <Section icon={Info} title="About Page - Contents" description="Manage intro text, tech stack, timeline, and work values." accent="#a8d5c2">
        
        {/* Intro */}
        <div className="space-y-1.5 mb-6">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Introduction Paragraphs</label>
          <textarea rows={4} value={settings.about.introText} onChange={(e) => setSettings({...settings, about: {...settings.about, introText: e.target.value}})} placeholder="Write about yourself..." className="w-full px-3 py-2 rounded-xl bg-background border focus:border-[#f4a295] outline-none" />
        </div>

        {/* Tech Stack */}
        <div className="space-y-2 mb-6 border-t border-border pt-4">
          <div className="flex items-center justify-between"><label className="text-xs font-semibold text-foreground uppercase">Tech Stack</label><button type="button" onClick={() => addArrayItem('about', 'stack', {name: '', level: 50})} className="text-xs text-[#a8d5c2] font-semibold hover:underline flex items-center gap-1"><Plus size={14}/> Add Tech</button></div>
          <div className="grid sm:grid-cols-2 gap-2">
            {settings.about.stack.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 border rounded-xl bg-muted/20">
                <input value={item.name} onChange={(e) => updateArray('about', 'stack', i, 'name', e.target.value)} placeholder="React" className="flex-1 px-2 py-1 rounded-lg border text-sm" />
                <input type="number" value={item.level} onChange={(e) => updateArray('about', 'stack', i, 'level', Number(e.target.value))} placeholder="90" className="w-16 px-2 py-1 rounded-lg border text-sm" />
                <span className="text-xs text-muted-foreground">%</span>
                <button type="button" onClick={() => removeArrayItem('about', 'stack', i)} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded"><Trash2 size={14}/></button>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="space-y-2 mb-6 border-t border-border pt-4">
          <div className="flex items-center justify-between"><label className="text-xs font-semibold text-foreground uppercase">How I Work (Values)</label><button type="button" onClick={() => addArrayItem('about', 'values', {title: '', desc: ''})} className="text-xs text-[#a8d5c2] font-semibold hover:underline flex items-center gap-1"><Plus size={14}/> Add Value</button></div>
          <div className="space-y-2">
            {settings.about.values.map((item, i) => (
              <div key={i} className="flex gap-2 p-3 border rounded-xl bg-muted/20 relative">
                <div className="flex-1 space-y-2">
                  <input value={item.title} onChange={(e) => updateArray('about', 'values', i, 'title', e.target.value)} placeholder="Title" className="w-full px-3 py-1.5 rounded-lg border text-sm font-semibold" />
                  <textarea rows={2} value={item.desc} onChange={(e) => updateArray('about', 'values', i, 'desc', e.target.value)} placeholder="Description" className="w-full px-3 py-1.5 rounded-lg border text-sm resize-none" />
                </div>
                <button type="button" onClick={() => removeArrayItem('about', 'values', i)} className="text-red-500 hover:bg-red-500/10 p-2 rounded h-fit"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex items-center justify-between"><label className="text-xs font-semibold text-foreground uppercase">Journey / Timeline</label><button type="button" onClick={() => addArrayItem('about', 'timeline', {year: '', title: '', place: '', desc: ''})} className="text-xs text-[#a8d5c2] font-semibold hover:underline flex items-center gap-1"><Plus size={14}/> Add Event</button></div>
          <div className="space-y-2">
            {settings.about.timeline.map((item, i) => (
              <div key={i} className="p-3 border rounded-xl bg-muted/20 relative space-y-2">
                <div className="flex gap-2">
                  <input value={item.year} onChange={(e) => updateArray('about', 'timeline', i, 'year', e.target.value)} placeholder="Year (e.g. 2024)" className="w-24 px-3 py-1.5 rounded-lg border text-sm" />
                  <input value={item.title} onChange={(e) => updateArray('about', 'timeline', i, 'title', e.target.value)} placeholder="Job Title" className="flex-1 px-3 py-1.5 rounded-lg border text-sm font-semibold" />
                  <button type="button" onClick={() => removeArrayItem('about', 'timeline', i)} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded h-fit"><Trash2 size={16}/></button>
                </div>
                <input value={item.place} onChange={(e) => updateArray('about', 'timeline', i, 'place', e.target.value)} placeholder="Company / Place" className="w-full px-3 py-1.5 rounded-lg border text-sm" />
                <textarea rows={2} value={item.desc} onChange={(e) => updateArray('about', 'timeline', i, 'desc', e.target.value)} placeholder="Description" className="w-full px-3 py-1.5 rounded-lg border text-sm resize-none" />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* --- CONTACT PAGE CONTENT --- */}
      <Section icon={Phone} title="Contact Page - Contents" description="Manage email, phone, location, and social links." accent="#bd93f9">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-xs text-muted-foreground uppercase">Email Address</label><input type="email" value={settings.contact.email} onChange={(e) => setSettings({...settings, contact: {...settings.contact, email: e.target.value}})} placeholder="hello@zihad.com" className="w-full px-3 py-2 rounded-xl bg-background border outline-none" /></div>
            <div className="space-y-1.5"><label className="text-xs text-muted-foreground uppercase">Phone / WhatsApp</label><input type="text" value={settings.contact.phone} onChange={(e) => setSettings({...settings, contact: {...settings.contact, phone: e.target.value}})} placeholder="+880..." className="w-full px-3 py-2 rounded-xl bg-background border outline-none" /></div>
            <div className="space-y-1.5 md:col-span-2"><label className="text-xs text-muted-foreground uppercase">Short Intro Text</label><textarea rows={2} value={settings.contact.shortText} onChange={(e) => setSettings({...settings, contact: {...settings.contact, shortText: e.target.value}})} placeholder="Let's build something great..." className="w-full px-3 py-2 rounded-xl bg-background border outline-none" /></div>
         </div>
         <div className="space-y-2 pt-4 border-t border-border mt-4">
            <div className="flex items-center justify-between"><label className="text-xs font-semibold text-foreground uppercase">Social Links</label><button type="button" onClick={() => addArrayItem('contact', 'socials', {platform: '', url: ''})} className="text-xs text-[#bd93f9] font-semibold hover:underline flex items-center gap-1"><Plus size={14}/> Add Link</button></div>
            <div className="grid sm:grid-cols-2 gap-2">
              {settings.contact.socials.map((item, i) => (
                <div key={i} className="flex gap-2 p-2 border rounded-xl bg-muted/20">
                  <input value={item.platform} onChange={(e) => updateArray('contact', 'socials', i, 'platform', e.target.value)} placeholder="LinkedIn" className="w-1/3 px-2 py-1 rounded-lg border text-sm" />
                  <input value={item.url} onChange={(e) => updateArray('contact', 'socials', i, 'url', e.target.value)} placeholder="https://..." className="flex-1 px-2 py-1 rounded-lg border text-sm" />
                  <button type="button" onClick={() => removeArrayItem('contact', 'socials', i)} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded"><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
         </div>
      </Section>

      {/* --- MODALS --- */}
      <ImageCropperModal
        isOpen={cropConfig !== null}
        file={cropConfig?.file || null}
        aspectRatio={cropConfig?.ratio || 1}
        onClose={() => setCropConfig(null)}
        onCropConfirm={(cropped) => {
          if(cropConfig) uploadActualFile(cropped, cropConfig.slot);
          setCropConfig(null);
        }}
      />

      <MediaPickerModal 
        isOpen={pickingSlot !== null} 
        onClose={() => setPickingSlot(null)} 
        multiple={pickingSlot === 'about.media'}
        onSelect={(urls) => {
          if (pickingSlot) handleExistingMedia(urls, pickingSlot);
          setPickingSlot(null);
        }} 
      />
    </div>
  )
}
