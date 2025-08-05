
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
