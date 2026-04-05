# Defi De Con Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a challenge tracking platform with custom daily data entry, gamification (points, badges, leaderboards), and admin tools, deployed on Vercel + Supabase.

**Architecture:** Next.js 16 fullstack (App Router + Server Actions) with Supabase for DB, Auth, and Storage. Dark sport-themed UI with Tailwind CSS 4. RLS policies handle authorization at the DB level.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS 4, Supabase (`@supabase/supabase-js` + `@supabase/ssr`), Zod, React Hook Form, Sonner, canvas-confetti, Lucide React, Recharts, date-fns

**Spec:** `docs/superpowers/specs/2026-04-06-defi-de-con-design.md`

**Next.js 16 notes:** `params` and `searchParams` are Promises (must be awaited). Server Functions use `'use server'` directive. Use `refresh()` from `next/cache` to re-render after mutations. `PageProps<'/route'>` and `LayoutProps<'/route'>` are globally available type helpers. Route groups use `(folderName)` convention.

---

## File Structure

```
defi_de_con/
├── app/
│   ├── globals.css                          # Tailwind + dark theme custom props
│   ├── layout.tsx                           # Root layout (html, body, Toaster)
│   ├── (public)/
│   │   ├── layout.tsx                       # Public layout (centered, no sidebar)
│   │   ├── page.tsx                         # Landing page
│   │   ├── login/page.tsx                   # Login page
│   │   └── signup/page.tsx                  # Signup page
│   ├── (app)/
│   │   ├── layout.tsx                       # App layout (sidebar + topbar)
│   │   ├── dashboard/page.tsx               # Dashboard
│   │   ├── challenges/
│   │   │   ├── page.tsx                     # Challenge list
│   │   │   └── [id]/
│   │   │       ├── page.tsx                 # Challenge detail
│   │   │       ├── entry/page.tsx           # Daily entry form
│   │   │       └── history/page.tsx         # Personal history
│   │   └── profile/
│   │       ├── page.tsx                     # Own profile + settings
│   │       └── [userId]/page.tsx            # Public profile
│   ├── (admin)/
│   │   ├── layout.tsx                       # Admin layout (admin nav guard)
│   │   └── admin/
│   │       ├── page.tsx                     # Admin dashboard
│   │       ├── challenges/
│   │       │   ├── new/page.tsx             # Create challenge
│   │       │   └── [id]/edit/page.tsx       # Edit challenge
│   │       ├── badges/page.tsx              # Manage badges
│   │       └── quotes/page.tsx              # Manage quotes
│   └── api/
│       └── cron/
│           └── challenges/route.ts          # Daily cron job
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge-display.tsx
│   │   ├── progress-bar.tsx
│   │   ├── animated-counter.tsx
│   │   ├── confetti.tsx
│   │   └── empty-state.tsx
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   └── mobile-nav.tsx
│   ├── challenges/
│   │   ├── challenge-card.tsx
│   │   ├── challenge-fields-builder.tsx     # Admin: dynamic field builder
│   │   ├── daily-entry-form.tsx             # Quick entry form
│   │   ├── wizard-entry-form.tsx            # Wizard mode form
│   │   ├── leaderboard.tsx
│   │   └── participant-list.tsx
│   ├── dashboard/
│   │   ├── streak-widget.tsx
│   │   ├── points-widget.tsx
│   │   ├── rank-widget.tsx
│   │   ├── active-challenges-widget.tsx
│   │   ├── recent-badges-widget.tsx
│   │   └── daily-quote-widget.tsx
│   └── auth/
│       ├── login-form.tsx
│       └── signup-form.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                        # Browser client
│   │   ├── server.ts                        # Server client (cookies-based)
│   │   ├── admin.ts                         # Service role client
│   │   ├── middleware.ts                     # Auth middleware helper
│   │   └── types.ts                         # Generated DB types
│   ├── actions/
│   │   ├── auth.ts                          # Login, signup, logout
│   │   ├── challenges.ts                    # CRUD challenges
│   │   ├── entries.ts                       # Submit/edit daily entries
│   │   ├── participants.ts                  # Join/leave challenges
│   │   ├── badges.ts                        # Badge check + award
│   │   ├── points.ts                        # Points calculation + logging
│   │   └── profile.ts                       # Update profile settings
│   ├── validations/
│   │   ├── auth.ts                          # Login/signup schemas
│   │   ├── challenges.ts                    # Challenge + field schemas
│   │   ├── entries.ts                       # Entry submission schema
│   │   └── profile.ts                       # Profile update schema
│   └── utils/
│       ├── points.ts                        # Points constants + streak calc
│       ├── quotes.ts                        # Quote selection logic
│       ├── dates.ts                         # Date helpers (UTC)
│       └── storage.ts                       # File upload helpers
├── middleware.ts                             # Next.js middleware (auth redirect)
├── types/
│   └── database.ts                          # Supabase generated types
└── supabase/
    └── migrations/
        └── 00001_initial_schema.sql         # Full schema migration
```

---

### Task 1: Install Dependencies & Configure Supabase

**Files:**
- Modify: `package.json`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/admin.ts`
- Create: `types/database.ts`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Install all dependencies**

```bash
pnpm add @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers sonner canvas-confetti lucide-react recharts date-fns
pnpm add -D @types/canvas-confetti supabase
```

- [ ] **Step 2: Create `.env.local` with Supabase placeholders**

Create `.env.local` at project root:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CRON_SECRET=your-cron-secret
```

Add `.env.local` to `.gitignore` if not already there.

- [ ] **Step 3: Create Supabase browser client**

Create `lib/supabase/client.ts`:
```ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 4: Create Supabase server client**

Create `lib/supabase/server.ts`:
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component — ignore
          }
        },
      },
    }
  )
}
```

- [ ] **Step 5: Create Supabase admin client (service role)**

Create `lib/supabase/admin.ts`:
```ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

- [ ] **Step 6: Create placeholder database types**

Create `types/database.ts` with a minimal placeholder that will be replaced by Supabase-generated types:
```ts
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
```

- [ ] **Step 7: Set up dark theme in globals.css**

Replace `app/globals.css` with:
```css
@import "tailwindcss";

@theme {
  --color-bg-primary: #0a0a0a;
  --color-bg-secondary: #141414;
  --color-bg-tertiary: #1a1a1a;
  --color-border: #222222;
  --color-accent-green: #00ff87;
  --color-accent-green-dark: #00b85c;
  --color-accent-orange: #ff6b00;
  --color-text-primary: #ffffff;
  --color-text-muted: #666666;
  --color-text-secondary: #999999;
  --color-error: #ef4444;
  --color-success: #00ff87;
}

