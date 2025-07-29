import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/db-schema';

export const useCompanies = () => {
  return useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase.from('companies').select('*').order('id');
      if (error) throw error;
      return data as Company[];
    },
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (company: Omit<Company, 'id'>) => {
      const { data, error } = await supabase.from('companies').insert([company]).select().single();
      if (error) throw error;
      return data as Company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['companies']);
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (company: Company) => {
      const { id, ...rest } = company;
      const { data, error } = await supabase.from('companies').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return data as Company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['companies']);
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['companies']);
    },
  });
};
