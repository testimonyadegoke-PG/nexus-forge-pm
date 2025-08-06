
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { EarnedValueMetrics } from '@/types/scheduling';

export const useEarnedValueMetrics = (projectId: string) => {
  return useQuery<EarnedValueMetrics[]>({
    queryKey: ['earned_value_metrics', projectId],
    queryFn: async () => {
      // TODO: Replace with actual Supabase query once types are updated
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
      // TODO: Implement actual EVM calculation once types are updated
      console.log('Calculating EVM for project:', projectId);

      const evmData: EarnedValueMetrics = {
        id: 'mock',
        project_id: projectId,
        measurement_date: new Date().toISOString().split('T')[0],
        planned_value: 0,
        earned_value: 0,
        actual_cost: 0,
        cost_performance_index: 0,
        schedule_performance_index: 0,
        cost_variance: 0,
        schedule_variance: 0,
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
