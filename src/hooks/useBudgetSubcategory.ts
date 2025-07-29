import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BudgetSubcategory } from '@/db-schema';

export const useBudgetSubcategories = (categoryId?: number) => {
  return useQuery<BudgetSubcategory[]>({
    queryKey: ['budget_subcategories', categoryId],
    queryFn: async () => {
      let query = supabase.from('budget_subcategories').select('*');
      if (categoryId) query = query.eq('category_id', categoryId);
      const { data, error } = await query;
      if (error) throw error;
      return data as BudgetSubcategory[];
    },
    enabled: !!categoryId,
  });
};

export const useCreateBudgetSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subcategory: Omit<BudgetSubcategory, 'id'>) => {
      const { data, error } = await supabase.from('budget_subcategories').insert([subcategory]).select().single();
      if (error) throw error;
      return data as BudgetSubcategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['budget_subcategories']);
    },
  });
};

export const useUpdateBudgetSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subcategory: BudgetSubcategory) => {
      const { id, ...rest } = subcategory;
      const { data, error } = await supabase.from('budget_subcategories').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return data as BudgetSubcategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['budget_subcategories']);
    },
  });
};

export const useDeleteBudgetSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('budget_subcategories').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['budget_subcategories']);
    },
  });
};
