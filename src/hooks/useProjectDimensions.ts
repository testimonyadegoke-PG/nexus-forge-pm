import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Generic type for dimensions
export interface ProjectDimension {
  id: number;
  name: string;
}

// Generic hook creator for fetching dimensions
const createDimensionQueryHook = (tableName: string) => () => {
  return useQuery<ProjectDimension[], Error>({
    queryKey: [tableName],
    queryFn: async () => {
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) throw new Error(error.message);
      return data || [];
    },
  });
};

// Generic hook creator for creating a dimension
const createDimensionCreationHook = (tableName: string, dimensionName: string) => () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ProjectDimension, Error, { name: string }>({
    mutationFn: async (newData) => {
      const { data, error } = await supabase.from(tableName).insert(newData).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: `${dimensionName} created successfully.` });
      queryClient.invalidateQueries({ queryKey: [tableName] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to create ${dimensionName.toLowerCase()}: ${error.message}`, variant: 'destructive' });
    },
  });
};

// Generic hook creator for updating a dimension
const createDimensionUpdateHook = (tableName: string, dimensionName: string) => () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ProjectDimension, Error, { id: number; name: string }>({
    mutationFn: async ({ id, name }) => {
      const { data, error } = await supabase.from(tableName).update({ name }).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: `${dimensionName} updated successfully.` });
      queryClient.invalidateQueries({ queryKey: [tableName] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to update ${dimensionName.toLowerCase()}: ${error.message}`, variant: 'destructive' });
    },
  });
};

// Generic hook creator for deleting a dimension
const createDimensionDeletionHook = (tableName: string, dimensionName: string) => () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: `${dimensionName} deleted successfully.` });
      queryClient.invalidateQueries({ queryKey: [tableName] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to delete ${dimensionName.toLowerCase()}: ${error.message}`, variant: 'destructive' });
    },
  });
};

// Export hooks for Project Categories
export const useProjectCategories = createDimensionQueryHook('project_categories');
export const useCreateProjectCategory = createDimensionCreationHook('project_categories', 'Category');
export const useUpdateProjectCategory = createDimensionUpdateHook('project_categories', 'Category');
export const useDeleteProjectCategory = createDimensionDeletionHook('project_categories', 'Category');

// Export hooks for Project Statuses
export const useProjectStatuses = createDimensionQueryHook('project_statuses');
export const useCreateProjectStatus = createDimensionCreationHook('project_statuses', 'Status');
export const useUpdateProjectStatus = createDimensionUpdateHook('project_statuses', 'Status');
export const useDeleteProjectStatus = createDimensionDeletionHook('project_statuses', 'Status');

// Export hooks for Project Stages
export const useProjectStages = createDimensionQueryHook('project_stages');
export const useCreateProjectStage = createDimensionCreationHook('project_stages', 'Stage');
export const useUpdateProjectStage = createDimensionUpdateHook('project_stages', 'Stage');
export const useDeleteProjectStage = createDimensionDeletionHook('project_stages', 'Stage');

// Export hooks for Project Phases
export const useProjectPhases = createDimensionQueryHook('project_phases');
export const useCreateProjectPhase = createDimensionCreationHook('project_phases', 'Phase');
export const useUpdateProjectPhase = createDimensionUpdateHook('project_phases', 'Phase');
export const useDeleteProjectPhase = createDimensionDeletionHook('project_phases', 'Phase');
