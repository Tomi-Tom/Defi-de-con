# Defi De Con — Design Specification

## Overview

A challenge tracking platform where an admin creates time-bound challenges (typically 30 days), users join and log daily data, earn points and badges for consistency, and compete on leaderboards. Deployed on Vercel (Next.js fullstack) + Supabase (DB, Auth, Storage).

## Architecture

- **Next.js 16 App Router** — Server Actions for mutations, Route Handlers for webhooks
- **Supabase Postgres** — Row Level Security policies for data access control
- **Supabase Auth** — Native email/password authentication via `@supabase/ssr`
- **Supabase Storage** — File uploads, buckets per challenge
- **Single deployment** — One Next.js app on Vercel, Supabase as managed backend

## Data Model

### `profiles`
Extension of `auth.users`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (FK → auth.users) | PK |
| `username` | text | Unique |
| `avatar_url` | text | Nullable |
| `entry_mode` | text | `'quick'` (default) or `'wizard'` |
| `is_admin` | boolean | Default false |
| `points_total` | integer | Denormalized total, default 0 |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Auto-set on UPDATE via trigger |

### `challenges`
Challenges created by admin.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `title` | text | |
| `description` | text | |
| `start_date` | date | |
| `end_date` | date | Derived: `start_date + duration_days` |
| `duration_days` | integer | Source of truth for length |
| `status` | text | `'draft'`, `'active'`, `'completed'` |
| `cover_image_url` | text | Nullable |
| `upload_config` | jsonb | Allowed types, max size per challenge |
| `created_by` | uuid (FK → profiles) | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Auto-set on UPDATE via trigger |

### `challenge_fields`
Custom fields defined by admin per challenge.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `challenge_id` | uuid (FK → challenges) | |
| `name` | text | Machine-readable key |
| `label` | text | Display label |
| `type` | text | `'number'`, `'text'`, `'date'`, `'boolean'`, `'file'`, `'image'` |
| `required` | boolean | Default true |
| `order` | integer | Display order |
| `config` | jsonb | Type-specific: min/max, placeholder, accepted file types, etc. |

### `challenge_participants`
User enrollments in challenges.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `challenge_id` | uuid (FK → challenges) | |
| `user_id` | uuid (FK → profiles) | |
| `joined_at` | timestamptz | |
| `current_streak` | integer | Default 0 |
| `best_streak` | integer | Default 0 |
| `points_earned` | integer | Denormalized, default 0 |

Unique constraint on `(challenge_id, user_id)`.

**Leave/rejoin behavior:** A user can leave a challenge (row deleted). Their `daily_entries` and `entry_values` are preserved (orphaned but readable by admin). Points already earned are kept in `points_log` and `profiles.points_total`. If the user rejoins, a new `challenge_participants` row is created with streak reset to 0. Past entries are not re-linked.

### `daily_entries`
One entry per user per challenge per day.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `challenge_id` | uuid (FK → challenges) | |
| `user_id` | uuid (FK → profiles) | |
| `entry_date` | date | |
| `submitted_at` | timestamptz | |

Unique constraint on `(challenge_id, user_id, entry_date)`.

### `entry_values`
EAV pattern — one row per field value per entry.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `entry_id` | uuid (FK → daily_entries) | |
| `field_id` | uuid (FK → challenge_fields) | |
| `value_text` | text | For text/boolean fields |
| `value_number` | numeric | For number fields |
| `value_date` | date | For date fields |
| `value_file_url` | text | For file/image uploads |

### `badges`
Badge definitions.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `name` | text | |
| `description` | text | |
| `icon_url` | text | SVG icon path |
| `condition_type` | text | `'streak'`, `'completion'`, `'points'`, `'custom'` |
| `condition_value` | integer | Threshold value |

### `user_badges`
Badges earned by users.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `user_id` | uuid (FK → profiles) | |
| `badge_id` | uuid (FK → badges) | |
| `challenge_id` | uuid (FK → challenges) | Nullable |
| `earned_at` | timestamptz | |

Unique constraint on `(user_id, badge_id, COALESCE(challenge_id, '00000000-0000-0000-0000-000000000000'))` to prevent duplicate badge awards. Badges are never revoked.

