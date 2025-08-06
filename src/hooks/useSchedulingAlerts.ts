import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SchedulingAlert } from '@/types/scheduling';

export const useSchedulingAlerts = (userId?: string) => {
  return useQuery({
    queryKey: ['scheduling_alerts', userId],
    queryFn: async (): Promise<SchedulingAlert[]> => {
      let query = supabase
        .from('scheduling_alerts')
        .select(`
          *,
          project:projects(name),
          task:tasks(name),
          milestone:milestones(name)
        `)
        .order('alert_date', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as SchedulingAlert[];
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
      return data;
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
        .insert({
          ...alert,
          alert_date: new Date().toISOString(),
          is_read: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling_alerts'] });
    },
  });
};

export const useGenerateSchedulingAlerts = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get overdue tasks
      const { data: overdueTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .lt('end_date', new Date().toISOString().split('T')[0])
        .neq('status', 'completed');

      // Get approaching deadlines (within 3 days)
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      const { data: approachingTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .lte('end_date', threeDaysFromNow.toISOString().split('T')[0])
        .gte('end_date', new Date().toISOString().split('T')[0])
        .neq('status', 'completed');

      const alerts = [];

      // Create overdue alerts
      overdueTasks?.forEach(task => {
        alerts.push({
          project_id: projectId,
          task_id: task.id,
          user_id: task.assignee_id || user.id,
          alert_type: 'task_overdue' as const,
          message: `Task "${task.name}" is overdue`,
          severity: 'high' as const,
          due_date: task.end_date
        });
      });

      // Create deadline approaching alerts
      approachingTasks?.forEach(task => {
        alerts.push({
          project_id: projectId,
          task_id: task.id,
          user_id: task.assignee_id || user.id,
          alert_type: 'deadline_approaching' as const,
          message: `Task "${task.name}" deadline approaching`,
          severity: 'medium' as const,
          due_date: task.end_date
        });
      });

      if (alerts.length > 0) {
        const { error } = await supabase
          .from('scheduling_alerts')
          .insert(alerts);

        if (error) throw error;
      }

      return alerts;
    },
    onSuccess: (alerts) => {
      toast({
        title: "Alerts Generated",
        description: `Created ${alerts.length} scheduling alerts`,
      });
      queryClient.invalidateQueries({ queryKey: ['scheduling_alerts'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate alerts: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
