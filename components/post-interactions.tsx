'use client'

import { useState, useEffect, useRef } from 'react'
import { Heart, MessageCircle, X, Send, User, Upload, Ghost, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Comment {
  id: string
  name: string
  avatar: string
  text: string
  date: string
}

interface PostInteractionsProps {
  postId: string
  initialLikes?: number
  initialComments?: Comment[]
}

interface VisitorIdentity {
  name: string
  avatar: string
  isAnonymous: boolean
}

export function PostInteractions({ postId, initialLikes = 0, initialComments = [] }: PostInteractionsProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(false)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  
  const [isCommentOpen, setIsCommentOpen] = useState(false)
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<'like' | 'comment' | null>(null)
  
  const [commentText, setCommentText] = useState('')
  const [identityName, setIdentityName] = useState('')
  const [identityAvatar, setIdentityAvatar] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [identity, setIdentity] = useState<VisitorIdentity | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('zd-visitor-identity')
    if (saved) setIdentity(JSON.parse(saved))
  }, [])

  const sendInteraction = async (action: 'like' | 'comment', newComment?: Comment) => {
    try {
      await fetch('/api/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action, comment: newComment })
      })
    } catch (e) {
      console.error('Interaction failed', e)
    }
  }

  const handleLikeClick = () => {
    if (!identity) {
      setPendingAction('like')
      setIsIdentityModalOpen(true)
      return
    }
    executeLike()
  }

  const executeLike = () => {
    if (isLiked) {
      setLikes(p => p - 1)
      setIsLiked(false)
    } else {
      setLikes(p => p + 1)
      setIsLiked(true)
      sendInteraction('like')
    }
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    if (!identity) {
      setPendingAction('comment')
      setIsIdentityModalOpen(true)
      return
    }
    executeComment()
  }

  const executeComment = () => {
    if (!identity) return
    const newComment: Comment = {
      id: Date.now().toString(),
      name: identity.isAnonymous ? 'Anonymous' : identity.name || 'Anonymous',
      avatar: identity.isAnonymous ? '' : identity.avatar,
      text: commentText,
      date: new Date().toISOString()
    }
    
    setComments(prev => [...prev, newComment])
    setCommentText('')
    sendInteraction('comment', newComment)
  }

  const handleAvatarUpload = async (file: File) => {
    setIsUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('format', 'webp')
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) setIdentityAvatar(data.url)
    } finally {
      setIsUploading(false)
    }
  }

  const saveIdentity = (isAnonymous: boolean) => {
    const newIdentity = {
      name: isAnonymous ? 'Anonymous' : identityName || 'Anonymous',
      avatar: isAnonymous ? '' : identityAvatar,
      isAnonymous
    }
    setIdentity(newIdentity)
    localStorage.setItem('zd-visitor-identity', JSON.stringify(newIdentity))
    setIsIdentityModalOpen(false)

    if (pendingAction === 'like') executeLike()
    if (pendingAction === 'comment') executeComment()
    setPendingAction(null)
  }

  return (
    <div className="pt-3 border-t border-border mt-4">
      <div className="flex items-center gap-6">
        <button 
          onClick={handleLikeClick}
          className={cn("flex items-center gap-2 text-sm font-medium transition-colors", isLiked ? "text-[#f4a295]" : "text-muted-foreground hover:text-foreground")}
        >
          <Heart size={18} className={cn("transition-transform active:scale-75", isLiked && "fill-[#f4a295]")} />
          {likes > 0 && <span>{likes}</span>}
        </button>

        <button 
          onClick={() => setIsCommentOpen(!isCommentOpen)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle size={18} />
          {comments.length > 0 && <span>{comments.length}</span>}
        </button>
      </div>

      {isCommentOpen && (
        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {comments.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3 bg-muted/30 p-3 rounded-2xl border border-border">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border">
                    {c.avatar ? <img src={c.avatar} alt="avatar" className="w-full h-full object-cover" /> : <Ghost size={14} className="text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-foreground truncate">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {new Date(c.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No comments yet. Be the first!</p>
          )}

          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border">
               {identity && !identity.isAnonymous && identity.avatar ? (
                 <img src={identity.avatar} alt="You" className="w-full h-full object-cover" />
               ) : (
                 <User size={16} className="text-muted-foreground" />
               )}
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full bg-muted/50 border border-border px-4 py-2 rounded-full text-sm outline-none focus:border-[#f4a295] transition-colors pr-10"
              />
              <button 
                type="submit" 
                disabled={!commentText.trim()}
                className="absolute right-1 top-1 bottom-1 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-[#f4a295] disabled:opacity-50 transition-colors"
              >
                <Send size={15} />
              </button>
            </div>
          </form>
        </div>
      )}

      {isIdentityModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl overflow-hidden p-6 relative">
            
            {/* 🔴 এখানে মডাল ক্লোজ করলে অটোমেটিক Anonymous সেভ হবে */}
            <button 
              onClick={() => saveIdentity(true)} 
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
            >
              <X size={18} />
            </button>
            
            <h3 className="font-bold text-xl text-foreground mb-1">Join the conversation</h3>
            <p className="text-xs text-muted-foreground mb-6">How would you like to interact?</p>

            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-muted relative overflow-hidden group">
                  {identityAvatar ? (
                    <img src={identityAvatar} className="w-full h-full object-cover" alt="Avatar"/>
                  ) : (
                    <User size={24} className="text-muted-foreground" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity" onClick={() => fileRef.current?.click()}>
                     {isUploading ? <Loader2 size={16} className="text-white animate-spin" /> : <Upload size={16} className="text-white" />}
                  </div>
                  <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-1 block">Display Name</label>
                  <input 
                    type="text" 
                    value={identityName} 
                    onChange={e => setIdentityName(e.target.value)} 
                    placeholder="e.g. John Doe"
                    className="w-full bg-muted/50 border border-border px-3 py-2 rounded-xl text-sm outline-none focus:border-[#f4a295]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <button 
                  onClick={() => saveIdentity(false)}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: '#f4a295', color: '#1a1a1a' }}
                >
                  Save Profile & Continue
                </button>
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground">OR</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>
                <button 
                  onClick={() => saveIdentity(true)}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-muted text-foreground border border-border hover:bg-background transition-all"
                >
                  <Ghost size={16} className="inline mr-2 -mt-0.5" />
                  Continue Anonymously
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}