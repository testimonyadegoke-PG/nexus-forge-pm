
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { EnhancedSelect } from '@/components/ui/enhanced-select';
import { DatePicker } from '@/components/ui/date-picker';
import { useUpdateProject, Project } from '@/hooks/useProjects';
import { useProjectCategories } from '@/hooks/useProjectDimensions';
import { useProjectPhases } from '@/hooks/useProjectDimensions';
import { useProjectStages } from '@/hooks/useProjectDimensions';
import { useProjectStatuses } from '@/hooks/useProjectDimensions';
import { useUsers } from '@/hooks/useUsers';

const formSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  start_date: z.string(),
  end_date: z.string(),
  status: z.string(),
  manager_id: z.string().optional(),
  category_id: z.string().optional(),
  phase_id: z.string().optional(),
  stage_id: z.string().optional(),
});

interface EnhancedEditProjectFormProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EnhancedEditProjectForm: React.FC<EnhancedEditProjectFormProps> = ({
  project,
  open,
  onOpenChange
}) => {
  const { mutate: updateProject } = useUpdateProject();
  const { data: categories = [] } = useProjectCategories();
  const { data: phases = [] } = useProjectPhases();
  const { data: stages = [] } = useProjectStages();
  const { data: statuses = [] } = useProjectStatuses();
  const { data: users = [] } = useUsers();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project.name || '',
      description: project.description || '',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      status: project.status || '',
      manager_id: project.manager_id || '',
      category_id: project.category_id?.toString() || '',
      phase_id: project.phase_id?.toString() || '',
      stage_id: project.stage_id?.toString() || '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateProject({
      id: project.id,
      data: {
        ...values,
        category_id: values.category_id ? parseInt(values.category_id) : undefined,
        phase_id: values.phase_id ? parseInt(values.phase_id) : undefined,
        stage_id: values.stage_id ? parseInt(values.stage_id) : undefined,
      }
    }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  const categoryOptions = categories.map(cat => ({
    value: cat.id.toString(),
    label: cat.name
  }));

  const phaseOptions = phases.map(phase => ({
    value: phase.id.toString(),
    label: phase.name
  }));

  const stageOptions = stages.map(stage => ({
    value: stage.id.toString(),
    label: stage.name
  }));

  const statusOptions = statuses.map(status => ({
    value: status.name,
    label: status.name
  }));

  const userOptions = users.map(user => ({
    value: user.id,
    label: user.full_name || user.email
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project: {project.name}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
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
                    <FormControl>
                      <EnhancedSelect
                        options={statusOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select status"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter project description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="manager_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Manager</FormLabel>
                    <FormControl>
                      <EnhancedSelect
                        options={userOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select manager"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <EnhancedSelect
                        options={categoryOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select category"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phase_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phase</FormLabel>
                    <FormControl>
                      <EnhancedSelect
                        options={phaseOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select phase"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stage_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage</FormLabel>
                    <FormControl>
                      <EnhancedSelect
                        options={stageOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select stage"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Project</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
