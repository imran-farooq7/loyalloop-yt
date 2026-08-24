create extension if not exists "pgcrypto";

create type member_role as enum ('owner', 'manager', 'staff');
create type program_type as enum ('stamp');
create type wallet_kind as enum ('apple', 'google');
create type stamp_event_type as enum ('stamp_added', 'reward_redeemed', 'reversal');

create table tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  city text not null,
  country text not null,
  plan text not null default 'trial',
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key,
  email text not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  profile_id uuid not null references profiles(id),
  role member_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, profile_id)
);

create table programs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  name text not null,
  type program_type not null default 'stamp',
  stamps_required integer not null default 8,
  reward text not null,
  brand jsonb not null,
  terms text not null,
  inactive_winback_days integer not null default 21,
  created_at timestamptz not null default now()
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  email text not null,
  name text,
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  last_visit_at timestamptz,
  unique (tenant_id, email)
);

create table wallet_passes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  customer_id uuid not null references customers(id),
  program_id uuid not null references programs(id),
  wallet_kind wallet_kind not null,
  provider_pass_id text not null,
  member_token text not null unique,
  stamps integer not null default 0,
  installed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (wallet_kind, provider_pass_id)
);

create table stamp_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  customer_id uuid not null references customers(id),
  staff_profile_id uuid references profiles(id),
  type stamp_event_type not null,
  stamps_delta integer not null default 0,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  name text not null,
  trigger text not null,
  message text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table tenants enable row level security;
alter table profiles enable row level security;
alter table memberships enable row level security;
alter table programs enable row level security;
alter table customers enable row level security;
alter table wallet_passes enable row level security;
alter table stamp_events enable row level security;
alter table campaigns enable row level security;

create policy tenant_member_read on tenants
  for select using (
    exists (
      select 1 from memberships
      where memberships.tenant_id = tenants.id
        and memberships.profile_id = auth.uid()
        and memberships.active = true
    )
  );

create policy membership_tenant_read on memberships
  for select using (
    exists (
      select 1 from memberships m
      where m.tenant_id = memberships.tenant_id
        and m.profile_id = auth.uid()
        and m.active = true
    )
  );

create policy program_tenant_read on programs
  for select using (
    exists (
      select 1 from memberships
      where memberships.tenant_id = programs.tenant_id
        and memberships.profile_id = auth.uid()
        and memberships.active = true
    )
  );

create policy customers_tenant_read on customers
  for select using (
    exists (
      select 1 from memberships
      where memberships.tenant_id = customers.tenant_id
        and memberships.profile_id = auth.uid()
        and memberships.active = true
    )
  );

create policy wallet_passes_tenant_read on wallet_passes
  for select using (
    exists (
      select 1 from memberships
      where memberships.tenant_id = wallet_passes.tenant_id
        and memberships.profile_id = auth.uid()
        and memberships.active = true
    )
  );

create policy stamp_events_tenant_read on stamp_events
  for select using (
    exists (
      select 1 from memberships
      where memberships.tenant_id = stamp_events.tenant_id
        and memberships.profile_id = auth.uid()
        and memberships.active = true
    )
  );
