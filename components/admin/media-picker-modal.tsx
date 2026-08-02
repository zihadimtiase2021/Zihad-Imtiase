'use client'

import { useState, useEffect } from 'react'
import { X, Check, Loader2, Image as ImageIcon, Film, Music } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaResource {
  asset_id: string
  public_id: string
  secure_url: string
  resource_type: string
  format: string
  created_at: string
}

interface MediaPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (urls: string[]) => void
  multiple?: boolean
}

function getMediaIcon(resourceType: string, format: string) {
  if (resourceType === 'video' && ['mp3', 'wav', 'ogg'].includes(format)) return <Music size={20} />
  if (resourceType === 'video') return <Film size={20} />
  return <ImageIcon size={20} />
}

export function MediaPickerModal({ isOpen, onClose, onSelect, multiple = false }: MediaPickerModalProps) {
  const [resources, setResources] = useState<MediaResource[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isOpen) {
      fetchMedia()
      setSelected(new Set())
    }
  }, [isOpen])

  async function fetchMedia() {
    setLoading(true)
    try {
      const res = await fetch('/api/media')
      const data = await res.json()
      if (data.success) {
        setResources(data.resources)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  function toggleSelection(url: string) {
    const next = new Set(selected)
    if (next.has(url)) {
      next.delete(url)
    } else {
      if (!multiple) next.clear()
      next.add(url)
    }
    setSelected(next)
  }

  function handleConfirm() {
    onSelect(Array.from(selected))
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl max-h-[85vh] bg-card border border-border rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
          <div>
            <h2 className="font-bold text-foreground">Select Media</h2>
            <p className="text-xs text-muted-foreground">Choose from your existing Cloudinary uploads</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 size={30} className="animate-spin text-muted-foreground" />
            </div>
          ) : resources.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon size={30} className="mb-2 opacity-50" />
              <p className="text-sm">No media found in Cloudinary folder.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {resources.map((res) => {
                const isSelected = selected.has(res.secure_url)
                return (
                  <div
                    key={res.asset_id}
                    onClick={() => toggleSelection(res.secure_url)}
                    className={cn(
                      'group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all',
                      isSelected ? 'border-[#f4a295]' : 'border-border hover:border-border/80'
                    )}
                  >
                    {res.resource_type === 'image' ? (
                      <img src={res.secure_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex flex-col items-center justify-center text-muted-foreground">
                        {getMediaIcon(res.resource_type, res.format)}
                        <span className="text-[10px] mt-1 font-semibold uppercase">{res.format}</span>
                      </div>
                    )}
                    
                    <div className={cn(
                      "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200",
                      isSelected ? "bg-[#f4a295] text-[#1a1a1a] scale-100 opacity-100" : "bg-black/40 border border-white/50 scale-90 opacity-0 group-hover:opacity-100"
                    )}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selected.size} {selected.size === 1 ? 'file' : 'files'} selected
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selected.size === 0}
              className="px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
              style={{ backgroundColor: '#f4a295', color: '#1a1a1a' }}
            >
              Insert Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
