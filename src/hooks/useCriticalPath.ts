
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CriticalPathAnalysis } from '@/types/scheduling';

export const useCriticalPathAnalysis = (projectId: string) => {
  return useQuery({
    queryKey: ['critical_path_analysis', projectId],
    queryFn: async (): Promise<CriticalPathAnalysis[]> => {
      // Mock implementation for now until tables are properly set up
      return [];
    },
    enabled: !!projectId,
  });
};

export const useCalculateCriticalPath = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (projectId: string) => {
      // Get actual tasks from the existing tasks table
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId);

      if (tasksError) throw tasksError;

      if (!tasks || tasks.length === 0) {
        throw new Error('No tasks found for critical path calculation');
      }

      // Simple mock calculation for now
      const mockAnalysis = tasks.map((task, index) => ({
        id: crypto.randomUUID(),
        project_id: projectId,
        task_id: task.id,
        is_critical: index % 3 === 0, // Mock: every third task is critical
        total_slack: index % 3 === 0 ? 0 : Math.floor(Math.random() * 5),
        free_slack: index % 3 === 0 ? 0 : Math.floor(Math.random() * 3),
        early_start: task.start_date,
        early_finish: task.end_date,
        late_start: task.start_date,
        late_finish: task.end_date,
        analysis_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        task: {
          name: task.name,
          start_date: task.start_date,
          end_date: task.end_date,
          duration: task.duration
        }
      }));

      return mockAnalysis;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Critical path calculated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['critical_path_analysis'] });
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
