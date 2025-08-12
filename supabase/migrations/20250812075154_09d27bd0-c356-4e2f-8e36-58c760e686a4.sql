
-- Enable RLS and create policies for budget_categories
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view budget categories" 
  ON public.budget_categories 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage budget categories" 
  ON public.budget_categories 
  FOR ALL 
  USING (public.is_admin());

-- Enable RLS and create policies for budget_lines
ALTER TABLE public.budget_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view budget lines for their projects" 
  ON public.budget_lines 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.budgets b 
      JOIN public.projects p ON b.project_id = p.id 
      WHERE b.id = budget_id 
      AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can manage budget lines for their projects" 
  ON public.budget_lines 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.budgets b 
      JOIN public.projects p ON b.project_id = p.id 
      WHERE b.id = budget_id 
      AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR public.is_admin())
    )
  );

-- Enable RLS and create policies for budget_subcategories
ALTER TABLE public.budget_subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view budget subcategories" 
  ON public.budget_subcategories 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage budget subcategories" 
  ON public.budget_subcategories 
  FOR ALL 
  USING (public.is_admin());

-- Enable RLS and create policies for companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view companies" 
  ON public.companies 
  FOR SELECT 
  USING (true);

CREATE POLICY "PMs can manage companies" 
  ON public.companies 
  FOR ALL 
  USING (public.is_pm());

-- Enable RLS and create policies for contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view contacts" 
  ON public.contacts 
  FOR SELECT 
  USING (true);

CREATE POLICY "PMs can manage contacts" 
  ON public.contacts 
  FOR ALL 
  USING (public.is_pm());

-- Enable RLS and create policies for cost_entry_lines
ALTER TABLE public.cost_entry_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cost entry lines for their projects" 
  ON public.cost_entry_lines 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.cost_entries ce 
      JOIN public.projects p ON ce.project_id = p.id 
      WHERE ce.id = cost_entry_id 
      AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can manage cost entry lines for their projects" 
  ON public.cost_entry_lines 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.cost_entries ce 
      JOIN public.projects p ON ce.project_id = p.id 
      WHERE ce.id = cost_entry_id 
      AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR public.is_admin())
    )
  );

-- Enable RLS and create policies for cost_posting_lines
ALTER TABLE public.cost_posting_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cost posting lines for their projects" 
  ON public.cost_posting_lines 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.cost_postings cp 
      JOIN public.projects p ON cp.project_id = p.id 
      WHERE cp.id = cost_posting_id 
      AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can manage cost posting lines for their projects" 
  ON public.cost_posting_lines 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.cost_postings cp 
      JOIN public.projects p ON cp.project_id = p.id 
      WHERE cp.id = cost_posting_id 
      AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR public.is_admin())
    )
  );

-- Enable RLS and create policies for cost_postings
ALTER TABLE public.cost_postings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cost postings for their projects" 
  ON public.cost_postings 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can manage cost postings for their projects" 
  ON public.cost_postings 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR public.is_admin())
    )
  );

-- Enable RLS and create policies for currencies
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view currencies" 
  ON public.currencies 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage currencies" 
  ON public.currencies 
  FOR ALL 
  USING (public.is_admin());

-- Enable RLS and create policies for customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view customers" 
  ON public.customers 
  FOR SELECT 
  USING (true);

CREATE POLICY "PMs can manage customers" 
  ON public.customers 
  FOR ALL 
  USING (public.is_pm());

-- Enable RLS and create policies for milestone_comments
ALTER TABLE public.milestone_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view milestone comments for their projects" 
  ON public.milestone_comments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.milestones m 
      JOIN public.projects p ON m.project_id = p.id 
      WHERE m.id = milestone_id 
      AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can manage milestone comments for their projects" 
  ON public.milestone_comments 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.milestones m 
      JOIN public.projects p ON m.project_id = p.id 
      WHERE m.id = milestone_id 
      AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR public.is_admin())
    )
  );

-- Enable RLS and create policies for milestone_tasks
ALTER TABLE public.milestone_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view milestone tasks for their projects" 
  ON public.milestone_tasks 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t 
      JOIN public.projects p ON t.project_id = p.id 
      WHERE t.id = task_id 
      AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can manage milestone tasks for their projects" 
  ON public.milestone_tasks 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t 
      JOIN public.projects p ON t.project_id = p.id 
      WHERE t.id = task_id 
      AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR public.is_admin())
    )
  );

-- Enable RLS and create policies for priorities
ALTER TABLE public.priorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view priorities" 
  ON public.priorities 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage priorities" 
  ON public.priorities 
  FOR ALL 
  USING (public.is_admin());

-- Enable RLS and create policies for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view products" 
  ON public.products 
  FOR SELECT 
  USING (true);

CREATE POLICY "PMs can manage products" 
  ON public.products 
  FOR ALL 
  USING (public.is_pm());

-- Enable RLS and create policies for project_categories
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project categories" 
  ON public.project_categories 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage project categories" 
  ON public.project_categories 
  FOR ALL 
  USING (public.is_admin());

-- Enable RLS and create policies for project_phases
ALTER TABLE public.project_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project phases" 
  ON public.project_phases 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage project phases" 
  ON public.project_phases 
  FOR ALL 
  USING (public.is_admin());

-- Enable RLS and create policies for project_stages
ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project stages" 
  ON public.project_stages 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage project stages" 
  ON public.project_stages 
  FOR ALL 
  USING (public.is_admin());

-- Enable RLS and create policies for project_status
ALTER TABLE public.project_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project status" 
  ON public.project_status 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage project status" 
  ON public.project_status 
  FOR ALL 
  USING (public.is_admin());

-- Enable RLS and create policies for project_subcategories
ALTER TABLE public.project_subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project subcategories" 
  ON public.project_subcategories 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage project subcategories" 
  ON public.project_subcategories 
  FOR ALL 
  USING (public.is_admin());

-- Enable RLS and create policies for project_types
ALTER TABLE public.project_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project types" 
  ON public.project_types 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage project types" 
  ON public.project_types 
  FOR ALL 
  USING (public.is_admin());

-- Enable RLS and create policies for task_dependencies
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view task dependencies for their projects" 
  ON public.task_dependencies 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t 
      JOIN public.projects p ON t.project_id = p.id 
      WHERE t.id = task_id 
      AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can manage task dependencies for their projects" 
  ON public.task_dependencies 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t 
      JOIN public.projects p ON t.project_id = p.id 
      WHERE t.id = task_id 
      AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR public.is_admin())
    )
  );

-- Enable RLS and create policies for task_status
ALTER TABLE public.task_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view task status" 
  ON public.task_status 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage task status" 
  ON public.task_status 
  FOR ALL 
  USING (public.is_admin());

-- Enable RLS and create policies for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can manage user roles" 
  ON public.user_roles 
  FOR ALL 
  USING (public.is_admin());

-- Fix database function security by adding proper search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER 
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT role FROM public.users WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin');
$function$;

CREATE OR REPLACE FUNCTION public.is_pm()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'pm'));
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'viewer'
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_security_event(event_type text, user_id uuid, resource_type text, resource_id text, details jsonb DEFAULT NULL::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- For now, just log to PostgreSQL logs
  -- In production, you would insert into an audit table
  RAISE LOG 'SECURITY_EVENT: % by % on %:% - %', event_type, user_id, resource_type, resource_id, details;
END;
$function$;
