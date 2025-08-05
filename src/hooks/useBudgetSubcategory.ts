
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BudgetSubcategory } from '@/db-schema';

export const useBudgetSubcategories = () => {
  return useQuery<BudgetSubcategory[]>({
    queryKey: ['budget_subcategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_subcategories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateBudgetSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, category_id }: { name: string; category_id: number }) => {
      const { data, error } = await supabase
        .from('budget_subcategories')
        .insert([{ name, category_id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget_subcategories'] });
    },
  });
};

export const useUpdateBudgetSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, category_id }: { id: number; name: string; category_id: number }) => {
      const { data, error } = await supabase
        .from('budget_subcategories')
        .update({ name, category_id })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget_subcategories'] });
    },
  });
};

export const useDeleteBudgetSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('budget_subcategories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget_subcategories'] });
    },
  });
};
