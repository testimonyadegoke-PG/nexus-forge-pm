
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SchedulingAlert } from '@/types/scheduling';

export const useSchedulingAlerts = (userId?: string) => {
  return useQuery({
    queryKey: ['scheduling_alerts', userId],
    queryFn: async (): Promise<SchedulingAlert[]> => {
      let query = `
        SELECT sa.*, 
               p.name as project_name,
               t.name as task_name,
               m.name as milestone_name
        FROM scheduling_alerts sa
        LEFT JOIN projects p ON p.id = sa.project_id
        LEFT JOIN tasks t ON t.id = sa.task_id
        LEFT JOIN milestones m ON m.id = sa.milestone_id
        ORDER BY sa.alert_date DESC
      `;
      let params: any[] = [];

      if (userId) {
        query = query.replace('ORDER BY', 'WHERE sa.user_id = $1 ORDER BY');
        params = [userId];
      }

      const { data, error } = await supabase
        .rpc('execute_sql', { query, params });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData = (data || []).map((row: any) => ({
        id: row.id,
        project_id: row.project_id,
        task_id: row.task_id,
        milestone_id: row.milestone_id,
        user_id: row.user_id,
        alert_type: row.alert_type,
        message: row.message,
        severity: row.severity,
        is_read: row.is_read,
        alert_date: row.alert_date,
        due_date: row.due_date,
        created_at: row.created_at,
        project: row.project_name ? { name: row.project_name } : undefined,
        task: row.task_name ? { name: row.task_name } : undefined,
        milestone: row.milestone_name ? { name: row.milestone_name } : undefined
      }));

      return transformedData as SchedulingAlert[];
    },
  });
};

export const useMarkAlertAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data, error } = await supabase
        .rpc('execute_sql', {
          query: 'UPDATE scheduling_alerts SET is_read = true WHERE id = $1 RETURNING *',
          params: [alertId]
        });

      if (error) throw error;
      return data[0];
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
      const { data, error } = await supabase
        .rpc('execute_sql', {
          query: `
            INSERT INTO scheduling_alerts (
              project_id, task_id, milestone_id, user_id, alert_type, message, severity, due_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
          `,
          params: [
            alert.project_id,
            alert.task_id || null,
            alert.milestone_id || null,
            alert.user_id,
            alert.alert_type,
            alert.message,
            alert.severity,
            alert.due_date || null
          ]
        });

      if (error) throw error;
      return data[0];
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
        .rpc('execute_sql', {
          query: `
            SELECT * FROM tasks 
            WHERE project_id = $1 AND end_date < CURRENT_DATE AND status != 'completed'
          `,
          params: [projectId]
        });

      // Get approaching deadlines (within 3 days)
      const { data: approachingTasks } = await supabase
        .rpc('execute_sql', {
          query: `
            SELECT * FROM tasks 
            WHERE project_id = $1 
            AND end_date <= CURRENT_DATE + INTERVAL '3 days'
            AND end_date >= CURRENT_DATE
            AND status != 'completed'
          `,
          params: [projectId]
        });

      const alerts = [];

      // Create overdue alerts
      overdueTasks?.forEach((task: any) => {
        alerts.push([
          projectId,
          task.id,
          null, // milestone_id
          task.assignee_id || user.id,
          'task_overdue',
          `Task "${task.name}" is overdue`,
          'high',
          task.end_date
        ]);
      });

      // Create deadline approaching alerts
      approachingTasks?.forEach((task: any) => {
        alerts.push([
          projectId,
          task.id,
          null, // milestone_id
          task.assignee_id || user.id,
          'deadline_approaching',
          `Task "${task.name}" deadline approaching`,
          'medium',
          task.end_date
        ]);
      });

      if (alerts.length > 0) {
        const insertQuery = `
          INSERT INTO scheduling_alerts (
            project_id, task_id, milestone_id, user_id, alert_type, message, severity, due_date
          ) VALUES ${alerts.map((_: any, i: number) => 
            `($${i * 8 + 1}, $${i * 8 + 2}, $${i * 8 + 3}, $${i * 8 + 4}, $${i * 8 + 5}, $${i * 8 + 6}, $${i * 8 + 7}, $${i * 8 + 8})`
          ).join(', ')}
        `;

        const { error } = await supabase
          .rpc('execute_sql', {
            query: insertQuery,
            params: alerts.flat()
          });

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
