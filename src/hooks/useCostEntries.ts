
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CostEntry {
  id: string;
  project_id: string;
  category: string;
  subcategory: string;
  amount: number;
  source_type: 'manual' | 'timesheet' | 'invoice' | 'expense';
  entry_date: string;
  description: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCostEntryData {
  project_id: string;
  category: string;
  subcategory?: string;
  amount: number;
  source_type: 'manual' | 'timesheet' | 'invoice' | 'expense';
  entry_date: string;
  description?: string;
  created_by?: string;
}

export const useProjectCostEntries = (projectId: string) => {
  return useQuery({
    queryKey: ['cost_entries', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_entries')
        .select('*')
        .eq('project_id', projectId)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return data as CostEntry[];
    },
    enabled: !!projectId,
  });
};

export const useCostEntries = () => {
  return useQuery({
    queryKey: ['cost_entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_entries')
        .select('*');

      if (error) throw error;
      return data as CostEntry[];
    },
  });
};

export const useCreateCostEntry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateCostEntryData) => {
      const { data: result, error } = await supabase
        .from('cost_entries')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: ['cost_entries', newEntry.project_id] });
      const previousEntries = queryClient.getQueryData<CostEntry[]>(['cost_entries', newEntry.project_id]);
      if (previousEntries) {
        queryClient.setQueryData<CostEntry[]>(['cost_entries', newEntry.project_id], [
          { ...newEntry, id: 'temp-id', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), description: newEntry.description || '', created_by: newEntry.created_by || '', subcategory: newEntry.subcategory || '' },
          ...previousEntries
        ]);
      }
      return { previousEntries };
    },
    onError: (error, _newEntry, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData<CostEntry[]>(['cost_entries', _newEntry.project_id], context.previousEntries);
      }
      toast({
        title: "Error",
        description: "Failed to create cost entry: " + error.message,
        variant: "destructive",
      });
    },
  });
};
