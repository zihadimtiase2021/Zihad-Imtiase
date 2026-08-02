'use client'

import { useState, useEffect, useRef } from 'react'
import { PenLine, X, Image as ImageIcon, Video, Loader2, Send, FileText, BookOpen, Quote, Briefcase, Music } from 'lucide-react'
import { cn } from '@/lib/utils'

type PostType = 'general' | 'article' | 'testimonial' | 'portfolio'

interface MediaFile {
  url: string
  type: 'image' | 'video' | 'audio'
}

export function QuickCompose() {
  const [isAuth, setIsAuth] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  // Form State
  const [postType, setPostType] = useState<PostType>('general')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [extraField, setExtraField] = useState('')
  const [mediaItems, setMediaItems] = useState<MediaFile[]>([])
  
  const [isUploading, setIsUploading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  
  const fileRef = useRef<HTMLInputElement>(null)

  // Check if admin is logged in
  useEffect(() => {
    fetch('/api/auth/status')
      .then(res => res.json())
      .then(data => setIsAuth(data.authenticated))
      .catch(() => setIsAuth(false))
  }, [])

  if (!isAuth) return null

  // Handle File (Image/Video/Audio) Upload
  async function handleFileUpload(file: File) {
    setIsUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    
    // ভিডিওর ক্ষেত্রে ওয়েবপি কনভার্ট করা যাবে না, তাই অরজিনাল ফরম্যাট রাখতে হবে
    const isVideoOrAudio = file.type.startsWith('video/') || file.type.startsWith('audio/')
    fd.append('format', isVideoOrAudio ? 'original' : 'webp')

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) {
        const fileType: 'image' | 'video' | 'audio' = file.type.startsWith('video/') 
          ? 'video' 
          : file.type.startsWith('audio/') 
          ? 'audio' 
          : 'image'

        setMediaItems(prev => [...prev, { url: data.url, type: fileType }])
      }
    } catch (e) {
      console.error('Upload failed', e)
    } finally {
      setIsUploading(false)
    }
  }

  // Handle Publish
  async function handlePublish() {
    if (!title.trim() && !content.trim() && mediaItems.length === 0) return
    setIsPublishing(true)

    // Extract raw URLs for backend compatibility
    const mediaUrls = mediaItems.map(m => m.url)

    try {
      let endpoint = ''
      let payload: any = {}

      if (postType === 'general' || postType === 'article') {
        endpoint = '/api/feed'
        payload = {
          type: postType === 'article' ? 'article' : 'post',
          category: postType === 'article' ? 'articles' : 'general',
          title: title || '',
          content,
          excerpt: content.slice(0, 100) + (content.length > 100 ? '...' : ''),
          media: mediaUrls,
          date: new Date().toISOString().split('T')[0]
        }
      } else if (postType === 'testimonial') {
        endpoint = '/api/feed'
        payload = {
          type: 'testimonial', category: 'testimonials',
          title: title || 'New Review', content,
          clientName: extraField || 'Anonymous Client',
          media: mediaUrls, rating: 5,
          date: new Date().toISOString().split('T')[0]
        }
      } else if (postType === 'portfolio') {
        endpoint = '/api/portfolio'
        payload = {
          title: title || 'New Project', description: content,
          category: 'development',
          image: mediaUrls[0] || '', images: mediaUrls,
          tech: extraField.split(',').map(t => t.trim()).filter(Boolean),
          featured: false
        }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setIsOpen(false)
        setTitle(''); setContent(''); setExtraField(''); setMediaItems([])
        window.location.reload()
      }
    } catch (e) {
      console.error('Publish failed', e)
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-5 md:bottom-28 md:right-8 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-[0_8px_30px_rgba(244,162,149,0.3)] hover:shadow-[0_8px_30px_rgba(244,162,149,0.5)]"
        style={{ backgroundColor: '#f4a295', color: '#1a1a1a' }}
      >
        <PenLine size={24} strokeWidth={2.5} />
      </button>

      {/* Compose Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex gap-1.5 bg-muted p-1 rounded-xl">
                {[
                  { id: 'general', icon: FileText, label: 'General Post' },
                  { id: 'article', icon: BookOpen, label: 'Article' },
                  { id: 'testimonial', icon: Quote, label: 'Testimonial' },
                  { id: 'portfolio', icon: Briefcase, label: 'Project' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setPostType(t.id as PostType)}
                    className={cn(
                      'relative group flex items-center justify-center p-2 rounded-lg transition-all', 
                      postType === t.id ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    )}
                  >
                    <t.icon size={16} className={postType === t.id ? 'text-[#f4a295]' : ''} />
                    
                    <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-foreground text-background text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
                      {t.label}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-foreground" />
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Compose Area */}
            <div className="p-5 flex flex-col gap-3">
              <input
                type="text"
                placeholder={postType === 'testimonial' ? "Review Summary" : postType === 'portfolio' ? "Project Name" : "Title (Optional)"}
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-transparent text-foreground text-lg font-bold placeholder:text-muted-foreground/50 outline-none"
              />
              
              <textarea
                placeholder={postType === 'portfolio' ? "Describe the project..." : "What's happening?"}
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={4}
                className="w-full bg-transparent text-foreground text-base placeholder:text-muted-foreground/50 outline-none resize-none leading-relaxed"
              />

              {/* Extra Fields */}
              {(postType === 'testimonial' || postType === 'portfolio') && (
                <input
                  type="text"
                  placeholder={postType === 'testimonial' ? "Client Name (e.g. John Doe)" : "Tech Stack (e.g. React, Next.js)"}
                  value={extraField}
                  onChange={e => setExtraField(e.target.value)}
                  className="w-full bg-muted/30 border border-border px-4 py-2.5 rounded-xl text-sm outline-none focus:border-[#f4a295] transition-colors mt-2"
                />
              )}

              {/* Media Previews (Supports Images & Videos) */}
              {mediaItems.length > 0 && (
                <div className="flex gap-3 overflow-x-auto py-3 scrollbar-none">
                  {mediaItems.map((item, i) => (
                    <div key={i} className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-border bg-muted shadow-sm flex items-center justify-center">
                      {item.type === 'video' ? (
                        <video src={item.url} className="w-full h-full object-cover" />
                      ) : item.type === 'audio' ? (
                        <Music size={24} className="text-[#f4a295]" />
                      ) : (
                        <img src={item.url} className="w-full h-full object-cover" alt="" />
                      )}
                      
                      <button 
                        onClick={() => setMediaItems(mediaItems.filter((_, idx) => idx !== i))} 
                        className="absolute top-1.5 right-1.5 bg-black/70 text-white p-1 rounded-full hover:bg-black transition-colors z-10"
                      >
                        <X size={12}/>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <button onClick={() => fileRef.current?.click()} disabled={isUploading || isPublishing} className="p-2.5 rounded-full text-[#f4a295] hover:bg-[#f4a295]/10 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                  {isUploading ? <Loader2 size={20} className="animate-spin" /> : <div className="flex items-center gap-1"><ImageIcon size={18} /><Video size={18} /></div>}
                </button>
                <input type="file" ref={fileRef} accept="image/*,video/mp4,video/webm,video/quicktime,audio/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
              </div>

              <button
                onClick={handlePublish}
                disabled={isPublishing || (!title.trim() && !content.trim() && mediaItems.length === 0)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all disabled:opacity-50 active:scale-95"
                style={{ backgroundColor: '#f4a295', color: '#1a1a1a' }}
              >
                {isPublishing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Post
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}