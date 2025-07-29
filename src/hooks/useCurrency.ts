import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Currency } from '@/db-schema';

export const useCurrencies = () => {
  return useQuery<Currency[]>({
    queryKey: ['currencies'],
    queryFn: async () => {
      const { data, error } = await supabase.from('currencies').select('*').order('code');
      if (error) throw error;
      return data as Currency[];
    },
  });
};

export const useCreateCurrency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (currency: Omit<Currency, 'id'>) => {
      const { data, error } = await supabase.from('currencies').insert([currency]).select().single();
      if (error) throw error;
      return data as Currency;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currencies']);
    },
  });
};

export const useUpdateCurrency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (currency: Currency) => {
      const { id, ...rest } = currency;
      const { data, error } = await supabase.from('currencies').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return data as Currency;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currencies']);
    },
  });
};

export const useDeleteCurrency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('currencies').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currencies']);
    },
  });
};
