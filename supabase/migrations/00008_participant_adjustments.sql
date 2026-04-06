-- Adjustments (bonus/malus) on participant goals, set by admin
create table participant_adjustments (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references challenges(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  field_id uuid references challenge_fields(id) on delete cascade not null,
  adjustment numeric not null, -- positive = avance (reduces goals), negative = handicap (increases goals)
  reason text not null default '',
  created_by uuid references profiles(id) not null,
  created_at timestamptz not null default now()
);

alter table participant_adjustments enable row level security;

create policy "Adjustments viewable by participant and admin"
  on participant_adjustments for select using (
    auth.uid() = user_id
    or exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can insert adjustments"
  on participant_adjustments for insert with check (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete adjustments"
  on participant_adjustments for delete using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create index idx_participant_adjustments_lookup on participant_adjustments (challenge_id, user_id, field_id);
