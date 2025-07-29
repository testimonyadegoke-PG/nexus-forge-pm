import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectCategory } from '@/db-schema';

export const useProjectCategories = () => {
  return useQuery<ProjectCategory[]>({
    queryKey: ['project_categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('project_categories').select('*').order('id');
      if (error) throw error;
      return data as ProjectCategory[];
    },
  });
};

export const useCreateProjectCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase.from('project_categories').insert([{ name }]).select().single();
      if (error) throw error;
      return data as ProjectCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['project_categories']);
    },
  });
};

export const useUpdateProjectCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const { data, error } = await supabase.from('project_categories').update({ name }).eq('id', id).select().single();
      if (error) throw error;
      return data as ProjectCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['project_categories']);
    },
  });
};

export const useDeleteProjectCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('project_categories').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['project_categories']);
    },
  });
};
