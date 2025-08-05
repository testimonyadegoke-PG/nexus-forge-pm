
export interface Budget {
  id: string;
  name: string;
  project_id: string;
  category: string;
  category_id?: number;
  allocated_amount: number;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  deleted_by?: string;
  currency_id?: number;
  subcategory?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled' | 'blocked';
  created_by: string;
  manager_id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  manager?: {
    full_name: string;
  };
}
