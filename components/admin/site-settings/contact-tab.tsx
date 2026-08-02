import { Phone, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SiteSettings } from '@/lib/types'
import { Field, SectionHeading, ArraySection, DeleteBtn, inputCls, UpdateFieldFn, UpdateArrayItemFn, AddArrayItemFn, RemoveArrayItemFn } from './settings-atoms'

interface ContactTabProps {
  settings: SiteSettings
  updateField: UpdateFieldFn
  updateArrayItem: UpdateArrayItemFn
  addArrayItem: AddArrayItemFn
  removeArrayItem: RemoveArrayItemFn
}

export function ContactTab({ settings, updateField, updateArrayItem, addArrayItem, removeArrayItem }: ContactTabProps) {
  return (
    <div className="p-4 sm:p-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <section>
        <SectionHeading icon={Phone} label="Direct Contact Info" accent="#a8d5c2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email Address">
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="email" className={cn(inputCls('#a8d5c2'), 'pl-8')} value={settings.contact.email} onChange={(e) => updateField('contact', 'email', e.target.value)} placeholder="hello@domain.com" />
            </div>
          </Field>
          <Field label="Phone / WhatsApp">
            <input type="text" className={inputCls('#a8d5c2')} value={settings.contact.phone} onChange={(e) => updateField('contact', 'phone', e.target.value)} placeholder="+880 1…" />
          </Field>
          <Field label="Contact Page Message" className="sm:col-span-2">
            <textarea rows={4} className={cn(inputCls('#a8d5c2'), 'resize-y')} value={settings.contact.shortText} onChange={(e) => updateField('contact', 'shortText', e.target.value)} placeholder="Got a project in mind?…" />
          </Field>
        </div>
      </section>

      <section className="border-t border-border pt-6">
        <ArraySection title="Social Media Links" accent="#a8d5c2" onAdd={() => addArrayItem('contact', 'socials', { platform: '', url: '' })} addLabel="Add Link">
          <div className="grid sm:grid-cols-2 gap-3">
            {settings.contact.socials.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 border border-border rounded-xl">
                <input value={item.platform} onChange={(e) => updateArrayItem('contact', 'socials', i, 'platform', e.target.value)} placeholder="LinkedIn" className="w-1/3 min-w-0 px-2.5 py-1.5 rounded-lg bg-background border text-sm outline-none focus:border-[#a8d5c2]" />
                <input value={item.url} onChange={(e) => updateArrayItem('contact', 'socials', i, 'url', e.target.value)} placeholder="https://…" className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-background border text-sm outline-none focus:border-[#a8d5c2]" />
                <DeleteBtn onClick={() => removeArrayItem('contact', 'socials', i)} />
              </div>
            ))}
          </div>
        </ArraySection>
      </section>
    </div>
  )
}
