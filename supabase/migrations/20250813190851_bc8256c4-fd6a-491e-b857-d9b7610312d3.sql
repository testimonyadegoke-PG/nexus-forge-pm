
-- Create purchase_orders table for tracking committed spend
CREATE TABLE public.purchase_orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL,
    task_id UUID NULL,
    po_number TEXT NOT NULL UNIQUE,
    vendor_name TEXT NOT NULL,
    description TEXT,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'received', 'cancelled')),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create purchase_order_lines table for line-item details
CREATE TABLE public.purchase_order_lines (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_order_id UUID NOT NULL,
    budget_line_id INTEGER NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    description TEXT,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add task_id to budget_lines for direct task linking
ALTER TABLE public.budget_lines ADD COLUMN task_id UUID NULL;

-- Add task_id to cost_entries for direct task linking  
ALTER TABLE public.cost_entries ADD COLUMN task_id UUID NULL;

-- Add budget_line_id to cost_entries for budget line tracking
ALTER TABLE public.cost_entries ADD COLUMN budget_line_id INTEGER NULL;

-- Create baseline_calculations table for tracking expected vs actual performance
CREATE TABLE public.baseline_calculations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL,
    task_id UUID NULL,
    budget_line_id INTEGER NULL,
    calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    planned_amount NUMERIC NOT NULL DEFAULT 0,
    baseline_percentage NUMERIC NOT NULL DEFAULT 0,
    baseline_amount NUMERIC NOT NULL DEFAULT 0,
    actual_amount NUMERIC NOT NULL DEFAULT 0,
    committed_amount NUMERIC NOT NULL DEFAULT 0, -- From POs
    variance_amount NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baseline_calculations ENABLE ROW LEVEL SECURITY;

-- RLS policies for purchase_orders
CREATE POLICY "Users can manage purchase orders for their projects" 
    ON public.purchase_orders 
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = purchase_orders.project_id 
        AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR is_admin())
    ));

CREATE POLICY "Users can view purchase orders for their projects" 
    ON public.purchase_orders 
    FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = purchase_orders.project_id 
        AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR is_admin())
    ));

-- RLS policies for purchase_order_lines
CREATE POLICY "Users can manage purchase order lines for their projects" 
    ON public.purchase_order_lines 
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM purchase_orders po 
        JOIN projects p ON p.id = po.project_id 
        WHERE po.id = purchase_order_lines.purchase_order_id 
        AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR is_admin())
    ));

CREATE POLICY "Users can view purchase order lines for their projects" 
    ON public.purchase_order_lines 
    FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM purchase_orders po 
        JOIN projects p ON p.id = po.project_id 
        WHERE po.id = purchase_order_lines.purchase_order_id 
        AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR is_admin())
    ));

-- RLS policies for baseline_calculations
CREATE POLICY "Users can manage baseline calculations for their projects" 
    ON public.baseline_calculations 
    FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = baseline_calculations.project_id 
        AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR is_admin())
    ));

CREATE POLICY "Users can view baseline calculations for their projects" 
    ON public.baseline_calculations 
    FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = baseline_calculations.project_id 
        AND (p.created_by = auth.uid() OR p.manager_id = auth.uid() OR is_admin())
    ));

-- Create function to calculate baseline percentage
CREATE OR REPLACE FUNCTION calculate_baseline_percentage(
    start_date DATE,
    end_date DATE,
    current_date DATE DEFAULT CURRENT_DATE
) RETURNS NUMERIC AS $$
BEGIN
    -- If project hasn't started yet, return 0
    IF current_date < start_date THEN
        RETURN 0;
    END IF;
    
    -- If project is complete, return 100
    IF current_date >= end_date THEN
        RETURN 100;
    END IF;
    
    -- Calculate percentage based on time elapsed
    RETURN ROUND(
        (EXTRACT(DAY FROM current_date - start_date)::NUMERIC / 
         EXTRACT(DAY FROM end_date - start_date)::NUMERIC) * 100, 
        2
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to update baseline calculations
CREATE OR REPLACE FUNCTION update_baseline_calculations(project_id_param UUID)
RETURNS VOID AS $$
DECLARE
    project_record RECORD;
    task_record RECORD;
    budget_line_record RECORD;
    baseline_pct NUMERIC;
    actual_costs NUMERIC;
    committed_costs NUMERIC;
BEGIN
    -- Get project details
    SELECT * INTO project_record FROM projects WHERE id = project_id_param;
    
    -- Update project-level baseline
    SELECT COALESCE(SUM(allocated_amount), 0) INTO baseline_pct FROM budgets WHERE project_id = project_id_param;
    SELECT COALESCE(SUM(amount), 0) INTO actual_costs FROM cost_entries WHERE project_id = project_id_param;
    SELECT COALESCE(SUM(total_amount), 0) INTO committed_costs FROM purchase_orders WHERE project_id = project_id_param;
    
    INSERT INTO baseline_calculations (project_id, calculation_date, planned_amount, baseline_percentage, baseline_amount, actual_amount, committed_amount, variance_amount)
    VALUES (
        project_id_param,
        CURRENT_DATE,
        baseline_pct,
        calculate_baseline_percentage(project_record.start_date, project_record.end_date),
        (baseline_pct * calculate_baseline_percentage(project_record.start_date, project_record.end_date) / 100),
        actual_costs,
        committed_costs,
        actual_costs - (baseline_pct * calculate_baseline_percentage(project_record.start_date, project_record.end_date) / 100)
    )
    ON CONFLICT (project_id, calculation_date) WHERE task_id IS NULL AND budget_line_id IS NULL
    DO UPDATE SET
        planned_amount = EXCLUDED.planned_amount,
        baseline_percentage = EXCLUDED.baseline_percentage,
        baseline_amount = EXCLUDED.baseline_amount,
        actual_amount = EXCLUDED.actual_amount,
        committed_amount = EXCLUDED.committed_amount,
        variance_amount = EXCLUDED.variance_amount;
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint for baseline calculations to prevent duplicates
ALTER TABLE public.baseline_calculations 
ADD CONSTRAINT unique_baseline_calculation 
UNIQUE (project_id, task_id, budget_line_id, calculation_date);
