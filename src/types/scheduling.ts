
// Types for scheduling and project management features

export interface AccessRight {
  id: number;
  name: string;
  description?: string;
  level: number; // 1=Viewer, 2=Commenter, 3=Editor, 4=Administrator
}

export interface ProjectAccess {
  id: string;
  project_id: string;
  user_id: string;
  access_right_id: number;
  granted_by?: string;
  granted_at: string;
  access_right?: AccessRight;
  user?: {
    full_name: string;
    email: string;
  };
}

export interface WbsItem {
  id: string;
  project_id: string;
  parent_id?: string;
  wbs_code: string;
  name: string;
  description?: string;
  level: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  children?: WbsItem[];
}

export interface ProjectBaseline {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  baseline_date: string;
  is_current: boolean;
  created_by?: string;
  created_at: string;
}

export interface TaskBaseline {
  id: string;
  baseline_id: string;
  task_id: string;
  planned_start_date?: string;
  planned_end_date?: string;
  planned_duration?: number;
  planned_progress: number;
  baseline_cost: number;
  created_at: string;
}

export interface CriticalPathAnalysis {
  id: string;
  project_id: string;
  task_id: string;
  is_critical: boolean;
  total_slack: number;
  free_slack: number;
  early_start?: string;
  early_finish?: string;
  late_start?: string;
  late_finish?: string;
  analysis_date: string;
}

export interface ResourceCapacity {
  id: string;
  user_id: string;
  date: string;
  available_hours: number;
  allocated_hours: number;
  created_at: string;
}

export interface SchedulingAlert {
  id: string;
  project_id: string;
  task_id?: string;
  milestone_id?: string;
  user_id: string;
  alert_type: 'deadline_approaching' | 'task_overdue' | 'milestone_missed' | 'resource_overallocation';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_read: boolean;
  alert_date: string;
  due_date?: string;
}

export interface EarnedValueMetrics {
  id: string;
  project_id: string;
  measurement_date: string;
  planned_value: number; // PV
  earned_value: number;  // EV
  actual_cost: number;   // AC
  cost_performance_index: number; // CPI = EV/AC
  schedule_performance_index: number; // SPI = EV/PV
  cost_variance: number; // CV = EV - AC
  schedule_variance: number; // SV = EV - PV
  created_at: string;
}
