import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BudgetCategory } from '@/db-schema';

export const useBudgetCategories = () => {
  return useQuery<BudgetCategory[]>({
    queryKey: ['budget_categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('budget_categories').select('*').order('id');
      if (error) throw error;
      return data as BudgetCategory[];
    },
  });
};

export const useCreateBudgetCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase.from('budget_categories').insert([{ name }]).select().single();
      if (error) throw error;
      return data as BudgetCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['budget_categories']);
    },
  });
};

export const useUpdateBudgetCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const { data, error } = await supabase.from('budget_categories').update({ name }).eq('id', id).select().single();
      if (error) throw error;
      return data as BudgetCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['budget_categories']);
    },
  });
};

export const useDeleteBudgetCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('budget_categories').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['budget_categories']);
    },
  });
};