body {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

- [ ] **Step 8: Update root layout with Toaster**

Replace `app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Defi De Con',
  description: 'Challenge tracking platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: '#141414',
              border: '1px solid #222',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  )
}
```

- [ ] **Step 9: Verify the app compiles**

```bash
pnpm build
```

Expected: Build succeeds (may have warnings about unused files, that's fine).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: install dependencies and configure Supabase clients + dark theme"
```

---

### Task 2: Database Schema Migration

**Files:**
- Create: `supabase/migrations/00001_initial_schema.sql`

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/00001_initial_schema.sql`:
```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- updated_at trigger function
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================
-- profiles
-- ============================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  entry_mode text not null default 'quick' check (entry_mode in ('quick', 'wizard')),
  is_admin boolean not null default false,
  points_total integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- RLS
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile except is_admin"
  on profiles for update using (auth.uid() = id)
  with check (auth.uid() = id and is_admin = (select is_admin from profiles where id = auth.uid()));

-- ============================================
-- challenges
-- ============================================
create table challenges (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null default '',
  start_date date not null,
  end_date date not null,
  duration_days integer not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'completed')),
  cover_image_url text,
  upload_config jsonb default '{"allowed_types": ["image/jpeg", "image/png", "image/webp", "application/pdf", "text/csv"], "max_size_mb": 10}'::jsonb,
  created_by uuid references profiles(id) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger challenges_updated_at
  before update on challenges
  for each row execute function update_updated_at();

alter table challenges enable row level security;

create policy "Challenges are viewable by everyone"
  on challenges for select using (true);

create policy "Admins can insert challenges"
  on challenges for insert with check (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update challenges"
  on challenges for update using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete challenges"
  on challenges for delete using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- ============================================
-- challenge_fields
-- ============================================
create table challenge_fields (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid references challenges(id) on delete cascade not null,
  name text not null,
  label text not null,
  type text not null check (type in ('number', 'text', 'date', 'boolean', 'file', 'image')),
  required boolean not null default true,
  "order" integer not null default 0,
  config jsonb,
  unique (challenge_id, name)
);

alter table challenge_fields enable row level security;

create policy "Challenge fields are viewable by everyone"
  on challenge_fields for select using (true);

create policy "Admins can insert challenge fields"
  on challenge_fields for insert with check (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update challenge fields"
  on challenge_fields for update using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete challenge fields"
  on challenge_fields for delete using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- ============================================
-- challenge_participants
-- ============================================
create table challenge_participants (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid references challenges(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  joined_at timestamptz not null default now(),
  current_streak integer not null default 0,
  best_streak integer not null default 0,
  points_earned integer not null default 0,
  unique (challenge_id, user_id)
);

alter table challenge_participants enable row level security;

create policy "Participants are viewable by everyone"
  on challenge_participants for select using (true);

create policy "Authenticated users can join challenges"
  on challenge_participants for insert with check (auth.uid() = user_id);

create policy "Users can update own participation"
  on challenge_participants for update using (auth.uid() = user_id);

create policy "Users can leave challenges"
  on challenge_participants for delete using (auth.uid() = user_id);

-- ============================================
-- daily_entries
-- ============================================
create table daily_entries (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid references challenges(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  entry_date date not null,
  submitted_at timestamptz not null default now(),
  unique (challenge_id, user_id, entry_date)
);

alter table daily_entries enable row level security;

create policy "Entries viewable by challenge participants"
  on daily_entries for select using (
    exists (
      select 1 from challenge_participants
      where challenge_participants.challenge_id = daily_entries.challenge_id
        and challenge_participants.user_id = auth.uid()
    )
    or exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Users can insert own entries"
  on daily_entries for insert with check (auth.uid() = user_id);

create policy "Users can update own entries same day"
  on daily_entries for update using (
    auth.uid() = user_id and entry_date = current_date
  );

create policy "Admins can delete entries"
  on daily_entries for delete using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- ============================================
-- entry_values
-- ============================================
create table entry_values (
  id uuid primary key default uuid_generate_v4(),
  entry_id uuid references daily_entries(id) on delete cascade not null,
  field_id uuid references challenge_fields(id) on delete cascade not null,
  value_text text,
  value_number numeric,
  value_date date,
  value_file_url text,
  unique (entry_id, field_id)
);

alter table entry_values enable row level security;

create policy "Entry values viewable by challenge participants"
  on entry_values for select using (
    exists (
      select 1 from daily_entries de
      join challenge_participants cp on cp.challenge_id = de.challenge_id and cp.user_id = auth.uid()
      where de.id = entry_values.entry_id
    )
    or exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Users can insert own entry values"
  on entry_values for insert with check (
    exists (
      select 1 from daily_entries where id = entry_values.entry_id and user_id = auth.uid()
    )
  );

create policy "Users can update own entry values same day"
  on entry_values for update using (
    exists (
      select 1 from daily_entries
      where id = entry_values.entry_id and user_id = auth.uid() and entry_date = current_date
    )
  );

create policy "Admins can delete entry values"
  on entry_values for delete using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- ============================================
-- badges
-- ============================================
create table badges (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null default '',
  icon_url text not null default '/badges/default.svg',
  condition_type text not null check (condition_type in ('streak', 'completion', 'points', 'custom')),
  condition_value integer not null default 0
);

alter table badges enable row level security;

create policy "Badges are viewable by everyone"
  on badges for select using (true);

create policy "Admins can insert badges"
  on badges for insert with check (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update badges"
  on badges for update using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete badges"
  on badges for delete using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- ============================================
-- user_badges
-- ============================================
create table user_badges (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  badge_id uuid references badges(id) on delete cascade not null,
  challenge_id uuid references challenges(id) on delete set null,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id, coalesce(challenge_id, '00000000-0000-0000-0000-000000000000'))
);

alter table user_badges enable row level security;

create policy "User badges are viewable by everyone"
  on user_badges for select using (true);

-- INSERT via service_role only (no RLS policy for regular users)

create policy "Admins can delete user badges"
  on user_badges for delete using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- ============================================
-- points_log
-- ============================================
create table points_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  challenge_id uuid references challenges(id) on delete cascade not null,
  entry_id uuid references daily_entries(id) on delete set null,
  action text not null,
  points integer not null,
  created_at timestamptz not null default now()
);

alter table points_log enable row level security;

create policy "Users can view own points log"
  on points_log for select using (auth.uid() = user_id);

-- INSERT via service_role only
-- No UPDATE or DELETE

-- ============================================
-- motivational_quotes
-- ============================================
create table motivational_quotes (
  id uuid primary key default uuid_generate_v4(),
  text text not null,
  author text,
  context text not null check (context in ('daily', 'streak_lost', 'streak_milestone', 'rank_up', 'entry_submitted'))
);

alter table motivational_quotes enable row level security;

create policy "Quotes are viewable by everyone"
  on motivational_quotes for select using (true);

create policy "Admins can insert quotes"
  on motivational_quotes for insert with check (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update quotes"
  on motivational_quotes for update using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete quotes"
  on motivational_quotes for delete using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- ============================================
-- Performance indexes
-- ============================================
create index idx_profiles_points_total on profiles (points_total desc);
create index idx_challenge_participants_points on challenge_participants (challenge_id, points_earned desc);
create index idx_daily_entries_lookup on daily_entries (challenge_id, user_id, entry_date);
create index idx_points_log_user on points_log (user_id, challenge_id, action);

-- ============================================
-- Seed default badges
-- ============================================
insert into badges (name, description, icon_url, condition_type, condition_value) values
  ('Premier pas', 'Premiere saisie ever', '/badges/first-step.svg', 'custom', 1),
  ('En feu', 'Streak de 7 jours', '/badges/fire.svg', 'streak', 7),
  ('Inarretable', 'Streak de 14 jours', '/badges/lightning.svg', 'streak', 14),
  ('Finisher', 'Completer un defi a 100%', '/badges/trophy.svg', 'completion', 100),
  ('Assidu', '3 defis completes', '/badges/star.svg', 'completion', 3),
  ('Veteran', '10 defis completes', '/badges/medal.svg', 'completion', 10),
  ('Podium', 'Top 3 dans un defi', '/badges/podium.svg', 'custom', 3),
  ('Challenger', 'Inscrit a 5 defis', '/badges/flag.svg', 'custom', 5);

-- ============================================
-- Seed motivational quotes
-- ============================================
insert into motivational_quotes (text, author, context) values
  ('Le succes est la somme de petits efforts repetes jour apres jour.', 'Robert Collier', 'daily'),
  ('La discipline est le pont entre les objectifs et les accomplissements.', 'Jim Rohn', 'daily'),
  ('Chaque champion a ete un jour un debutant qui a refuse d''abandonner.', null, 'daily'),
  ('La douleur est temporaire, la fierte est eternelle.', null, 'daily'),
  ('Tu n''as pas besoin d''etre parfait, tu dois juste etre present.', null, 'daily'),
  ('Continue comme ca, tu es sur la bonne voie !', null, 'entry_submitted'),
  ('Boom ! Encore une journee validee. Tu geres.', null, 'entry_submitted'),
  ('Chaque jour compte. Et celui-la est dans la boite.', null, 'entry_submitted'),
  ('Pas grave, on se releve et on repart plus fort !', null, 'streak_lost'),
  ('Un faux pas ne definit pas ta course. Reviens demain.', null, 'streak_lost'),
  ('La serie est cassee, mais pas ta motivation. On y retourne !', null, 'streak_lost'),
  ('Quelle serie ! Tu es en feu, continue !', null, 'streak_milestone'),
  ('Inarretable ! Ta regularite force le respect.', null, 'streak_milestone'),
  ('Tu montes dans le classement ! Les autres ont interet a s''accrocher.', null, 'rank_up'),
  ('Nouveau rang debloque ! La competition te va bien.', null, 'rank_up');
```

- [ ] **Step 2: Commit**

```bash
git add supabase/
git commit -m "feat: add initial database schema migration with RLS policies and seed data"
```

**Note:** To apply this migration, run `supabase db push` after linking your Supabase project with `supabase link`. This step requires a live Supabase project.

---

### Task 3: Auth Middleware & Validation Schemas

**Files:**
- Create: `middleware.ts`
- Create: `lib/supabase/middleware.ts`
- Create: `lib/validations/auth.ts`
- Create: `lib/validations/challenges.ts`
- Create: `lib/validations/entries.ts`
- Create: `lib/validations/profile.ts`

- [ ] **Step 1: Create Supabase middleware helper**

Create `lib/supabase/middleware.ts`:
```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup'
  const isPublicPage = request.nextUrl.pathname === '/' || isAuthPage
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')

  // Redirect unauthenticated users to login (except public pages)
  if (!user && !isPublicPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Admin page protection (check is_admin via profile)
  if (user && isAdminPage) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
```

- [ ] **Step 2: Create Next.js middleware**

Create `middleware.ts` at project root:
```ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|badges/|api/cron/).*)',
  ],
}
```

- [ ] **Step 3: Create auth validation schemas**

Create `lib/validations/auth.ts`:
```ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caracteres'),
})

export const signupSchema = z.object({
  username: z.string().min(3, 'Minimum 3 caracteres').max(30, 'Maximum 30 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Lettres, chiffres, tirets et underscores uniquement'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caracteres'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
```

- [ ] **Step 4: Create challenge validation schemas**

Create `lib/validations/challenges.ts`:
```ts
import { z } from 'zod'

export const challengeFieldSchema = z.object({
  name: z.string().min(1).regex(/^[a-z_]+$/, 'snake_case uniquement'),
  label: z.string().min(1, 'Label requis'),
  type: z.enum(['number', 'text', 'date', 'boolean', 'file', 'image']),
  required: z.boolean().default(true),
  order: z.number().int().min(0),
  config: z.record(z.unknown()).nullable().default(null),
})

export const createChallengeSchema = z.object({
  title: z.string().min(3, 'Minimum 3 caracteres').max(100),
  description: z.string().max(2000).default(''),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD'),
  duration_days: z.number().int().min(1).max(365),
  upload_config: z.object({
    allowed_types: z.array(z.string()),
    max_size_mb: z.number().min(1).max(50),
  }).optional(),
  fields: z.array(challengeFieldSchema).min(1, 'Au moins un champ requis'),
})

export type CreateChallengeInput = z.infer<typeof createChallengeSchema>
export type ChallengeFieldInput = z.infer<typeof challengeFieldSchema>
```

- [ ] **Step 5: Create entry validation schema**

Create `lib/validations/entries.ts`:
```ts
import { z } from 'zod'

export const entryValueSchema = z.object({
  field_id: z.string().uuid(),
  value_text: z.string().nullable().default(null),
  value_number: z.number().nullable().default(null),
  value_date: z.string().nullable().default(null),
  value_file_url: z.string().nullable().default(null),
})

export const submitEntrySchema = z.object({
  challenge_id: z.string().uuid(),
  values: z.array(entryValueSchema).min(1),
})

export type SubmitEntryInput = z.infer<typeof submitEntrySchema>
```

- [ ] **Step 6: Create profile validation schema**

Create `lib/validations/profile.ts`:
```ts
import { z } from 'zod'

export const updateProfileSchema = z.object({
  username: z.string().min(3).max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Lettres, chiffres, tirets et underscores uniquement')
    .optional(),
  avatar_url: z.string().url().nullable().optional(),
  entry_mode: z.enum(['quick', 'wizard']).optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
```

- [ ] **Step 7: Verify build**

```bash
pnpm build
```

- [ ] **Step 8: Commit**

```bash
git add middleware.ts lib/
git commit -m "feat: add auth middleware, Supabase session management, and Zod validation schemas"
```

---

### Task 4: UI Component Library

**Files:**
- Create: `components/ui/button.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/card.tsx`
- Create: `components/ui/badge-display.tsx`
- Create: `components/ui/progress-bar.tsx`
- Create: `components/ui/animated-counter.tsx`
- Create: `components/ui/confetti.tsx`
- Create: `components/ui/empty-state.tsx`

- [ ] **Step 1: Create Button component**

Create `components/ui/button.tsx`:
```tsx
import { type ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent-green text-black font-bold hover:bg-accent-green-dark',
  secondary: 'bg-bg-secondary border border-border text-white hover:bg-bg-tertiary',
  danger: 'bg-error text-white font-bold hover:bg-red-600',
  ghost: 'text-text-muted hover:text-white hover:bg-bg-secondary',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-[10px] font-semibold transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
```

- [ ] **Step 2: Create Input component**

Create `components/ui/input.tsx`:
```tsx
import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-semibold text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full rounded-[10px] border border-border bg-bg-secondary px-4 py-2.5
            text-white placeholder:text-text-muted
            focus:border-accent-green focus:outline-none focus:ring-1 focus:ring-accent-green
            ${error ? 'border-error' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
```

- [ ] **Step 3: Create Card component**

Create `components/ui/card.tsx`:
```tsx
import { type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'accent'
}

export function Card({ variant = 'default', className = '', children, ...props }: CardProps) {
  const base = 'rounded-[12px] border'
  const variants = {
    default: 'bg-bg-secondary border-border',
    accent: 'bg-gradient-to-br from-accent-green to-accent-green-dark border-transparent',
  }

  return (
    <div className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 pb-2 ${className}`} {...props}>{children}</div>
}

