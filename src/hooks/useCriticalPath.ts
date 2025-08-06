
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CriticalPathAnalysis } from '@/types/scheduling';

export const useCriticalPathAnalysis = (projectId: string) => {
  return useQuery({
    queryKey: ['critical_path_analysis', projectId],
    queryFn: async (): Promise<CriticalPathAnalysis[]> => {
      const { data, error } = await supabase
        .rpc('execute_sql', {
          query: `
            SELECT cpa.*, 
                   t.name as task_name,
                   t.start_date,
                   t.end_date,
                   t.duration
            FROM critical_path_analysis cpa
            JOIN tasks t ON t.id = cpa.task_id
            WHERE cpa.project_id = $1
            ORDER BY cpa.is_critical DESC
          `,
          params: [projectId]
        });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map((row: any) => ({
        id: row.id,
        project_id: row.project_id,
        task_id: row.task_id,
        is_critical: row.is_critical,
        total_slack: row.total_slack,
        free_slack: row.free_slack,
        early_start: row.early_start,
        early_finish: row.early_finish,
        late_start: row.late_start,
        late_finish: row.late_finish,
        analysis_date: row.analysis_date,
        created_at: row.created_at,
        task: {
          name: row.task_name,
          start_date: row.start_date,
          end_date: row.end_date,
          duration: row.duration
        }
      }));

      return transformedData as CriticalPathAnalysis[];
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
        .rpc('execute_sql', {
          query: 'SELECT * FROM tasks WHERE project_id = $1',
          params: [projectId]
        });

      if (tasksError) throw tasksError;

      if (!tasks || tasks.length === 0) {
        throw new Error('No tasks found for critical path calculation');
      }

      // Get task dependencies
      const { data: dependencies, error: depError } = await supabase
        .rpc('execute_sql', {
          query: 'SELECT * FROM task_dependencies WHERE task_id IN (' + tasks.map((_: any, i: number) => `$${i + 1}`).join(',') + ')',
          params: tasks.map((t: any) => t.id)
        });

      if (depError) throw depError;

      // Simple critical path calculation algorithm
      const taskMap = new Map(tasks.map((task: any) => [task.id, task]));
      const depMap = new Map();
      
      dependencies?.forEach((dep: any) => {
        if (!depMap.has(dep.task_id)) {
          depMap.set(dep.task_id, []);
        }
        depMap.get(dep.task_id).push(dep.depends_on_task_id);
      });

      const calculations = tasks.map((task: any) => {
        const startDate = new Date(task.start_date);
        const endDate = new Date(task.end_date);
        
        // Calculate early start/finish (forward pass)
        let earlyStart = startDate;
        const taskDeps = depMap.get(task.id) || [];
        
        if (taskDeps.length > 0) {
          const dependencyFinishes = taskDeps.map((depTaskId: string) => {
            const depTask = taskMap.get(depTaskId);
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

        return [
          projectId,
          task.id,
          isCritical,
          totalSlack,
          totalSlack, // free_slack simplified
          earlyStart.toISOString().split('T')[0],
          earlyFinish.toISOString().split('T')[0],
          lateStart.toISOString().split('T')[0],
          lateFinish.toISOString().split('T')[0]
        ];
      });

      // Delete existing analysis for this project
      await supabase
        .rpc('execute_sql', {
          query: 'DELETE FROM critical_path_analysis WHERE project_id = $1',
          params: [projectId]
        });

      // Insert new analysis
      const insertQuery = `
        INSERT INTO critical_path_analysis (
          project_id, task_id, is_critical, total_slack, free_slack, 
          early_start, early_finish, late_start, late_finish
        ) VALUES ${calculations.map((_: any, i: number) => 
          `($${i * 9 + 1}, $${i * 9 + 2}, $${i * 9 + 3}, $${i * 9 + 4}, $${i * 9 + 5}, $${i * 9 + 6}, $${i * 9 + 7}, $${i * 9 + 8}, $${i * 9 + 9})`
        ).join(', ')}
      `;

      const { data, error } = await supabase
        .rpc('execute_sql', {
          query: insertQuery,
          params: calculations.flat()
        });

      if (error) throw error;
      return data;
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
