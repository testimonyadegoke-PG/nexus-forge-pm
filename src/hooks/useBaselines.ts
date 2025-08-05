
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProjectBaseline, TaskBaseline } from '@/types/scheduling';

export const useProjectBaselines = (projectId: string) => {
  return useQuery<ProjectBaseline[]>({
    queryKey: ['project_baselines', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_baselines')
        .select('*')
        .eq('project_id', projectId)
        .order('baseline_date', { ascending: false });
      
      if (error) throw error;
      return data as ProjectBaseline[];
    },
    enabled: !!projectId,
  });
};

export const useTaskBaselines = (baselineId: string) => {
  return useQuery<TaskBaseline[]>({
    queryKey: ['task_baselines', baselineId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_baselines')
        .select('*')
        .eq('baseline_id', baselineId);
      
      if (error) throw error;
      return data as TaskBaseline[];
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
      // First create the baseline
      const { data: baseline, error: baselineError } = await supabase
        .from('project_baselines')
        .insert([{
          project_id: projectId,
          name,
          description,
          baseline_date: new Date().toISOString().split('T')[0],
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (baselineError) throw baselineError;

      // Get all current tasks for the project
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId);

      if (tasksError) throw tasksError;

      // Create task baselines
      if (tasks && tasks.length > 0) {
        const taskBaselines = tasks.map(task => ({
          baseline_id: baseline.id,
          task_id: task.id,
          planned_start_date: task.start_date,
          planned_end_date: task.end_date,
          planned_duration: task.duration,
          planned_progress: task.progress,
          baseline_cost: 0 // TODO: Calculate from budget allocations
        }));

        const { error: taskBaselinesError } = await supabase
          .from('task_baselines')
          .insert(taskBaselines);

        if (taskBaselinesError) throw taskBaselinesError;
      }

      return baseline as ProjectBaseline;
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
