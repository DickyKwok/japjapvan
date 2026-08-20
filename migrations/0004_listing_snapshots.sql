create table if not exists listing_snapshots (
  day date primary key,
  generated_at timestamptz not null default CURRENT_TIMESTAMP,
  payload text not null
);

create table if not exists cron_cursor (
  id text primary key,
  payload text not null,
  updated_at timestamptz not null default CURRENT_TIMESTAMP
);
