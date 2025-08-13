
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BudgetCategory {
  id: number;
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
