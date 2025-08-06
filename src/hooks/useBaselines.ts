
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProjectBaseline, TaskBaseline } from '@/types/scheduling';

export const useProjectBaselines = (projectId: string) => {
  return useQuery({
    queryKey: ['project_baselines', projectId],
    queryFn: async (): Promise<ProjectBaseline[]> => {
      // Use a simple approach without execute_sql - create mock data for now
      // This will be replaced when the tables are properly added to Supabase types
      return [];
    },
    enabled: !!projectId,
  });
};

export const useTaskBaselines = (baselineId: string) => {
  return useQuery({
    queryKey: ['task_baselines', baselineId],
    queryFn: async (): Promise<TaskBaseline[]> => {
      // Use a simple approach without execute_sql - create mock data for now
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
      // For now, return a mock baseline until the tables are properly set up
      const mockBaseline = {
        id: crypto.randomUUID(),
        project_id: projectId,
        name,
        description: description || null,
        baseline_date: new Date().toISOString().split('T')[0],
        is_current: false,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return mockBaseline;
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
      // Mock implementation for now
      return 'mock-project-id';
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
