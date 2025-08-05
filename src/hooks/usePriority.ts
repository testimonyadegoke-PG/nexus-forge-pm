
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Priority {
  id: number;
  name: string;
  rank?: number;
}

export const usePriorities = () => {
  return useQuery<Priority[]>({
    queryKey: ['priorities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('priorities')
        .select('*')
        .order('rank');

      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreatePriority = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, rank }: { name: string; rank?: number }) => {
      const { data, error } = await supabase
        .from('priorities')
        .insert([{ name, rank }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
    },
  });
};

export const useUpdatePriority = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, rank }: { id: number; name: string; rank?: number }) => {
      const { data, error } = await supabase
        .from('priorities')
        .update({ name, rank })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
    },
  });
};

export const useDeletePriority = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('priorities')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
    },
  });
};
