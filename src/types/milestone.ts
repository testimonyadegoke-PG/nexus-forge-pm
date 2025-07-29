// Milestone model for frontend
export interface Milestone {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  due_date: string;
  achieved_date?: string | null;
  is_achieved: boolean;
  status: "upcoming" | "completed" | "missed";
  linked_tasks: MilestoneTask[];
  progress: number; // percent of linked tasks completed
  comments?: MilestoneComment[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface MilestoneTask {
  id: string;
  milestone_id: string;
  task_id: string;
  task?: Task; // Optionally include the full task
  created_at: string;
}

export interface MilestoneComment {
  id: string;
  milestone_id: string;
  user_id?: string;
  content: string;
  created_at: string;
}

import type { Task } from "@/hooks/useTasks";
