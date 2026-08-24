create table if not exists wallet_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider_pass_id text not null,
  wallet_kind wallet_kind not null,
  event text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists wallet_sync_attempts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  customer_id uuid references customers(id),
  provider_pass_id text not null,
  status text not null,
  error text,
  created_at timestamptz not null default now()
);

create table if not exists campaign_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id),
  customer_id uuid not null references customers(id),
  status text not null default 'queued',
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (campaign_id, customer_id)
);

alter table wallet_webhook_events enable row level security;
alter table wallet_sync_attempts enable row level security;
alter table campaign_deliveries enable row level security;

insert into tenants (id, slug, name, category, city, country, plan)
values (
  '11111111-1111-1111-1111-111111111111',
  'kin-coffee',
  'Kin Coffee Club',
  'cafe',
  'Kuala Lumpur',
  'Malaysia',
  'trial'
)
on conflict (slug) do nothing;

insert into programs (
  id,
  tenant_id,
  name,
  type,
  stamps_required,
  reward,
  brand,
  terms,
  inactive_winback_days
)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Morning Regulars',
  'stamp',
  8,
  'Free signature drink',
  '{"brandColor":"#243C2F","accentColor":"#FFB454","backgroundColor":"#F5F0E7","logoText":"KIN"}'::jsonb,
  'One stamp per visit. Reward cannot be exchanged for cash.',
  21
)
on conflict do nothing;

insert into profiles (id, email, name)
values (
  '33333333-3333-3333-3333-333333333333',
  'owner@kin.example',
  'Aisha Wong'
)
on conflict (id) do nothing;

insert into memberships (tenant_id, profile_id, role)
values (
  '11111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333333',
  'owner'
)
on conflict (tenant_id, profile_id) do nothing;

insert into campaigns (tenant_id, name, trigger, message)
values (
  '11111111-1111-1111-1111-111111111111',
  'Inactive member win-back',
  'inactive_21_days',
  'We miss you. Your next visit gets a bonus stamp.'
)
on conflict do nothing;
