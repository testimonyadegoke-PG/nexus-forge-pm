
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BudgetCategory {
  id: number;
  name: string;
}

export interface BudgetSubcategory {
  id: number;
  category_id: number;
  name: string;
}

export const useBudgetCategories = () => {
  return useQuery({
    queryKey: ['budget_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as BudgetCategory[];
    },
  });
};

export const useBudgetSubcategories = (categoryId?: number) => {
  return useQuery({
    queryKey: ['budget_subcategories', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('budget_subcategories')
        .select('*')
        .order('name');

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as BudgetSubcategory[];
    },
    enabled: !!categoryId,
  });
};