### `points_log`
Audit trail for all point transactions. Source of truth for recalculation.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `user_id` | uuid (FK → profiles) | |
| `challenge_id` | uuid (FK → challenges) | |
| `entry_id` | uuid (FK → daily_entries) | Nullable |
| `action` | text | `'daily_entry'`, `'streak_3'`, `'streak_7'`, `'streak_14'`, `'streak_30'`, `'first_entry'` |
| `points` | integer | |
| `created_at` | timestamptz | |

Denormalized totals in `profiles.points_total` and `challenge_participants.points_earned` can be recalculated from this table if needed. The Server Action checks for existing `points_log` entries to prevent duplicate bonus awards (e.g., same streak milestone awarded twice).

### `motivational_quotes`
Quotes pool.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `text` | text | |
| `author` | text | Nullable |
| `context` | text | `'daily'`, `'streak_lost'`, `'streak_milestone'`, `'rank_up'`, `'entry_submitted'` |

## Pages & Routes

```
/                              Landing (unauthenticated) / redirect to dashboard (authenticated)
/login                         Email/password login
/signup                        Account creation
/dashboard                     Main dashboard (streak, points, rank, active challenges, daily quote, quick entry, recent badges)
/challenges                    Challenge list (active, upcoming, completed tabs)
/challenges/[id]               Challenge detail (description, participants, leaderboard, data)
/challenges/[id]/entry         Daily entry (quick mode or wizard mode)
/challenges/[id]/history       Personal history on this challenge
/profile                       Own profile (stats, badges, challenge history, settings)
/profile/[userId]              Public profile of another user
/admin                         Admin panel
/admin/challenges/new          Create challenge (title, duration, custom fields builder)
/admin/challenges/[id]/edit    Edit challenge
/admin/badges                  Manage badges
/admin/quotes                  Manage motivational quotes
```

### Layouts

- **(public)** — Landing, login, signup. No sidebar.
- **(app)** — Dashboard, challenges, profile. Sidebar nav + topbar with avatar/points.
- **(admin)** — Same as app + admin badge + admin nav links.

## Points System

| Action | Points |
|--------|--------|
| Daily entry submitted | +10 |
| 3-day streak bonus | +15 |
| 7-day streak bonus | +30 |
| 14-day streak bonus | +50 |
| 30-day streak (full challenge) | +100 |
| First entry on a challenge | +5 |

Points are calculated in the Server Action on entry submission. Totals are denormalized into `challenge_participants.points_earned` and `profiles.points_total`. All transactions are logged in `points_log` for audit and recalculation.

### Streak Rules

- **Timezone:** All dates are based on UTC. `entry_date` is a UTC date.
- **Streak increment:** On entry submission, if the user has an entry for `entry_date - 1 day`, increment `current_streak`. Otherwise, reset `current_streak` to 1.
- **Streak reset:** No cron job needed. The streak is evaluated on each submission. If a user misses a day and submits the next day, the gap is detected and the streak resets to 1.
- **`best_streak`:** Updated to `MAX(current_streak, best_streak)` on each submission.
- **Streak bonuses:** Awarded when `current_streak` reaches exactly 3, 7, 14, or 30. The `points_log` table is checked to prevent duplicate bonus awards for the same milestone on the same challenge.

### Challenge Status Transitions

```
draft → active → completed
```

- **draft → active:** Manual (admin clicks "Publier"). Users cannot join a draft challenge.
- **active → completed:** Automatic when `end_date` is reached. Checked on page load (lazy evaluation). A daily Vercel Cron job also runs to transition overdue challenges and evaluate "Podium" badges for completed challenges.
- **completed → active:** Not allowed. A completed challenge is final.
- **draft → deleted:** Admin can delete a draft with no participants. Not a status — actual row deletion.

## Badges

| Badge | Condition |
|-------|-----------|
| Premier pas | First entry ever |
| En feu | 7-day streak |
| Inarretable | 14-day streak |
| Finisher | 100% challenge completion |
| Assidu | 3 challenges completed |
| Veteran | 10 challenges completed |
| Podium | Top 3 in a challenge |
| Challenger | Joined 5 challenges |

Admin can create custom badges from the admin panel. Badge checks run after each entry submission via Server Action using `service_role` key.

## Leaderboard

- Per challenge: ranked by `challenge_participants.points_earned`
- Global: ranked by `profiles.points_total`
- Refreshed on page load (no realtime for V1)

## UX & Interactions

### Quick Entry (default)
- Single screen with all challenge fields for the day
- Pre-filled if already submitted today (edit mode, same day only)
- "Valider" button at bottom
- Success: confetti explosion (`canvas-confetti`), green neon toast via `sonner`, contextual motivational message
- Streak milestone: golden confetti + special toast + animated badge unlock (scale + neon glow)
- Error: red toast with shake animation, encouraging message

