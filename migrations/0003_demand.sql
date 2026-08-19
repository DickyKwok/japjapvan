create table if not exists demand_bundles (
  id text primary key,
  payload text not null,
  generated_at timestamptz not null default CURRENT_TIMESTAMP,
  method text not null default ''
);
