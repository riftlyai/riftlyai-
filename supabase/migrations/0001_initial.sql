create extension if not exists "pgcrypto";

create table if not exists public.brokers (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text,
  phone text,
  company text,
  timezone text,
  calendar_id text,
  preferences jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  broker_id uuid not null references public.brokers (id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  phone text,
  status text not null default 'new' check (
    status in ('new', 'contacted', 'qualified', 'booked', 'closed', 'unresponsive')
  ),
  source text,
  intent_score numeric,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  broker_id uuid not null references public.brokers (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  scheduled_at timestamptz not null,
  meeting_link text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.conversation_logs (
  id uuid primary key default gen_random_uuid(),
  broker_id uuid not null references public.brokers (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  transcript text not null,
  summary text,
  qualification_score numeric,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  event_type text not null,
  payload jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.brokers enable row level security;
alter table public.leads enable row level security;
alter table public.bookings enable row level security;
alter table public.conversation_logs enable row level security;
alter table public.lead_events enable row level security;

create policy "Brokers can manage own profile"
  on public.brokers
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Brokers read own leads"
  on public.leads
  for select
  using (auth.uid() = broker_id);

create policy "Brokers manage own leads"
  on public.leads
  for all
  using (auth.uid() = broker_id)
  with check (auth.uid() = broker_id);

create policy "Brokers read own bookings"
  on public.bookings
  for select
  using (auth.uid() = broker_id);

create policy "Brokers manage own bookings"
  on public.bookings
  for all
  using (auth.uid() = broker_id)
  with check (auth.uid() = broker_id);

create policy "Brokers read own conversations"
  on public.conversation_logs
  for select
  using (auth.uid() = broker_id);

create policy "Brokers manage own conversations"
  on public.conversation_logs
  for all
  using (auth.uid() = broker_id)
  with check (auth.uid() = broker_id);

create policy "Brokers read logs linked to their leads"
  on public.lead_events
  for select
  using (
    exists (
      select 1
      from public.leads leads
      where leads.id = lead_events.lead_id
        and leads.broker_id = auth.uid()
    )
  );

create policy "Brokers insert logs for their leads"
  on public.lead_events
  for insert
  with check (
    exists (
      select 1
      from public.leads leads
      where leads.id = lead_events.lead_id
        and leads.broker_id = auth.uid()
    )
  );
