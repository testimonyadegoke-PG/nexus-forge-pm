
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateBudget } from '@/hooks/useBudgets';
import { EnhancedSelect } from '@/components/ui/enhanced-select';
import { useBudgetCategories, useBudgetSubcategories } from '@/hooks/useBudgetCategories';
import { useCreateBudgetCategory } from '@/hooks/useBudgetCategory';
import { useCreateBudgetSubcategory } from '@/hooks/useBudgetSubcategory';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  allocated_amount: z.number().min(0, 'Amount must be positive'),
  description: z.string().optional(),
});

interface CreateBudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProjectId?: string;
}

export const CreateBudgetForm: React.FC<CreateBudgetFormProps> = ({
  open,
  onOpenChange,
  defaultProjectId
}) => {
  const { toast } = useToast();
  const { mutate: createBudget } = useCreateBudget();
  const { data: categories = [] } = useBudgetCategories();
  const { data: subcategories = [] } = useBudgetSubcategories();
  const { mutate: createCategory } = useCreateBudgetCategory();
  const { mutate: createSubcategory } = useCreateBudgetSubcategory();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      subcategory: '',
      allocated_amount: 0,
      description: '',
    },
  });

  const selectedCategory = form.watch('category');
  const filteredSubcategories = subcategories.filter(
    sub => sub.category_id.toString() === selectedCategory
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!defaultProjectId) {
      toast({
        title: "Error",
        description: "Project ID is required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get the current user's ID from Supabase Auth
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive",
        });
        return;
      }

      const budgetData = {
        name: values.name,
        project_id: defaultProjectId,
        category: values.category,
        subcategory: values.subcategory || undefined,
        allocated_amount: values.allocated_amount,
        description: values.description || undefined,
        created_by: user.id, // Use the actual user UUID from Supabase Auth
      };

      createBudget(budgetData, {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      });
    } catch (error) {
      console.error('Error creating budget:', error);
      toast({
        title: "Error",
        description: "Failed to create budget",
        variant: "destructive",
      });
    }
  };

  const handleCreateCategory = async (name: string) => {
    return new Promise<void>((resolve, reject) => {
      createCategory(name, {
        onSuccess: () => resolve(),
        onError: () => reject(),
      });
    });
  };

  const handleCreateSubcategory = async (name: string) => {
    if (!selectedCategory) return Promise.reject();
    
    return new Promise<void>((resolve, reject) => {
      createSubcategory({
        name,
        category_id: parseInt(selectedCategory)
      }, {
        onSuccess: () => resolve(),
        onError: () => reject(),
      });
    });
  };

  const categoryOptions = categories.map(cat => ({
    value: cat.id.toString(),
    label: cat.name
  }));

  const subcategoryOptions = filteredSubcategories.map(sub => ({
    value: sub.id.toString(),
    label: sub.name
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Budget</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter budget name" {...field} />
                  </FormControl>
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
                    <EnhancedSelect
                      options={categoryOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select category"
                      canCreate={true}
                      onCreate={handleCreateCategory}
                    />
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
                    <EnhancedSelect
                      options={subcategoryOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select subcategory"
                      canCreate={selectedCategory ? true : false}
                      onCreate={selectedCategory ? handleCreateSubcategory : undefined}
                    />
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
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
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
                    <Textarea
                      placeholder="Enter budget description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Budget</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
