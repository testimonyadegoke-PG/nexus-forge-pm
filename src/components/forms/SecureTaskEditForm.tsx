
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUpdateTask, Task } from '@/hooks/useTasks';
import { useUsers } from '@/hooks/useUsers';
import { format, parseISO } from 'date-fns';
import { sanitizeInputEnhanced, logEnhancedSecurityEvent, verifyProjectAccess, generateCSRFToken, setCSRFToken } from '@/utils/securityEnhanced';
import { useSecurityMiddleware } from '@/hooks/useSecurityMiddleware';
import { useToast } from '@/hooks/use-toast';

const taskEditSchema = z.object({
  name: z.string().min(1, 'Task name is required').max(200, 'Task name too long').refine(
    (val) => !/<script|javascript:|on\w+=/i.test(val),
    'Invalid characters in task name'
  ),
  description: z.string().optional().refine(
    (val) => !val || val.length <= 2000,
    'Description too long'
  ),
  status: z.string(),
  assignee_id: z.string().nullable(),
  start_date: z.string(),
  end_date: z.string(),
  csrf_token: z.string(),
}).refine(
  (data) => new Date(data.start_date) <= new Date(data.end_date),
  {
    message: "End date must be after start date",
    path: ["end_date"],
  }
);

export interface SecureTaskEditFormProps {
  task: Task;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const SecureTaskEditForm: React.FC<SecureTaskEditFormProps> = ({ 
  task, 
  open = true, 
  onOpenChange = () => {}, 
  onSuccess,
  onCancel 
}) => {
  const { mutate: updateTask } = useUpdateTask();
  const { data: users = [] } = useUsers();
  const { securityContext, checkRateLimit } = useSecurityMiddleware();
  const { toast } = useToast();
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [hasProjectAccess, setHasProjectAccess] = useState<boolean>(false);

  const form = useForm<z.infer<typeof taskEditSchema>>({
    resolver: zodResolver(taskEditSchema),
    defaultValues: {
      name: task.name,
      description: task.description || '',
      status: task.status,
      assignee_id: task.assignee_id || null,
      start_date: format(parseISO(task.start_date), 'yyyy-MM-dd'),
      end_date: format(parseISO(task.end_date), 'yyyy-MM-dd'),
      csrf_token: '',
    },
  });

  useEffect(() => {
    // Generate and set CSRF token
    const token = generateCSRFToken();
    setCsrfToken(token);
    setCSRFToken(token);
    form.setValue('csrf_token', token);

    // Verify project access
    if (task.project_id) {
      verifyProjectAccess(task.project_id, 'write').then(setHasProjectAccess);
    }
  }, [task.project_id, form]);

  const onSubmit = async (values: z.infer<typeof taskEditSchema>) => {
    try {
      // Security checks
      if (!hasProjectAccess) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to edit this task",
          variant: "destructive",
        });
        return;
      }

      if (!checkRateLimit('task_edit')) {
        return;
      }

      // Log the edit attempt
      await logEnhancedSecurityEvent('TASK_EDIT_ATTEMPT', 'task', task.id, {
        originalName: task.name,
        newName: values.name,
        statusChange: task.status !== values.status,
      });

      // Sanitize inputs
      const sanitizedValues = {
        ...values,
        name: sanitizeInputEnhanced(values.name),
        description: values.description ? sanitizeInputEnhanced(values.description) : undefined,
      };

      updateTask({ id: task.id, data: sanitizedValues }, {
        onSuccess: () => {
          logEnhancedSecurityEvent('TASK_EDIT_SUCCESS', 'task', task.id);
          onOpenChange(false);
          if (onSuccess) onSuccess();
          toast({
            title: "Success",
            description: "Task updated successfully",
          });
        },
        onError: (error) => {
          logEnhancedSecurityEvent('TASK_EDIT_ERROR', 'task', task.id, { error: error.message });
          toast({
            title: "Error",
            description: "Failed to update task",
            variant: "destructive",
          });
        },
      });
    } catch (error) {
      console.error('Task edit security error:', error);
      toast({
        title: "Security Error",
        description: "Unable to process request",
        variant: "destructive",
      });
    }
  };

  if (!hasProjectAccess) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">You don't have permission to edit this task.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" name="csrf_token" value={csrfToken} />
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Name</FormLabel>
              <FormControl>
                <Input {...field} maxLength={200} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} maxLength={2000} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assignee_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assignee</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'unassigned'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel || (() => onOpenChange(false))}>
            Cancel
          </Button>
          <Button type="submit" disabled={!securityContext?.isAuthenticated}>
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
};
