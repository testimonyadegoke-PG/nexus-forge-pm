
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useBudgetCategories } from '@/hooks/useBudgetCategory';
import { useBudgetSubcategories } from '@/hooks/useBudgetSubcategory';
import { useCreateBudget, useCreateBudgetLine } from '@/hooks/useBudgets';
import { useToast } from '@/hooks/use-toast';

const lineSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Unit price cannot be negative'),
  description: z.string().optional(),
});

const budgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  category: z.string().min(1, 'Category is required'),
  allocated_amount: z.number().min(1, 'Allocated amount must be at least 1'),
  description: z.string().optional(),
  lines: z.array(lineSchema),
});

interface BudgetCreationFormProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BudgetCreationForm: React.FC<BudgetCreationFormProps> = ({ projectId, open, onOpenChange }) => {
  const { data: budgetCategories = [] } = useBudgetCategories();
  const { data: budgetSubcategories = [] } = useBudgetSubcategories();
  const createBudget = useCreateBudget();
  const createBudgetLine = useCreateBudgetLine();

  const { toast } = useToast();

  const form = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: '',
      category: '',
      allocated_amount: 0,
      description: '',
      lines: [],
    },
  });

  const handleSubmit = async (values: z.infer<typeof budgetSchema>) => {
    try {
      console.log('Creating budget with values:', values);
      
      const budgetData = {
        name: values.name,
        project_id: projectId,
        category: values.category,
        allocated_amount: values.allocated_amount,
        description: values.description,
        created_by: 'current-user' // This should be set from auth context
      };

      const budget = await createBudget.mutateAsync(budgetData);
      console.log('Budget created:', budget);

      // Create budget lines
      for (const line of values.lines) {
        const lineData = {
          budget_id: budget.id,
          category: line.category,
          subcategory: line.subcategory,
          quantity: line.quantity,
          unit_price: line.unit_price,
          amount: line.quantity * line.unit_price,
          total: line.quantity * line.unit_price,
          description: line.description
        };
        await createBudgetLine.mutateAsync(lineData);
      }

      toast({
        title: "Success",
        description: "Budget created successfully",
      });
      
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error('Error creating budget:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create budget",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Name</FormLabel>
              <FormControl>
                <Input placeholder="Budget Name" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {budgetCategories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
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
          name="allocated_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allocated Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Allocated Amount" {...field} />
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
                <Textarea placeholder="Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <h3 className="text-lg font-semibold mb-2">Budget Lines</h3>
          {form.watch('lines')?.map((_, index) => (
            <div key={index} className="border p-4 rounded-md mb-2">
              <h4 className="text-md font-semibold mb-2">Line {index + 1}</h4>
              <FormField
                control={form.control}
                name={`lines.${index}.category` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Category" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`lines.${index}.subcategory` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <FormControl>
                      <Input placeholder="Subcategory" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`lines.${index}.quantity` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Quantity" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`lines.${index}.unit_price` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Unit Price" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`lines.${index}.description` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <Button type="submit" disabled={createBudget.isPending}>
          {createBudget.isPending ? 'Creating...' : 'Create Budget'}
        </Button>
      </form>
    </Form>
  );
};

export default BudgetCreationForm;