export function CardContent({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 pt-2 ${className}`} {...props}>{children}</div>
}
```

- [ ] **Step 4: Create BadgeDisplay component**

Create `components/ui/badge-display.tsx`:
```tsx
interface BadgeDisplayProps {
  name: string
  iconUrl: string
  earned?: boolean
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

const sizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' }

export function BadgeDisplay({ name, iconUrl, earned = true, size = 'md', animate = false }: BadgeDisplayProps) {
  return (
    <div className={`flex flex-col items-center gap-1 ${!earned ? 'opacity-30 grayscale' : ''}`}>
      <div className={`${sizes[size]} relative ${animate ? 'animate-badge-unlock' : ''}`}>
        <img src={iconUrl} alt={name} className="w-full h-full" />
        {earned && animate && (
          <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(0,255,135,0.5)] animate-pulse" />
        )}
      </div>
      <span className="text-xs text-text-muted font-semibold">{name}</span>
    </div>
  )
}
```

- [ ] **Step 5: Create ProgressBar component**

Create `components/ui/progress-bar.tsx`:
```tsx
interface ProgressBarProps {
  value: number // 0-100
  label?: string
  showPercentage?: boolean
}

export function ProgressBar({ value, label, showPercentage = true }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div>
      {(label || showPercentage) && (
        <div className="flex justify-between mb-1.5">
          {label && <span className="text-sm font-bold text-white">{label}</span>}
          {showPercentage && <span className="text-sm font-bold text-accent-green">{Math.round(clamped)}%</span>}
        </div>
      )}
      <div className="h-2 rounded-full bg-bg-tertiary overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-green to-accent-green-dark transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create AnimatedCounter component**

Create `components/ui/animated-counter.tsx`:
```tsx
'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function AnimatedCounter({ value, duration = 1000, prefix = '', suffix = '', className = '' }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0)
  const prevValue = useRef(0)

  useEffect(() => {
    const start = prevValue.current
    const diff = value - start
    const startTime = performance.now()

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      setDisplay(Math.round(start + diff * eased))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
    prevValue.current = value
  }, [value, duration])

  return (
    <span className={className}>
      {prefix}{display.toLocaleString('fr-FR')}{suffix}
    </span>
  )
}
```

- [ ] **Step 7: Create Confetti trigger component**

Create `components/ui/confetti.tsx`:
```tsx
'use client'

import confetti from 'canvas-confetti'

export function fireConfetti(type: 'success' | 'milestone' = 'success') {
  if (type === 'milestone') {
    // Golden confetti for milestones
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF6B00', '#00ff87'],
    })
  } else {
    // Green confetti for daily success
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#00ff87', '#00b85c', '#ffffff'],
    })
  }
}
```

- [ ] **Step 8: Create EmptyState component**

Create `components/ui/empty-state.tsx`:
```tsx
import { type ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-text-muted mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-text-muted text-sm max-w-sm mb-6">{description}</p>
      {action}
    </div>
  )
}
```

- [ ] **Step 9: Verify build**

```bash
pnpm build
```

- [ ] **Step 10: Commit**

```bash
git add components/ui/
git commit -m "feat: add UI component library (Button, Input, Card, ProgressBar, Confetti, etc.)"
```

---

### Task 5: Auth Pages & Server Actions

**Files:**
- Create: `lib/actions/auth.ts`
- Create: `components/auth/login-form.tsx`
- Create: `components/auth/signup-form.tsx`
- Create: `app/(public)/layout.tsx`
- Create: `app/(public)/page.tsx`
- Create: `app/(public)/login/page.tsx`
- Create: `app/(public)/signup/page.tsx`

- [ ] **Step 1: Create auth Server Actions**

Create `lib/actions/auth.ts`:
```ts
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema } from '@/lib/validations/auth'

export type AuthState = {
  error?: string
}

export async function login(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { error: 'Email ou mot de passe incorrect' }
  }

  redirect('/dashboard')
}

export async function signup(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { username: parsed.data.username },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Cet email est deja utilise' }
    }
    return { error: 'Erreur lors de la creation du compte' }
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

- [ ] **Step 2: Create LoginForm component**

Create `components/auth/login-form.tsx`:
```tsx
'use client'

import { useActionState } from 'react'
import { login, type AuthState } from '@/lib/actions/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(login, {})

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full max-w-sm">
      <h1 className="text-3xl font-black tracking-tight">
        <span className="text-accent-green">DEFI</span>DECON
      </h1>
      <p className="text-text-muted text-sm mb-4">Connecte-toi pour continuer</p>

      {state.error && (
        <div className="bg-error/10 border border-error/20 rounded-[10px] px-4 py-2 text-sm text-error">
          {state.error}
        </div>
      )}

      <Input name="email" type="email" label="Email" placeholder="ton@email.com" required />
      <Input name="password" type="password" label="Mot de passe" placeholder="••••••" required />

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? 'Connexion...' : 'Se connecter'}
      </Button>

      <p className="text-text-muted text-sm text-center">
        Pas encore de compte ?{' '}
        <Link href="/signup" className="text-accent-green font-semibold hover:underline">
          Creer un compte
        </Link>
      </p>
    </form>
  )
}
```

- [ ] **Step 3: Create SignupForm component**

Create `components/auth/signup-form.tsx`:
```tsx
'use client'

import { useActionState } from 'react'
import { signup, type AuthState } from '@/lib/actions/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function SignupForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signup, {})

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full max-w-sm">
      <h1 className="text-3xl font-black tracking-tight">
        <span className="text-accent-green">DEFI</span>DECON
      </h1>
      <p className="text-text-muted text-sm mb-4">Cree ton compte et rejoins le defi</p>

      {state.error && (
        <div className="bg-error/10 border border-error/20 rounded-[10px] px-4 py-2 text-sm text-error">
          {state.error}
        </div>
      )}

      <Input name="username" label="Nom d'utilisateur" placeholder="john_doe" required />
      <Input name="email" type="email" label="Email" placeholder="ton@email.com" required />
      <Input name="password" type="password" label="Mot de passe" placeholder="Min. 6 caracteres" required />

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? 'Creation...' : 'Creer mon compte'}
      </Button>

      <p className="text-text-muted text-sm text-center">
        Deja un compte ?{' '}
        <Link href="/login" className="text-accent-green font-semibold hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  )
}
```

- [ ] **Step 4: Create public layout**

Create `app/(public)/layout.tsx`:
```tsx
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      {children}
    </div>
  )
}
```

- [ ] **Step 5: Create landing page**

Create `app/(public)/page.tsx`:
```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center text-center max-w-2xl">
      <h1 className="text-6xl font-black tracking-tight mb-4">
        <span className="text-accent-green">DEFI</span>DECON
      </h1>
      <p className="text-xl text-text-muted mb-8 max-w-md">
        Releve des defis. Suis tes progres. Deviens inarretable.
      </p>
      <div className="flex gap-4">
        <Link href="/signup">
          <Button size="lg">Commencer</Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary" size="lg">Se connecter</Button>
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create login page**

Create `app/(public)/login/page.tsx`:
```tsx
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return <LoginForm />
}
```

- [ ] **Step 7: Create signup page**

Create `app/(public)/signup/page.tsx`:
```tsx
import { SignupForm } from '@/components/auth/signup-form'

export default function SignupPage() {
  return <SignupForm />
}
```

- [ ] **Step 8: Remove default page.tsx**

Delete `app/page.tsx` (the default Next.js page — replaced by `app/(public)/page.tsx`).

- [ ] **Step 9: Verify build**

```bash
pnpm build
```

- [ ] **Step 10: Commit**

```bash
git add app/ components/auth/ lib/actions/auth.ts
git commit -m "feat: add auth pages (login, signup, landing) with Server Actions"
```

---

### Task 6: App Layout (Sidebar + Topbar)

**Files:**
- Create: `components/layout/sidebar.tsx`
- Create: `components/layout/topbar.tsx`
- Create: `components/layout/mobile-nav.tsx`
- Create: `app/(app)/layout.tsx`

- [ ] **Step 1: Create Sidebar component**

Create `components/layout/sidebar.tsx`:
```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Trophy, User, Shield } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/challenges', label: 'Defis', icon: Trophy },
  { href: '/profile', label: 'Profil', icon: User },
]

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 bg-bg-secondary border-r border-border h-screen sticky top-0">
      <div className="p-6">
        <Link href="/dashboard" className="text-2xl font-black tracking-tight">
          <span className="text-accent-green">DEFI</span>DECON
        </Link>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] mb-1 text-sm font-semibold transition-colors
                ${isActive
                  ? 'bg-accent-green/10 text-accent-green'
                  : 'text-text-muted hover:text-white hover:bg-bg-tertiary'
                }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          )
        })}

        {isAdmin && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] mb-1 text-sm font-semibold transition-colors
              ${pathname.startsWith('/admin')
                ? 'bg-accent-orange/10 text-accent-orange'
                : 'text-text-muted hover:text-white hover:bg-bg-tertiary'
              }`}
          >
            <Shield size={20} />
            Admin
          </Link>
        )}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Create Topbar component**

Create `components/layout/topbar.tsx`:
```tsx
import { Flame, Star } from 'lucide-react'
import { AnimatedCounter } from '@/components/ui/animated-counter'

interface TopbarProps {
  username: string
  avatarUrl: string | null
  points: number
  streak: number
}

export function Topbar({ username, avatarUrl, points, streak }: TopbarProps) {
  return (
    <header className="h-16 bg-bg-secondary border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-accent-orange">
          <Flame size={18} />
          <span className="text-sm font-bold">{streak}j</span>
        </div>
        <div className="flex items-center gap-2 text-accent-green">
          <Star size={18} />
          <AnimatedCounter value={points} className="text-sm font-bold" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-text-secondary">{username}</span>
        <div className="w-8 h-8 rounded-full bg-accent-green flex items-center justify-center text-xs font-bold text-black">
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="w-full h-full rounded-full object-cover" />
          ) : (
            username.slice(0, 2).toUpperCase()
          )}
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Create MobileNav component**

Create `components/layout/mobile-nav.tsx`:
```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Trophy, User } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/challenges', label: 'Defis', icon: Trophy },
  { href: '/profile', label: 'Profil', icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-border flex justify-around py-2 z-20">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 text-xs font-semibold
              ${isActive ? 'text-accent-green' : 'text-text-muted'}`}
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 4: Create App layout**

Create `app/(app)/layout.tsx`:
```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { MobileNav } from '@/components/layout/mobile-nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url, is_admin, points_total')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Get current streak from active challenge participation
  const { data: participation } = await supabase
    .from('challenge_participants')
    .select('current_streak')
    .eq('user_id', user.id)
    .order('current_streak', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar isAdmin={profile.is_admin} />
      <div className="flex-1 flex flex-col">
        <Topbar
          username={profile.username}
          avatarUrl={profile.avatar_url}
          points={profile.points_total}
          streak={participation?.current_streak ?? 0}
        />
        <main className="flex-1 p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
```

- [ ] **Step 5: Verify build**

```bash
pnpm build
```

- [ ] **Step 6: Commit**

