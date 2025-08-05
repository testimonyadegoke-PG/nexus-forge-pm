
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EarnedValueMetrics } from '@/types/scheduling';

export const useEarnedValueMetrics = (projectId: string) => {
  return useQuery<EarnedValueMetrics[]>({
    queryKey: ['earned_value_metrics', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('earned_value_metrics')
        .select('*')
        .eq('project_id', projectId)
        .order('measurement_date', { ascending: false });
      
      if (error) throw error;
      return data as EarnedValueMetrics[];
    },
    enabled: !!projectId,
  });
};

export const useCalculateEarnedValue = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (projectId: string) => {
      // Get project budget
      const { data: budgets, error: budgetError } = await supabase
        .from('budgets')
        .select('allocated_amount')
        .eq('project_id', projectId);

      if (budgetError) throw budgetError;

      // Get project costs
      const { data: costs, error: costError } = await supabase
        .from('cost_entries')
        .select('amount')
        .eq('project_id', projectId);

      if (costError) throw costError;

      // Get project tasks and progress
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('progress')
        .eq('project_id', projectId);

      if (tasksError) throw tasksError;

      // Calculate EVM metrics
      const totalBudget = budgets?.reduce((sum, b) => sum + Number(b.allocated_amount), 0) || 0;
      const totalCosts = costs?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
      const avgProgress = tasks?.length > 0 
        ? tasks.reduce((sum, t) => sum + Number(t.progress), 0) / tasks.length 
        : 0;

      const plannedValue = totalBudget; // Simplified - should be time-phased
      const earnedValue = (avgProgress / 100) * totalBudget;
      const actualCost = totalCosts;

      const evmData = {
        project_id: projectId,
        measurement_date: new Date().toISOString().split('T')[0],
        planned_value: plannedValue,
        earned_value: earnedValue,
        actual_cost: actualCost
      };

      const { data, error } = await supabase
        .from('earned_value_metrics')
        .insert([evmData])
        .select()
        .single();

      if (error) throw error;
      return data as EarnedValueMetrics;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Earned value metrics calculated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['earned_value_metrics', data.project_id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to calculate EVM: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
