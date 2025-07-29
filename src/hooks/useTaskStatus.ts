import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TaskStatus } from '@/db-schema';

export const useTaskStatuses = () => {
  return useQuery<TaskStatus[]>({
    queryKey: ['task_status'],
    queryFn: async () => {
      const { data, error } = await supabase.from('task_status').select('*').order('id');
      if (error) throw error;
      return data as TaskStatus[];
    },
  });
};

export const useCreateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase.from('task_status').insert([{ name }]).select().single();
      if (error) throw error;
      return data as TaskStatus;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['task_status']);
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const { data, error } = await supabase.from('task_status').update({ name }).eq('id', id).select().single();
      if (error) throw error;
      return data as TaskStatus;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['task_status']);
    },
  });
};

export const useDeleteTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('task_status').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['task_status']);
    },
  });
};
