// AUTO-GENERATED: Database Types for Nexus Forge PPM
// These interfaces reflect the normalized schema and best practices for TypeScript/React use

// === Dimension Tables ===
export interface ProjectStatus {
  id: number;
  name: string;
}

export interface TaskStatus {
  id: number;
  name: string;
}

export interface Priority {
  id: number;
  name: string;
  rank?: number;
}

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol?: string;
}

export interface ProjectCategory {
  id: number;
  name: string;
}

export interface ProjectSubcategory {
  id: number;
  category_id: number;
  name: string;
}

export interface ProjectType {
  id: number;
  name: string;
}

export interface ProjectStage {
  id: number;
  name: string;
}

export interface ProjectPhase {
  id: number;
  name: string;
}

export interface Company {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface Customer {
  id: number;
  company_id?: number;
  name: string;
  email?: string;
  phone?: string;
}

export interface Contact {
  id: number;
  customer_id: number;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface BudgetCategory {
  id: number;
  name: string;
}

export interface BudgetSubcategory {
  id: number;
  category_id: number;
  name: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  unit_price: number;
  currency_id: number;
  category_id?: number;
  subcategory_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserRole {
  id: number;
  name: string;
}

// === Main Tables ===
export interface Project {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  status_id?: number;
  stage_id?: number;
  category_id?: number;
  type_id?: number;
  phase_id?: number;
  company_id?: number;
  customer_id?: number;
  created_by?: string;
  manager_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  duration: number;
  progress: number;
  assignee_id?: string;
  status_id?: number;
  priority_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Budget {
  id: string;
  project_id: string;
  category_id?: number;
  subcategory_id?: number;
  currency_id?: number;
  allocated_amount: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CostEntry {
  id: string;
  project_id: string;
  category_id?: number;
  subcategory_id?: number;
  currency_id?: number;
  amount: number;
  source_type: 'manual' | 'timesheet' | 'invoice' | 'expense';
  entry_date: string;
  description?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role_id?: number;
  created_at?: string;
  updated_at?: string;
}

// === Line/Transaction Tables ===
export interface TaskDependency {
  id: number;
  task_id: string;
  depends_on_task_id: string;
}

export interface BudgetLine {
  id: number;
  budget_id: string;
  product_id?: number;
  category_id?: number;
  subcategory_id?: number;
  quantity: number;
  unit_price: number;
  total: number;
  description?: string;
}

export interface CostEntryLine {
  id: number;
  cost_entry_id: string;
  product_id?: number;
  category_id?: number;
  subcategory_id?: number;
  quantity: number;
  unit_price: number;
  total: number;
  description?: string;
}
