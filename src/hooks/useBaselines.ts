
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ProjectBaseline, TaskBaseline } from '@/types/scheduling';

export const useProjectBaselines = (projectId: string) => {
  return useQuery<ProjectBaseline[]>({
    queryKey: ['project_baselines', projectId],
    queryFn: async () => {
      // TODO: Replace with actual Supabase query once types are updated
      return [];
    },
    enabled: !!projectId,
  });
};

export const useTaskBaselines = (baselineId: string) => {
  return useQuery<TaskBaseline[]>({
    queryKey: ['task_baselines', baselineId],
    queryFn: async () => {
      // TODO: Replace with actual Supabase query once types are updated
      return [];
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
      // TODO: Replace with actual Supabase mutation once types are updated
      console.log('Creating baseline:', { projectId, name, description });
      
      const baseline: ProjectBaseline = {
        id: 'mock',
        project_id: projectId,
        name,
        description,
        baseline_date: new Date().toISOString().split('T')[0],
        is_current: false,
        created_at: new Date().toISOString()
      };

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
