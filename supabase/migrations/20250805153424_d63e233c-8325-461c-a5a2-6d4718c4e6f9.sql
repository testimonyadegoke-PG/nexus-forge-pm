
-- Add access rights system
CREATE TABLE public.access_rights (
  id integer NOT NULL DEFAULT nextval('access_rights_id_seq'::regclass) PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  level integer NOT NULL -- 1=Viewer, 2=Commenter, 3=Editor, 4=Administrator
);

CREATE SEQUENCE IF NOT EXISTS access_rights_id_seq;

-- Project access control
CREATE TABLE public.project_access (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  access_right_id integer REFERENCES public.access_rights(id),
  granted_by uuid REFERENCES public.users(id),
  granted_at timestamp with time zone DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Work Breakdown Structure
CREATE TABLE public.wbs_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.wbs_items(id) ON DELETE CASCADE,
  wbs_code text NOT NULL, -- e.g., "1.2.3"
  name text NOT NULL,
  description text,
  level integer NOT NULL DEFAULT 1,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Project baselines
CREATE TABLE public.project_baselines (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  baseline_date date NOT NULL,
  is_current boolean DEFAULT false,
  created_by uuid REFERENCES public.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Task baselines (snapshot of task data at baseline creation)
CREATE TABLE public.task_baselines (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  baseline_id uuid REFERENCES public.project_baselines(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  planned_start_date date,
  planned_end_date date,
  planned_duration integer,
  planned_progress integer DEFAULT 0,
  baseline_cost numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Critical path analysis results
CREATE TABLE public.critical_path_analysis (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  is_critical boolean DEFAULT false,
  total_slack numeric DEFAULT 0,
  free_slack numeric DEFAULT 0,
  early_start date,
  early_finish date,
  late_start date,
  late_finish date,
  analysis_date timestamp with time zone DEFAULT now()
);

-- Resource capacity and allocation
CREATE TABLE public.resource_capacity (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  available_hours numeric DEFAULT 8,
  allocated_hours numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Scheduling alerts
CREATE TABLE public.scheduling_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  milestone_id uuid REFERENCES public.milestones(id) ON DELETE SET NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  alert_type text NOT NULL, -- 'deadline_approaching', 'task_overdue', 'milestone_missed', 'resource_overallocation'
  message text NOT NULL,
  severity text DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  is_read boolean DEFAULT false,
  alert_date timestamp with time zone DEFAULT now(),
  due_date timestamp with time zone
);

-- EVM tracking
CREATE TABLE public.earned_value_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  measurement_date date NOT NULL,
  planned_value numeric DEFAULT 0, -- PV (Budgeted Cost of Work Scheduled)
  earned_value numeric DEFAULT 0, -- EV (Budgeted Cost of Work Performed)  
  actual_cost numeric DEFAULT 0, -- AC (Actual Cost of Work Performed)
  cost_performance_index numeric GENERATED ALWAYS AS (CASE WHEN actual_cost > 0 THEN earned_value / actual_cost ELSE 0 END) STORED, -- CPI = EV/AC
  schedule_performance_index numeric GENERATED ALWAYS AS (CASE WHEN planned_value > 0 THEN earned_value / planned_value ELSE 0 END) STORED, -- SPI = EV/PV
  cost_variance numeric GENERATED ALWAYS AS (earned_value - actual_cost) STORED, -- CV = EV - AC
  schedule_variance numeric GENERATED ALWAYS AS (earned_value - planned_value) STORED, -- SV = EV - PV
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default access rights
INSERT INTO public.access_rights (name, description, level) VALUES
  ('Viewer', 'Can only view the files', 1),
  ('Commenter', 'Can view and comment on the files', 2), 
  ('Editor', 'Can view, comment, organize files, add new files, and edit existing files', 3),
  ('Administrator', 'Full access and can manage members', 4);

-- Enable RLS on new tables
ALTER TABLE public.access_rights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wbs_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.critical_path_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_capacity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduling_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earned_value_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for access_rights (everyone can read, only admins can modify)
CREATE POLICY "Everyone can view access rights" ON public.access_rights FOR SELECT USING (true);
CREATE POLICY "Only admins can modify access rights" ON public.access_rights FOR ALL USING (is_admin());

-- RLS Policies for project_access
CREATE POLICY "Users can view project access for their projects" ON public.project_access 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = project_access.project_id 
      AND (created_by = auth.uid() OR manager_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Project managers can manage project access" ON public.project_access 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = project_access.project_id 
      AND (created_by = auth.uid() OR manager_id = auth.uid() OR is_admin())
    )
  );

-- RLS Policies for WBS (same as project tasks)
CREATE POLICY "Users can view WBS for their projects" ON public.wbs_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = wbs_items.project_id 
      AND (created_by = auth.uid() OR manager_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can manage WBS for their projects" ON public.wbs_items 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = wbs_items.project_id 
      AND (created_by = auth.uid() OR manager_id = auth.uid() OR is_admin())
    )
  );

-- Similar RLS policies for other tables (following same pattern as existing project-related tables)
CREATE POLICY "Users can view baselines for their projects" ON public.project_baselines 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = project_baselines.project_id 
      AND (created_by = auth.uid() OR manager_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can manage baselines for their projects" ON public.project_baselines 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = project_baselines.project_id 
      AND (created_by = auth.uid() OR manager_id = auth.uid() OR is_admin())
    )
  );

-- Add updated_at trigger to new tables
CREATE TRIGGER set_updated_at_wbs_items BEFORE UPDATE ON public.wbs_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_project_baselines BEFORE UPDATE ON public.project_baselines FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Add indexes for performance
CREATE INDEX idx_project_access_project_user ON public.project_access(project_id, user_id);
CREATE INDEX idx_wbs_items_project_parent ON public.wbs_items(project_id, parent_id);
CREATE INDEX idx_critical_path_project ON public.critical_path_analysis(project_id);
CREATE INDEX idx_resource_capacity_user_date ON public.resource_capacity(user_id, date);
CREATE INDEX idx_scheduling_alerts_user_read ON public.scheduling_alerts(user_id, is_read);
