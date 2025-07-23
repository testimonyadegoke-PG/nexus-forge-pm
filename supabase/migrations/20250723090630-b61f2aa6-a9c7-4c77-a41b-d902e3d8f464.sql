
-- Create users table for authentication and user management
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'pm', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on-hold', 'completed', 'cancelled')),
  created_by UUID REFERENCES public.users(id),
  manager_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration INTEGER NOT NULL DEFAULT 1,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  assignee_id UUID REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'blocked')),
  dependencies TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date),
  CONSTRAINT valid_progress CHECK (progress >= 0 AND progress <= 100)
);

-- Create budgets table
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subcategory TEXT,
  allocated_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT positive_amount CHECK (allocated_amount >= 0)
);

-- Create cost_entries table
CREATE TABLE public.cost_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subcategory TEXT,
  amount DECIMAL(15,2) NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'manual' CHECK (source_type IN ('manual', 'timesheet', 'invoice', 'expense')),
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_projects_created_by ON public.projects(created_by);
CREATE INDEX idx_projects_manager_id ON public.projects(manager_id);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX idx_budgets_project_id ON public.budgets(project_id);
CREATE INDEX idx_cost_entries_project_id ON public.cost_entries(project_id);
CREATE INDEX idx_cost_entries_entry_date ON public.cost_entries(entry_date);

-- Insert sample users
INSERT INTO public.users (id, email, full_name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'sarah.johnson@company.com', 'Sarah Johnson', 'pm'),
  ('550e8400-e29b-41d4-a716-446655440002', 'michael.chen@company.com', 'Michael Chen', 'pm'),
  ('550e8400-e29b-41d4-a716-446655440003', 'emily.rodriguez@company.com', 'Emily Rodriguez', 'pm'),
  ('550e8400-e29b-41d4-a716-446655440004', 'john.doe@company.com', 'John Doe', 'viewer'),
  ('550e8400-e29b-41d4-a716-446655440005', 'jane.smith@company.com', 'Jane Smith', 'admin');

-- Insert sample projects
INSERT INTO public.projects (id, name, description, start_date, end_date, status, created_by, manager_id) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'Office Renovation Project', 'Complete renovation of headquarters including new HVAC, electrical, and interior design', '2024-01-15', '2024-06-30', 'active', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440002', 'ERP System Implementation', 'Deployment of new enterprise resource planning system across all departments', '2024-03-01', '2024-12-15', 'planning', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002'),
  ('650e8400-e29b-41d4-a716-446655440003', 'Marketing Campaign Q2', 'Digital marketing campaign for product launch in Q2 2024', '2024-04-01', '2024-06-30', 'completed', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003');

-- Insert sample tasks
INSERT INTO public.tasks (id, project_id, name, description, start_date, end_date, duration, progress, assignee_id, status, dependencies) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Project Planning & Design', 'Initial project planning and design phase', '2024-01-15', '2024-02-15', 30, 100, '550e8400-e29b-41d4-a716-446655440001', 'completed', '{}'),
  ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'Permit Applications', 'Submit and obtain all necessary permits', '2024-02-01', '2024-02-28', 28, 100, '550e8400-e29b-41d4-a716-446655440002', 'completed', '{"750e8400-e29b-41d4-a716-446655440001"}'),
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 'HVAC Installation', 'Install new HVAC system', '2024-03-01', '2024-04-15', 45, 85, '550e8400-e29b-41d4-a716-446655440004', 'in-progress', '{"750e8400-e29b-41d4-a716-446655440002"}'),
  ('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', 'Electrical Work', 'Electrical system upgrade', '2024-03-15', '2024-05-01', 47, 60, '550e8400-e29b-41d4-a716-446655440004', 'in-progress', '{"750e8400-e29b-41d4-a716-446655440002"}'),
  ('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001', 'Interior Design & Finishing', 'Final interior design and finishing work', '2024-05-01', '2024-06-30', 60, 0, '550e8400-e29b-41d4-a716-446655440003', 'not-started', '{"750e8400-e29b-41d4-a716-446655440003", "750e8400-e29b-41d4-a716-446655440004"}');

-- Insert sample budgets
INSERT INTO public.budgets (project_id, category, subcategory, allocated_amount, description) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'Labor', 'Project Management', 25000, 'Project management costs'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Labor', 'Construction Labor', 70000, 'Construction and installation labor'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Labor', 'Design Services', 25000, 'Architectural and design services'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Materials', 'HVAC Equipment', 35000, 'HVAC system and components'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Materials', 'Electrical Materials', 25000, 'Electrical components and wiring'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Materials', 'Finishing Materials', 20000, 'Paint, flooring, and finishing materials'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Equipment', 'Tools & Equipment', 30000, 'Construction tools and equipment rental'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Overhead', 'Project Overhead', 20000, 'Administrative and overhead costs');

-- Insert sample cost entries
INSERT INTO public.cost_entries (project_id, category, subcategory, amount, source_type, entry_date, description, created_by) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'Labor', 'Project Management', 18000, 'timesheet', '2024-03-15', 'Project management hours through March', '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Labor', 'Construction Labor', 50000, 'timesheet', '2024-03-15', 'Construction labor costs', '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Labor', 'Design Services', 17000, 'invoice', '2024-02-28', 'Architectural design services', '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Materials', 'HVAC Equipment', 30000, 'invoice', '2024-03-01', 'HVAC system purchase', '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Materials', 'Electrical Materials', 15000, 'invoice', '2024-03-10', 'Electrical components', '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Materials', 'Finishing Materials', 10000, 'invoice', '2024-03-20', 'Paint and flooring materials', '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Equipment', 'Tools & Equipment', 20000, 'expense', '2024-03-05', 'Equipment rental', '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Overhead', 'Project Overhead', 10000, 'manual', '2024-03-15', 'Administrative costs', '550e8400-e29b-41d4-a716-446655440001');
