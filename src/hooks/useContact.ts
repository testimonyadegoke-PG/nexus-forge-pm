import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/db-schema';

export const useContacts = (customerId?: number) => {
  return useQuery<Contact[]>({
    queryKey: ['contacts', customerId],
    queryFn: async () => {
      let query = supabase.from('contacts').select('*');
      if (customerId) query = query.eq('customer_id', customerId);
      const { data, error } = await query;
      if (error) throw error;
      return data as Contact[];
    },
    enabled: !!customerId,
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contact: Omit<Contact, 'id'>) => {
      const { data, error } = await supabase.from('contacts').insert([contact]).select().single();
      if (error) throw error;
      return data as Contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
    },
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contact: Contact) => {
      const { id, ...rest } = contact;
      const { data, error } = await supabase.from('contacts').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return data as Contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
    },
  });
};
