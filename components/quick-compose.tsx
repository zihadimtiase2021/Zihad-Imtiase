'use client'

import { useState, useEffect } from 'react'
import { PenLine, X, Loader2, Send, FileText, BookOpen, Quote, Briefcase, Music } from 'lucide-react'
import { cn } from '@/lib/utils'
import { addFeedItem, updateFeedItem, addPortfolioProject, updatePortfolioProject } from '@/lib/data-actions'
import { MediaPicker } from '@/components/media-picker'

type PostType = 'general' | 'article' | 'testimonial' | 'portfolio'

interface MediaFile {
  url: string
  type: 'image' | 'video' | 'audio'
}

export function QuickCompose() {
  const [isAuth, setIsAuth] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  // Form State
  const [isEditing, setIsEditing] = useState(false)
  const [editPostId, setEditPostId] = useState<string | null>(null)
  const [postType, setPostType] = useState<PostType>('general')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [extraField, setExtraField] = useState('')
  const [mediaItems, setMediaItems] = useState<MediaFile[]>([])
  
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(() => {
    fetch('/api/auth/status')
      .then(res => res.json())
      .then(data => setIsAuth(data.authenticated))
      .catch(() => setIsAuth(false))
  }, [])

  // Listen for Edit Event
  useEffect(() => {
    const handleEditEvent = (e: any) => {
      const { id, type, title, content, extraField, mediaUrls } = e.detail
      
      let mappedType: PostType = 'general'
      if (type === 'article') mappedType = 'article'
      else if (type === 'testimonial') mappedType = 'testimonial'
      else if (type === 'project' || type === 'portfolio') mappedType = 'portfolio'
      
      setPostType(mappedType)
      setTitle(title || '')
      setContent(content || '')
      setExtraField(extraField || '')
      
      const mappedMedia = (mediaUrls || []).map((url: string) => {
        const type = url.match(/\.(mp4|webm|mov)$/i) ? 'video' : url.match(/\.(mp3|wav|ogg)$/i) ? 'audio' : 'image'
        return { url, type }
      })
      setMediaItems(mappedMedia)
      setEditPostId(id)
      setIsEditing(true)
      setIsOpen(true)
    }

    window.addEventListener('edit-post', handleEditEvent)
    return () => window.removeEventListener('edit-post', handleEditEvent)
  }, [])

  if (!isAuth) return null

  const closeAndReset = () => {
    setIsOpen(false)
    setTimeout(() => {
      setIsEditing(false); setEditPostId(null); setPostType('general');
      setTitle(''); setContent(''); setExtraField(''); setMediaItems([])
    }, 200)
  }

  const handlePublish = async () => {
    if (!title.trim() && !content.trim() && mediaItems.length === 0) return
    setIsPublishing(true)

    const mediaUrls = mediaItems.map(m => m.url)
    let success = false

    try {
      if (postType === 'portfolio') {
        const payload: any = {
          title: title || 'New Project', 
          description: content,
          category: 'development',
          image: mediaUrls[0] || '', 
          images: mediaUrls,
          tech: extraField.split(',').map(t => t.trim()).filter(Boolean),
          featured: false
        }
        const res = isEditing && editPostId 
          ? await updatePortfolioProject(editPostId, payload)
          : await addPortfolioProject(payload)
        success = res.success
      } else {
        const payload: any = {
          type: postType === 'article' ? 'article' : postType === 'testimonial' ? 'testimonial' : 'post',
          category: postType === 'article' ? 'articles' : postType === 'testimonial' ? 'testimonials' : 'general',
          title: title || '', 
          body: content, 
          author: postType === 'testimonial' ? extraField : 'Zihad Imtiase',
          media: mediaUrls
        }
        
        if (postType === 'testimonial') payload.rating = 5

        const res = isEditing && editPostId
          ? await updateFeedItem(editPostId, payload)
          : await addFeedItem(payload)
        success = res.success
      }

      if (success) {
        closeAndReset()
        window.location.reload()
      } else {
        alert(`Failed to ${isEditing ? 'update' : 'publish'} post.`)
      }
    } catch (e) {
      console.error('Publish failed', e)
    } finally {
      setIsPublishing(false)
    }
  }

  // --- Dynamic Placeholders ---
  const getTitlePlaceholder = () => {
    switch (postType) {
      case 'article': return "Article Title..."
      case 'testimonial': return "Review Summary..."
      case 'portfolio': return "Project Name..."
      default: return "Title (Optional)..."
    }
  }

  const getContentPlaceholder = () => {
    switch (postType) {
      case 'article': return "Write your article content here..."
      case 'testimonial': return "What did the client say? (Testimonial)..."
      case 'portfolio': return "Describe the project details and tech stack..."
      default: return "What's happening? (General Update)..."
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-5 md:bottom-28 md:right-8 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-[0_8px_30px_rgba(244,162,149,0.3)] hover:shadow-[0_8px_30px_rgba(244,162,149,0.5)]"
        style={{ backgroundColor: '#f4a295', color: '#1a1a1a' }}
        aria-label="Create Post"
      >
        <PenLine size={24} strokeWidth={2.5} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm text-foreground ml-1">{isEditing ? 'Edit Post' : 'Select Category'}</span>
                {!isEditing && (
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
                          'relative flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all', 
                          postType === t.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                        )}
                      >
                        <t.icon size={14} className={cn("mr-1.5", postType === t.id ? 'text-[#f4a295]' : '')} />
                        <span className="hidden sm:inline">{t.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={closeAndReset} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-3">
              <input
                type="text"
                placeholder={getTitlePlaceholder()}
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-transparent text-foreground text-lg font-bold placeholder:text-muted-foreground/50 outline-none transition-all"
              />
              
              <textarea
                placeholder={getContentPlaceholder()}
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={4}
                className="w-full bg-transparent text-foreground text-base placeholder:text-muted-foreground/50 outline-none resize-none leading-relaxed transition-all"
              />

              {(postType === 'testimonial' || postType === 'portfolio') && (
                <input
                  type="text"
                  placeholder={postType === 'testimonial' ? "Client Name (e.g. John Doe)" : "Tech Stack (e.g. React, Next.js)"}
                  value={extraField}
                  onChange={e => setExtraField(e.target.value)}
                  className="w-full bg-muted/30 border border-border px-4 py-2.5 rounded-xl text-sm outline-none focus:border-[#f4a295] transition-colors mt-2"
                />
              )}

              {mediaItems.length > 0 && (
                <div className="flex gap-3 overflow-x-auto py-3 scrollbar-none">
                  {mediaItems.map((item, i) => (
                    <div key={i} className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-border bg-muted shadow-sm flex items-center justify-center group">
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

            <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-muted/20">
              
              {/* 🟢 Reusable Media Picker Integration */}
              <MediaPicker 
                disabled={isPublishing}
                onSelect={(newItems) => setMediaItems(prev => [...prev, ...newItems])} 
              />

              <button
                onClick={handlePublish}
                disabled={isPublishing || (!title.trim() && !content.trim() && mediaItems.length === 0)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all disabled:opacity-50 active:scale-95"
                style={{ backgroundColor: '#f4a295', color: '#1a1a1a' }}
              >
                {isPublishing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isEditing ? 'Save Changes' : 'Post'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
