-- Drop existing tables
drop table if exists players;
drop table if exists games;

-- Games table
create table games (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  winner_id uuid,
  created_at timestamptz default now()
);

-- Players table
create table players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade not null,
  name text not null,
  alive boolean default true,
  target_id uuid references players(id),
  original_target_id uuid references players(id),
  killer_id uuid references players(id)
);

-- RLS enabled with permissive policies (no auth needed for this game)
alter table games enable row level security;
alter table players enable row level security;

create policy "Allow all on games" on games for all using (true) with check (true);
create policy "Allow all on players" on players for all using (true) with check (true);
