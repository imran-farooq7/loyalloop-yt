alter table tenants
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists billing_status text not null default 'trialing';

create table if not exists onboarding_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  owner_email text not null,
  status text not null default 'created',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists billing_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  stripe_event_id text unique,
  event_type text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table onboarding_events enable row level security;
alter table billing_events enable row level security;
