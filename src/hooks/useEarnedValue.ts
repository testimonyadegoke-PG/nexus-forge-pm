
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EarnedValueMetrics } from '@/types/scheduling';

export const useEarnedValueMetrics = (projectId: string) => {
  return useQuery({
    queryKey: ['earned_value_metrics', projectId],
    queryFn: async (): Promise<EarnedValueMetrics[]> => {
      // Mock implementation for now
      return [];
    },
    enabled: !!projectId,
  });
};

export const useCalculateEarnedValue = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (projectId: string) => {
      // Get project budget (Planned Value) from existing budgets table
      const { data: budgets, error: budgetError } = await supabase
        .from('budgets')
        .select('allocated_amount')
        .eq('project_id', projectId);

      if (budgetError) throw budgetError;

      // Get actual costs (Actual Cost) from existing cost_entries table
      const { data: costs, error: costError } = await supabase
        .from('cost_entries')
        .select('amount')
        .eq('project_id', projectId);

      if (costError) throw costError;

      // Get task progress (for Earned Value calculation) from existing tasks table
      const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select('progress, duration')
        .eq('project_id', projectId);

      if (taskError) throw taskError;

      const totalBudget = budgets?.reduce((sum, budget) => sum + Number(budget.allocated_amount), 0) || 0;
      const actualCost = costs?.reduce((sum, cost) => sum + Number(cost.amount), 0) || 0;
      
      // Calculate Earned Value based on task progress
      const totalTaskWeight = tasks?.reduce((sum, task) => sum + task.duration, 0) || 1;
      const completedWork = tasks?.reduce((sum, task) => {
        const taskWeight = task.duration / totalTaskWeight;
        return sum + (taskWeight * (task.progress / 100));
      }, 0) || 0;
      
      const earnedValue = totalBudget * completedWork;
      const plannedValue = totalBudget; // Simplified: assume we planned to spend full budget by now

      // Calculate performance indices
      const costPerformanceIndex = actualCost > 0 ? earnedValue / actualCost : 0;
      const schedulePerformanceIndex = plannedValue > 0 ? earnedValue / plannedValue : 0;
      const costVariance = earnedValue - actualCost;
      const scheduleVariance = earnedValue - plannedValue;

      const evmData: EarnedValueMetrics = {
        id: crypto.randomUUID(),
        project_id: projectId,
        measurement_date: new Date().toISOString().split('T')[0],
        planned_value: plannedValue,
        earned_value: earnedValue,
        actual_cost: actualCost,
        cost_performance_index: costPerformanceIndex,
        schedule_performance_index: schedulePerformanceIndex,
        cost_variance: costVariance,
        schedule_variance: scheduleVariance,
        created_at: new Date().toISOString()
      };

      return evmData;
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
