
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SchedulingAlert } from '@/types/scheduling';

export const useSchedulingAlerts = (userId?: string) => {
  return useQuery<SchedulingAlert[]>({
    queryKey: ['scheduling_alerts', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduling_alerts')
        .select('*')
        .eq('user_id', userId || (await supabase.auth.getUser()).data.user?.id || '')
        .order('alert_date', { ascending: false });
      
      if (error) throw error;
      return data as SchedulingAlert[];
    },
  });
};

export const useMarkAlertAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data, error } = await supabase
        .from('scheduling_alerts')
        .update({ is_read: true })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;
      return data as SchedulingAlert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling_alerts'] });
    },
  });
};

export const useCreateSchedulingAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alert: Omit<SchedulingAlert, 'id' | 'is_read' | 'alert_date'>) => {
      const { data, error } = await supabase
        .from('scheduling_alerts')
        .insert([alert])
        .select()
        .single();

      if (error) throw error;
      return data as SchedulingAlert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling_alerts'] });
    },
  });
};
