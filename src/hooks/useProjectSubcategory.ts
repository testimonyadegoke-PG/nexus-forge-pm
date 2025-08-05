
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectSubcategory } from '@/db-schema';

export const useProjectSubcategories = (categoryId?: number) => {
  return useQuery<ProjectSubcategory[]>({
    queryKey: ['project_subcategories', categoryId],
    queryFn: async () => {
      let query = supabase.from('project_subcategories').select('*');
      if (categoryId) query = query.eq('category_id', categoryId);
      const { data, error } = await query;
      if (error) throw error;
      return data as ProjectSubcategory[];
    },
    enabled: !!categoryId,
  });
};

export const useCreateProjectSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subcategory: Omit<ProjectSubcategory, 'id'>) => {
      const { data, error } = await supabase.from('project_subcategories').insert([subcategory]).select().single();
      if (error) throw error;
      return data as ProjectSubcategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_subcategories'] });
    },
  });
};

export const useUpdateProjectSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subcategory: ProjectSubcategory) => {
      const { id, ...rest } = subcategory;
      const { data, error } = await supabase.from('project_subcategories').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return data as ProjectSubcategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_subcategories'] });
    },
  });
};

export const useDeleteProjectSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('project_subcategories').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_subcategories'] });
    },
  });
};
