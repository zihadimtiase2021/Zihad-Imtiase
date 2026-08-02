import { Image as ImageIcon, Upload, Trash2, User, Link2, MapPin, Globe, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MediaPicker } from '@/components/media-picker'
import type { SiteSettings } from '@/lib/types'
import { Field, SectionHeading, inputCls, mediaKind, UpdateFieldFn } from './settings-atoms'

interface ProfileTabProps {
  settings: SiteSettings
  updateField: UpdateFieldFn
  handleLocationChange: (val: string) => void
  tagsInput: string
  setTagsInput: (val: string) => void
  setDirty: (val: boolean) => void
  updateMediaField: (slot: 'hero.coverMedia' | 'hero.profileMedia' | 'meta.favicon', url: string) => void
  deleteMedia: (slot: string) => void
}

export function ProfileTab({ settings, updateField, handleLocationChange, tagsInput, setTagsInput, setDirty, updateMediaField, deleteMedia }: ProfileTabProps) {
  return (
    <div className="p-4 sm:p-6 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* ── Visual Identity Section ── */}
      <section>
        <SectionHeading icon={ImageIcon} label="Visual Identity" accent="#f4a295" />
        
        {/* Cover Photo Container */}
        <div className="relative rounded-2xl border border-border bg-muted/30 h-40 sm:h-56 mb-16 sm:mb-20 shadow-sm">
          
          {/* Background Media */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            {settings.hero.coverMedia ? (
              mediaKind(settings.hero.coverMedia) === 'video'
                ? <video src={settings.hero.coverMedia} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                : <img src={settings.hero.coverMedia} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2 bg-muted/50">
                <Upload size={32} className="opacity-40" />
                <span className="text-xs font-medium">Add a cover image</span>
              </div>
            )}
          </div>

          {/* Cover Photo Actions (Always Visible) */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
            <div className="bg-background/90 backdrop-blur-md border border-border rounded-xl shadow-sm hover:bg-background transition-colors flex items-center shrink-0">
              <MediaPicker onSelect={(m) => updateMediaField('hero.coverMedia', m[0].url)} />
            </div>
            {settings.hero.coverMedia && (
              <button 
                onClick={() => deleteMedia('hero.coverMedia')} 
                className="w-10 h-10 flex items-center justify-center bg-destructive text-white rounded-xl shadow-sm hover:bg-destructive/90 transition-colors shrink-0"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {/* Profile Photo (Avatar) */}
          <div className="absolute -bottom-12 sm:-bottom-14 left-4 sm:left-8 z-30 flex items-end">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-card bg-muted overflow-hidden shadow-xl">
                {settings.hero.profileMedia ? (
                  mediaKind(settings.hero.profileMedia) === 'video'
                    ? <video src={settings.hero.profileMedia} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                    : <img src={settings.hero.profileMedia} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                    <User size={36} className="opacity-50" />
                  </div>
                )}
              </div>
              
              {/* Universal Avatar Upload Button (Positioned at bottom right) */}
              <div className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 bg-background border border-border rounded-full shadow-lg z-40 hover:scale-105 transition-transform flex items-center justify-center">
                 <MediaPicker onSelect={(m) => updateMediaField('hero.profileMedia', m[0].url)} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Basic Information Section ── */}
      <section>
        <SectionHeading icon={User} label="Basic Information" accent="#f4a295" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-muted/10 p-4 sm:p-5 border border-border rounded-2xl">
          <Field label="Full Name">
            <input 
              className={inputCls()} 
              value={settings.hero.name} 
              onChange={(e) => updateField('hero', 'name', e.target.value)} 
              placeholder="e.g. Zihad Imtiase" 
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
              className={cn(inputCls(), 'resize-y leading-relaxed')} 
              value={settings.hero.bio} 
              onChange={(e) => updateField('hero', 'bio', e.target.value)} 
              placeholder="Write a brief, punchy summary of who you are and what you do..." 
            />
          </Field>

          <Field label="Hire Me Link" hint="Prefix with mailto: or https://" className="sm:col-span-2">
            <div className="relative">
              <Link2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                className={cn(inputCls(), 'pl-10')} 
                value={settings.hero.hireMeLink} 
                onChange={(e) => updateField('hero', 'hireMeLink', e.target.value)} 
                placeholder="mailto:you@email.com OR https://wa.me/..." 
              />
            </div>
          </Field>

          <Field label="Keywords / Hashtags" className="sm:col-span-2">
            <input 
              className={inputCls()} 
              value={tagsInput} 
              onChange={(e) => { setTagsInput(e.target.value); setDirty(true) }} 
              placeholder="e.g. #frontend, #webflow, #react" 
            />
          </Field>

          <Field label="Global Location">
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                className={cn(inputCls(), 'pl-10')} 
                value={settings.hero.location} 
                onChange={(e) => handleLocationChange(e.target.value)} 
                placeholder="e.g. Dhaka, Bangladesh" 
              />
            </div>
          </Field>
          
          <Field label="Experience / Join Date">
            <input 
              className={inputCls()} 
              value={settings.hero.joinDate} 
              onChange={(e) => updateField('hero', 'joinDate', e.target.value)} 
              placeholder="e.g. Joined March 2022" 
            />
          </Field>
        </div>
      </section>

      {/* ── SEO & Metadata Section ── */}
      <section>
        <SectionHeading icon={Globe} label="SEO & Metadata" accent="#f4a295" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-muted/10 p-4 sm:p-5 border border-border rounded-2xl">
          <div className="sm:col-span-2 space-y-5">
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
                rows={4} 
                className={cn(inputCls(), 'resize-none leading-relaxed')} 
                value={settings.meta.description} 
                onChange={(e) => updateField('meta', 'description', e.target.value)} 
                placeholder="Brief description for search engines (Recommended: 150-160 characters)..." 
              />
            </Field>
          </div>

          <Field label="Website Favicon" hint="Best size: 512×512 PNG or SVG.">
            <div className="flex flex-col gap-4 bg-background p-4 rounded-xl border border-border shadow-sm">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                {settings.meta.favicon ? (
                  <img src={settings.meta.favicon} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Globe size={24} className="text-muted-foreground opacity-40" />
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <input 
                  type="text" 
                  value={settings.meta.favicon} 
                  onChange={(e) => updateField('meta', 'favicon', e.target.value)} 
                  placeholder="URL..." 
                  className={cn(inputCls(), 'flex-1 text-xs min-w-0')} 
                />
                <div className="bg-background border border-border rounded-xl shrink-0 flex items-center hover:bg-muted transition-colors shadow-sm">
                  <MediaPicker onSelect={(m) => updateMediaField('meta.favicon', m[0].url)} />
                </div>
              </div>
            </div>
          </Field>
        </div>
      </section>
      
    </div>
  )
}
