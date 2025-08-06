
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SchedulingAlert } from '@/types/scheduling';

export const useSchedulingAlerts = (userId?: string) => {
  return useQuery({
    queryKey: ['scheduling_alerts', userId],
    queryFn: async (): Promise<SchedulingAlert[]> => {
      // Mock implementation for now
      return [];
    },
  });
};

export const useMarkAlertAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      // Mock implementation for now
      return { id: alertId, is_read: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling_alerts'] });
    },
  });
};

export const useCreateSchedulingAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alert: Omit<SchedulingAlert, 'id' | 'is_read' | 'alert_date' | 'created_at'>) => {
      // Mock implementation for now
      const mockAlert: SchedulingAlert = {
        id: crypto.randomUUID(),
        project_id: alert.project_id,
        task_id: alert.task_id,
        milestone_id: alert.milestone_id,
        user_id: alert.user_id,
        alert_type: alert.alert_type,
        message: alert.message,
        severity: alert.severity,
        is_read: false,
        alert_date: new Date().toISOString().split('T')[0],
        due_date: alert.due_date,
        created_at: new Date().toISOString()
      };

      return mockAlert;
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

      // Get overdue tasks from existing tasks table
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
        .gte('end_date', new Date().toISOString().split('T')[0])
        .lte('end_date', threeDaysFromNow.toISOString().split('T')[0])
        .neq('status', 'completed');

      const alerts = [];

      // Create mock alerts based on found tasks
      overdueTasks?.forEach((task: any) => {
        alerts.push({
          project_id: projectId,
          task_id: task.id,
          user_id: task.assignee_id || user.id,
          alert_type: 'task_overdue',
          message: `Task "${task.name}" is overdue`,
          severity: 'high',
          due_date: task.end_date
        });
      });

      approachingTasks?.forEach((task: any) => {
        alerts.push({
          project_id: projectId,
          task_id: task.id,
          user_id: task.assignee_id || user.id,
          alert_type: 'deadline_approaching',
          message: `Task "${task.name}" deadline approaching`,
          severity: 'medium',
          due_date: task.end_date
        });
      });

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
