
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProjectBaseline, TaskBaseline } from '@/types/scheduling';

export const useProjectBaselines = (projectId: string) => {
  return useQuery<ProjectBaseline[]>({
    queryKey: ['project_baselines', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_baselines')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
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
        .select(`
          *,
          task:tasks(name, start_date, end_date, duration, progress)
        `)
        .eq('baseline_id', baselineId);

      if (error) throw error;
      return data || [];
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
        .insert({
          project_id: projectId,
          name,
          description,
          baseline_date: new Date().toISOString().split('T')[0],
          is_current: false
        })
        .select()
        .single();

      if (baselineError) throw baselineError;

      // Then capture current task data
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId);

      if (tasksError) throw tasksError;

      if (tasks && tasks.length > 0) {
        const taskBaselines = tasks.map(task => ({
          baseline_id: baseline.id,
          task_id: task.id,
          planned_start_date: task.start_date,
          planned_end_date: task.end_date,
          planned_duration: task.duration,
          planned_progress: task.progress,
          baseline_cost: 0 // Could be calculated from budget data
        }));

        const { error: taskBaselinesError } = await supabase
          .from('task_baselines')
          .insert(taskBaselines);

        if (taskBaselinesError) throw taskBaselinesError;
      }

      return baseline;
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
        .from('project_baselines')
        .select('project_id')
        .eq('id', baselineId)
        .single();

      if (getError) throw getError;

      // Reset all baselines for this project
      const { error: resetError } = await supabase
        .from('project_baselines')
        .update({ is_current: false })
        .eq('project_id', baseline.project_id);

      if (resetError) throw resetError;

      // Set the selected baseline as current
      const { error: updateError } = await supabase
        .from('project_baselines')
        .update({ is_current: true })
        .eq('id', baselineId);

      if (updateError) throw updateError;

      return baseline.project_id;
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
