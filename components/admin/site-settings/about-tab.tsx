import { Image as ImageIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MediaPicker } from '@/components/media-picker'
import type { SiteSettings } from '@/lib/types'
import { Field, SectionHeading, ArraySection, DeleteBtn, inputCls, mediaKind, UpdateFieldFn, UpdateArrayItemFn, AddArrayItemFn, RemoveArrayItemFn } from './settings-atoms'

interface AboutTabProps {
  settings: SiteSettings
  updateField: UpdateFieldFn
  updateArrayItem: UpdateArrayItemFn
  addArrayItem: AddArrayItemFn
  removeArrayItem: RemoveArrayItemFn
  appendAboutMedia: (urls: string[]) => void
  deleteMedia: (slot: string, index?: number) => void
}

export function AboutTab({ settings, updateField, updateArrayItem, addArrayItem, removeArrayItem, appendAboutMedia, deleteMedia }: AboutTabProps) {
  return (
    <div className="p-4 sm:p-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <section>
        <SectionHeading icon={ImageIcon} label="About Gallery (5:7)" accent="#9db8e8" />
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
          {settings.about.media.map((url, i) => (
            <div key={i} className="relative aspect-[5/7] rounded-xl overflow-hidden border border-border group bg-muted">
              {mediaKind(url) === 'video' ? <video src={url} className="w-full h-full object-cover" autoPlay loop muted playsInline /> : <img src={url} className="w-full h-full object-cover" alt="" />}
              {i === 0 && <span className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Cover</span>}
              <button onClick={() => deleteMedia('about.media', i)} className="absolute top-1.5 right-1.5 p-1.5 bg-red-500/90 text-white rounded-lg opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
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

      <section className="border-t border-border pt-6">
        <Field label="Detailed Introduction">
          <textarea rows={6} className={cn(inputCls('#9db8e8'), 'resize-y')} value={settings.about.introText} onChange={(e) => updateField('about', 'introText', e.target.value)} placeholder="Write your full story here…" />
        </Field>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-border pt-6">
        <ArraySection title="Highlight Stats" accent="#9db8e8" onAdd={() => addArrayItem('hero', 'stats', { value: '', label: '' })} addLabel="Add Stat">
          {settings.hero.stats.map((st, i) => (
            <div key={i} className="flex items-center gap-2 bg-muted/30 p-2 rounded-xl border border-border">
              <input value={st.value} onChange={(e) => updateArrayItem('hero', 'stats', i, 'value', e.target.value)} placeholder="50+" className="w-16 px-2.5 py-1.5 rounded-lg bg-background border text-sm font-bold outline-none focus:border-[#9db8e8] min-w-0" />
              <input value={st.label} onChange={(e) => updateArrayItem('hero', 'stats', i, 'label', e.target.value)} placeholder="Projects" className="flex-1 px-2.5 py-1.5 rounded-lg bg-background border text-sm outline-none focus:border-[#9db8e8] min-w-0" />
              <DeleteBtn onClick={() => removeArrayItem('hero', 'stats', i)} />
            </div>
          ))}
        </ArraySection>

        <ArraySection title="Tech Stack" accent="#9db8e8" onAdd={() => addArrayItem('about', 'stack', { name: '', level: 50 })} addLabel="Add Skill">
          {settings.about.stack.map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-muted/30 p-2 rounded-xl border border-border">
              <input value={item.name} onChange={(e) => updateArrayItem('about', 'stack', i, 'name', e.target.value)} placeholder="React" className="flex-1 px-2.5 py-1.5 rounded-lg bg-background border text-sm outline-none focus:border-[#9db8e8] min-w-0" />
              <input type="number" value={item.level} onChange={(e) => updateArrayItem('about', 'stack', i, 'level', Number(e.target.value))} className="w-14 px-2 py-1.5 rounded-lg bg-background border text-sm outline-none focus:border-[#9db8e8] text-center min-w-0" />
              <span className="text-xs text-muted-foreground font-semibold shrink-0">%</span>
              <DeleteBtn onClick={() => removeArrayItem('about', 'stack', i)} />
            </div>
          ))}
        </ArraySection>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-border pt-6">
        <ArraySection title="Core Values" accent="#9db8e8" onAdd={() => addArrayItem('about', 'values', { title: '', desc: '' })} addLabel="Add Value">
          {settings.about.values.map((item, i) => (
            <div key={i} className="bg-muted/30 p-3 rounded-xl border border-border space-y-2 relative">
              <input value={item.title} onChange={(e) => updateArrayItem('about', 'values', i, 'title', e.target.value)} placeholder="Title" className="w-full pr-8 px-2.5 py-1.5 rounded-lg bg-background border text-sm font-bold outline-none focus:border-[#9db8e8] min-w-0" />
              <textarea rows={2} value={item.desc} onChange={(e) => updateArrayItem('about', 'values', i, 'desc', e.target.value)} placeholder="Description" className="w-full px-2.5 py-1.5 rounded-lg bg-background border text-sm resize-y outline-none focus:border-[#9db8e8] min-w-0" />
              <DeleteBtn onClick={() => removeArrayItem('about', 'values', i)} className="absolute top-2 right-2" />
            </div>
          ))}
        </ArraySection>

        <ArraySection title="Timeline" accent="#9db8e8" onAdd={() => addArrayItem('about', 'timeline', { year: '', title: '', place: '', desc: '' })} addLabel="Add Event">
          {settings.about.timeline.map((item, i) => (
            <div key={i} className="bg-muted/30 p-3 rounded-xl border border-border space-y-2 relative">
              <div className="flex gap-2 pr-8">
                <input value={item.year} onChange={(e) => updateArrayItem('about', 'timeline', i, 'year', e.target.value)} placeholder="2024" className="w-20 px-2.5 py-1.5 rounded-lg bg-background border text-sm font-bold outline-none focus:border-[#9db8e8] min-w-0" />
                <input value={item.title} onChange={(e) => updateArrayItem('about', 'timeline', i, 'title', e.target.value)} placeholder="Job Title" className="flex-1 px-2.5 py-1.5 rounded-lg bg-background border text-sm font-semibold outline-none focus:border-[#9db8e8] min-w-0" />
              </div>
              <input value={item.place} onChange={(e) => updateArrayItem('about', 'timeline', i, 'place', e.target.value)} placeholder="Company / Location" className="w-full px-2.5 py-1.5 rounded-lg bg-background border text-sm outline-none focus:border-[#9db8e8] min-w-0" />
              <textarea rows={2} value={item.desc} onChange={(e) => updateArrayItem('about', 'timeline', i, 'desc', e.target.value)} placeholder="Description…" className="w-full px-2.5 py-1.5 rounded-lg bg-background border text-sm resize-y outline-none focus:border-[#9db8e8] min-w-0" />
              <DeleteBtn onClick={() => removeArrayItem('about', 'timeline', i)} className="absolute top-2 right-2" />
            </div>
          ))}
        </ArraySection>
      </div>
    </div>
  )
}
