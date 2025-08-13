
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
      const { data, error } = await supabase
        .from('baseline_calculations' as any)
        .select('*')
        .eq('project_id', projectId)
        .order('calculation_date', { ascending: false });

      if (error) throw error;
      return data as BaselineCalculation[];
    },
    enabled: !!projectId,
  });
};

export const useUpdateProjectBaseline = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase.rpc('update_baseline_calculations' as any, {
        project_id_param: projectId
      });

      if (error) throw error;
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
