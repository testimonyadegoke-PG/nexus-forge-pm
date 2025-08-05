
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  project_id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  due_date: string;
  duration: number;
  progress: number;
  assignee_id: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  dependencies: string[];
  created_at: string;
  updated_at: string;
  category: string;
  subcategory?: string;
  assignee?: {
    full_name: string;
  };
  priority_id?: number;
}

export interface CreateTaskData {
  project_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  due_date: string;
  duration: number;
  progress?: number;
  assignee_id?: string;
  status_id?: number;
  priority_id?: number;
  dependencies?: string[];
  category: string;
  subcategory?: string;
}

// Hook to fetch all tasks (portfolio-wide)
export const useTasks = () => {
  return useQuery<Task[], Error>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          project_id,
          name,
          description,
          start_date,
          end_date,
          due_date,
          duration,
          progress,
          assignee_id,
          status,
          dependencies,
          created_at,
          updated_at,
          category,
          subcategory,
          priority_id,
          assignee:users!tasks_assignee_id_fkey(full_name)
        `);

      if (error) {
        throw new Error(error.message);
      }
      // Cast the status to the correct type
      return (data || []).map(task => ({
        ...task,
        status: task.status as 'not-started' | 'in-progress' | 'completed' | 'blocked'
      })) as Task[];
    },
  });
};

// Hook to fetch tasks for a specific project
export const useProjectTasks = (projectId: string) => {
  return useQuery<Task[], Error>({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          project_id,
          name,
          description,
          start_date,
          end_date,
          due_date,
          duration,
          progress,
          assignee_id,
          status,
          dependencies,
          created_at,
          updated_at,
          category,
          subcategory,
          priority_id,
          assignee:users!tasks_assignee_id_fkey(full_name)
        `)
        .eq('project_id', projectId)
        .order('start_date', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }
      // Cast the status to the correct type
      return (data || []).map(task => ({
        ...task,
        status: task.status as 'not-started' | 'in-progress' | 'completed' | 'blocked'
      })) as Task[];
    },
    enabled: !!projectId,
  });
};

// Hook to fetch a single task by ID
export const useTask = (taskId: string) => {
  return useQuery<Task, Error>({
    queryKey: ['tasks', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          project_id,
          name,
          description,
          start_date,
          end_date,
          due_date,
          duration,
          progress,
          assignee_id,
          status,
          dependencies,
          created_at,
          updated_at,
          category,
          subcategory,
          priority_id,
          assignee:users!tasks_assignee_id_fkey(full_name)
        `)
        .eq('id', taskId)
        .single();

      if (error) {
        throw new Error(error.message);
      }
      // Cast the status to the correct type
      return {
        ...data,
        status: data.status as 'not-started' | 'in-progress' | 'completed' | 'blocked'
      } as Task;
    },
    enabled: !!taskId,
  });
};

// Hook to create a new task
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Task, Error, CreateTaskData>({
    mutationFn: async (taskData) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
        toast({
            title: "Success",
            description: "Task created successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        if (data.project_id) {
            queryClient.invalidateQueries({ queryKey: ['tasks', data.project_id] });
        }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create task: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Hook to update an existing task
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateTaskData> }) => {
      const { data: result, error } = await supabase
        .from('tasks')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (data.project_id) {
        queryClient.invalidateQueries({ queryKey: ['tasks', data.project_id] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
