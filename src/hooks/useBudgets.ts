import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BudgetLine {
  id: string;
  budget_id: string;
  category: string;
  subcategory?: string;
  amount: number;
  description?: string;
  created_at: string;
}

export interface Budget {
  id: string;
  project_id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  description?: string;
  allocated_amount?: number;
  lines: BudgetLine[];
  creator?: { id: string; full_name: string };
}

export interface CreateBudgetData {
  project_id: string;
  name: string;
  created_by: string;
  description?: string;
  category: string;
  allocated_amount: number;
}

export interface CreateBudgetLineData {
  budget_id: string;
  category: string;
  subcategory?: string;
  amount: number;
  description?: string;
  unit_price: number;
}

export const useCreateBudgetLine = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateBudgetLineData) => {
      const { data: result, error } = await supabase
        .from('budget_lines')
        .insert([{
          budget_id: data.budget_id,
          category_id: null,
          subcategory_id: null,
          quantity: 1,
          unit_price: data.unit_price,
          total: data.amount,
          description: data.description,
        }])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({
        title: 'Success',
        description: 'Budget line created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create budget line: ' + error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useProjectBudgets = (projectId: string) => {
  return useQuery({
    queryKey: ['budgets', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*, budget_lines(*), creator:users!budgets_created_by_fkey(id, full_name)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      // Map lines and creator for TS
      return (data || []).map((b: any) => ({
        ...b,
        lines: b.budget_lines || [],
        creator: b.creator || undefined,
      })) as Budget[];
    },
    enabled: !!projectId,
  });
};

export const useBudgets = () => {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*, budget_lines(*), creator:users!budgets_created_by_fkey(id, full_name)');

      if (error) throw error;
      return (data || []).map((b: any) => ({
        ...b,
        lines: b.budget_lines || [],
        creator: b.creator || undefined,
      })) as Budget[];
    },
  });
};

// Utility: Aggregate total allocated from all budgets/lines for a project
export function aggregateBudgets(budgets: Budget[]): number {
  return budgets.reduce((sum, b) => sum + (b.lines?.reduce((lsum, l) => lsum + (l.amount || 0), 0) || 0), 0);
}

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateBudgetData) => {
      const { data: result, error } = await supabase
        .from('budgets')
        .insert([{
          project_id: data.project_id,
          name: data.name,
          created_by: data.created_by,
          description: data.description,
          category: data.category,
          allocated_amount: data.allocated_amount,
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onMutate: async (newBudget) => {
      await queryClient.cancelQueries({ queryKey: ['budgets', newBudget.project_id] });
      const previousBudgets = queryClient.getQueryData<Budget[]>(['budgets', newBudget.project_id]);
      if (previousBudgets) {
        queryClient.setQueryData<Budget[]>(['budgets', newBudget.project_id], [
          {
            ...newBudget,
            id: `temp-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            description: newBudget.description || '',
            lines: []
          },
          ...previousBudgets,
        ]);
      }
      return { previousBudgets };
    },
    onError: (error, _newBudget, context) => {
      if (context?.previousBudgets) {
        queryClient.setQueryData<Budget[]>(['budgets', _newBudget.project_id], context.previousBudgets);
      }
      toast({
        title: "Error",
        description: "Failed to create budget entry: " + error.message,
        variant: "destructive",
      });
    },
  });
};
