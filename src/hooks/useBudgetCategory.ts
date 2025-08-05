
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BudgetCategory } from '@/db-schema';

export const useBudgetCategories = () => {
  return useQuery<BudgetCategory[]>({
    queryKey: ['budget_categories'],
    queryFn: async () => {
      // For now, return empty array since budget_categories table doesn't exist in current schema
      // TODO: Create budget_categories table or use alternative approach
      return [] as BudgetCategory[];
    },
  });
};

export const useCreateBudgetCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      // TODO: Implement when budget_categories table is created
      throw new Error('Budget categories table not implemented yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget_categories'] });
    },
  });
};

export const useUpdateBudgetCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      // TODO: Implement when budget_categories table is created
      throw new Error('Budget categories table not implemented yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget_categories'] });
    },
  });
};

export const useDeleteBudgetCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      // TODO: Implement when budget_categories table is created
      throw new Error('Budget categories table not implemented yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget_categories'] });
    },
  });
};
