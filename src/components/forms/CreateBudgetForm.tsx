
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateBudget, useCreateBudgetLine } from '@/hooks/useBudgets';
import { useProjects } from '@/hooks/useProjects';
import { Trash2, Plus, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const budgetLineSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.coerce.number().min(0, 'Unit price must be positive'),
  description: z.string().optional(),
});

const budgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  project_id: z.string().min(1, 'Project is required'),
  category: z.string().min(1, 'Main category is required'),
  description: z.string().optional(),
  lines: z.array(budgetLineSchema).min(1, 'At least one budget line is required'),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface CreateBudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProjectId?: string;
}

const budgetCategories = [
  'Labor',
  'Materials',
  'Equipment',
  'Overhead',
  'Contingency',
  'Travel',
  'Utilities',
  'Consulting',
  'Software',
  'Other'
];

const subcategoryMap: Record<string, string[]> = {
  Labor: ['Development', 'Design', 'Management', 'QA', 'DevOps'],
  Materials: ['Hardware', 'Software Licenses', 'Office Supplies', 'Raw Materials'],
  Equipment: ['Computers', 'Servers', 'Tools', 'Machinery'],
  Overhead: ['Rent', 'Insurance', 'Administrative', 'Legal'],
  Consulting: ['Technical', 'Business', 'Legal', 'Financial'],
  Travel: ['Transportation', 'Accommodation', 'Meals', 'Conference'],
};

export const CreateBudgetForm: React.FC<CreateBudgetFormProps> = ({
  open,
  onOpenChange,
  defaultProjectId
}) => {
  const { toast } = useToast();
  const { data: projects = [] } = useProjects();
  const createBudget = useCreateBudget();
  const createBudgetLine = useCreateBudgetLine();

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: '',
      project_id: defaultProjectId || '',
      category: '',
      description: '',
      lines: [{ category: '', subcategory: '', quantity: 1, unit_price: 0, description: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lines',
  });

  const watchedLines = form.watch('lines');
  const totalAmount = watchedLines.reduce((sum, line) => {
    const lineTotal = (line.quantity || 0) * (line.unit_price || 0);
    return sum + lineTotal;
  }, 0);

  const onSubmit = async (data: BudgetFormData) => {
    try {
      // Create the main budget
      const budgetData = {
        name: data.name,
        project_id: data.project_id,
        category: data.category,
        allocated_amount: totalAmount,
        description: data.description,
        created_by: 'current-user' // This should be set from auth context
      };

      const budget = await createBudget.mutateAsync(budgetData);

      // Create budget lines
      for (const line of data.lines) {
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
        description: "Budget created successfully with all lines",
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

  const addLine = () => {
    append({ category: '', subcategory: '', quantity: 1, unit_price: 0, description: '' });
  };

  const removeLine = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="project_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Q1 Development Budget" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select main category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {budgetCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Budget description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Budget Lines</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calculator className="h-4 w-4" />
                    Total: ${totalAmount.toLocaleString()}
                  </div>
                  <Button type="button" onClick={addLine} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Line
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => {
                  const selectedCategory = form.watch(`lines.${index}.category`);
                  const availableSubcategories = subcategoryMap[selectedCategory] || [];
                  const lineTotal = (form.watch(`lines.${index}.quantity`) || 0) * (form.watch(`lines.${index}.unit_price`) || 0);

                  return (
                    <Card key={field.id} className="p-4 border-l-4 border-l-primary">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-medium">Line {index + 1}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            Total: ${lineTotal.toLocaleString()}
                          </span>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLine(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <FormField
                          control={form.control}
                          name={`lines.${index}.category`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {budgetCategories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
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
                          name={`lines.${index}.subcategory`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subcategory</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select subcategory" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {availableSubcategories.map((subcategory) => (
                                    <SelectItem key={subcategory} value={subcategory}>
                                      {subcategory}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <FormField
                          control={form.control}
                          name={`lines.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  step="1"
                                  placeholder="1"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`lines.${index}.unit_price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit Price *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormItem>
                          <FormLabel>Line Total</FormLabel>
                          <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center">
                            ${lineTotal.toLocaleString()}
                          </div>
                        </FormItem>
                      </div>

                      <FormField
                        control={form.control}
                        name={`lines.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Line item description"
                                className="min-h-[60px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Card>
                  );
                })}
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createBudget.isPending}>
                {createBudget.isPending ? 'Creating...' : `Create Budget ($${totalAmount.toLocaleString()})`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
