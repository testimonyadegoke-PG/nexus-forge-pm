import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ResourceCapacity } from '@/types/scheduling';

export const useResourceCapacity = (userId?: string, dateRange?: { start: string; end: string }) => {
  return useQuery({
    queryKey: ['resource_capacity', userId, dateRange],
    queryFn: async (): Promise<ResourceCapacity[]> => {
      let query = supabase
        .from('resource_capacity')
        .select(`
          *,
          user:users(full_name, email)
        `)
        .order('date', { ascending: true });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (dateRange) {
        query = query
          .gte('date', dateRange.start)
          .lte('date', dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as ResourceCapacity[];
    },
  });
};

export const useUpdateResourceCapacity = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (capacity: {
      user_id: string;
      date: string;
      available_hours: number;
      allocated_hours?: number;
    }) => {
      const { data, error } = await supabase
        .from('resource_capacity')
        .upsert(capacity, {
          onConflict: 'user_id,date'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Resource capacity updated",
      });
      queryClient.invalidateQueries({ queryKey: ['resource_capacity'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update capacity: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useResourceAllocation = (projectId?: string) => {
  return useQuery({
    queryKey: ['resource_allocation', projectId],
    queryFn: async () => {
      // Get tasks with assignees for the project
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:users(id, full_name, email)
        `)
        .eq('project_id', projectId)
        .not('assignee_id', 'is', null);

      if (error) throw error;

      // Calculate allocation by user and date
      const allocation = new Map();
      
      tasks?.forEach(task => {
        if (!task.assignee_id) return;
        
        const startDate = new Date(task.start_date);
        const endDate = new Date(task.end_date);
        const dailyHours = 8 / task.duration; // Simplified allocation
        
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
          const dateStr = date.toISOString().split('T')[0];
          const key = `${task.assignee_id}-${dateStr}`;
          
          if (!allocation.has(key)) {
            allocation.set(key, {
              user_id: task.assignee_id,
              date: dateStr,
              allocated_hours: 0,
              tasks: []
            });
          }
          
          const existing = allocation.get(key);
          existing.allocated_hours += dailyHours;
          existing.tasks.push(task.name);
        }
      });

      return Array.from(allocation.values());
    },
    enabled: !!projectId,
  });
};
