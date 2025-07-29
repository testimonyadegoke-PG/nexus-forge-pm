-- === DIMENSION TABLES ===

-- Project Status
CREATE TABLE IF NOT EXISTS public.project_status (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);
INSERT INTO public.project_status (name) VALUES
  ('planning'), ('active'), ('on-hold'), ('completed'), ('cancelled')
ON CONFLICT DO NOTHING;

-- Task Status
CREATE TABLE IF NOT EXISTS public.task_status (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);
INSERT INTO public.task_status (name) VALUES
  ('not-started'), ('in-progress'), ('completed'), ('blocked')
ON CONFLICT DO NOTHING;

-- Priorities
CREATE TABLE IF NOT EXISTS public.priorities (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  rank INTEGER
);
INSERT INTO public.priorities (name, rank) VALUES
  ('Low', 1), ('Medium', 2), ('High', 3), ('Critical', 4)
ON CONFLICT DO NOTHING;

-- Currencies
CREATE TABLE IF NOT EXISTS public.currencies (
  id SERIAL PRIMARY KEY,
  code CHAR(3) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT
);
INSERT INTO public.currencies (code, name, symbol) VALUES
  ('USD', 'US Dollar', '$'),
  ('EUR', 'Euro', '€'),
  ('GBP', 'Pound Sterling', '£'),
  ('NGN', 'Naira', '₦')
ON CONFLICT DO NOTHING;

-- Project Categories
CREATE TABLE IF NOT EXISTS public.project_categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Project Subcategories
CREATE TABLE IF NOT EXISTS public.project_subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES public.project_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  UNIQUE(category_id, name)
);

-- Project Types
CREATE TABLE IF NOT EXISTS public.project_types (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Project Stages
CREATE TABLE IF NOT EXISTS public.project_stages (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Project Phases
CREATE TABLE IF NOT EXISTS public.project_phases (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Companies
CREATE TABLE IF NOT EXISTS public.companies (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT
);

-- Customers
CREATE TABLE IF NOT EXISTS public.customers (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES public.companies(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT
);

-- Contacts
CREATE TABLE IF NOT EXISTS public.contacts (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES public.customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT
);

-- Budget Categories
CREATE TABLE IF NOT EXISTS public.budget_categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Budget Subcategories
CREATE TABLE IF NOT EXISTS public.budget_subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES public.budget_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  UNIQUE(category_id, name)
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id SERIAL PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  unit_price DECIMAL(15,2) NOT NULL,
  currency_id INTEGER REFERENCES public.currencies(id),
  category_id INTEGER REFERENCES public.budget_categories(id),
  subcategory_id INTEGER REFERENCES public.budget_subcategories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);
INSERT INTO public.user_roles (name) VALUES ('admin'), ('pm'), ('viewer') ON CONFLICT DO NOTHING;

-- === LINE/TRANSACTION TABLES ===

-- Task Dependencies (normalized)
CREATE TABLE IF NOT EXISTS public.task_dependencies (
  id SERIAL PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE
);

-- Budget Lines (normalized, links to products)
CREATE TABLE IF NOT EXISTS public.budget_lines (
  id SERIAL PRIMARY KEY,
  budget_id UUID REFERENCES public.budgets(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.products(id) ON DELETE SET NULL,
  category_id INTEGER REFERENCES public.budget_categories(id),
  subcategory_id INTEGER REFERENCES public.budget_subcategories(id),
  quantity DECIMAL(12,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL,
  total DECIMAL(18,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  description TEXT
);

-- Cost Entry Lines (if cost entries can have multiple lines)
CREATE TABLE IF NOT EXISTS public.cost_entry_lines (
  id SERIAL PRIMARY KEY,
  cost_entry_id UUID REFERENCES public.cost_entries(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.products(id) ON DELETE SET NULL,
  category_id INTEGER REFERENCES public.budget_categories(id),
  subcategory_id INTEGER REFERENCES public.budget_subcategories(id),
  quantity DECIMAL(12,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL,
  total DECIMAL(18,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  description TEXT
);

-- === PATCH: ADD FOREIGN KEYS TO MAIN TABLES FOR DIMENSIONS ===

-- Projects: link to status, stage, category, type, phase, company, customer
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS status_id INTEGER REFERENCES public.project_status(id),
  ADD COLUMN IF NOT EXISTS stage_id INTEGER REFERENCES public.project_stages(id),
  ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES public.project_categories(id),
  ADD COLUMN IF NOT EXISTS type_id INTEGER REFERENCES public.project_types(id),
  ADD COLUMN IF NOT EXISTS phase_id INTEGER REFERENCES public.project_phases(id),
  ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES public.companies(id),
  ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES public.customers(id);

-- Tasks: link to status, priority
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS status_id INTEGER REFERENCES public.task_status(id),
  ADD COLUMN IF NOT EXISTS priority_id INTEGER REFERENCES public.priorities(id);

-- Budgets: link to category, subcategory, currency
ALTER TABLE public.budgets
  ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES public.budget_categories(id),
  ADD COLUMN IF NOT EXISTS subcategory_id INTEGER REFERENCES public.budget_subcategories(id),
  ADD COLUMN IF NOT EXISTS currency_id INTEGER REFERENCES public.currencies(id);

-- Cost Entries: link to category, subcategory, currency
ALTER TABLE public.cost_entries
  ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES public.budget_categories(id),
  ADD COLUMN IF NOT EXISTS subcategory_id INTEGER REFERENCES public.budget_subcategories(id),
  ADD COLUMN IF NOT EXISTS currency_id INTEGER REFERENCES public.currencies(id);

-- Users: link to user_roles
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES public.user_roles(id);

-- Add comments for clarity
COMMENT ON COLUMN public.projects.status_id IS 'FK to project_status table';
COMMENT ON COLUMN public.projects.stage_id IS 'FK to project_stages table';
COMMENT ON COLUMN public.projects.category_id IS 'FK to project_categories table';
COMMENT ON COLUMN public.projects.type_id IS 'FK to project_types table';
COMMENT ON COLUMN public.projects.phase_id IS 'FK to project_phases table';
COMMENT ON COLUMN public.projects.company_id IS 'FK to companies table';
COMMENT ON COLUMN public.projects.customer_id IS 'FK to customers table';
COMMENT ON COLUMN public.tasks.status_id IS 'FK to task_status table';
COMMENT ON COLUMN public.tasks.priority_id IS 'FK to priorities table';
COMMENT ON COLUMN public.budgets.category_id IS 'FK to budget_categories table';
COMMENT ON COLUMN public.budgets.subcategory_id IS 'FK to budget_subcategories table';
COMMENT ON COLUMN public.budgets.currency_id IS 'FK to currencies table';
COMMENT ON COLUMN public.cost_entries.category_id IS 'FK to budget_categories table';
COMMENT ON COLUMN public.cost_entries.subcategory_id IS 'FK to budget_subcategories table';
COMMENT ON COLUMN public.cost_entries.currency_id IS 'FK to currencies table';
COMMENT ON COLUMN public.users.role_id IS 'FK to user_roles table';
