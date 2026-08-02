'use client'

import { useState, useEffect } from 'react'
import {
  Trash2, Image as ImageIcon, Film, Music, Loader2, X,
  User, FileText, Phone, Plus, Save, ImagePlus, MapPin, Globe, Link2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MediaPicker } from '@/components/media-picker'
import { ToastStack } from '@/components/admin/shared'
import { useToast } from '@/hooks/use-toast'

// --- Interfaces ---
interface TimelineItem { year: string; title: string; place: string; desc: string }
interface StackItem { name: string; level: number }
interface ValueItem { title: string; desc: string }
interface SocialItem { platform: string; url: string }

interface SiteSettings {
  hero: {
    coverMedia: string; profileMedia: string; name: string; title: string; bio: string;
    tags: string[]; location: string; joinDate: string; stats: { value: string; label: string }[];
    hireMeLink: string; 
  }
  about: {
    media: string[]; introText: string; timeline: TimelineItem[]; stack: StackItem[]; values: ValueItem[];
  }
  contact: {
    email: string; phone: string; address: string; shortText: string; socials: SocialItem[];
  }
  meta: { 
    title: string; description: string; favicon: string;
  }
}

function mediaKind(url: string): 'image' | 'video' | 'audio' | 'none' {
  if (!url) return 'none'
  if (/\.(mp4|webm|mov)$/i.test(url)) return 'video'
  if (/\.(mp3|ogg|wav|aac|flac|m4a)$/i.test(url)) return 'audio'
  return 'image'
}

