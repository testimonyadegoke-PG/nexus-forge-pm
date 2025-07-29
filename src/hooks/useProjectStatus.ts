import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectStatus } from '@/db-schema';

// Fetch all project statuses
export const useProjectStatuses = () => {
  return useQuery<ProjectStatus[]>({
    queryKey: ['project_status'],
    queryFn: async () => {
      const { data, error } = await supabase.from('project_status').select('*').order('id');
      if (error) throw error;
      return data as ProjectStatus[];
    },
  });
};

// Create a new project status
export const useCreateProjectStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase.from('project_status').insert([{ name }]).select().single();
      if (error) throw error;
      return data as ProjectStatus;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['project_status']);
    },
  });
};

// Edit a project status
export const useUpdateProjectStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const { data, error } = await supabase.from('project_status').update({ name }).eq('id', id).select().single();
      if (error) throw error;
      return data as ProjectStatus;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['project_status']);
    },
  });
};

// Delete a project status
export const useDeleteProjectStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('project_status').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['project_status']);
    },
  });
};
