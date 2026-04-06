'use client'

import { useState, useRef, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Camera } from 'lucide-react'

interface AvatarUploadProps {
  userId: string
  username: string
  currentAvatarUrl: string | null
  onUploaded: (url: string) => void
}

export function AvatarUpload({ userId, username, currentAvatarUrl, onUploaded }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate
    if (!file.type.startsWith('image/')) {
      toast.error('Seules les images sont acceptees')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image trop lourde (max 2 Mo)')
      return
    }

    setUploading(true)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${userId}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) {
        toast.error(`Erreur upload: ${uploadError.message}`)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      // Add cache buster
      const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlWithCacheBuster })
        .eq('id', userId)

      if (updateError) {
        toast.error(`Erreur: ${updateError.message}`)
        return
      }

      setPreview(urlWithCacheBuster)
      onUploaded(urlWithCacheBuster)
      toast.success('Photo de profil mise a jour !')
    } catch {
      toast.error('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="relative group">
      <div
        className="w-20 h-20 rounded-2xl overflow-hidden bg-accent-green/20 flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-accent-green/50 transition-all"
        onClick={() => fileRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt={username} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl font-black text-accent-green">
            {username.slice(0, 2).toUpperCase()}
          </span>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading ? (
            <div className="w-6 h-6 border-2 border-accent-green border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera size={20} className="text-white" />
          )}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  )
}
