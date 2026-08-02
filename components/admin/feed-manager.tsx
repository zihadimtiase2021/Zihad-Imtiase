'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Trash2, Edit2, Plus, X, Check, Upload, Image, FileVideo,
  BookOpen, Quote, Briefcase, ChevronDown, Loader2, Star,
  Music, Film, GripVertical, ImagePlus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MediaPickerModal } from './media-picker-modal'

interface FeedItem {
  id: string
  type: string
  title: string
  excerpt: string
  content: string
  category: string
  image?: string
  media?: string[]
  author: string
  clientName?: string
  clientRole?: string
  date: string
  likes: number
  replies: number
  rating?: number
  tech?: string[]
  link?: string
  featured?: boolean
  linkedProjectId?: string
}

interface PortfolioProject {
  id: string
  title: string
  category: string
}

const EMPTY: Omit<FeedItem, 'id'> = {
  type: 'article',
  title: '',
  excerpt: '',
  content: '',
  category: 'articles',
  image: '',
  media: [],
  author: 'Zihad Imtiase',
  clientName: '',
  clientRole: '',
  date: new Date().toISOString().split('T')[0],
  likes: 0,
  replies: 0,
  rating: 5,
  tech: [],
  link: '',
  featured: false,
  linkedProjectId: '',
}

const TYPE_OPTIONS = [
  { value: 'article', label: 'Article', icon: BookOpen, color: '#f4a295' },
  { value: 'testimonial', label: 'Testimonial', icon: Quote, color: '#a8d5c2' },
  { value: 'project', label: 'Project', icon: Briefcase, color: '#9db8e8' },
]

const CATEGORY_MAP: Record<string, string> = {
  article: 'articles',
  testimonial: 'testimonials',
  project: 'projects',
}

type Toast = { id: number; msg: string; ok: boolean }

function mediaType(url: string): 'image' | 'video' | 'audio' {
  if (/\.(mp4|webm|mov)$/i.test(url)) return 'video'
  if (/\.(mp3|ogg|wav|aac|flac|m4a)$/i.test(url)) return 'audio'
  return 'image'
}

