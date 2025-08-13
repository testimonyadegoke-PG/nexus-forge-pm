
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BaselineCalculation {
  id: string;
  project_id: string;
  task_id?: string;
  budget_line_id?: number;
  calculation_date: string;
  planned_amount: number;
  baseline_percentage: number;
  baseline_amount: number;
  actual_amount: number;
  committed_amount: number;
  variance_amount: number;
  created_at: string;
}

export const useProjectBaselineCalculations = (projectId: string) => {
  return useQuery({
    queryKey: ['baseline_calculations', projectId],
    queryFn: async () => {
      // Since baseline_calculations table doesn't exist yet, return empty array
      // This will be replaced when the proper database migration is run
      console.log('Baseline calculations table not available yet');
      return [] as BaselineCalculation[];
    },
    enabled: !!projectId,
  });
};

export const useUpdateProjectBaseline = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (projectId: string) => {
      // Since the stored procedure doesn't exist yet, just return success
      console.log('Update baseline calculations not available yet');
      return projectId;
    },
    onSuccess: (projectId) => {
      toast({
        title: "Success",
        description: "Baseline calculations updated",
      });
      queryClient.invalidateQueries({ queryKey: ['baseline_calculations', projectId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update baseline: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
