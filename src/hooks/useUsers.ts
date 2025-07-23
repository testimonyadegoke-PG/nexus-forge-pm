
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'pm' | 'viewer';
  created_at: string;
  updated_at: string;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data as User[];
    },
  });
};
