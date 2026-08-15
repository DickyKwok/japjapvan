create table if not exists week_plans (
  user_id text not null,
  week text not null,
  payload text not null,
  updated_at timestamptz default CURRENT_TIMESTAMP not null,
  primary key (user_id, week)
);
