
-- Phase 1: Enable Row Level Security on all unprotected tables and fix database functions

-- Enable RLS on all tables that currently don't have it
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_posting_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for dimension tables (admin/PM access)
CREATE POLICY "Admin and PM can manage budget categories" ON public.budget_categories FOR ALL USING (is_pm());
CREATE POLICY "Admin and PM can manage budget subcategories" ON public.budget_subcategories FOR ALL USING (is_pm());
CREATE POLICY "Admin and PM can manage companies" ON public.companies FOR ALL USING (is_pm());
CREATE POLICY "Admin and PM can manage currencies" ON public.currencies FOR ALL USING (is_pm());
CREATE POLICY "Admin and PM can manage priorities" ON public.priorities FOR ALL USING (is_pm());
CREATE POLICY "Admin and PM can manage products" ON public.products FOR ALL USING (is_pm());
CREATE POLICY "Admin and PM can manage project categories" ON public.project_categories FOR ALL USING (is_pm());
CREATE POLICY "Admin and PM can manage project phases" ON public.project_phases FOR ALL USING (is_pm());
CREATE POLICY "Admin and PM can manage project stages" ON public.project_stages FOR ALL USING (is_pm());
CREATE POLICY "Admin and PM can manage project status" ON public.project_status FOR ALL USING (is_pm());
CREATE POLICY "Admin and PM can manage project subcategories" ON public.project_subcategories FOR ALL USING (is_pm());
CREATE POLICY "Admin and PM can manage project types" ON public.project_types FOR ALL USING (is_pm());
CREATE POLICY "Admin and PM can manage task status" ON public.task_status FOR ALL USING (is_pm());

-- Allow all authenticated users to read dimension tables
CREATE POLICY "Users can view budget categories" ON public.budget_categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view budget subcategories" ON public.budget_subcategories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view companies" ON public.companies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view currencies" ON public.currencies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view priorities" ON public.priorities FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view products" ON public.products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view project categories" ON public.project_categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view project phases" ON public.project_phases FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view project stages" ON public.project_stages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view project status" ON public.project_status FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view project subcategories" ON public.project_subcategories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view project types" ON public.project_types FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view task status" ON public.task_status FOR SELECT USING (auth.role() = 'authenticated');

-- Project-specific data policies
CREATE POLICY "Users can view project contacts" ON public.contacts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.customers c 
    JOIN public.projects p ON p.customer_id = c.id
    WHERE c.id = contacts.customer_id 
    AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR is_admin())
  )
);

CREATE POLICY "Users can view project customers" ON public.customers FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.customer_id = customers.id 
    AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR is_admin())
  )
);

-- Budget and cost entry line policies
CREATE POLICY "Users can manage budget lines in their projects" ON public.budget_lines FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.budgets b
    JOIN public.projects p ON p.id = b.project_id
    WHERE b.id = budget_lines.budget_id
    AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR is_admin())
  )
);

CREATE POLICY "Users can manage cost entry lines in their projects" ON public.cost_entry_lines FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.cost_entries ce
    JOIN public.projects p ON p.id = ce.project_id
    WHERE ce.id = cost_entry_lines.cost_entry_id
    AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR is_admin())
  )
);

-- Cost posting policies
CREATE POLICY "Users can manage cost postings in their projects" ON public.cost_postings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = cost_postings.project_id
    AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR is_admin())
  )
);

CREATE POLICY "Users can manage cost posting lines for their postings" ON public.cost_posting_lines FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.cost_postings cp
    JOIN public.projects p ON p.id = cp.project_id
    WHERE cp.id = cost_posting_lines.cost_posting_id
    AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR is_admin())
  )
);

-- Milestone policies
CREATE POLICY "Users can manage milestone comments in their projects" ON public.milestone_comments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.milestones m
    JOIN public.projects p ON p.id = m.project_id
    WHERE m.id = milestone_comments.milestone_id
    AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR is_admin())
  )
);

CREATE POLICY "Users can manage milestone tasks in their projects" ON public.milestone_tasks FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.milestones m
    JOIN public.projects p ON p.id = m.project_id
    WHERE m.id = milestone_tasks.milestone_id
    AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR is_admin())
  )
);

-- Task dependency policies
CREATE POLICY "Users can manage task dependencies in their projects" ON public.task_dependencies FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.projects p ON p.id = t.project_id
    WHERE t.id = task_dependencies.task_id
    AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR is_admin())
  )
);

-- User roles - only admins can manage
CREATE POLICY "Only admins can manage user roles" ON public.user_roles FOR ALL USING (is_admin());
CREATE POLICY "Users can view user roles" ON public.user_roles FOR SELECT USING (auth.role() = 'authenticated');

-- Fix role escalation vulnerability by preventing users from changing their own role
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (
  auth.uid() = id AND 
  -- Prevent role changes unless user is admin
  (OLD.role = NEW.role OR is_admin())
);

-- Fix database functions to include proper search_path security
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT role FROM public.users WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin');
$function$;

CREATE OR REPLACE FUNCTION public.is_pm()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'pm'));
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
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
 SET search_path = public
AS $function$
BEGIN
  -- For now, just log to PostgreSQL logs
  -- In production, you would insert into an audit table
  RAISE LOG 'SECURITY_EVENT: % by % on %:% - %', event_type, user_id, resource_type, resource_id, details;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
