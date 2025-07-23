
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Budget {
  id: string;
  project_id: string;
  category: string;
  subcategory: string;
  allocated_amount: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBudgetData {
  project_id: string;
  category: string;
  subcategory?: string;
  allocated_amount: number;
  description?: string;
}

export const useProjectBudgets = (projectId: string) => {
  return useQuery({
    queryKey: ['budgets', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('project_id', projectId)
        .order('category', { ascending: true });

      if (error) throw error;
      return data as Budget[];
    },
    enabled: !!projectId,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateBudgetData) => {
      const { data: result, error } = await supabase
        .from('budgets')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['budgets', data.project_id] });
      toast({
        title: "Success",
        description: "Budget entry created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create budget entry: " + error.message,
        variant: "destructive",
      });
    },
  });
};
