import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/db-schema';

export const useUserRoles = () => {
  return useQuery<UserRole[]>({
    queryKey: ['user_roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_roles').select('*').order('id');
      if (error) throw error;
      return data as UserRole[];
    },
  });
};

export const useCreateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase.from('user_roles').insert([{ name }]).select().single();
      if (error) throw error;
      return data as UserRole;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user_roles']);
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const { data, error } = await supabase.from('user_roles').update({ name }).eq('id', id).select().single();
      if (error) throw error;
      return data as UserRole;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user_roles']);
    },
  });
};

export const useDeleteUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('user_roles').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user_roles']);
    },
  });
};
