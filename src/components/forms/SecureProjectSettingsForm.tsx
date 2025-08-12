
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUpdateProject, Project } from '@/hooks/useProjects';
import { useUsers } from '@/hooks/useUsers';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logEnhancedSecurityEvent, verifyProjectAccess, generateCSRFToken, setCSRFToken } from '@/utils/securityEnhanced';
import { useSecurityMiddleware } from '@/hooks/useSecurityMiddleware';

const settingsSchema = z.object({
  manager_id: z.string().optional(),
  csrf_token: z.string(),
});

interface SecureProjectSettingsFormProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SecureProjectSettingsForm = ({ project, open, onOpenChange }: SecureProjectSettingsFormProps) => {
  const updateProject = useUpdateProject();
  const { data: users } = useUsers();
  const { toast } = useToast();
  const { securityContext, requireAdmin, checkRateLimit } = useSecurityMiddleware();
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [hasProjectAccess, setHasProjectAccess] = useState<boolean>(false);
  
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      manager_id: project.manager_id || 'no-manager',
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
    verifyProjectAccess(project.id, 'admin').then(setHasProjectAccess);
  }, [project.id, form]);

  const onSubmit = async (data: z.infer<typeof settingsSchema>) => {
    try {
      // Security checks
      if (!hasProjectAccess) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to modify project settings",
          variant: "destructive",
        });
        return;
      }

      if (!checkRateLimit('project_settings')) {
        return;
      }

      // Validate manager assignment - only admins can change manager to someone other than themselves
      if (data.manager_id && data.manager_id !== 'no-manager' && data.manager_id !== securityContext?.userId && !requireAdmin()) {
        return;
      }

      // Log the settings change attempt
      await logEnhancedSecurityEvent('PROJECT_SETTINGS_CHANGE', 'project', project.id, {
        oldManagerId: project.manager_id,
        newManagerId: data.manager_id === 'no-manager' ? undefined : data.manager_id,
      });

      await updateProject.mutateAsync({
        id: project.id,
        data: {
          manager_id: data.manager_id === 'no-manager' ? undefined : data.manager_id,
        }
      });

      await logEnhancedSecurityEvent('PROJECT_SETTINGS_SUCCESS', 'project', project.id);
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Project settings updated successfully",
      });
    } catch (error: any) {
      await logEnhancedSecurityEvent('PROJECT_SETTINGS_ERROR', 'project', project.id, { 
        error: error.message 
      });
      toast({
        title: "Error",
        description: "Failed to update project settings",
        variant: "destructive",
      });
    }
  };

  // Filter users - only show PMs and admins as potential managers
  const eligibleManagers = users?.filter(user => user.role === 'admin' || user.role === 'pm') || [];

  if (!hasProjectAccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Access Denied</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="text-muted-foreground">You don't have permission to modify project settings.</p>
            <Button onClick={() => onOpenChange(false)} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Project Settings</DialogTitle>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" name="csrf_token" value={csrfToken} />
            
            <FormField
              control={form.control}
              name="manager_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Manager</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project manager" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no-manager">No Manager Assigned</SelectItem>
                      {eligibleManagers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {!securityContext?.isAdmin && (
                    <p className="text-xs text-muted-foreground">
                      Only administrators can assign other users as project managers.
                    </p>
                  )}
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateProject.isPending}>
                {updateProject.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
