
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectType } from '@/db-schema';

export const useProjectTypes = () => {
  return useQuery<ProjectType[]>({
    queryKey: ['project_types'],
    queryFn: async () => {
      const { data, error } = await supabase.from('project_types').select('*').order('id');
      if (error) throw error;
      return data as ProjectType[];
    },
  });
};

export const useCreateProjectType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase.from('project_types').insert([{ name }]).select().single();
      if (error) throw error;
      return data as ProjectType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_types'] });
    },
  });
};

export const useUpdateProjectType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const { data, error } = await supabase.from('project_types').update({ name }).eq('id', id).select().single();
      if (error) throw error;
      return data as ProjectType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_types'] });
    },
  });
};

export const useDeleteProjectType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('project_types').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_types'] });
    },
  });
};
