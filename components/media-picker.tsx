'use client'

import { useState, useRef, useEffect } from 'react'
import { Image as ImageIcon, Video, UploadCloud, Library, Loader2, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaFile {
  url: string
  type: 'image' | 'video' | 'audio'
}

interface MediaPickerProps {
  onSelect: (media: MediaFile[]) => void
  disabled?: boolean
}

export function MediaPicker({ onSelect, disabled }: MediaPickerProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [siteMedia, setSiteMedia] = useState<MediaFile[]>([])
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false)
  
  const menuRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle Device Upload
  const handleFileUpload = async (file: File) => {
    setIsMenuOpen(false)
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
        const fileType = file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'image'
        onSelect([{ url: data.url, type: fileType }])
      }
    } catch (e) {
      console.error('Upload failed', e)
    } finally {
      setIsUploading(false)
    }
  }

  // Fetch Existing Site Media from Cloudinary (using your existing API)
  const openLibrary = async () => {
    setIsMenuOpen(false)
    setIsLibraryOpen(true)
    setIsLoadingLibrary(true)
    
    try {
      const res = await fetch('/api/media') 
      if (res.ok) {
        const data = await res.json()
        
        // Cloudinary returns data in `resources` array
        if (data.success && data.resources) {
          const mappedMedia: MediaFile[] = data.resources.map((item: any) => ({
            url: item.secure_url || item.url, 
            type: item.resource_type === 'video' ? 'video' : 'image' // Cloudinary mostly uses 'image' or 'video'
          }))
          setSiteMedia(mappedMedia)
        } else {
          setSiteMedia([])
        }
      }
    } catch (e) {
      console.error('Failed to fetch media library', e)
    } finally {
      setIsLoadingLibrary(false)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsMenuOpen(!isMenuOpen)}
        disabled={disabled || isUploading}
        className={cn(
          "p-2.5 rounded-full transition-colors flex items-center gap-1.5",
          isMenuOpen ? "bg-[#f4a295]/20 text-[#f4a295]" : "text-[#f4a295] hover:bg-[#f4a295]/10",
          (disabled || isUploading) && "opacity-50 cursor-not-allowed"
        )}
        aria-label="Add Media"
      >
        {isUploading ? <Loader2 size={20} className="animate-spin" /> : (
          <div className="flex items-center gap-1">
            <ImageIcon size={18} />
            <Video size={18} />
          </div>
        )}
      </button>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileRef} 
        accept="image/*,video/mp4,video/webm,audio/*" 
        className="hidden" 
        onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])} 
      />

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-60 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
          <button 
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors text-left"
          >
            <UploadCloud size={16} className="text-[#f4a295]" />
            Upload from device
          </button>
          <div className="h-px bg-border w-full" />
          <button 
            onClick={openLibrary}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors text-left"
          >
            <Library size={16} className="text-[#f4a295]" />
            Choose from existing site
          </button>
        </div>
      )}

      {/* Cloudinary Media Library Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in" onClick={(e) => e.stopPropagation()}>
          <div className="w-full max-w-3xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Library size={18} className="text-[#f4a295]" /> Site Media Library
              </h3>
              <button onClick={() => setIsLibraryOpen(false)} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
              {isLoadingLibrary ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
                  <Loader2 size={24} className="animate-spin text-[#f4a295]" />
                  <p className="text-sm font-medium">Loading media from Cloudinary...</p>
                </div>
              ) : siteMedia.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {siteMedia.map((media, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        onSelect([media])
                        setIsLibraryOpen(false)
                      }}
                      className="aspect-square rounded-xl bg-muted border border-border overflow-hidden cursor-pointer hover:border-[#f4a295] hover:shadow-md transition-all relative group"
                    >
                      {media.type === 'video' ? (
                        <video src={media.url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={media.url} className="w-full h-full object-cover" alt="Media preview" loading="lazy" />
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Check size={28} className="text-white" />
                      </div>
                      
                      {/* Video Indicator */}
                      {media.type === 'video' && (
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white p-1 rounded-md">
                          <Video size={12} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <Library size={32} className="opacity-20 mb-3" />
                  <p className="text-sm">No existing media found on the site.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
