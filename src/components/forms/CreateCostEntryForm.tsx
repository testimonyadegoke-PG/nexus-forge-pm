
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateCostEntry, CreateCostEntryData } from '@/hooks/useCostEntries';
import { useBudgetCategories } from '@/hooks/useBudgetCategory';
import { useBudgetSubcategories } from '@/hooks/useBudgetSubcategory';
import { useProducts } from '@/hooks/useProduct';
import { useCurrencies } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';

const costEntrySchema = z.object({
  amount: z.number().min(0.01, 'Amount must be positive'),
  entry_date: z.string().min(1, 'Date is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  source_type: z.enum(['manual', 'timesheet', 'invoice', 'expense']),
  description: z.string().optional(),
  created_by: z.string().optional(),
});

type FormData = z.infer<typeof costEntrySchema>;

interface CreateCostEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
}

export const CreateCostEntryForm: React.FC<CreateCostEntryFormProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { toast } = useToast();
  const createCostEntry = useCreateCostEntry();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(costEntrySchema),
    defaultValues: {
      amount: 0,
      entry_date: '',
      category: '',
      subcategory: '',
      source_type: 'manual',
      description: '',
      created_by: '',
    },
  });

  const watchedCategory = watch('category');

  const onSubmit = async (data: FormData) => {
    const costEntryData: CreateCostEntryData = {
      project_id: projectId!,
      amount: data.amount,
      entry_date: data.entry_date,
      category: data.category,
      subcategory: data.subcategory || undefined,
      source_type: data.source_type,
      description: data.description || undefined,
      created_by: data.created_by || undefined,
    };

    try {
      await createCostEntry.mutateAsync(costEntryData);
      toast({
        title: 'Success',
        description: 'Cost entry created successfully',
      });
      reset();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create cost entry',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Create Cost Entry
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry_date">Date *</Label>
              <Input
                id="entry_date"
                type="date"
                {...register('entry_date')}
              />
              {errors.entry_date && (
                <p className="text-sm text-destructive">{errors.entry_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={watchedCategory}
                onValueChange={(value) => {
                  setValue('category', value);
                  setSelectedCategory(value);
                  setValue('subcategory', '');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {useBudgetCategories().data?.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Select
                value={watch('subcategory') ?? ''}
                onValueChange={(value) => setValue('subcategory', value)}
                disabled={!watchedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {watchedCategory && useBudgetSubcategories().data?.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.name}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="source_type">Source Type</Label>
              <Select
                value={watch('source_type') ?? ''}
                onValueChange={(value) => setValue('source_type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="timesheet">Timesheet</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter description..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Cost Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
