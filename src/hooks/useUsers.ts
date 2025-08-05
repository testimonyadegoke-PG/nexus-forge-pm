
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  role_id?: number;
  created_at?: string;
  updated_at?: string;
  avatar_url?: string;
}

export const useUsers = () => {
  return useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*');

      if (error) {
        throw new Error(error.message);
      }
      return data as User[];
    },
  });
};

export const useUser = (id: string) => {
  return useQuery<User, Error>({
    queryKey: ['users', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data as User;
    },
    enabled: !!id,
  });
};
