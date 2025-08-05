
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectStage } from '@/db-schema';

export const useProjectStages = () => {
  return useQuery<ProjectStage[]>({
    queryKey: ['project_stages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('project_stages').select('*').order('id');
      if (error) throw error;
      return data as ProjectStage[];
    },
  });
};

export const useCreateProjectStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase.from('project_stages').insert([{ name }]).select().single();
      if (error) throw error;
      return data as ProjectStage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_stages'] });
    },
  });
};

export const useUpdateProjectStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const { data, error } = await supabase.from('project_stages').update({ name }).eq('id', id).select().single();
      if (error) throw error;
      return data as ProjectStage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_stages'] });
    },
  });
};

export const useDeleteProjectStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('project_stages').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_stages'] });
    },
  });
};
