
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
  duration: number;
  progress: number;
  assignee_id: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  dependencies: string[];
  created_at: string;
  updated_at: string;
  assignee?: {
    full_name: string;
  };
}

export interface CreateTaskData {
  project_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  duration: number;
  progress?: number;
  assignee_id?: string;
  status?: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  dependencies?: string[];
}

export const useProjectTasks = (projectId: string) => {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:users!tasks_assignee_id_fkey(full_name)
        `)
        .eq('project_id', projectId)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!projectId,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTaskData) => {
      const { data: result, error } = await supabase
        .from('tasks')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', data.project_id] });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create task: " + error.message,
        variant: "destructive",
      });
    },
  });
};

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
      queryClient.invalidateQueries({ queryKey: ['tasks', data.project_id] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task: " + error.message,
        variant: "destructive",
      });
    },
  });
};
