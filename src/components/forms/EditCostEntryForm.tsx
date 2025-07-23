
import React, { useState, useEffect } from 'react';
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
import { CostEntry } from '@/hooks/useCostEntries';
import { useToast } from '@/hooks/use-toast';

const costEntrySchema = z.object({
  project_id: z.string().min(1, 'Project is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  amount: z.number().min(0, 'Amount must be positive'),
  source_type: z.enum(['manual', 'timesheet', 'invoice', 'expense']),
  entry_date: z.string().min(1, 'Entry date is required'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof costEntrySchema>;

interface EditCostEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  costEntry: CostEntry | null;
}

const categories = [
  { value: 'labor', label: 'Labor' },
  { value: 'materials', label: 'Materials' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'overhead', label: 'Overhead' },
  { value: 'other', label: 'Other' },
];

const subcategories = {
  labor: ['Internal Staff', 'Contractors', 'Consultants'],
  materials: ['Raw Materials', 'Supplies', 'Tools'],
  equipment: ['Rental', 'Purchase', 'Maintenance'],
  overhead: ['Admin', 'Utilities', 'Insurance'],
  other: ['Travel', 'Training', 'Miscellaneous'],
};

export const EditCostEntryForm: React.FC<EditCostEntryFormProps> = ({
  isOpen,
  onClose,
  costEntry,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(costEntrySchema),
  });

  const watchedCategory = watch('category');

  useEffect(() => {
    if (costEntry) {
      setValue('project_id', costEntry.project_id);
      setValue('category', costEntry.category);
      setValue('subcategory', costEntry.subcategory || '');
      setValue('amount', costEntry.amount);
      setValue('source_type', costEntry.source_type);
      setValue('entry_date', costEntry.entry_date);
      setValue('description', costEntry.description || '');
      setSelectedCategory(costEntry.category);
    }
  }, [costEntry, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      // Here you would call your update mutation
      console.log('Updating cost entry:', data);
      toast({
        title: 'Success',
        description: 'Cost entry updated successfully',
      });
      reset();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update cost entry',
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
            Edit Cost Entry
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_id">Project *</Label>
              <Input
                id="project_id"
                {...register('project_id')}
                placeholder="Select project"
                disabled
              />
              {errors.project_id && (
                <p className="text-sm text-destructive">{errors.project_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry_date">Entry Date *</Label>
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
              <Label htmlFor="category">Category *</Label>
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
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Select
                value={watch('subcategory') || ''}
                onValueChange={(value) => setValue('subcategory', value)}
                disabled={!watchedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {watchedCategory && subcategories[watchedCategory as keyof typeof subcategories]?.map((sub) => (
                    <SelectItem key={sub} value={sub}>
                      {sub}
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
                value={watch('source_type')}
                onValueChange={(value) => setValue('source_type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
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
              {isSubmitting ? 'Updating...' : 'Update Cost Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
