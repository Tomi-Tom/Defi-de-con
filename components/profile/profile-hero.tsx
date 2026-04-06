'use client'

import { useState } from 'react'
import { AvatarUpload } from './avatar-upload'
import { UserAvatar } from '@/components/ui/user-avatar'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ProfileHeroProps {
  userId: string
  username: string
  avatarUrl: string | null
  isAdmin: boolean
  createdAt: string
  isOwnProfile: boolean
}

export function ProfileHero({ userId, username, avatarUrl, isAdmin, createdAt, isOwnProfile }: ProfileHeroProps) {
  const [currentAvatar, setCurrentAvatar] = useState(avatarUrl)

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-bg-secondary via-bg-secondary to-bg-tertiary border border-border p-8">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-green to-accent-green-dark" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-accent-green/5 rounded-full blur-3xl" />

      <div className="relative flex items-center gap-6">
        {isOwnProfile ? (
          <AvatarUpload
            userId={userId}
            username={username}
            currentAvatarUrl={currentAvatar}
            onUploaded={setCurrentAvatar}
          />
        ) : (
          <UserAvatar username={username} avatarUrl={currentAvatar} size="xl" className="rounded-2xl" />
        )}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-black text-white">{username}</h1>
            {isAdmin && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-accent-orange/10 text-accent-orange uppercase">Admin</span>
            )}
          </div>
          <p className="text-text-muted text-sm">
            Membre depuis {format(parseISO(createdAt), 'MMMM yyyy', { locale: fr })}
          </p>
          {isOwnProfile && (
            <p className="text-[10px] text-text-muted mt-1">Clique sur l&apos;avatar pour changer ta photo</p>
          )}
        </div>
      </div>
    </div>
  )
}
