
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WbsItem } from '@/types/scheduling';

export const useWbsItems = (projectId: string) => {
  return useQuery<WbsItem[]>({
    queryKey: ['wbs_items', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wbs_items')
        .select('*')
        .eq('project_id', projectId)
        .order('wbs_code', { ascending: true });
      
      if (error) throw error;
      
      // Build hierarchical structure
      const items = data as WbsItem[];
      const itemMap = new Map<string, WbsItem>();
      const rootItems: WbsItem[] = [];

      // First pass: create map and initialize children arrays
      items.forEach(item => {
        item.children = [];
        itemMap.set(item.id, item);
      });

      // Second pass: build hierarchy
      items.forEach(item => {
        if (item.parent_id) {
          const parent = itemMap.get(item.parent_id);
          if (parent) {
            parent.children!.push(item);
          }
        } else {
          rootItems.push(item);
        }
      });

      return rootItems;
    },
    enabled: !!projectId,
  });
};

export const useCreateWbsItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (wbsItem: Omit<WbsItem, 'id' | 'created_at' | 'updated_at' | 'children'>) => {
      const { data, error } = await supabase
        .from('wbs_items')
        .insert([wbsItem])
        .select()
        .single();

      if (error) throw error;
      return data as WbsItem;
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
      const { data: result, error } = await supabase
        .from('wbs_items')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as WbsItem;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "WBS item updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['wbs_items', data.project_id] });
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
      const { error } = await supabase
        .from('wbs_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
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