```bash
git add components/layout/ app/\(app\)/layout.tsx
git commit -m "feat: add app layout with sidebar, topbar, and mobile nav"
```

---

### Task 7: Dashboard Page

**Files:**
- Create: `components/dashboard/streak-widget.tsx`
- Create: `components/dashboard/points-widget.tsx`
- Create: `components/dashboard/rank-widget.tsx`
- Create: `components/dashboard/active-challenges-widget.tsx`
- Create: `components/dashboard/recent-badges-widget.tsx`
- Create: `components/dashboard/daily-quote-widget.tsx`
- Create: `lib/utils/quotes.ts`
- Create: `app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Create quote selection utility**

Create `lib/utils/quotes.ts`:
```ts
import type { Database } from '@/types/database'

type Quote = Database['public']['Tables']['motivational_quotes']['Row']

export function selectDailyQuote(quotes: Quote[], userId: string): Quote | null {
  if (quotes.length === 0) return null

  // Seed based on userId + date for consistent daily rotation
  const today = new Date().toISOString().slice(0, 10)
  const seed = hashCode(`${userId}-${today}`)
  return quotes[Math.abs(seed) % quotes.length]
}

export function selectContextualQuote(quotes: Quote[], context: string): Quote | null {
  const filtered = quotes.filter(q => q.context === context)
  if (filtered.length === 0) {
    // Fallback to daily pool
    const daily = quotes.filter(q => q.context === 'daily')
    if (daily.length === 0) return null
    return daily[Math.floor(Math.random() * daily.length)]
  }
  return filtered[Math.floor(Math.random() * filtered.length)]
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return hash
}
```

- [ ] **Step 2: Create dashboard widgets**

Create `components/dashboard/streak-widget.tsx`:
```tsx
import { Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function StreakWidget({ streak }: { streak: number }) {
  return (
    <Card variant={streak > 0 ? 'accent' : 'default'}>
      <CardContent className="p-4">
        <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${streak > 0 ? 'text-black/60' : 'text-text-muted'}`}>
          Streak actuel
        </div>
        <div className={`flex items-center gap-2 ${streak > 0 ? 'text-black' : 'text-white'}`}>
          <Flame size={28} />
          <span className="text-4xl font-black">{streak}</span>
          <span className="text-lg font-semibold">jours</span>
        </div>
      </CardContent>
    </Card>
  )
}
```

Create `components/dashboard/points-widget.tsx`:
```tsx
import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedCounter } from '@/components/ui/animated-counter'

export function PointsWidget({ points, todayPoints }: { points: number; todayPoints: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs font-bold uppercase tracking-widest text-text-muted mb-1">Points</div>
        <AnimatedCounter value={points} className="text-3xl font-black text-white" />
        {todayPoints > 0 && (
          <div className="text-sm font-semibold text-accent-green mt-1">+{todayPoints} aujourd'hui</div>
        )}
      </CardContent>
    </Card>
  )
}
```

Create `components/dashboard/rank-widget.tsx`:
```tsx
import { TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function RankWidget({ rank, total }: { rank: number; total: number }) {
  const percentile = total > 0 ? Math.round((1 - rank / total) * 100) : 0

  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs font-bold uppercase tracking-widest text-text-muted mb-1">Classement</div>
        <div className="text-3xl font-black text-white">#{rank}</div>
        {percentile > 0 && (
          <div className="text-sm font-semibold text-accent-orange flex items-center gap-1 mt-1">
            <TrendingUp size={14} />
            Top {100 - percentile}%
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

Create `components/dashboard/active-challenges-widget.tsx`:
```tsx
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Button } from '@/components/ui/button'

interface ActiveChallenge {
  id: string
  title: string
  progress: number // 0-100
  hasEntryToday: boolean
}

export function ActiveChallengesWidget({ challenges }: { challenges: ActiveChallenge[] }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Defis en cours</h3>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {challenges.map((c) => (
          <div key={c.id} className="flex items-center gap-3">
            <div className="flex-1">
              <ProgressBar value={c.progress} label={c.title} />
            </div>
            {!c.hasEntryToday && (
              <Link href={`/challenges/${c.id}/entry`}>
                <Button size="sm">Saisir</Button>
              </Link>
            )}
          </div>
        ))}
        {challenges.length === 0 && (
          <p className="text-text-muted text-sm">Aucun defi en cours</p>
        )}
      </CardContent>
    </Card>
  )
}
```

Create `components/dashboard/recent-badges-widget.tsx`:
```tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BadgeDisplay } from '@/components/ui/badge-display'

interface RecentBadge {
  name: string
  iconUrl: string
}

