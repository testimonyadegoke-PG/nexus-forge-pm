
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProjectBaseline, TaskBaseline } from '@/types/scheduling';

export const useProjectBaselines = (projectId: string) => {
  return useQuery({
    queryKey: ['project_baselines', projectId],
    queryFn: async (): Promise<ProjectBaseline[]> => {
      const { data, error } = await supabase
        .rpc('execute_sql', {
          query: `SELECT * FROM project_baselines WHERE project_id = $1 ORDER BY created_at DESC`,
          params: [projectId]
        });

      if (error) throw error;
      return (data || []) as ProjectBaseline[];
    },
    enabled: !!projectId,
  });
};

export const useTaskBaselines = (baselineId: string) => {
  return useQuery({
    queryKey: ['task_baselines', baselineId],
    queryFn: async (): Promise<TaskBaseline[]> => {
      const { data, error } = await supabase
        .rpc('execute_sql', {
          query: `
            SELECT tb.*, 
                   t.name as task_name,
                   t.start_date,
                   t.end_date,
                   t.duration,
                   t.progress
            FROM task_baselines tb
            JOIN tasks t ON t.id = tb.task_id
            WHERE tb.baseline_id = $1
          `,
          params: [baselineId]
        });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map((row: any) => ({
        id: row.id,
        baseline_id: row.baseline_id,
        task_id: row.task_id,
        planned_start_date: row.planned_start_date,
        planned_end_date: row.planned_end_date,
        planned_duration: row.planned_duration,
        planned_progress: row.planned_progress,
        baseline_cost: row.baseline_cost,
        created_at: row.created_at,
        task: {
          name: row.task_name,
          start_date: row.start_date,
          end_date: row.end_date,
          duration: row.duration,
          progress: row.progress
        }
      }));

      return transformedData as TaskBaseline[];
    },
    enabled: !!baselineId,
  });
};

export const useCreateBaseline = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      projectId, 
      name, 
      description 
    }: { 
      projectId: string; 
      name: string; 
      description?: string; 
    }) => {
      // First create the baseline using raw SQL
      const { data: baseline, error: baselineError } = await supabase
        .rpc('execute_sql', {
          query: `
            INSERT INTO project_baselines (project_id, name, description, baseline_date, is_current)
            VALUES ($1, $2, $3, CURRENT_DATE, false)
            RETURNING *
          `,
          params: [projectId, name, description || null]
        });

      if (baselineError) throw baselineError;
      const baselineRecord = baseline[0];

      // Then capture current task data
      const { data: tasks, error: tasksError } = await supabase
        .rpc('execute_sql', {
          query: 'SELECT * FROM tasks WHERE project_id = $1',
          params: [projectId]
        });

      if (tasksError) throw tasksError;

      if (tasks && tasks.length > 0) {
        const taskBaselinesQuery = `
          INSERT INTO task_baselines (baseline_id, task_id, planned_start_date, planned_end_date, planned_duration, planned_progress, baseline_cost)
          VALUES ${tasks.map((_: any, index: number) => 
            `($${index * 6 + 1}, $${index * 6 + 2}, $${index * 6 + 3}, $${index * 6 + 4}, $${index * 6 + 5}, $${index * 6 + 6})`
          ).join(', ')}
        `;

        const params = tasks.flatMap((task: any) => [
          baselineRecord.id,
          task.id,
          task.start_date,
          task.end_date,
          task.duration,
          task.progress
        ]);

        const { error: taskBaselinesError } = await supabase
          .rpc('execute_sql', {
            query: taskBaselinesQuery,
            params
          });

        if (taskBaselinesError) throw taskBaselinesError;
      }

      return baselineRecord;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Baseline created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['project_baselines', data.project_id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create baseline: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useSetCurrentBaseline = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (baselineId: string) => {
      // First get the baseline to know the project
      const { data: baseline, error: getError } = await supabase
        .rpc('execute_sql', {
          query: 'SELECT project_id FROM project_baselines WHERE id = $1',
          params: [baselineId]
        });

      if (getError) throw getError;
      const projectId = baseline[0]?.project_id;

      // Reset all baselines for this project
      const { error: resetError } = await supabase
        .rpc('execute_sql', {
          query: 'UPDATE project_baselines SET is_current = false WHERE project_id = $1',
          params: [projectId]
        });

      if (resetError) throw resetError;

      // Set the selected baseline as current
      const { error: updateError } = await supabase
        .rpc('execute_sql', {
          query: 'UPDATE project_baselines SET is_current = true WHERE id = $1',
          params: [baselineId]
        });

      if (updateError) throw updateError;

      return projectId;
    },
    onSuccess: (projectId) => {
      toast({
        title: "Success",
        description: "Current baseline updated",
      });
      queryClient.invalidateQueries({ queryKey: ['project_baselines', projectId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to set current baseline: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
