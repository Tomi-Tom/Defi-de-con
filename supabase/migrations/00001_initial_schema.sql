-- Enable pgcrypto for gen_random_uuid()
create extension if not exists "pgcrypto";

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
  id uuid primary key default gen_random_uuid(),
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
  id uuid primary key default gen_random_uuid(),
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
  id uuid primary key default gen_random_uuid(),
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
  id uuid primary key default gen_random_uuid(),
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
  id uuid primary key default gen_random_uuid(),
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
  id uuid primary key default gen_random_uuid(),
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
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  badge_id uuid references badges(id) on delete cascade not null,
  challenge_id uuid references challenges(id) on delete set null,
  earned_at timestamptz not null default now()
);

create unique index idx_user_badges_unique
  on user_badges (user_id, badge_id, coalesce(challenge_id, '00000000-0000-0000-0000-000000000000'));

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
  id uuid primary key default gen_random_uuid(),
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
  id uuid primary key default gen_random_uuid(),
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

-- ============================================
-- increment_points helper function
-- ============================================
create or replace function increment_points(p_user_id uuid, p_challenge_id uuid, p_points integer)
returns void as $$
begin
  update profiles set points_total = points_total + p_points where id = p_user_id;
  update challenge_participants set points_earned = points_earned + p_points where user_id = p_user_id and challenge_id = p_challenge_id;
end;
$$ language plpgsql security definer;