### Wizard Mode (opt-in via profile settings)
- One field per screen, progress bar at top
- Slide transitions between steps
- Same success/error feedback as quick entry

### Animations & Feedback
- Confetti: `canvas-confetti`
- Toasts: `sonner` (dark theme)
- Page transitions: CSS fade/slide
- Dashboard counters: animated increment (points, streak)
- Badge unlock: scale + neon green glow animation

### Motivational Quotes
- Dashboard: daily quote, random per-user per-day (seeded by `hash(user_id + date)`), changes at midnight UTC
- Contextual: random message from matching context pool on each action
- Fallback: if no quote exists for a specific context, fall back to the `'daily'` pool

## Design Direction

**Dark & Intense** — Sport-forward aesthetic.

- Background: `#0a0a0a` to `#1a1a1a`
- Primary accent: neon green `#00ff87`
- Secondary accent: orange `#ff6b00`
- Text: white `#ffffff`, muted `#666666`
- Cards: `#141414` with `#222222` borders
- Typography: bold weights (700-900), tight letter-spacing
- Border radius: 10-12px on cards
- Gradients on hero elements (green to darker green)

## Security — Row Level Security

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `profiles` | All (public profiles) | Auto (trigger on signup) | Owner only | Never |
| `challenges` | All | Admin only | Admin only | Admin only |
| `challenge_fields` | All | Admin only | Admin only | Admin only |
| `challenge_participants` | All (leaderboard) | Authenticated (self) | Owner only | Owner only |
| `daily_entries` | Challenge participants | Owner only | Owner only (same day) | Admin only |
| `entry_values` | Challenge participants | Owner only | Owner only (same day) | Admin only |
| `points_log` | Owner only | System only (service role) | Never | Admin only |
| `badges` | All | Admin only | Admin only | Admin only |
| `user_badges` | All (public) | System only (service role) | Never | Admin only |
| `motivational_quotes` | All | Admin only | Admin only | Admin only |

Key rules:
- Entry editing restricted to same day only
- Badge attribution via Server Action with `service_role` (not client-manipulable)
- `is_admin` flag checked server-side in Server Actions + RLS policies. The RLS UPDATE policy on `profiles` explicitly excludes `is_admin` from user-updatable columns.
- Storage: per-challenge buckets, read access for participants, server-side MIME validation on upload
- Admin can DELETE entries and entry values for data correction

## Tech Stack

| Need | Choice |
|------|--------|
| Framework | Next.js 16 (App Router, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| DB + Auth + Storage | Supabase (`@supabase/supabase-js` + `@supabase/ssr`) |
| Validation | Zod |
| Forms | React Hook Form + Zod resolver |
| Toasts | Sonner |
| Confetti | canvas-confetti |
| Icons | Lucide React |
| Charts | Recharts |
| Dates | date-fns |

## Project Structure

```
defi_de_con/
├── app/
│   ├── (public)/              # Landing, login, signup — no sidebar
│   ├── (app)/                 # Dashboard, challenges, profile — sidebar + topbar
│   │   ├── dashboard/
│   │   ├── challenges/
│   │   └── profile/
│   └── (admin)/               # Admin panel — admin nav
│       └── admin/
├── components/
│   ├── ui/                    # Button, Input, Card, Toast, etc.
│   ├── challenges/            # Challenge-specific components
│   ├── dashboard/             # Dashboard widgets
│   └── layout/                # Sidebar, Topbar, etc.
├── lib/
│   ├── supabase/              # Client, server, middleware, types
│   ├── actions/               # Server Actions
│   ├── validations/           # Zod schemas
│   └── utils/                 # Points calc, date formatting, quotes, etc.
├── public/
│   └── badges/                # Badge SVG icons
└── types/                     # Global TypeScript types
```

## Pagination

- Challenge list, leaderboard, history pages: offset-based pagination, 20 items per page
- Index on `profiles.points_total DESC` for global leaderboard
- Index on `challenge_participants.points_earned DESC` for per-challenge leaderboard

## Notifications

- V1: In-app toasts only at key moments
- No push notifications for V1

## Database Migrations

Managed via Supabase CLI (`supabase migration new`, `supabase db push`). Migration files stored in `supabase/migrations/` at project root.