function MediaThumb({ url, onRemove }: { url: string; onRemove: () => void }) {
  const kind = mediaType(url)
  return (
    <div className="relative rounded-xl overflow-hidden bg-muted border border-border group/thumb">
      {kind === 'image' && (
        <img src={url} alt="" className="w-full h-24 object-cover" />
      )}
      {kind === 'video' && (
        <div className="w-full h-24 flex flex-col items-center justify-center gap-1 text-muted-foreground">
          <Film size={20} />
          <span className="text-[10px]">Video</span>
        </div>
      )}
      {kind === 'audio' && (
        <div className="w-full h-24 flex flex-col items-center justify-center gap-1 text-muted-foreground">
          <Music size={20} />
          <span className="text-[10px]">Audio</span>
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90 transition-colors opacity-0 group-hover/thumb:opacity-100"
      >
        <X size={11} />
      </button>
      <div className="absolute bottom-1 left-1.5 text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-black/60 text-white">
        {kind}
      </div>
    </div>
  )
}

export function FeedManager() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<FeedItem, 'id'>>(EMPTY)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [techInput, setTechInput] = useState('')
  const [portfolioProjects, setPortfolioProjects] = useState<PortfolioProject[]>([])
  
  const fileRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => { fetchItems(); fetchPortfolioProjects() }, [])

  function addToast(msg: string, ok = true) {
    const id = Date.now()
    setToasts((t) => [...t, { id, msg, ok }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000)
  }

  async function fetchPortfolioProjects() {
    try {
      const res = await fetch('/api/portfolio')
      const data = await res.json()
      setPortfolioProjects(data.projects || [])
    } catch { }
  }

  async function fetchItems() {
    try {
      const res = await fetch('/api/feed')
      const data = await res.json()
      setItems(data.items || [])
    } catch {
      addToast('Failed to load items', false)
    } finally {
      setLoading(false)
    }
  }

  function set(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function openNew() {
    setEditingId(null)
    setForm({ ...EMPTY, date: new Date().toISOString().split('T')[0] })
    setTechInput('')
    setShowForm(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  function openEdit(item: FeedItem) {
    setEditingId(item.id)
    setForm({ ...item, media: item.media ?? [] })
    setTechInput(Array.isArray(item.tech) ? item.tech.join(', ') : '')
    setShowForm(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
  }

  async function handleUploadFiles(files: FileList) {
    setUploading(true)
    const uploaded: string[] = []
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (data.success) uploaded.push(data.url)
        else addToast(`Upload failed: ${file.name}`, false)
      } catch {
        addToast(`Upload failed: ${file.name}`, false)
      }
    }
    if (uploaded.length > 0) {
      setForm((f) => ({
        ...f,
        media: [...(f.media ?? []), ...uploaded],
      }))
      addToast(`${uploaded.length} file${uploaded.length > 1 ? 's' : ''} uploaded`)
    }
    setUploading(false)
  }

  function handleSelectExisting(urls: string[]) {
    const remainingSlots = 4 - (form.media?.length || 0)
    const urlsToAdd = urls.slice(0, remainingSlots)
    
    if (urlsToAdd.length > 0) {
      setForm((f) => ({
        ...f,
        media: [...(f.media ?? []), ...urlsToAdd],
      }))
      addToast(`${urlsToAdd.length} media attached`)
    }
  }

  function removeMedia(index: number) {
    setForm((f) => ({ ...f, media: (f.media ?? []).filter((_, i) => i !== index) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      category: CATEGORY_MAP[form.type] ?? 'articles',
      tech: techInput.split(',').map((t) => t.trim()).filter(Boolean),
      image: (form.media ?? [])[0] ?? form.image ?? '',
    }
    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, updates: payload } : payload
      const res = await fetch('/api/feed', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        addToast(editingId ? 'Post updated' : 'Post created')
        fetchItems()
        closeForm()
      } else {
        addToast('Save failed', false)
      }
    } catch {
      addToast('Save failed', false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch('/api/feed', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        addToast('Post deleted')
        setItems((prev) => prev.filter((i) => i.id !== id))
      } else {
        addToast('Delete failed', false)
      }
    } catch {
      addToast('Delete failed', false)
    } finally {
      setDeleteConfirm(null)
    }
  }

  const mediaCount = (form.media ?? []).length

  return (
    <div className="relative">
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg pointer-events-auto transition-all',
              t.ok ? 'bg-foreground text-background' : 'bg-destructive text-white'
            )}
          >
            {t.msg}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Feed Posts</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {items.length} {items.length === 1 ? 'post' : 'posts'} total
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: '#f4a295', color: '#1a1a1a' }}
        >
          <Plus size={16} />
          New Post
        </button>
      </div>

      {showForm && (
        <div ref={formRef} className="mb-6 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border" style={{ background: '#f4a29510' }}>
            <h3 className="font-semibold text-foreground text-sm">
              {editingId ? 'Edit Post' : 'New Post'}
            </h3>
            <button onClick={closeForm} className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X size={15} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Post Type
              </label>
              <div className="flex gap-2">
                {TYPE_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  const active = form.type === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('type', opt.value)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex-1 justify-center',
                        active ? 'border-transparent' : 'border-border text-muted-foreground hover:border-border/80'
                      )}
                      style={active ? { backgroundColor: opt.color + '20', color: opt.color, borderColor: opt.color + '40' } : {}}
                    >
                      <Icon size={13} />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Enter a compelling title..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Excerpt / Short text
              </label>
              <textarea
                value={form.excerpt}
                onChange={(e) => set('excerpt', e.target.value)}
                placeholder="Short preview shown in the feed..."
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Full Content
              </label>
              <textarea
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
                placeholder="Full post content..."
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors resize-none"
              />
            </div>

            {form.type === 'testimonial' && (
              <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Client Name</label>
                    <input
                      type="text"
                      value={form.clientName || ''}
                      onChange={(e) => set('clientName', e.target.value)}
                      placeholder="Felix Johnson"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Role / Company</label>
                    <input
                      type="text"
                      value={form.clientRole || ''}
                      onChange={(e) => set('clientRole', e.target.value)}
                      placeholder="Founder, TechStart"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => set('rating', n)}
                        className="transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          size={22}
                          fill={(form.rating ?? 5) >= n ? '#f4a295' : 'none'}
                          style={{ color: (form.rating ?? 5) >= n ? '#f4a295' : 'var(--muted-foreground)' }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {form.type === 'project' && (
              <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Details</p>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Technologies (comma-separated)</label>
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    placeholder="React, Webflow, TailwindCSS"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Project Link</label>
                  <input
                    type="url"
                    value={form.link || ''}
                    onChange={(e) => set('link', e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Media
                  <span className="ml-1 font-normal normal-case text-muted-foreground/70">
                    — images, video, audio (up to 4 files)
                  </span>
                </label>
                {mediaCount > 0 && (
                  <span className="text-[11px] text-muted-foreground">{mediaCount}/4</span>
                )}
              </div>

              {mediaCount > 0 && (
                <div className={cn('grid gap-2 mb-2', mediaCount === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
                  {(form.media ?? []).map((url, i) => (
                    <MediaThumb key={url + i} url={url} onRemove={() => removeMedia(i)} />
                  ))}
                </div>
              )}

              {mediaCount < 4 && (
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-xl transition-colors cursor-pointer',
                      uploading ? 'border-brand/40 bg-brand/5' : 'border-border hover:border-[#f4a295]/50 hover:bg-muted/30'
                    )}
                    onClick={() => !uploading && fileRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-1.5 py-4 text-muted-foreground">
                      {uploading ? (
                        <Loader2 size={18} className="animate-spin text-[#f4a295]" />
                      ) : (
                        <>
                          <Upload size={18} />
                          <span className="text-xs">Upload New</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div
                    className="border-2 border-dashed rounded-xl transition-colors cursor-pointer border-border hover:border-[#f4a295]/50 hover:bg-muted/30"
                    onClick={() => setPickerOpen(true)}
                  >
                    <div className="flex flex-col items-center gap-1.5 py-4 text-muted-foreground">
                      <ImagePlus size={18} />
                      <span className="text-xs">Choose Existing</span>
                    </div>
                  </div>

                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept="image/*,video/mp4,video/webm,audio/*"
                    className="hidden"
                    onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
                  />
                </div>
              )}
            </div>

            {portfolioProjects.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Link to Portfolio Project
                  <span className="ml-1 font-normal normal-case text-muted-foreground/70">(optional)</span>
                </label>
                <div className="relative">
                  <select
                    value={form.linkedProjectId || ''}
                    onChange={(e) => set('linkedProjectId', e.target.value || '')}
                    className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                  >
                    <option value="">— No linked project —</option>
                    {portfolioProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.category})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                style={{ backgroundColor: '#f4a295', color: '#1a1a1a' }}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {editingId ? 'Save changes' : 'Publish post'}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="px-5 py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3 rounded-2xl border border-dashed border-border">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Plus size={20} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No posts yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const typeMeta = TYPE_OPTIONS.find((t) => t.value === item.type) ?? TYPE_OPTIONS[0]
            const TypeIcon = typeMeta.icon
            const isDeleting = deleteConfirm === item.id
            const allMedia = item.media?.length ? item.media : item.image ? [item.image] : []

            return (
              <div
                key={item.id}
                className={cn(
                  'group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all',
                  isDeleting ? 'border-destructive/40 bg-destructive/5' : 'border-border bg-card hover:border-border/80 hover:bg-muted/30'
                )}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: typeMeta.color + '18' }}>
                  <TypeIcon size={14} style={{ color: typeMeta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{item.title || '(no title)'}</p>
                  <p className="text-xs text-muted-foreground">
                    {typeMeta.label} · {item.date}
                    {allMedia.length > 0 && ` · ${allMedia.length} media`}
                  </p>
                </div>
                {isDeleting ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">Delete?</span>
                    <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 rounded-lg bg-destructive text-white text-xs font-semibold hover:opacity-90 transition-opacity">Yes</button>
                    <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">No</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(item)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Edit2 size={14} /></button>
                    <button onClick={() => setDeleteConfirm(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <MediaPickerModal 
        isOpen={pickerOpen} 
        onClose={() => setPickerOpen(false)} 
        multiple={true}
        onSelect={handleSelectExisting} 
      />
    </div>
  )
}
