-- Migration: Add budget lines, cost posting lines, and aggregation structure

-- Add name and created_by to budgets
do $$
begin
    if not exists (
        select 1 from information_schema.columns 
        where table_name='budgets' and column_name='name'
    ) then
        alter table budgets add column name varchar(150) not null default 'General';
    end if;
    if not exists (
        select 1 from information_schema.columns 
        where table_name='budgets' and column_name='created_by'
    ) then
        alter table budgets add column created_by uuid references users(id);
    end if;
end$$;

-- Create budget_lines table
create table if not exists budget_lines (
    id uuid primary key default gen_random_uuid(),
    budget_id uuid references budgets(id) on delete cascade not null,
    category varchar(100) not null,
    subcategory varchar(100),
    amount numeric not null,
    description text,
    created_at timestamp with time zone default now()
);

-- Create cost_postings table
create table if not exists cost_postings (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references projects(id) on delete cascade not null,
    created_by uuid references users(id),
    posting_date date not null default current_date,
    description text,
    created_at timestamp with time zone default now()
);

-- Create cost_posting_lines table
create table if not exists cost_posting_lines (
    id uuid primary key default gen_random_uuid(),
    cost_posting_id uuid references cost_postings(id) on delete cascade not null,
    category varchar(100) not null,
    subcategory varchar(100),
    amount numeric not null,
    description text,
    created_at timestamp with time zone default now()
);
