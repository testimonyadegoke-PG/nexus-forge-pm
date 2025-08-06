
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CriticalPathAnalysis } from '@/types/scheduling';

export const useCriticalPathAnalysis = (projectId: string) => {
  return useQuery({
    queryKey: ['critical_path_analysis', projectId],
    queryFn: async (): Promise<CriticalPathAnalysis[]> => {
      const { data, error } = await supabase
        .from('critical_path_analysis')
        .select(`
          *,
          task:tasks(name, start_date, end_date, duration)
        `)
        .eq('project_id', projectId)
        .order('is_critical', { ascending: false });

      if (error) throw error;
      return (data || []) as CriticalPathAnalysis[];
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
        .select(`
          *,
          dependencies:task_dependencies!task_dependencies_task_id_fkey(depends_on_task_id)
        `)
        .eq('project_id', projectId);

      if (tasksError) throw tasksError;

      if (!tasks || tasks.length === 0) {
        throw new Error('No tasks found for critical path calculation');
      }

      // Simple critical path calculation algorithm
      const taskMap = new Map(tasks.map(task => [task.id, task]));
      const calculations = tasks.map(task => {
        const startDate = new Date(task.start_date);
        const endDate = new Date(task.end_date);
        
        // Calculate early start/finish (forward pass)
        let earlyStart = startDate;
        if (task.dependencies && task.dependencies.length > 0) {
          const dependencyFinishes = task.dependencies.map((dep: any) => {
            const depTask = taskMap.get(dep.depends_on_task_id);
            return depTask ? new Date(depTask.end_date) : startDate;
          });
          earlyStart = new Date(Math.max(...dependencyFinishes.map(d => d.getTime())));
        }
        
        const earlyFinish = new Date(earlyStart);
        earlyFinish.setDate(earlyFinish.getDate() + task.duration);

        // For this simple implementation, assume late dates equal early dates for critical tasks
        const lateStart = earlyStart;
        const lateFinish = earlyFinish;
        
        const totalSlack = Math.max(0, Math.floor((lateStart.getTime() - earlyStart.getTime()) / (1000 * 60 * 60 * 24)));
        const isCritical = totalSlack === 0;

        return {
          project_id: projectId,
          task_id: task.id,
          is_critical: isCritical,
          total_slack: totalSlack,
          free_slack: totalSlack, // Simplified
          early_start: earlyStart.toISOString().split('T')[0],
          early_finish: earlyFinish.toISOString().split('T')[0],
          late_start: lateStart.toISOString().split('T')[0],
          late_finish: lateFinish.toISOString().split('T')[0],
          analysis_date: new Date().toISOString().split('T')[0]
        };
      });

      // Delete existing analysis for this project
      await supabase
        .from('critical_path_analysis')
        .delete()
        .eq('project_id', projectId);

      // Insert new analysis
      const { data, error } = await supabase
        .from('critical_path_analysis')
        .insert(calculations)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const projectId = data?.[0]?.project_id;
      toast({
        title: "Success",
        description: "Critical path calculated successfully",
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
