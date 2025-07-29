
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateBudget, useCreateBudgetLine, CreateBudgetData } from '@/hooks/useBudgets';
import { useBudgetCategories } from '@/hooks/useBudgetCategory';
import { useBudgetSubcategories } from '@/hooks/useBudgetSubcategory';
import { useCurrencies } from '@/hooks/useCurrency';
import { X, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const budgetLineSchema = z.object({
  category_id: z.number().optional(),
  subcategory_id: z.number().optional(),
  amount: z.number().min(0, 'Amount must be positive'),
  description: z.string().optional(),
  currency_id: z.number().optional(),
});

const budgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  description: z.string().optional(),
  budget_lines: z.array(budgetLineSchema).min(1, 'At least one budget line is required'),
});

interface BudgetCreationFormProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

import { useCurrentUser } from '@/hooks/useCurrentUser';

export const BudgetCreationForm = ({ projectId, open, onOpenChange }: BudgetCreationFormProps) => {
  const createBudget = useCreateBudget();
  const createBudgetLine = useCreateBudgetLine();
  const { toast } = useToast();
  const { user } = useCurrentUser();

  const form = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: '',
      description: '',
      budget_lines: [
        { category_id: undefined, subcategory_id: undefined, amount: 0, description: '', currency_id: undefined },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'budget_lines',
  });

  const addBudgetLine = () => {
    append({ category_id: undefined, subcategory_id: undefined, amount: 0, description: '', currency_id: undefined });
  };

  const removeBudgetLine = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: z.infer<typeof budgetSchema>) => {
  try {
    if (!user?.id) throw new Error('User not authenticated');
    // 1. Create the budget
    const budgetRes = await createBudget.mutateAsync({
      name: data.name,
      project_id: projectId,
      created_by: user.id,
      description: data.description || undefined,
    });
    const budgetId = budgetRes?.id;
    if (!budgetId) throw new Error('Failed to create budget');
    // 2. Create all budget lines
    for (const line of data.budget_lines) {
      await createBudgetLine.mutateAsync({
        budget_id: budgetId,
        category: line.category_id?.toString() ?? '',
        subcategory: line.subcategory_id?.toString() ?? undefined,
        amount: line.amount,
        description: line.description || undefined,
      });
    }
    onOpenChange(false);
    form.reset();
    toast({
      title: "Success",
      description: "Budget created successfully",
    });
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to create budget",
      variant: "destructive",
    });
  }
};

  const totalAmount = form.watch('budget_lines').reduce((sum, line) => sum + (Number(line.amount) || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Create Budget</DialogTitle>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Budget name" {...field} />
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
                      <Textarea placeholder="Enter budget description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Budget Lines</h3>
                <Button type="button" variant="outline" size="sm" onClick={addBudgetLine}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Line
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Budget Line {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBudgetLine(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`budget_lines.${index}.category_id`}
                      render={({ field }) => {
                        const { data: categories = [] } = useBudgetCategories();
                        return (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={val => field.onChange(val ? Number(val) : undefined)} value={field.value?.toString() ?? ''}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map(category => (
                                  <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name={`budget_lines.${index}.subcategory_id`}
                      render={({ field }) => {
                        const { data: subcategories = [] } = useBudgetSubcategories(form.watch(`budget_lines.${index}.category_id`));
                        return (
                          <FormItem>
                            <FormLabel>Subcategory</FormLabel>
                            <Select onValueChange={val => field.onChange(val ? Number(val) : undefined)} value={field.value?.toString() ?? ''}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select subcategory" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {subcategories.map(subcat => (
                                  <SelectItem key={subcat.id} value={subcat.id.toString()}>{subcat.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`budget_lines.${index}.amount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            placeholder="0.00"
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`budget_lines.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter description"
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Budget:</span>
                <span className="text-lg font-bold">
                  ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createBudget.isPending}>
                {createBudget.isPending ? 'Creating...' : 'Create Budget'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
