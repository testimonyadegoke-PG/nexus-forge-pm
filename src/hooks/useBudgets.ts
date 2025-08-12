
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Budget Types
export interface Budget {
  id: string;
  name: string;
  project_id: string;
  category: string;
  allocated_amount: number;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBudgetData {
  name: string;
  project_id: string;
  category: string;
  allocated_amount: number;
  description?: string;
  created_by: string;
}

// Budget Line Types
export interface CreateBudgetLineData {
  budget_id: string;
  category: string;
  subcategory?: string;
  quantity: number;
  unit_price: number;
  amount: number;
  total: number;
  description?: string;
}

// Budget Queries
export const useBudgets = (projectId?: string) => {
  return useQuery<Budget[]>({
    queryKey: projectId ? ["budgets", projectId] : ["budgets"],
    queryFn: async () => {
      let query = supabase.from('budgets').select('*');
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Budget[];
    },
  });
};

export const useProjectBudgets = (projectId: string) => {
  return useBudgets(projectId);
};

export const useBudget = (id: string) => {
  return useQuery<Budget>({
    queryKey: ["budgets", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Budget;
    },
    enabled: !!id,
  });
};

// Budget Mutations
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast({
        title: "Success",
        description: "Budget created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create budget: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateBudgetData> }) => {
      const { data: result, error } = await supabase
        .from('budgets')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast({
        title: "Success",
        description: "Budget updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update budget: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast({
        title: "Success",
        description: "Budget deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete budget: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Budget Line Mutations
export const useCreateBudgetLine = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: CreateBudgetLineData) => {
      const { data: result, error } = await supabase
        .from('budget_lines')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast({
        title: "Success",
        description: "Budget line created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create budget line: " + error.message,
        variant: "destructive",
      });
    },
  });
};
