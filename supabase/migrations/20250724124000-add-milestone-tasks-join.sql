-- Migration: Add achieved_date, is_achieved to milestones and create milestone_tasks join table

alter table milestones
  add column if not exists achieved_date date,
  add column if not exists is_achieved boolean default false;

create table if not exists milestone_tasks (
  id uuid primary key default uuid_generate_v4(),
  milestone_id uuid references milestones(id) on delete cascade,
  task_id uuid references tasks(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique (milestone_id, task_id)
);

-- Optional: notes/comments table for milestone discussions
create table if not exists milestone_comments (
  id uuid primary key default uuid_generate_v4(),
  milestone_id uuid references milestones(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  content text,
  created_at timestamp with time zone default now()
);
