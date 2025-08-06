
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { WbsItem } from '@/types/scheduling';

export const useWbsItems = (projectId: string) => {
  return useQuery<WbsItem[]>({
    queryKey: ['wbs_items', projectId],
    queryFn: async () => {
      // TODO: Replace with actual Supabase query once types are updated
      return [];
    },
    enabled: !!projectId,
  });
};

export const useCreateWbsItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<WbsItem, 'id' | 'created_at' | 'updated_at' | 'children'>) => {
      // TODO: Replace with actual Supabase mutation once types are updated
      console.log('Creating WBS item:', data);
      return { ...data, id: 'mock', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "WBS item created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['wbs_items', data.project_id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create WBS item: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateWbsItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WbsItem> }) => {
      // TODO: Replace with actual Supabase mutation once types are updated
      console.log('Updating WBS item:', id, data);
      return { id, ...data };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "WBS item updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['wbs_items'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update WBS item: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteWbsItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // TODO: Replace with actual Supabase mutation once types are updated
      console.log('Deleting WBS item:', id);
      return { id };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "WBS item deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['wbs_items'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete WBS item: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
