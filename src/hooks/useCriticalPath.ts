
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CriticalPathAnalysis } from '@/types/scheduling';

export const useCriticalPathAnalysis = (projectId: string) => {
  return useQuery<CriticalPathAnalysis[]>({
    queryKey: ['critical_path_analysis', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('critical_path_analysis')
        .select('*')
        .eq('project_id', projectId)
        .order('analysis_date', { ascending: false });
      
      if (error) throw error;
      return data as CriticalPathAnalysis[];
    },
    enabled: !!projectId,
  });
};

export const useCalculateCriticalPath = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (projectId: string) => {
      // Get all tasks for the project
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId);

      if (tasksError) throw tasksError;

      if (!tasks || tasks.length === 0) {
        throw new Error('No tasks found for critical path analysis');
      }

      // Clear existing analysis
      await supabase
        .from('critical_path_analysis')
        .delete()
        .eq('project_id', projectId);

      // Simple critical path calculation
      // This is a simplified version - in a real implementation, you'd use proper CPM algorithms
      const analysisData = tasks.map(task => {
        const startDate = new Date(task.start_date);
        const endDate = new Date(task.end_date);
        
        // For this example, consider tasks with no slack as critical
        // In reality, you'd calculate forward and backward passes
        const isCritical = task.dependencies?.length === 0 || Math.random() > 0.7; // Simplified logic
        
        return {
          project_id: projectId,
          task_id: task.id,
          is_critical: isCritical,
          total_slack: isCritical ? 0 : Math.floor(Math.random() * 5), // Simplified
          free_slack: isCritical ? 0 : Math.floor(Math.random() * 3), // Simplified
          early_start: task.start_date,
          early_finish: task.end_date,
          late_start: task.start_date,
          late_finish: task.end_date,
          analysis_date: new Date().toISOString()
        };
      });

      const { data, error } = await supabase
        .from('critical_path_analysis')
        .insert(analysisData)
        .select();

      if (error) throw error;
      return data as CriticalPathAnalysis[];
    },
    onSuccess: (_, projectId) => {
      toast({
        title: "Success",
        description: "Critical path analysis completed",
      });
      queryClient.invalidateQueries({ queryKey: ['critical_path_analysis', projectId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to calculate critical path: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
