-- Daily goals per challenge field (set via Excel import by admin)
create table challenge_goals (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references challenges(id) on delete cascade not null,
  field_id uuid references challenge_fields(id) on delete cascade not null,
  goal_date date not null,
  target_value numeric not null,
  unique (challenge_id, field_id, goal_date)
);

alter table challenge_goals enable row level security;

create policy "Goals viewable by everyone"
  on challenge_goals for select using (true);

create policy "Admins can insert goals"
  on challenge_goals for insert with check (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update goals"
  on challenge_goals for update using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete goals"
  on challenge_goals for delete using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create index idx_challenge_goals_lookup on challenge_goals (challenge_id, field_id, goal_date);