export function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings>({
    hero: { coverMedia: '', profileMedia: '', name: '', title: '', bio: '', tags: [], location: '', joinDate: '', stats: [], hireMeLink: '' },
    about: { media: [], introText: '', timeline: [], stack: [], values: [] },
    contact: { email: '', phone: '', address: '', shortText: '', socials: [] },
    meta: { title: '', description: '', favicon: '' }
  })
  
  const [activeTab, setActiveTab] = useState<'profile' | 'about' | 'contact'>('profile')
  const [tagsInput, setTagsInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toasts, addToast } = useToast()

  useEffect(() => { fetchSettings() }, [])

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
        stats: Array.isArray(data.hero?.stats) ? data.hero.stats : [],
        hireMeLink: data.hero?.hireMeLink ?? ''
      }
      const about = {
        media: Array.isArray(data.about?.media) ? data.about.media : [], introText: data.about?.introText ?? '',
        timeline: Array.isArray(data.about?.timeline) ? data.about.timeline : [],
        stack: Array.isArray(data.about?.stack) ? data.about.stack : [], values: Array.isArray(data.about?.values) ? data.about.values : []
      }
      const contact = {
        email: data.contact?.email ?? '', phone: data.contact?.phone ?? '', address: data.contact?.address ?? '',
        shortText: data.contact?.shortText ?? '', socials: Array.isArray(data.contact?.socials) ? data.contact?.socials : []
      }
      const meta = {
        title: data.meta?.title ?? '', description: data.meta?.description ?? '', favicon: data.meta?.favicon ?? ''
      }

      setSettings({ hero, about, contact, meta })
      setTagsInput(hero.tags.join(', '))
    } catch {
      addToast('Failed to load settings', false)
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings(next: SiteSettings = settings) {
    setSaving(true)
    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    const payload = { ...next, hero: { ...next.hero, tags: tagsArray } }
    
    try {
      const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) addToast('Settings saved globally!')
      else addToast('Failed to save settings', false)
    } catch {
      addToast('Failed to save settings', false)
    } finally {
      setSaving(false)
    }
  }

  function handleLocationChange(val: string) {
    setSettings(prev => ({
      ...prev, hero: { ...prev.hero, location: val }, contact: { ...prev.contact, address: val }
    }))
  }

  // --- Handlers for Reusable Media Picker ---
  function updateMediaField(slot: 'hero.coverMedia' | 'hero.profileMedia' | 'meta.favicon', url: string) {
    let next = { ...settings }
    if (slot === 'hero.coverMedia') next.hero.coverMedia = url
    if (slot === 'hero.profileMedia') next.hero.profileMedia = url
    if (slot === 'meta.favicon') next.meta.favicon = url
    setSettings(next)
    saveSettings(next)
  }

  function appendAboutMedia(urls: string[]) {
    let next = { ...settings }
    next.about.media = [...next.about.media, ...urls]
    setSettings(next)
    saveSettings(next)
  }

  function deleteMedia(slot: string, index?: number) {
    let next = { ...settings }
    if (slot === 'hero.coverMedia') next.hero.coverMedia = ''
    else if (slot === 'hero.profileMedia') next.hero.profileMedia = ''
    else if (slot === 'meta.favicon') next.meta.favicon = ''
    else if (slot === 'about.media' && index !== undefined) next.about.media.splice(index, 1)
    
    setSettings(next)
    saveSettings(next)
  }

  function updateArray(section: 'hero' | 'about' | 'contact', field: string, index: number, key: string, val: any) {
    let next = { ...settings }
    ;(next[section] as any)[field][index][key] = val
    setSettings(next)
  }
  function addArrayItem(section: 'hero' | 'about' | 'contact', field: string, emptyItem: any) {
    let next = { ...settings }
    ;(next[section] as any)[field].push(emptyItem)
    setSettings(next)
  }
  function removeArrayItem(section: 'hero' | 'about' | 'contact', field: string, index: number) {
    let next = { ...settings }
    ;(next[section] as any)[field].splice(index, 1)
    setSettings(next)
  }

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#f4a295]" /></div>

  return (
    <div className="relative space-y-6 pb-10">
      <ToastStack toasts={toasts} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Global Settings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Change in one place, update everywhere.</p>
        </div>
        <button onClick={() => saveSettings()} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-[#1a1a1a] bg-[#f4a295] hover:opacity-90 disabled:opacity-50 transition-all active:scale-95 shrink-0">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
        </button>
      </div>

      <div className="flex p-1 bg-muted/50 border border-border rounded-2xl overflow-x-auto scrollbar-none">
        {[
          { id: 'profile', label: 'General Profile & SEO', icon: User },
          { id: 'about', label: 'About & Portfolio', icon: FileText },
          { id: 'contact', label: 'Contact & Socials', icon: Phone },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={cn('flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap', activeTab === tab.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80')}>
            <tab.icon size={15} className={activeTab === tab.id ? 'text-[#f4a295]' : ''} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 md:p-7 shadow-sm">
        
        {/* 1. GENERAL PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><ImageIcon size={16} className="text-[#f4a295]"/> Visual Identity</h3>
              <div className="relative rounded-2xl border border-border bg-muted h-48 md:h-64 mb-16 group/cover overflow-hidden">
                {settings.hero.coverMedia ? (
                   mediaKind(settings.hero.coverMedia) === 'video' ? <video src={settings.hero.coverMedia} className="w-full h-full object-cover" autoPlay loop muted /> : <img src={settings.hero.coverMedia} className="w-full h-full object-cover" alt="cover"/>
                ) : <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground"><ImagePlus size={32} className="mb-2 opacity-50"/><span className="text-xs">No Cover Added</span></div>}
                
                <div className="absolute top-3 right-3 flex items-center gap-2 opacity-100 sm:opacity-0 group-hover/cover:opacity-100 transition-opacity">
                   {/* 🟢 Reusable Media Picker for Cover */}
                   <div className="bg-black/60 backdrop-blur rounded-full">
                     <MediaPicker onSelect={(m) => updateMediaField('hero.coverMedia', m[0].url)} />
                   </div>
                   {settings.hero.coverMedia && <button onClick={() => deleteMedia('hero.coverMedia')} className="p-2.5 bg-red-500/80 text-white rounded-full hover:bg-red-600"><Trash2 size={16}/></button>}
                </div>

                <div className="absolute -bottom-12 left-4 sm:left-6 group/avatar">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-card bg-muted overflow-hidden relative shadow-lg">
                    {settings.hero.profileMedia ? (
                       mediaKind(settings.hero.profileMedia) === 'video' ? <video src={settings.hero.profileMedia} className="w-full h-full object-cover" autoPlay loop muted /> : <img src={settings.hero.profileMedia} className="w-full h-full object-cover" alt="profile"/>
                    ) : <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-background"><User size={32}/></div>}
                    
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                      {/* 🟢 Reusable Media Picker for Profile */}
                      <MediaPicker onSelect={(m) => updateMediaField('hero.profileMedia', m[0].url)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
               <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><User size={16} className="text-[#f4a295]"/> Basic Information</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-xs text-muted-foreground uppercase">Full Name</label><input type="text" value={settings.hero.name} onChange={(e) => setSettings({...settings, hero: {...settings.hero, name: e.target.value}})} className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border outline-none focus:border-[#f4a295] focus:bg-background transition-colors min-w-0" /></div>
                  <div className="space-y-1.5"><label className="text-xs text-muted-foreground uppercase">Professional Title</label><input type="text" value={settings.hero.title} onChange={(e) => setSettings({...settings, hero: {...settings.hero, title: e.target.value}})} className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border outline-none focus:border-[#f4a295] focus:bg-background transition-colors min-w-0" /></div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs text-muted-foreground uppercase">Short Bio</label>
                    <textarea rows={3} value={settings.hero.bio} onChange={(e) => setSettings({...settings, hero: {...settings.hero, bio: e.target.value}})} className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border outline-none focus:border-[#f4a295] focus:bg-background transition-colors resize-y min-w-0" />
                  </div>
                  
                  <div className="space-y-1.5 md:col-span-2 border-t border-border pt-3 mt-1">
                    <label className="text-xs text-foreground font-semibold uppercase flex items-center gap-1.5"><Link2 size={14} className="text-[#f4a295]"/> Hire Me Button Link</label>
                    <input type="text" value={settings.hero.hireMeLink} onChange={(e) => setSettings({...settings, hero: {...settings.hero, hireMeLink: e.target.value}})} placeholder="mailto:you@email.com OR https://wa.me/880..." className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border outline-none focus:border-[#f4a295] focus:bg-background transition-colors min-w-0" />
                    <p className="text-[10px] text-muted-foreground">The icon automatically changes to Mail or WhatsApp based on this link.</p>
                  </div>

                  <div className="space-y-1.5 md:col-span-2"><label className="text-xs text-muted-foreground uppercase mt-2">Keywords / Hashtags</label><input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="e.g. #frontend, #webflow" className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border outline-none focus:border-[#f4a295] focus:bg-background transition-colors min-w-0" /></div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground uppercase flex items-center gap-1"><MapPin size={12}/> Global Location</label>
                    <input type="text" value={settings.hero.location} onChange={(e) => handleLocationChange(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border outline-none focus:border-[#f4a295] focus:bg-background transition-colors min-w-0" />
                  </div>
                  <div className="space-y-1.5"><label className="text-xs text-muted-foreground uppercase">Join Date / Experience</label><input type="text" value={settings.hero.joinDate} onChange={(e) => setSettings({...settings, hero: {...settings.hero, joinDate: e.target.value}})} className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border outline-none focus:border-[#f4a295] focus:bg-background transition-colors min-w-0" /></div>
               </div>
            </div>

            {/* SEO & Metadata Section */}
            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><Globe size={16} className="text-[#f4a295]"/> SEO & Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Meta Texts */}
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground uppercase">Meta Title</label>
                    <input type="text" value={settings.meta.title} onChange={(e) => setSettings({...settings, meta: {...settings.meta, title: e.target.value}})} placeholder="e.g. Zihad Imtiase - Portfolio" className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border outline-none focus:border-[#f4a295] focus:bg-background transition-colors min-w-0" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground uppercase">Meta Description</label>
                    <textarea rows={3} value={settings.meta.description} onChange={(e) => setSettings({...settings, meta: {...settings.meta, description: e.target.value}})} placeholder="Brief description for Google Search..." className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border outline-none focus:border-[#f4a295] focus:bg-background transition-colors resize-none min-w-0" />
                  </div>
                </div>

                {/* Favicon Upload via MediaPicker */}
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs text-muted-foreground uppercase mb-1">Website Favicon</label>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0">
                      {settings.meta.favicon ? (
                        <img src={settings.meta.favicon} alt="Favicon" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-muted-foreground">No Icon</span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <input 
                          type="text" 
                          value={settings.meta.favicon || ''} 
                          onChange={(e) => setSettings({ ...settings, meta: { ...settings.meta, favicon: e.target.value }})}
                          placeholder="Favicon URL..."
                          className="w-full bg-muted/50 border border-border px-3 py-2 rounded-xl text-sm outline-none focus:border-[#f4a295]"
                        />
                        
                        <div className="bg-muted border border-border rounded-full shrink-0">
                          <MediaPicker onSelect={(m) => updateMediaField('meta.favicon', m[0].url)} />
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Recommended: 512x512px (PNG/SVG).</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ABOUT & PORTFOLIO TAB */}
        {activeTab === 'about' && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div>
             <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><ImageIcon size={16} className="text-[#9db8e8]"/> About Gallery (5:7 Ratio)</h3>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
               {settings.about.media.map((url, i) => (
                 <div key={i} className="relative aspect-[5/7] rounded-xl overflow-hidden border border-border group bg-muted shadow-sm">
                   {mediaKind(url) === 'video' ? <video src={url} className="w-full h-full object-cover" autoPlay loop muted /> : <img src={url} className="w-full h-full object-cover" alt="" />}
                   {i === 0 && <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase backdrop-blur">Cover</span>}
                   <button onClick={() => deleteMedia('about.media', i)} className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-lg hover:bg-red-600 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                 </div>
               ))}
               
               {/* 🟢 Reusable Media Picker for About Gallery */}
               <div className="aspect-[5/7] flex items-center justify-center border-2 border-dashed border-border rounded-xl bg-muted/30">
                  <div className="bg-background rounded-full shadow-sm border border-border">
                    <MediaPicker onSelect={(m) => appendAboutMedia(m.map(x => x.url))} />
                  </div>
               </div>
             </div>
           </div>

           <div className="border-t border-border pt-6 space-y-1.5">
             <label className="text-xs font-semibold text-muted-foreground uppercase">Detailed Introduction</label>
             <textarea rows={6} value={settings.about.introText} onChange={(e) => setSettings({...settings, about: {...settings.about, introText: e.target.value}})} placeholder="Write your full story here..." className="w-full px-4 py-3 rounded-xl bg-muted/50 border outline-none focus:border-[#9db8e8] focus:bg-background transition-colors resize-y leading-relaxed text-sm min-w-0" />
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-border pt-6">
             <div className="min-w-0">
               <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-foreground">Highlight Stats</h3><button onClick={() => addArrayItem('hero', 'stats', {value: '', label: ''})} className="text-xs font-semibold text-[#9db8e8] hover:underline flex items-center gap-1 shrink-0"><Plus size={14}/> Add Stat</button></div>
               <div className="space-y-2">
                 {settings.hero.stats.map((st, i) => (
                   <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-muted/30 p-3 sm:p-2 rounded-xl border border-border relative">
                     <div className="flex items-center gap-2 flex-1 pr-8 sm:pr-0">
                       <input value={st.value} onChange={(e) => updateArray('hero', 'stats', i, 'value', e.target.value)} placeholder="50+" className="w-16 sm:w-20 px-3 py-1.5 rounded-lg bg-background border text-sm font-bold outline-none focus:border-[#9db8e8] min-w-0" />
                       <input value={st.label} onChange={(e) => updateArray('hero', 'stats', i, 'label', e.target.value)} placeholder="Label (e.g. Clients)" className="flex-1 px-3 py-1.5 rounded-lg bg-background border text-sm outline-none focus:border-[#9db8e8] min-w-0" />
                     </div>
                     <button onClick={() => removeArrayItem('hero', 'stats', i)} className="absolute top-2 right-2 sm:static sm:top-auto sm:right-auto text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg shrink-0"><Trash2 size={15}/></button>
                   </div>
                 ))}
               </div>
             </div>
             
             <div className="min-w-0">
               <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-foreground">Tech Stack</h3><button onClick={() => addArrayItem('about', 'stack', {name: '', level: 50})} className="text-xs font-semibold text-[#9db8e8] hover:underline flex items-center gap-1 shrink-0"><Plus size={14}/> Add Skill</button></div>
               <div className="space-y-2">
                 {settings.about.stack.map((item, i) => (
                   <div key={i} className="flex items-center gap-2 bg-muted/30 p-2 sm:p-3 rounded-xl border border-border">
                     <input value={item.name} onChange={(e) => updateArray('about', 'stack', i, 'name', e.target.value)} placeholder="React JS" className="flex-1 px-3 py-1.5 rounded-lg bg-background border text-sm outline-none focus:border-[#9db8e8] min-w-0" />
                     <input type="number" value={item.level} onChange={(e) => updateArray('about', 'stack', i, 'level', Number(e.target.value))} className="w-14 sm:w-16 px-2 py-1.5 rounded-lg bg-background border text-sm outline-none focus:border-[#9db8e8] min-w-0 text-center" />
                     <span className="text-xs text-muted-foreground font-semibold shrink-0">%</span>
                     <button onClick={() => removeArrayItem('about', 'stack', i)} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg shrink-0"><Trash2 size={15}/></button>
                   </div>
                 ))}
               </div>
             </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-border pt-6">
             <div className="min-w-0">
               <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-foreground">Core Values</h3><button onClick={() => addArrayItem('about', 'values', {title: '', desc: ''})} className="text-xs font-semibold text-[#9db8e8] hover:underline flex items-center gap-1 shrink-0"><Plus size={14}/> Add Value</button></div>
               <div className="space-y-3">
                 {settings.about.values.map((item, i) => (
                   <div key={i} className="flex items-start gap-2 bg-muted/30 p-3 rounded-xl border border-border relative">
                     <div className="flex-1 space-y-2 pr-8 sm:pr-2 min-w-0">
                       <input value={item.title} onChange={(e) => updateArray('about', 'values', i, 'title', e.target.value)} placeholder="Title" className="w-full px-3 py-1.5 rounded-lg bg-background border text-sm font-bold outline-none focus:border-[#9db8e8] min-w-0" />
                       <textarea rows={3} value={item.desc} onChange={(e) => updateArray('about', 'values', i, 'desc', e.target.value)} placeholder="Description" className="w-full px-3 py-1.5 rounded-lg bg-background border text-sm resize-y outline-none focus:border-[#9db8e8] min-w-0" />
                     </div>
                     <button onClick={() => removeArrayItem('about', 'values', i)} className="absolute top-3 right-2 sm:static sm:top-auto sm:right-auto text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg mt-0 shrink-0"><Trash2 size={16}/></button>
                   </div>
                 ))}
               </div>
             </div>

             <div className="min-w-0">
               <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-foreground">Timeline Journey</h3><button onClick={() => addArrayItem('about', 'timeline', {year: '', title: '', place: '', desc: ''})} className="text-xs font-semibold text-[#9db8e8] hover:underline flex items-center gap-1 shrink-0"><Plus size={14}/> Add Event</button></div>
               <div className="space-y-3">
                 {settings.about.timeline.map((item, i) => (
                   <div key={i} className="bg-muted/30 p-3 rounded-xl border border-border space-y-2 relative">
                     <div className="flex flex-col sm:flex-row gap-2 pr-8 sm:pr-8">
                       <input value={item.year} onChange={(e) => updateArray('about', 'timeline', i, 'year', e.target.value)} placeholder="2024" className="w-full sm:w-20 px-3 py-1.5 rounded-lg bg-background border text-sm font-bold outline-none focus:border-[#9db8e8] min-w-0" />
                       <input value={item.title} onChange={(e) => updateArray('about', 'timeline', i, 'title', e.target.value)} placeholder="Job Role" className="flex-1 px-3 py-1.5 rounded-lg bg-background border text-sm font-bold outline-none focus:border-[#9db8e8] min-w-0" />
                     </div>
                     <input value={item.place} onChange={(e) => updateArray('about', 'timeline', i, 'place', e.target.value)} placeholder="Company / Location" className="w-full px-3 py-1.5 rounded-lg bg-background border text-sm outline-none focus:border-[#9db8e8] min-w-0" />
                     <textarea rows={3} value={item.desc} onChange={(e) => updateArray('about', 'timeline', i, 'desc', e.target.value)} placeholder="Description..." className="w-full px-3 py-1.5 rounded-lg bg-background border text-sm resize-y outline-none focus:border-[#9db8e8] min-w-0" />
                     <button onClick={() => removeArrayItem('about', 'timeline', i)} className="absolute top-3 right-2 text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg shrink-0"><Trash2 size={15}/></button>
                   </div>
                 ))}
               </div>
             </div>
           </div>

         </div>
        )}

        {/* 3. CONTACT & SOCIALS TAB */}
        {activeTab === 'contact' && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div>
             <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><Phone size={16} className="text-[#a8d5c2]"/> Direct Contact Info</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1.5"><label className="text-xs text-muted-foreground uppercase">Email Address</label><input type="email" value={settings.contact.email} onChange={(e) => setSettings({...settings, contact: {...settings.contact, email: e.target.value}})} placeholder="hello@domain.com" className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border outline-none focus:border-[#a8d5c2] focus:bg-background transition-colors min-w-0" /></div>
               <div className="space-y-1.5"><label className="text-xs text-muted-foreground uppercase">Phone / WhatsApp</label><input type="text" value={settings.contact.phone} onChange={(e) => setSettings({...settings, contact: {...settings.contact, phone: e.target.value}})} placeholder="+880 1..." className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border outline-none focus:border-[#a8d5c2] focus:bg-background transition-colors min-w-0" /></div>
               <div className="space-y-1.5 md:col-span-2">
                 <label className="text-xs text-muted-foreground uppercase">Contact Page Message</label>
                 <textarea rows={4} value={settings.contact.shortText} onChange={(e) => setSettings({...settings, contact: {...settings.contact, shortText: e.target.value}})} placeholder="Got a project in mind?..." className="w-full px-4 py-3 rounded-xl bg-muted/50 border outline-none focus:border-[#a8d5c2] focus:bg-background transition-colors resize-y min-w-0" />
               </div>
             </div>
           </div>

           <div className="border-t border-border pt-6">
              <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold text-foreground">Social Media Links</h3><button onClick={() => addArrayItem('contact', 'socials', {platform: '', url: ''})} className="text-xs font-semibold text-[#a8d5c2] hover:underline flex items-center gap-1 shrink-0"><Plus size={14}/> Add Link</button></div>
              <div className="grid lg:grid-cols-2 gap-3">
                 {settings.contact.socials.map((item, i) => (
                   <div key={i} className="flex items-center gap-2 p-2 sm:p-3 bg-muted/30 border border-border rounded-xl">
                     <input value={item.platform} onChange={(e) => updateArray('contact', 'socials', i, 'platform', e.target.value)} placeholder="LinkedIn" className="w-1/3 min-w-0 px-3 py-1.5 rounded-lg bg-background border text-sm outline-none focus:border-[#a8d5c2]" />
                     <input value={item.url} onChange={(e) => updateArray('contact', 'socials', i, 'url', e.target.value)} placeholder="https://..." className="flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-background border text-sm outline-none focus:border-[#a8d5c2]" />
                     <button onClick={() => removeArrayItem('contact', 'socials', i)} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg shrink-0"><Trash2 size={15}/></button>
                   </div>
                 ))}
              </div>
           </div>
         </div>
        )}

      </div>
    </div>
  )
}
