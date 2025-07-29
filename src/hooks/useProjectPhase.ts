import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectPhase } from '@/db-schema';

export const useProjectPhases = () => {
  return useQuery<ProjectPhase[]>({
    queryKey: ['project_phases'],
    queryFn: async () => {
      const { data, error } = await supabase.from('project_phases').select('*').order('id');
      if (error) throw error;
      return data as ProjectPhase[];
    },
  });
};

export const useCreateProjectPhase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase.from('project_phases').insert([{ name }]).select().single();
      if (error) throw error;
      return data as ProjectPhase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['project_phases']);
    },
  });
};

export const useUpdateProjectPhase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const { data, error } = await supabase.from('project_phases').update({ name }).eq('id', id).select().single();
      if (error) throw error;
      return data as ProjectPhase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['project_phases']);
    },
  });
};

export const useDeleteProjectPhase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('project_phases').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['project_phases']);
    },
  });
};
