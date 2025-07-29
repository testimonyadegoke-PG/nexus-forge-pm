import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateBudget, type CreateBudgetData } from '@/hooks/useBudgets';
import { useProjects } from '@/hooks/useProjects';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const budgetSchema = z.object({
  project_id: z.string({ required_error: "Project is required." }).min(1, 'Project is required'),
  category: z.string({ required_error: "Category is required." }).min(1, 'Category is required'),
  subcategory: z.string().optional(),
  allocated_amount: z.coerce.number({ required_error: "Allocated amount is required." }).min(0, 'Allocated amount must be a positive number'),
  description: z.string().optional(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

const CreateBudget = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const createBudgetMutation = useCreateBudget();

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      project_id: '',
      category: '',
      subcategory: '',
      allocated_amount: 0,
      description: '',
    },
  });

  const onSubmit = async (data: CreateBudgetData) => {
    await createBudgetMutation.mutateAsync(data, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Budget created successfully.',
        });
        navigate('/dashboard/budgets');
      },
      onError: (error) => {
        // The hook already shows a toast on error
        console.error('Failed to create budget:', error);
      },
    });
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="project_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={projectsLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects?.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Marketing, Development" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Social Media Ads" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allocated_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allocated Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 5000" {...field} />
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the budget item" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createBudgetMutation.isPending}>
                  {createBudgetMutation.isPending ? 'Creating...' : 'Create Budget'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateBudget;