export function RecentBadgesWidget({ badges }: { badges: RecentBadge[] }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Badges recents</h3>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 flex-wrap">
          {badges.map((b) => (
            <BadgeDisplay key={b.name} name={b.name} iconUrl={b.iconUrl} size="md" />
          ))}
          {badges.length === 0 && (
            <p className="text-text-muted text-sm">Aucun badge pour le moment</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

Create `components/dashboard/daily-quote-widget.tsx`:
```tsx
import { Card, CardContent } from '@/components/ui/card'

interface DailyQuoteWidgetProps {
  text: string
  author: string | null
}

export function DailyQuoteWidget({ text, author }: DailyQuoteWidgetProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm italic text-text-secondary leading-relaxed">"{text}"</p>
        {author && <p className="text-xs text-text-muted mt-2 font-semibold">— {author}</p>}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Create Dashboard page**

Create `app/(app)/dashboard/page.tsx`:
```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { selectDailyQuote } from '@/lib/utils/quotes'
import { StreakWidget } from '@/components/dashboard/streak-widget'
import { PointsWidget } from '@/components/dashboard/points-widget'
import { RankWidget } from '@/components/dashboard/rank-widget'
import { ActiveChallengesWidget } from '@/components/dashboard/active-challenges-widget'
import { RecentBadgesWidget } from '@/components/dashboard/recent-badges-widget'
import { DailyQuoteWidget } from '@/components/dashboard/daily-quote-widget'
import { differenceInDays, parseISO } from 'date-fns'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Parallel data fetching
  const [profileRes, participationsRes, rankRes, badgesRes, quotesRes, todayPointsRes] = await Promise.all([
    supabase.from('profiles').select('points_total').eq('id', user.id).single(),
    supabase
      .from('challenge_participants')
      .select('challenge_id, current_streak, challenges(id, title, start_date, duration_days)')
      .eq('user_id', user.id)
      .eq('challenges.status', 'active'),
    supabase.from('profiles').select('id').order('points_total', { ascending: false }),
    supabase
      .from('user_badges')
      .select('badges(name, icon_url)')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })
      .limit(5),
    supabase.from('motivational_quotes').select('*').eq('context', 'daily'),
    supabase
      .from('points_log')
      .select('points')
      .eq('user_id', user.id)
      .gte('created_at', new Date().toISOString().slice(0, 10)),
  ])

  const profile = profileRes.data
  const participations = participationsRes.data ?? []
  const rankList = rankRes.data ?? []
  const badges = badgesRes.data ?? []
  const quotes = quotesRes.data ?? []
  const todayPointsData = todayPointsRes.data ?? []

  const rank = rankList.findIndex(p => p.id === user.id) + 1
  const todayPoints = todayPointsData.reduce((sum, p) => sum + p.points, 0)

  // Best current streak across participations
  const bestStreak = participations.reduce((max, p) => Math.max(max, p.current_streak), 0)

  // Check today's entries
  const today = new Date().toISOString().slice(0, 10)
  const { data: todayEntries } = await supabase
    .from('daily_entries')
    .select('challenge_id')
    .eq('user_id', user.id)
    .eq('entry_date', today)

  const todayEntryIds = new Set((todayEntries ?? []).map(e => e.challenge_id))

  const activeChallenges = participations
    .filter(p => p.challenges)
    .map(p => {
      const c = p.challenges as unknown as { id: string; title: string; start_date: string; duration_days: number }
      const elapsed = differenceInDays(new Date(), parseISO(c.start_date)) + 1
      const progress = Math.min(100, Math.round((elapsed / c.duration_days) * 100))
      return {
        id: c.id,
        title: c.title,
        progress,
        hasEntryToday: todayEntryIds.has(c.id),
      }
    })

  const dailyQuote = selectDailyQuote(quotes, user.id)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-black">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StreakWidget streak={bestStreak} />
        <PointsWidget points={profile?.points_total ?? 0} todayPoints={todayPoints} />
        <RankWidget rank={rank || 1} total={rankList.length} />
      </div>

      <ActiveChallengesWidget challenges={activeChallenges} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RecentBadgesWidget
          badges={badges.map(b => ({
            name: (b.badges as unknown as { name: string; icon_url: string }).name,
            iconUrl: (b.badges as unknown as { name: string; icon_url: string }).icon_url,
          }))}
        />
        {dailyQuote && <DailyQuoteWidget text={dailyQuote.text} author={dailyQuote.author} />}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify build**

```bash
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/ lib/utils/quotes.ts app/\(app\)/dashboard/
git commit -m "feat: add dashboard page with streak, points, rank, challenges, badges, and quote widgets"
```

---

### Task 8: Challenge List & Detail Pages

**Files:**
- Create: `components/challenges/challenge-card.tsx`
- Create: `components/challenges/leaderboard.tsx`
- Create: `components/challenges/participant-list.tsx`
- Create: `lib/actions/participants.ts`
- Create: `app/(app)/challenges/page.tsx`
- Create: `app/(app)/challenges/[id]/page.tsx`

- [ ] **Step 1: Create ChallengeCard component**

Create `components/challenges/challenge-card.tsx`:
```tsx
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Calendar, Users } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ChallengeCardProps {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: string
  participantCount: number
  progress?: number
}

export function ChallengeCard({ id, title, description, startDate, endDate, status, participantCount, progress }: ChallengeCardProps) {
  const statusColors = {
    active: 'text-accent-green bg-accent-green/10',
    draft: 'text-text-muted bg-bg-tertiary',
    completed: 'text-accent-orange bg-accent-orange/10',
  }

  return (
    <Link href={`/challenges/${id}`}>
      <Card className="hover:border-accent-green/30 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-white">{title}</h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[status as keyof typeof statusColors] ?? statusColors.draft}`}>
              {status}
            </span>
          </div>
          <p className="text-sm text-text-muted mb-3 line-clamp-2">{description}</p>
          <div className="flex items-center gap-4 text-xs text-text-muted mb-3">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {format(parseISO(startDate), 'd MMM', { locale: fr })} - {format(parseISO(endDate), 'd MMM yyyy', { locale: fr })}
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} />
              {participantCount}
            </span>
          </div>
          {progress !== undefined && <ProgressBar value={progress} />}
        </CardContent>
      </Card>
    </Link>
  )
}
```

- [ ] **Step 2: Create Leaderboard component**

Create `components/challenges/leaderboard.tsx`:
```tsx
import { Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface LeaderboardEntry {
  userId: string
  username: string
  avatarUrl: string | null
  points: number
  streak: number
}

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
          <Trophy size={16} />
          Classement
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 p-2 rounded-lg ${i < 3 ? 'bg-bg-tertiary' : ''}`}
            >
              <span className={`w-6 text-center text-sm font-black
                ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-text-muted'}`}>
                {i + 1}
              </span>
              <div className="w-7 h-7 rounded-full bg-accent-green/20 flex items-center justify-center text-xs font-bold text-accent-green">
                {entry.username.slice(0, 2).toUpperCase()}
              </div>
              <span className="flex-1 text-sm font-semibold text-white">{entry.username}</span>
              <span className="text-sm font-bold text-accent-green">{entry.points} pts</span>
              <span className="text-xs text-accent-orange">{entry.streak}j</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Create join/leave Server Actions**

Create `lib/actions/participants.ts`:
```ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function joinChallenge(challengeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifie')

  const { error } = await supabase
    .from('challenge_participants')
    .insert({ challenge_id: challengeId, user_id: user.id })

  if (error) {
    if (error.code === '23505') return { error: 'Deja inscrit a ce defi' }
    return { error: 'Erreur lors de l\'inscription' }
  }

  revalidatePath(`/challenges/${challengeId}`)
  return { success: true }
}

export async function leaveChallenge(challengeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifie')

  const { error } = await supabase
    .from('challenge_participants')
    .delete()
    .eq('challenge_id', challengeId)
    .eq('user_id', user.id)

  if (error) return { error: 'Erreur lors de la desinscription' }

  revalidatePath(`/challenges/${challengeId}`)
  return { success: true }
}
```

- [ ] **Step 4: Create Challenge list page**

Create `app/(app)/challenges/page.tsx`:
```tsx
import { createClient } from '@/lib/supabase/server'
import { ChallengeCard } from '@/components/challenges/challenge-card'
import { Trophy } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

export default async function ChallengesPage(props: PageProps<'/challenges'>) {
  const searchParams = await props.searchParams
  const tab = (searchParams?.tab as string) ?? 'active'
  const supabase = await createClient()

  const { data: challenges } = await supabase
    .from('challenges')
    .select('*, challenge_participants(count)')
    .eq('status', tab === 'upcoming' ? 'draft' : tab)
    .order('start_date', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-black">Defis</h2>

      <div className="flex gap-2">
        {['active', 'completed'].map((t) => (
          <a
            key={t}
            href={`/challenges?tab=${t}`}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors
              ${tab === t ? 'bg-accent-green text-black' : 'bg-bg-secondary text-text-muted hover:text-white'}`}
          >
            {t === 'active' ? 'En cours' : 'Termines'}
          </a>
        ))}
      </div>

      {challenges && challenges.length > 0 ? (
        <div className="grid gap-4">
          {challenges.map((c) => (
            <ChallengeCard
              key={c.id}
              id={c.id}
              title={c.title}
              description={c.description}
              startDate={c.start_date}
              endDate={c.end_date}
              status={c.status}
              participantCount={(c.challenge_participants as unknown as { count: number }[])[0]?.count ?? 0}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Trophy size={48} />}
          title="Aucun defi"
          description={tab === 'active' ? 'Aucun defi en cours pour le moment' : 'Aucun defi termine'}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 5: Create Challenge detail page**

Create `app/(app)/challenges/[id]/page.tsx`:
```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Leaderboard } from '@/components/challenges/leaderboard'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { joinChallenge, leaveChallenge } from '@/lib/actions/participants'
import { differenceInDays, parseISO, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar, Users, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function ChallengeDetailPage(props: PageProps<'/challenges/[id]'>) {
  const { id } = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: challenge } = await supabase
    .from('challenges')
    .select('*, challenge_fields(*)')
    .eq('id', id)
    .single()

  if (!challenge) notFound()

  const { data: participants } = await supabase
    .from('challenge_participants')
    .select('user_id, current_streak, points_earned, profiles(username, avatar_url)')
    .eq('challenge_id', id)
    .order('points_earned', { ascending: false })

  const isParticipant = (participants ?? []).some(p => p.user_id === user.id)
  const elapsed = differenceInDays(new Date(), parseISO(challenge.start_date)) + 1
  const progress = Math.min(100, Math.round((elapsed / challenge.duration_days) * 100))

  const leaderboardEntries = (participants ?? []).map(p => ({
    userId: p.user_id,
    username: (p.profiles as unknown as { username: string; avatar_url: string | null }).username,
    avatarUrl: (p.profiles as unknown as { username: string; avatar_url: string | null }).avatar_url,
    points: p.points_earned,
    streak: p.current_streak,
  }))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black mb-2">{challenge.title}</h2>
        <p className="text-text-muted">{challenge.description}</p>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-text-muted">
        <span className="flex items-center gap-1">
          <Calendar size={14} />
          {format(parseISO(challenge.start_date), 'd MMM', { locale: fr })} - {format(parseISO(challenge.end_date), 'd MMM yyyy', { locale: fr })}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {challenge.duration_days} jours
        </span>
        <span className="flex items-center gap-1">
          <Users size={14} />
          {(participants ?? []).length} participants
        </span>
      </div>

      {challenge.status === 'active' && <ProgressBar value={progress} label="Progression" />}

      <div className="flex gap-3">
        {challenge.status === 'active' && !isParticipant && (
          <form action={async () => {
            'use server'
            await joinChallenge(id)
          }}>
            <Button type="submit">Rejoindre le defi</Button>
          </form>
        )}
        {isParticipant && challenge.status === 'active' && (
          <>
            <Link href={`/challenges/${id}/entry`}>
              <Button>Saisir aujourd'hui</Button>
            </Link>
            <Link href={`/challenges/${id}/history`}>
              <Button variant="secondary">Mon historique</Button>
            </Link>
            <form action={async () => {
              'use server'
              await leaveChallenge(id)
            }}>
              <Button variant="ghost" type="submit">Quitter</Button>
            </form>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Champs du defi</h3>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {(challenge.challenge_fields as unknown as Array<{ label: string; type: string; required: boolean }>)
              .sort((a: { order?: number }, b: { order?: number }) => (a.order ?? 0) - (b.order ?? 0))
              .map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-white font-semibold">{f.label}</span>
                  <span className="text-text-muted">({f.type})</span>
                  {f.required && <span className="text-accent-orange text-xs">requis</span>}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <Leaderboard entries={leaderboardEntries} />
    </div>
  )
}
```

- [ ] **Step 6: Verify build**

```bash
pnpm build
```

- [ ] **Step 7: Commit**

```bash
git add components/challenges/ lib/actions/participants.ts app/\(app\)/challenges/
git commit -m "feat: add challenge list and detail pages with leaderboard and join/leave actions"
```

---

### Task 9: Daily Entry System (Core Feature)

**Files:**
- Create: `lib/actions/entries.ts`
- Create: `lib/actions/points.ts`
- Create: `lib/actions/badges.ts`
- Create: `lib/utils/points.ts`
- Create: `lib/utils/dates.ts`
- Create: `components/challenges/daily-entry-form.tsx`
- Create: `app/(app)/challenges/[id]/entry/page.tsx`

- [ ] **Step 1: Create date utilities**

Create `lib/utils/dates.ts`:
```ts
export function getTodayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getYesterdayUTC(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}
```

- [ ] **Step 2: Create points constants and calculation**

Create `lib/utils/points.ts`:
```ts
export const POINTS = {
  DAILY_ENTRY: 10,
  FIRST_ENTRY: 5,
  STREAK_3: 15,
  STREAK_7: 30,
  STREAK_14: 50,
  STREAK_30: 100,
} as const

export const STREAK_MILESTONES = [
  { days: 3, points: POINTS.STREAK_3, action: 'streak_3' },
  { days: 7, points: POINTS.STREAK_7, action: 'streak_7' },
  { days: 14, points: POINTS.STREAK_14, action: 'streak_14' },
  { days: 30, points: POINTS.STREAK_30, action: 'streak_30' },
] as const
```

- [ ] **Step 3: Create points Server Action**

Create `lib/actions/points.ts`:
```ts
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { POINTS, STREAK_MILESTONES } from '@/lib/utils/points'

interface AwardPointsParams {
  userId: string
  challengeId: string
  entryId: string
  currentStreak: number
  isFirstEntry: boolean
}

export async function awardPoints({ userId, challengeId, entryId, currentStreak, isFirstEntry }: AwardPointsParams) {
  const admin = createAdminClient()
  let totalAwarded = 0
  const awards: Array<{ action: string; points: number }> = []

  // Daily entry points
  awards.push({ action: 'daily_entry', points: POINTS.DAILY_ENTRY })
  totalAwarded += POINTS.DAILY_ENTRY

  // First entry bonus
  if (isFirstEntry) {
    awards.push({ action: 'first_entry', points: POINTS.FIRST_ENTRY })
    totalAwarded += POINTS.FIRST_ENTRY
  }

  // Streak bonuses
  for (const milestone of STREAK_MILESTONES) {
    if (currentStreak === milestone.days) {
      // Check not already awarded
      const { data: existing } = await admin
        .from('points_log')
        .select('id')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .eq('action', milestone.action)
        .limit(1)

      if (!existing || existing.length === 0) {
        awards.push({ action: milestone.action, points: milestone.points })
        totalAwarded += milestone.points
      }
    }
  }

  // Insert all point logs
  if (awards.length > 0) {
    await admin.from('points_log').insert(
      awards.map(a => ({
        user_id: userId,
        challenge_id: challengeId,
        entry_id: entryId,
        action: a.action,
        points: a.points,
      }))
    )

    // Update denormalized totals
    await admin.rpc('increment_points', {
      p_user_id: userId,
      p_challenge_id: challengeId,
      p_points: totalAwarded,
    })
  }

  return { totalAwarded, awards }
}
```

**Note:** This requires a Postgres function `increment_points`. Add to the migration:

```sql
-- Add to supabase/migrations/00001_initial_schema.sql (or a new migration)
create or replace function increment_points(p_user_id uuid, p_challenge_id uuid, p_points integer)
returns void as $$
begin
  update profiles set points_total = points_total + p_points where id = p_user_id;
  update challenge_participants set points_earned = points_earned + p_points where user_id = p_user_id and challenge_id = p_challenge_id;
end;
$$ language plpgsql security definer;
```

- [ ] **Step 4: Create badges Server Action**

Create `lib/actions/badges.ts`:
```ts
'use server'

import { createAdminClient } from '@/lib/supabase/admin'

interface CheckBadgesParams {
  userId: string
  challengeId: string
  currentStreak: number
}

export async function checkAndAwardBadges({ userId, challengeId, currentStreak }: CheckBadgesParams) {
  const admin = createAdminClient()
  const newBadges: Array<{ name: string; iconUrl: string }> = []

  // Get all badge definitions
  const { data: badges } = await admin.from('badges').select('*')
  if (!badges) return newBadges

  // Get user's existing badges
  const { data: userBadges } = await admin
    .from('user_badges')
    .select('badge_id, challenge_id')
    .eq('user_id', userId)

  const existingBadgeKeys = new Set(
    (userBadges ?? []).map(ub => `${ub.badge_id}-${ub.challenge_id ?? 'null'}`)
  )

  // Check first entry ever (Premier pas)
  const firstEntryBadge = badges.find(b => b.name === 'Premier pas')
  if (firstEntryBadge && !existingBadgeKeys.has(`${firstEntryBadge.id}-null`)) {
    const { count } = await admin
      .from('daily_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (count === 1) {
      await admin.from('user_badges').insert({
        user_id: userId,
        badge_id: firstEntryBadge.id,
        challenge_id: null,
      })
      newBadges.push({ name: firstEntryBadge.name, iconUrl: firstEntryBadge.icon_url })
    }
  }

  // Check streak badges
  const streakBadges = badges.filter(b => b.condition_type === 'streak')
  for (const badge of streakBadges) {
    const key = `${badge.id}-${challengeId}`
    if (currentStreak >= badge.condition_value && !existingBadgeKeys.has(key)) {
      await admin.from('user_badges').insert({
        user_id: userId,
        badge_id: badge.id,
        challenge_id: challengeId,
      })
      newBadges.push({ name: badge.name, iconUrl: badge.icon_url })
    }
  }

  // Check Challenger badge (joined 5 challenges)
  const challengerBadge = badges.find(b => b.name === 'Challenger')
  if (challengerBadge && !existingBadgeKeys.has(`${challengerBadge.id}-null`)) {
    const { count } = await admin
      .from('challenge_participants')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (count && count >= 5) {
      await admin.from('user_badges').insert({
        user_id: userId,
        badge_id: challengerBadge.id,
        challenge_id: null,
      })
      newBadges.push({ name: challengerBadge.name, iconUrl: challengerBadge.icon_url })
    }
  }

  return newBadges
}
```

- [ ] **Step 5: Create entry submission Server Action**

Create `lib/actions/entries.ts`:
```ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { submitEntrySchema, type SubmitEntryInput } from '@/lib/validations/entries'
import { getTodayUTC, getYesterdayUTC } from '@/lib/utils/dates'
import { awardPoints } from './points'
import { checkAndAwardBadges } from './badges'

export type EntryResult = {
  success?: boolean
  error?: string
  pointsAwarded?: number
  newBadges?: Array<{ name: string; iconUrl: string }>
  streakMilestone?: boolean
  currentStreak?: number
}

export async function submitEntry(input: SubmitEntryInput): Promise<EntryResult> {
  const parsed = submitEntrySchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifie' }

  const today = getTodayUTC()
  const yesterday = getYesterdayUTC()
  const { challenge_id, values } = parsed.data

  // Check participation
  const { data: participation } = await supabase
    .from('challenge_participants')
    .select('id, current_streak, best_streak')
    .eq('challenge_id', challenge_id)
    .eq('user_id', user.id)
    .single()

  if (!participation) return { error: 'Tu ne participes pas a ce defi' }

  // Check if already submitted today (upsert mode)
  const { data: existingEntry } = await supabase
    .from('daily_entries')
    .select('id')
    .eq('challenge_id', challenge_id)
    .eq('user_id', user.id)
    .eq('entry_date', today)
    .single()

  let entryId: string

  if (existingEntry) {
    // Update existing entry values
    entryId = existingEntry.id
    for (const val of values) {
      await supabase
        .from('entry_values')
        .upsert({
          entry_id: entryId,
          field_id: val.field_id,
          value_text: val.value_text,
          value_number: val.value_number,
          value_date: val.value_date,
          value_file_url: val.value_file_url,
        }, { onConflict: 'entry_id,field_id' })
    }

    revalidatePath(`/challenges/${challenge_id}`)
    return { success: true, currentStreak: participation.current_streak }
  }

  // New entry
  const { data: newEntry, error: entryError } = await supabase
    .from('daily_entries')
    .insert({ challenge_id, user_id: user.id, entry_date: today })
    .select('id')
    .single()

  if (entryError || !newEntry) return { error: 'Erreur lors de la saisie' }
  entryId = newEntry.id

  // Insert values
  await supabase.from('entry_values').insert(
    values.map(v => ({
      entry_id: entryId,
      field_id: v.field_id,
      value_text: v.value_text,
      value_number: v.value_number,
      value_date: v.value_date,
      value_file_url: v.value_file_url,
    }))
  )

  // Calculate streak
  const { data: yesterdayEntry } = await supabase
    .from('daily_entries')
    .select('id')
    .eq('challenge_id', challenge_id)
    .eq('user_id', user.id)
    .eq('entry_date', yesterday)
    .single()

  const newStreak = yesterdayEntry ? participation.current_streak + 1 : 1
  const bestStreak = Math.max(newStreak, participation.best_streak)

  await supabase
    .from('challenge_participants')
    .update({ current_streak: newStreak, best_streak: bestStreak })
    .eq('id', participation.id)

  // Check if first entry ever
  const { count } = await supabase
    .from('daily_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const isFirstEntry = count === 1

  // Award points
  const { totalAwarded, awards } = await awardPoints({
    userId: user.id,
    challengeId: challenge_id,
    entryId,
    currentStreak: newStreak,
    isFirstEntry,
  })

  // Check badges
  const newBadges = await checkAndAwardBadges({
    userId: user.id,
    challengeId: challenge_id,
    currentStreak: newStreak,
  })

  const streakMilestone = awards.some(a => a.action.startsWith('streak_'))

  revalidatePath(`/challenges/${challenge_id}`)
  revalidatePath('/dashboard')

  return {
    success: true,
    pointsAwarded: totalAwarded,
    newBadges,
    streakMilestone,
    currentStreak: newStreak,
  }
}
```

- [ ] **Step 6: Create DailyEntryForm component**

Create `components/challenges/daily-entry-form.tsx`:
```tsx
'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { submitEntry, type EntryResult } from '@/lib/actions/entries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fireConfetti } from '@/components/ui/confetti'
import { toast } from 'sonner'
import { selectContextualQuote } from '@/lib/utils/quotes'

interface Field {
  id: string
  name: string
  label: string
  type: string
  required: boolean
  config: Record<string, unknown> | null
}

interface ExistingValue {
  field_id: string
  value_text: string | null
  value_number: number | null
  value_date: string | null
  value_file_url: string | null
}

interface DailyEntryFormProps {
  challengeId: string
  fields: Field[]
  existingValues?: ExistingValue[]
  quotes: Array<{ text: string; author: string | null; context: string }>
}

export function DailyEntryForm({ challengeId, fields, existingValues = [], quotes }: DailyEntryFormProps) {
  const [isPending, startTransition] = useTransition()
  const { register, handleSubmit } = useForm()

  const getExistingValue = (fieldId: string) =>
    existingValues.find(v => v.field_id === fieldId)

  const onSubmit = (data: Record<string, unknown>) => {
    startTransition(async () => {
      const values = fields.map(f => {
        const raw = data[f.name]
        return {
          field_id: f.id,
          value_text: f.type === 'text' || f.type === 'boolean' ? String(raw ?? '') : null,
          value_number: f.type === 'number' ? Number(raw) || null : null,
          value_date: f.type === 'date' ? String(raw ?? '') || null : null,
          value_file_url: null, // File upload handled separately
        }
      })

      const result: EntryResult = await submitEntry({ challenge_id: challengeId, values })

      if (result.error) {
        toast.error(result.error, {
          description: 'Pas de panique, reessaie !',
          style: { background: '#1a0a0a', border: '1px solid #ef4444' },
        })
        return
      }

      // Success feedback
      if (result.streakMilestone) {
        fireConfetti('milestone')
        toast.success(`Serie de ${result.currentStreak} jours !`, {
          description: `+${result.pointsAwarded} points`,
          style: { background: '#0a1a0a', border: '1px solid #00ff87' },
        })
      } else {
        fireConfetti('success')
        const quote = quotes.length > 0
          ? selectContextualQuote(quotes as any, 'entry_submitted')
          : null
        toast.success(quote?.text ?? 'Bien joue !', {
          description: `+${result.pointsAwarded} points`,
          style: { background: '#0a1a0a', border: '1px solid #00ff87' },
        })
      }

      // Badge notifications
      if (result.newBadges && result.newBadges.length > 0) {
        for (const badge of result.newBadges) {
          setTimeout(() => {
            toast.success(`Badge debloque : ${badge.name}`, {
              style: { background: '#1a1a0a', border: '1px solid #FFD700' },
            })
          }, 1500)
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields
        .sort((a, b) => (a as unknown as { order: number }).order - (b as unknown as { order: number }).order)
        .map(field => {
          const existing = getExistingValue(field.id)
          return (
            <div key={field.id}>
              {field.type === 'number' && (
                <Input
                  label={field.label}
                  type="number"
                  step="any"
                  defaultValue={existing?.value_number ?? ''}
                  required={field.required}
                  {...register(field.name)}
                />
              )}
              {field.type === 'text' && (
                <Input
                  label={field.label}
                  type="text"
                  defaultValue={existing?.value_text ?? ''}
                  required={field.required}
                  {...register(field.name)}
                />
              )}
              {field.type === 'date' && (
                <Input
                  label={field.label}
                  type="date"
                  defaultValue={existing?.value_date ?? ''}
                  required={field.required}
                  {...register(field.name)}
                />
              )}
              {field.type === 'boolean' && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={existing?.value_text === 'true'}
                    className="w-5 h-5 accent-accent-green"
                    {...register(field.name)}
                  />
                  <span className="text-sm font-semibold text-white">{field.label}</span>
                </label>
              )}
            </div>
          )
        })}

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? 'Envoi...' : existingValues.length > 0 ? 'Modifier' : 'Valider'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 7: Create entry page**

Create `app/(app)/challenges/[id]/entry/page.tsx`:
```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { DailyEntryForm } from '@/components/challenges/daily-entry-form'
import { getTodayUTC } from '@/lib/utils/dates'

export default async function EntryPage(props: PageProps<'/challenges/[id]/entry'>) {
  const { id } = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = getTodayUTC()

  const [challengeRes, participationRes, existingEntryRes, quotesRes] = await Promise.all([
    supabase.from('challenges').select('*, challenge_fields(*)').eq('id', id).single(),
    supabase.from('challenge_participants').select('id').eq('challenge_id', id).eq('user_id', user.id).single(),
    supabase.from('daily_entries').select('id').eq('challenge_id', id).eq('user_id', user.id).eq('entry_date', today).single(),
    supabase.from('motivational_quotes').select('*'),
  ])

  if (!challengeRes.data) notFound()
  if (!participationRes.data) redirect(`/challenges/${id}`)

  const fields = (challengeRes.data.challenge_fields as unknown as Array<{
    id: string; name: string; label: string; type: string; required: boolean; order: number; config: Record<string, unknown> | null
  }>).sort((a, b) => a.order - b.order)

  let existingValues: Array<{
    field_id: string; value_text: string | null; value_number: number | null;
    value_date: string | null; value_file_url: string | null
  }> = []

  if (existingEntryRes.data) {
    const { data: values } = await supabase
      .from('entry_values')
      .select('field_id, value_text, value_number, value_date, value_file_url')
      .eq('entry_id', existingEntryRes.data.id)

    existingValues = values ?? []
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="text-2xl font-black">{challengeRes.data.title}</h2>
      <p className="text-text-muted text-sm">
        {existingValues.length > 0 ? 'Modifier la saisie du jour' : 'Saisie du jour'}
      </p>

      <DailyEntryForm
        challengeId={id}
        fields={fields}
        existingValues={existingValues}
        quotes={quotesRes.data ?? []}
      />
    </div>
  )
}
```

- [ ] **Step 8: Verify build**

```bash
pnpm build
```

- [ ] **Step 9: Commit**

```bash
git add lib/actions/ lib/utils/ components/challenges/daily-entry-form.tsx app/\(app\)/challenges/\[id\]/entry/
git commit -m "feat: add daily entry system with points, streaks, badges, confetti, and toasts"
```

---

### Task 10: History & Profile Pages

**Files:**
- Create: `app/(app)/challenges/[id]/history/page.tsx`
- Create: `app/(app)/profile/page.tsx`
- Create: `app/(app)/profile/[userId]/page.tsx`
- Create: `lib/actions/profile.ts`

- [ ] **Step 1: Create history page**

Create `app/(app)/challenges/[id]/history/page.tsx`:
```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function HistoryPage(props: PageProps<'/challenges/[id]/history'>) {
  const { id } = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: challenge } = await supabase
    .from('challenges')
    .select('title, challenge_fields(*)')
    .eq('id', id)
    .single()

  if (!challenge) notFound()

  const { data: entries } = await supabase
    .from('daily_entries')
    .select('id, entry_date, entry_values(field_id, value_text, value_number, value_date, value_file_url)')
    .eq('challenge_id', id)
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })

  const fields = challenge.challenge_fields as unknown as Array<{ id: string; label: string; type: string; order: number }>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-black">{challenge.title}</h2>
      <p className="text-text-muted text-sm">Mon historique — {(entries ?? []).length} saisies</p>

      <div className="space-y-3">
        {(entries ?? []).map(entry => (
          <Card key={entry.id}>
            <CardContent className="p-4">
              <div className="text-sm font-bold text-accent-green mb-2">
                {format(parseISO(entry.entry_date), 'EEEE d MMMM yyyy', { locale: fr })}
              </div>
              <div className="grid gap-1">
                {fields.sort((a, b) => a.order - b.order).map(f => {
                  const val = (entry.entry_values as unknown as Array<{
                    field_id: string; value_text: string | null; value_number: number | null;
                    value_date: string | null; value_file_url: string | null
                  }>).find(v => v.field_id === f.id)
                  const display = val?.value_number ?? val?.value_text ?? val?.value_date ?? '—'
                  return (
                    <div key={f.id} className="flex justify-between text-sm">
                      <span className="text-text-muted">{f.label}</span>
                      <span className="text-white font-semibold">{String(display)}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create profile update Server Action**

Create `lib/actions/profile.ts`:
```ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { updateProfileSchema } from '@/lib/validations/profile'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifie' }

  const parsed = updateProfileSchema.safeParse({
    username: formData.get('username') || undefined,
    entry_mode: formData.get('entry_mode') || undefined,
  })

  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { error } = await supabase
    .from('profiles')
    .update(parsed.data)
    .eq('id', user.id)

  if (error) {
    if (error.code === '23505') return { error: 'Ce nom d\'utilisateur est deja pris' }
    return { error: 'Erreur lors de la mise a jour' }
  }

  revalidatePath('/profile')
  return { success: true }
}
```

- [ ] **Step 3: Create own profile page**

Create `app/(app)/profile/page.tsx`:
```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BadgeDisplay } from '@/components/ui/badge-display'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateProfile } from '@/lib/actions/profile'
import { logout } from '@/lib/actions/auth'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, badgesRes, challengesRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('user_badges').select('badges(name, icon_url), earned_at').eq('user_id', user.id).order('earned_at', { ascending: false }),
    supabase.from('challenge_participants').select('challenges(id, title, status)').eq('user_id', user.id),
  ])

  const profile = profileRes.data!
  const badges = badgesRes.data ?? []
  const challenges = challengesRes.data ?? []

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-black">Mon profil</h2>

      <Card>
        <CardHeader><h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Stats</h3></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-black text-accent-green">{profile.points_total}</div>
              <div className="text-xs text-text-muted">Points</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">{badges.length}</div>
              <div className="text-xs text-text-muted">Badges</div>
            </div>
            <div>
              <div className="text-2xl font-black text-accent-orange">{challenges.length}</div>
              <div className="text-xs text-text-muted">Defis</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Badges</h3></CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            {badges.map((b, i) => (
              <BadgeDisplay
                key={i}
                name={(b.badges as unknown as { name: string; icon_url: string }).name}
                iconUrl={(b.badges as unknown as { name: string; icon_url: string }).icon_url}
              />
            ))}
            {badges.length === 0 && <p className="text-text-muted text-sm">Aucun badge</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Parametres</h3></CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-4">
            <Input name="username" label="Nom d'utilisateur" defaultValue={profile.username} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-secondary">Mode de saisie</label>
              <select
                name="entry_mode"
                defaultValue={profile.entry_mode}
                className="rounded-[10px] border border-border bg-bg-secondary px-4 py-2.5 text-white focus:border-accent-green focus:outline-none"
              >
                <option value="quick">Rapide (tous les champs)</option>
                <option value="wizard">Wizard (un champ a la fois)</option>
              </select>
            </div>
            <Button type="submit">Sauvegarder</Button>
          </form>
        </CardContent>
      </Card>

      <form action={logout}>
        <Button variant="danger" type="submit" className="w-full">Se deconnecter</Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Create public profile page**

Create `app/(app)/profile/[userId]/page.tsx`:
```tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BadgeDisplay } from '@/components/ui/badge-display'

export default async function PublicProfilePage(props: PageProps<'/profile/[userId]'>) {
  const { userId } = await props.params
  const supabase = await createClient()

  const [profileRes, badgesRes, challengesRes] = await Promise.all([
    supabase.from('profiles').select('username, avatar_url, points_total').eq('id', userId).single(),
    supabase.from('user_badges').select('badges(name, icon_url)').eq('user_id', userId),
    supabase.from('challenge_participants').select('challenges(title, status)').eq('user_id', userId),
  ])

  if (!profileRes.data) notFound()
  const profile = profileRes.data

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-accent-green flex items-center justify-center text-xl font-black text-black">
          {profile.username.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h2 className="text-2xl font-black">{profile.username}</h2>
          <p className="text-accent-green font-bold">{profile.points_total} points</p>
        </div>
      </div>

      <Card>
        <CardHeader><h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Badges</h3></CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            {(badgesRes.data ?? []).map((b, i) => (
              <BadgeDisplay
                key={i}
                name={(b.badges as unknown as { name: string; icon_url: string }).name}
                iconUrl={(b.badges as unknown as { name: string; icon_url: string }).icon_url}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 5: Verify build**

```bash
pnpm build
```

- [ ] **Step 6: Commit**

```bash
git add app/\(app\)/challenges/\[id\]/history/ app/\(app\)/profile/ lib/actions/profile.ts
git commit -m "feat: add history page, profile page with settings, and public profile"
```

---

### Task 11: Admin Panel

**Files:**
- Create: `app/(admin)/layout.tsx`
- Create: `app/(admin)/admin/page.tsx`
- Create: `lib/actions/challenges.ts`
- Create: `components/challenges/challenge-fields-builder.tsx`
- Create: `app/(admin)/admin/challenges/new/page.tsx`
- Create: `app/(admin)/admin/challenges/[id]/edit/page.tsx`
- Create: `app/(admin)/admin/badges/page.tsx`
- Create: `app/(admin)/admin/quotes/page.tsx`

- [ ] **Step 1: Create admin layout**

Create `app/(admin)/layout.tsx`:
```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url, is_admin, points_total')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar isAdmin={true} />
      <div className="flex-1 flex flex-col">
        <Topbar username={profile.username} avatarUrl={profile.avatar_url} points={profile.points_total} streak={0} />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent-orange/10 text-accent-orange">ADMIN</span>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create challenge CRUD Server Actions**

Create `lib/actions/challenges.ts`:
```ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createChallengeSchema } from '@/lib/validations/challenges'
import { addDays, format } from 'date-fns'

export async function createChallenge(input: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifie' }

  const parsed = createChallengeSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { fields, ...challengeData } = parsed.data
  const endDate = format(addDays(new Date(challengeData.start_date), challengeData.duration_days), 'yyyy-MM-dd')

  const { data: challenge, error } = await supabase
    .from('challenges')
    .insert({
      ...challengeData,
      end_date: endDate,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error || !challenge) return { error: 'Erreur lors de la creation' }

  // Insert fields
  await supabase.from('challenge_fields').insert(
    fields.map(f => ({ ...f, challenge_id: challenge.id }))
  )

  revalidatePath('/challenges')
  redirect(`/challenges/${challenge.id}`)
}

export async function updateChallenge(challengeId: string, input: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifie' }

  const parsed = createChallengeSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { fields, ...challengeData } = parsed.data
  const endDate = format(addDays(new Date(challengeData.start_date), challengeData.duration_days), 'yyyy-MM-dd')

  const { error } = await supabase
    .from('challenges')
    .update({ ...challengeData, end_date: endDate })
    .eq('id', challengeId)

  if (error) return { error: 'Erreur lors de la mise a jour' }

  // Replace fields
  await supabase.from('challenge_fields').delete().eq('challenge_id', challengeId)
  await supabase.from('challenge_fields').insert(
    fields.map(f => ({ ...f, challenge_id: challengeId }))
  )

  revalidatePath(`/challenges/${challengeId}`)
  revalidatePath('/admin')
  return { success: true }
}

export async function publishChallenge(challengeId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('challenges')
    .update({ status: 'active' })
    .eq('id', challengeId)
    .eq('status', 'draft')

  if (error) return { error: 'Erreur lors de la publication' }

  revalidatePath(`/challenges/${challengeId}`)
  revalidatePath('/challenges')
  return { success: true }
}

export async function deleteChallenge(challengeId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('challenges')
    .delete()
    .eq('id', challengeId)
    .eq('status', 'draft')

  if (error) return { error: 'Impossible de supprimer (le defi a peut-etre des participants)' }

  revalidatePath('/admin')
  revalidatePath('/challenges')
  return { success: true }
}
```

- [ ] **Step 3: Create ChallengeFieldsBuilder component**

Create `components/challenges/challenge-fields-builder.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, GripVertical } from 'lucide-react'

interface Field {
  name: string
  label: string
  type: string
  required: boolean
  order: number
  config: Record<string, unknown> | null
}

interface ChallengeFieldsBuilderProps {
  initialFields?: Field[]
  onChange: (fields: Field[]) => void
}

const fieldTypes = [
  { value: 'number', label: 'Nombre' },
  { value: 'text', label: 'Texte' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Oui/Non' },
  { value: 'file', label: 'Fichier' },
  { value: 'image', label: 'Image' },
]

export function ChallengeFieldsBuilder({ initialFields = [], onChange }: ChallengeFieldsBuilderProps) {
  const [fields, setFields] = useState<Field[]>(
    initialFields.length > 0 ? initialFields : [{ name: '', label: '', type: 'number', required: true, order: 0, config: null }]
  )

  const update = (newFields: Field[]) => {
    setFields(newFields)
    onChange(newFields)
  }

  const addField = () => {
    update([...fields, { name: '', label: '', type: 'number', required: true, order: fields.length, config: null }])
  }

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index).map((f, i) => ({ ...f, order: i }))
    update(newFields)
  }

  const updateField = (index: number, key: keyof Field, value: unknown) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], [key]: value }
    // Auto-generate name from label
    if (key === 'label') {
      newFields[index].name = String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '')
    }
    update(newFields)
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-text-secondary">Champs du defi</label>
      {fields.map((field, i) => (
        <div key={i} className="flex items-start gap-2 p-3 bg-bg-tertiary rounded-[10px] border border-border">
          <GripVertical size={16} className="text-text-muted mt-2.5 cursor-grab" />
          <div className="flex-1 grid grid-cols-2 gap-2">
            <Input
              placeholder="Label (ex: Pompes)"
              value={field.label}
              onChange={e => updateField(i, 'label', e.target.value)}
            />
            <select
              value={field.type}
              onChange={e => updateField(i, 'type', e.target.value)}
              className="rounded-[10px] border border-border bg-bg-secondary px-3 py-2.5 text-white text-sm focus:border-accent-green focus:outline-none"
            >
              {fieldTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-1 mt-2.5">
            <input
              type="checkbox"
              checked={field.required}
              onChange={e => updateField(i, 'required', e.target.checked)}
              className="accent-accent-green"
            />
            <span className="text-xs text-text-muted">Requis</span>
          </label>
          <button onClick={() => removeField(i)} className="text-text-muted hover:text-error mt-2.5">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={addField}>
        <Plus size={14} className="mr-1" /> Ajouter un champ
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: Create "New challenge" admin page**

Create `app/(admin)/admin/challenges/new/page.tsx`:
```tsx
'use client'

import { useState, useTransition } from 'react'
import { createChallenge } from '@/lib/actions/challenges'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChallengeFieldsBuilder } from '@/components/challenges/challenge-fields-builder'
import { toast } from 'sonner'

export default function NewChallengePage() {
  const [fields, setFields] = useState<Array<{
    name: string; label: string; type: string; required: boolean; order: number; config: Record<string, unknown> | null
  }>>([])
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createChallenge({
        title: form.get('title'),
        description: form.get('description'),
        start_date: form.get('start_date'),
        duration_days: Number(form.get('duration_days')),
        fields,
      })

      if (result?.error) {
        toast.error(result.error)
      }
      // On success, the Server Action redirects
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black">Nouveau defi</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="title" label="Titre" placeholder="Ex: 30 jours de pompes" required />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-text-secondary">Description</label>
          <textarea
            name="description"
            rows={3}
            className="rounded-[10px] border border-border bg-bg-secondary px-4 py-2.5 text-white placeholder:text-text-muted focus:border-accent-green focus:outline-none resize-none"
            placeholder="Decris le defi..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input name="start_date" type="date" label="Date de debut" required />
          <Input name="duration_days" type="number" label="Duree (jours)" placeholder="30" required />
        </div>

        <ChallengeFieldsBuilder onChange={setFields} />

        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? 'Creation...' : 'Creer le defi'}
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 5: Create admin dashboard page**

Create `app/(admin)/admin/page.tsx`:
```tsx
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { publishChallenge, deleteChallenge } from '@/lib/actions/challenges'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: challenges } = await supabase
    .from('challenges')
    .select('id, title, status, start_date, duration_days, challenge_participants(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">Admin — Defis</h2>
        <Link href="/admin/challenges/new">
          <Button><Plus size={16} className="mr-1" /> Nouveau defi</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {(challenges ?? []).map(c => (
          <Card key={c.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">{c.title}</h3>
                <p className="text-xs text-text-muted">
                  {c.status} — {(c.challenge_participants as unknown as { count: number }[])[0]?.count ?? 0} participants
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/challenges/${c.id}/edit`}>
                  <Button variant="secondary" size="sm">Modifier</Button>
                </Link>
                {c.status === 'draft' && (
                  <>
                    <form action={async () => {
                      'use server'
                      await publishChallenge(c.id)
                    }}>
                      <Button size="sm" type="submit">Publier</Button>
                    </form>
                    <form action={async () => {
                      'use server'
                      await deleteChallenge(c.id)
                    }}>
                      <Button variant="danger" size="sm" type="submit">Supprimer</Button>
                    </form>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create edit challenge page (stub — reuses builder)**

Create `app/(admin)/admin/challenges/[id]/edit/page.tsx`:
```tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'

export default async function EditChallengePage(props: PageProps<'/admin/challenges/[id]/edit'>) {
  const { id } = await props.params
  const supabase = await createClient()

  const { data: challenge } = await supabase
    .from('challenges')
    .select('*, challenge_fields(*)')
    .eq('id', id)
    .single()

  if (!challenge) notFound()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black">Modifier: {challenge.title}</h2>
      <Card>
        <CardContent className="p-4">
          <p className="text-text-muted text-sm">
            Edition du defi en cours de developpement. Utilisez la page de creation pour l'instant.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 7: Create badges admin page**

Create `app/(admin)/admin/badges/page.tsx`:
```tsx
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { BadgeDisplay } from '@/components/ui/badge-display'

export default async function AdminBadgesPage() {
  const supabase = await createClient()
  const { data: badges } = await supabase.from('badges').select('*').order('name')

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black">Admin — Badges</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(badges ?? []).map(b => (
          <Card key={b.id}>
            <CardContent className="p-4 flex flex-col items-center">
              <BadgeDisplay name={b.name} iconUrl={b.icon_url} size="lg" />
              <p className="text-xs text-text-muted mt-2 text-center">{b.description}</p>
              <p className="text-xs text-accent-green mt-1">{b.condition_type}: {b.condition_value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Create quotes admin page**

Create `app/(admin)/admin/quotes/page.tsx`:
```tsx
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'

export default async function AdminQuotesPage() {
  const supabase = await createClient()
  const { data: quotes } = await supabase.from('motivational_quotes').select('*').order('context')

  const grouped = (quotes ?? []).reduce((acc, q) => {
    if (!acc[q.context]) acc[q.context] = []
    acc[q.context].push(q)
    return acc
  }, {} as Record<string, typeof quotes>)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black">Admin — Citations</h2>
      {Object.entries(grouped).map(([context, contextQuotes]) => (
        <div key={context}>
          <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-3">{context}</h3>
          <div className="space-y-2">
            {(contextQuotes ?? []).map(q => (
              <Card key={q.id}>
                <CardContent className="p-3">
                  <p className="text-sm text-white italic">"{q.text}"</p>
                  {q.author && <p className="text-xs text-text-muted mt-1">— {q.author}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 9: Verify build**

```bash
pnpm build
```

- [ ] **Step 10: Commit**

```bash
git add app/\(admin\)/ lib/actions/challenges.ts components/challenges/challenge-fields-builder.tsx
git commit -m "feat: add admin panel with challenge creation, badges, and quotes management"
```

---

### Task 12: Cron Job & increment_points Function

**Files:**
- Create: `app/api/cron/challenges/route.ts`
- Modify: `supabase/migrations/00001_initial_schema.sql` (add `increment_points` function)

- [ ] **Step 1: Add increment_points to migration**

Create `supabase/migrations/00002_increment_points.sql`:
```sql
create or replace function increment_points(p_user_id uuid, p_challenge_id uuid, p_points integer)
returns void as $$
begin
  update profiles set points_total = points_total + p_points where id = p_user_id;
  update challenge_participants set points_earned = points_earned + p_points where user_id = p_user_id and challenge_id = p_challenge_id;
end;
$$ language plpgsql security definer;
```

- [ ] **Step 2: Create cron route handler**

Create `app/api/cron/challenges/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  // Transition overdue active challenges to completed
  const { data: overdue } = await admin
    .from('challenges')
    .select('id')
    .eq('status', 'active')
    .lt('end_date', today)

  if (overdue && overdue.length > 0) {
    const overdueIds = overdue.map(c => c.id)

    await admin
      .from('challenges')
      .update({ status: 'completed' })
      .in('id', overdueIds)

    // Award Podium badges for completed challenges
    for (const challengeId of overdueIds) {
      const { data: top3 } = await admin
        .from('challenge_participants')
        .select('user_id')
        .eq('challenge_id', challengeId)
        .order('points_earned', { ascending: false })
        .limit(3)

      if (top3) {
        const { data: podiumBadge } = await admin
          .from('badges')
          .select('id')
          .eq('name', 'Podium')
          .single()

        if (podiumBadge) {
          for (const participant of top3) {
            await admin.from('user_badges').upsert({
              user_id: participant.user_id,
              badge_id: podiumBadge.id,
              challenge_id: challengeId,
            }, { onConflict: 'user_id,badge_id,coalesce(challenge_id, \'00000000-0000-0000-0000-000000000000\')' })
          }
        }
      }
    }
  }

  return NextResponse.json({ transitioned: overdue?.length ?? 0 })
}
```

- [ ] **Step 3: Add vercel.json for cron schedule**

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/challenges",
      "schedule": "0 1 * * *"
    }
  ]
}
```

- [ ] **Step 4: Verify build**

```bash
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add app/api/cron/ supabase/migrations/00002_increment_points.sql vercel.json
git commit -m "feat: add daily cron job for challenge transitions and Podium badges"
```

---

### Task 13: Final Polish & Badge SVGs

**Files:**
- Create: `public/badges/first-step.svg`
- Create: `public/badges/fire.svg`
- Create: `public/badges/lightning.svg`
- Create: `public/badges/trophy.svg`
- Create: `public/badges/star.svg`
- Create: `public/badges/medal.svg`
- Create: `public/badges/podium.svg`
- Create: `public/badges/flag.svg`
- Create: `public/badges/default.svg`

- [ ] **Step 1: Create badge SVG icons**

Create simple neon-green-themed SVG badge icons for each badge. Each should be a 64x64 SVG with the sport dark theme aesthetic (dark background, neon green accents).

These are decorative icons — use simple geometric shapes (circles, shields, stars) with `#00ff87` fill/stroke on transparent backgrounds.

- [ ] **Step 2: Verify the full app builds**

```bash
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add public/badges/
git commit -m "feat: add badge SVG icons"
```

- [ ] **Step 4: Final build verification**

```bash
pnpm build
```

The entire application should build without errors.

- [ ] **Step 5: Final commit with any remaining fixes**

```bash
git add -A
git commit -m "chore: final build fixes and cleanup"
```
