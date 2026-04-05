export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          entry_mode: 'quick' | 'wizard'
          is_admin: boolean
          points_total: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at' | 'points_total'> & {
          points_total?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      challenges: {
        Row: {
          id: string
          title: string
          description: string
          start_date: string
          end_date: string
          duration_days: number
          status: 'draft' | 'active' | 'completed'
          cover_image_url: string | null
          upload_config: Record<string, unknown> | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['challenges']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['challenges']['Insert']>
      }
      challenge_fields: {
        Row: {
          id: string
          challenge_id: string
          name: string
          label: string
          type: 'number' | 'text' | 'date' | 'boolean' | 'file' | 'image'
          required: boolean
          order: number
          config: Record<string, unknown> | null
        }
        Insert: Omit<Database['public']['Tables']['challenge_fields']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['challenge_fields']['Insert']>
      }
      challenge_participants: {
        Row: {
          id: string
          challenge_id: string
          user_id: string
          joined_at: string
          current_streak: number
          best_streak: number
          points_earned: number
        }
        Insert: Omit<Database['public']['Tables']['challenge_participants']['Row'], 'id' | 'joined_at' | 'current_streak' | 'best_streak' | 'points_earned'> & {
          id?: string
          joined_at?: string
          current_streak?: number
          best_streak?: number
          points_earned?: number
        }
        Update: Partial<Database['public']['Tables']['challenge_participants']['Insert']>
      }
      daily_entries: {
        Row: {
          id: string
          challenge_id: string
          user_id: string
          entry_date: string
          submitted_at: string
        }
        Insert: Omit<Database['public']['Tables']['daily_entries']['Row'], 'id' | 'submitted_at'> & {
          id?: string
          submitted_at?: string
        }
        Update: Partial<Database['public']['Tables']['daily_entries']['Insert']>
      }
      entry_values: {
        Row: {
          id: string
          entry_id: string
          field_id: string
          value_text: string | null
          value_number: number | null
          value_date: string | null
          value_file_url: string | null
        }
        Insert: Omit<Database['public']['Tables']['entry_values']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['entry_values']['Insert']>
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string
          icon_url: string
          condition_type: 'streak' | 'completion' | 'points' | 'custom'
          condition_value: number
        }
        Insert: Omit<Database['public']['Tables']['badges']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['badges']['Insert']>
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          challenge_id: string | null
          earned_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_badges']['Row'], 'id' | 'earned_at'> & {
          id?: string
          earned_at?: string
        }
        Update: Partial<Database['public']['Tables']['user_badges']['Insert']>
      }
      points_log: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          entry_id: string | null
          action: string
          points: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['points_log']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['points_log']['Insert']>
      }
      motivational_quotes: {
        Row: {
          id: string
          text: string
          author: string | null
          context: 'daily' | 'streak_lost' | 'streak_milestone' | 'rank_up' | 'entry_submitted'
        }
        Insert: Omit<Database['public']['Tables']['motivational_quotes']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['motivational_quotes']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
