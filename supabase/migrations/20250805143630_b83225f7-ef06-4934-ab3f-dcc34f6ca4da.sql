
-- Enable Row Level Security on all critical tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Create security definer functions to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_pm()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'pm'));
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- User policies - users can view their own profile and admins can view all
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any user"
  ON public.users FOR UPDATE
  USING (public.is_admin());

-- Project policies - users can see projects they created or manage, admins see all
CREATE POLICY "Users can view their projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = created_by OR auth.uid() = manager_id OR public.is_admin());

CREATE POLICY "Users can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Project managers and creators can update projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = created_by OR auth.uid() = manager_id OR public.is_admin());

CREATE POLICY "Project managers and creators can delete projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = created_by OR auth.uid() = manager_id OR public.is_admin());

-- Task policies - users can see tasks in projects they have access to
CREATE POLICY "Users can view project tasks"
  ON public.tasks FOR SELECT
  USING (
    EXISTS(
      SELECT 1 FROM public.projects 
      WHERE id = tasks.project_id 
      AND (created_by = auth.uid() OR manager_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can create tasks in their projects"
  ON public.tasks FOR INSERT
  WITH CHECK (
    EXISTS(
      SELECT 1 FROM public.projects 
      WHERE id = tasks.project_id 
      AND (created_by = auth.uid() OR manager_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can update tasks in their projects"
  ON public.tasks FOR UPDATE
  USING (
    EXISTS(
      SELECT 1 FROM public.projects 
      WHERE id = tasks.project_id 
      AND (created_by = auth.uid() OR manager_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can delete tasks in their projects"
  ON public.tasks FOR DELETE
  USING (
    EXISTS(
      SELECT 1 FROM public.projects 
      WHERE id = tasks.project_id 
      AND (created_by = auth.uid() OR manager_id = auth.uid() OR public.is_admin())
    )
  );

-- Budget policies - similar to tasks, tied to project access
CREATE POLICY "Users can view project budgets"
  ON public.budgets FOR SELECT
  USING (
    EXISTS(
      SELECT 1 FROM public.projects 
      WHERE id = budgets.project_id 
      AND (created_by = auth.uid() OR manager_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can create budgets in their projects"
  ON public.budgets FOR INSERT
  WITH CHECK (
    EXISTS(
      SELECT 1 FROM public.projects 
      WHERE id = budgets.project_id 
      AND (created_by = auth.uid() OR manager_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can update budgets in their projects"
  ON public.budgets FOR UPDATE
  USING (
    EXISTS(
      SELECT 1 FROM public.projects 
      WHERE id = budgets.project_id 
      AND (created_by = auth.uid() OR manager_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can delete budgets in their projects"
  ON public.budgets FOR DELETE
  USING (
    EXISTS(
      SELECT 1 FROM public.projects 
      WHERE id = budgets.project_id 
      AND (created_by = auth.uid() OR manager_id = auth.uid() OR public.is_admin())
    )
  );

-- Cost entry policies - similar to tasks and budgets
CREATE POLICY "Users can view project cost entries"
  ON public.cost_entries FOR SELECT
  USING (
    EXISTS(
      SELECT 1 FROM public.projects 
      WHERE id = cost_entries.project_id 
      AND (created_by = auth.uid() OR manager_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can create cost entries in their projects"
  ON public.cost_entries FOR INSERT
  WITH CHECK (
    EXISTS(
      SELECT 1 FROM public.projects 
      WHERE id = cost_entries.project_id 
      AND (created_by = auth.uid() OR manager_id = auth.uid() OR public.is_admin())
    ) AND auth.uid() = created_by
  );

CREATE POLICY "Users can update cost entries in their projects"
  ON public.cost_entries FOR UPDATE
  USING (
    EXISTS(
      SELECT 1 FROM public.projects 
      WHERE id = cost_entries.project_id 
      AND (created_by = auth.uid() OR manager_id = auth.uid() OR public.is_admin())
    ) AND auth.uid() = created_by
  );

CREATE POLICY "Users can delete cost entries in their projects"
  ON public.cost_entries FOR DELETE
  USING (
    EXISTS(
      SELECT 1 FROM public.projects 
      WHERE id = cost_entries.project_id 
      AND (created_by = auth.uid() OR manager_id = auth.uid() OR public.is_admin())
    ) AND auth.uid() = created_by
  );

-- Milestone policies - similar to other project-related entities
CREATE POLICY "Users can view project milestones"
  ON public.milestones FOR SELECT
  USING (
    EXISTS(
      SELECT 1 FROM public.projects 
      WHERE id = milestones.project_id 
      AND (created_by = auth.uid() OR manager_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can create milestones in their projects"
  ON public.milestones FOR INSERT
  WITH CHECK (
    EXISTS(
      SELECT 1 FROM public.projects 
      WHERE id = milestones.project_id 
      AND (created_by = auth.uid() OR manager_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can update milestones in their projects"
  ON public.milestones FOR UPDATE
  USING (
    EXISTS(
      SELECT 1 FROM public.projects 
      WHERE id = milestones.project_id 
      AND (created_by = auth.uid() OR manager_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can delete milestones in their projects"
  ON public.milestones FOR DELETE
  USING (
    EXISTS(
      SELECT 1 FROM public.projects 
      WHERE id = milestones.project_id 
      AND (created_by = auth.uid() OR manager_id = auth.uid() OR public.is_admin())
    )
  );

-- Create trigger to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create audit logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  user_id UUID,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- For now, just log to PostgreSQL logs
  -- In production, you would insert into an audit table
  RAISE LOG 'SECURITY_EVENT: % by % on %:% - %', event_type, user_id, resource_type, resource_id, details;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
