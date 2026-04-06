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
        Relationships: []
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
        Relationships: []
      }
      challenge_fields: {
        Row: {
          id: string
          challenge_id: string
          name: string
          label: string
          type: 'number' | 'duration' | 'text' | 'date' | 'boolean' | 'file' | 'image'
          required: boolean
          order: number
          config: Record<string, unknown> | null
        }
        Insert: Omit<Database['public']['Tables']['challenge_fields']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['challenge_fields']['Insert']>
        Relationships: [
          {
            foreignKeyName: "challenge_fields_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "daily_entries_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "entry_values_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "daily_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "challenge_fields"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "points_log_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
      }
      challenge_goals: {
        Row: {
          id: string
          challenge_id: string
          field_id: string
          goal_date: string
          target_value: number
        }
        Insert: Omit<Database['public']['Tables']['challenge_goals']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['challenge_goals']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      increment_points: {
        Args: {
          p_user_id: string
          p_challenge_id: string
          p_points: number
        }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
  }
}
