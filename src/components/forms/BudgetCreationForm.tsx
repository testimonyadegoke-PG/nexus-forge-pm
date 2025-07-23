
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
import { useCreateBudget } from '@/hooks/useBudgets';
import { X, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const budgetLineSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  allocated_amount: z.number().min(0, 'Amount must be positive'),
  description: z.string().optional(),
});

const budgetSchema = z.object({
  budget_lines: z.array(budgetLineSchema).min(1, 'At least one budget line is required'),
});

interface BudgetCreationFormProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryOptions = [
  'Labor',
  'Materials',
  'Equipment',
  'Overhead',
  'Contingency',
  'Travel',
  'Utilities',
  'Other'
];

export const BudgetCreationForm = ({ projectId, open, onOpenChange }: BudgetCreationFormProps) => {
  const createBudget = useCreateBudget();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      budget_lines: [
        { category: '', subcategory: '', allocated_amount: 0, description: '' }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'budget_lines',
  });

  const addBudgetLine = () => {
    append({ category: '', subcategory: '', allocated_amount: 0, description: '' });
  };

  const removeBudgetLine = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: z.infer<typeof budgetSchema>) => {
    try {
      // Create each budget line separately
      for (const line of data.budget_lines) {
        await createBudget.mutateAsync({
          project_id: projectId,
          category: line.category,
          subcategory: line.subcategory || undefined,
          allocated_amount: line.allocated_amount,
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

  const totalAmount = form.watch('budget_lines').reduce((sum, line) => sum + (line.allocated_amount || 0), 0);

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
                      name={`budget_lines.${index}.category`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categoryOptions.map((category) => (
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
                      name={`budget_lines.${index}.subcategory`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subcategory</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter subcategory" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`budget_lines.${index}.allocated_amount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allocated Amount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
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
