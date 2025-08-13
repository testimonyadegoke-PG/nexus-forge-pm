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
import { useCreatePurchaseOrder } from '@/hooks/usePurchaseOrders';
import { useProjectTasks } from '@/hooks/useTasks';
import { Trash2, Plus, Calculator } from 'lucide-react';

const poLineSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.coerce.number().min(0, 'Unit price must be positive'),
  description: z.string().optional(),
});

const purchaseOrderSchema = z.object({
  po_number: z.string().min(1, 'PO number is required'),
  vendor_name: z.string().min(1, 'Vendor name is required'),
  description: z.string().optional(),
  task_id: z.string().optional(),
  order_date: z.string().min(1, 'Order date is required'),
  expected_delivery_date: z.string().optional(),
  lines: z.array(poLineSchema).min(1, 'At least one line is required'),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface CreatePurchaseOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

const categories = [
  'Materials', 'Equipment', 'Services', 'Software', 'Travel', 'Consulting', 'Other'
];

const subcategoryMap: Record<string, string[]> = {
  Materials: ['Hardware', 'Software Licenses', 'Office Supplies', 'Raw Materials'],
  Equipment: ['Computers', 'Servers', 'Tools', 'Machinery'],
  Services: ['Maintenance', 'Support', 'Installation', 'Training'],
  Consulting: ['Technical', 'Business', 'Legal', 'Financial'],
};

export const CreatePurchaseOrderForm: React.FC<CreatePurchaseOrderFormProps> = ({
  open,
  onOpenChange,
  projectId
}) => {
  const { data: tasks = [] } = useProjectTasks(projectId);
  const createPurchaseOrder = useCreatePurchaseOrder();

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      po_number: '',
      vendor_name: '',
      description: '',
      task_id: '',
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery_date: '',
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

  const onSubmit = async (data: PurchaseOrderFormData) => {
    try {
      // Ensure required fields are present
      const submissionData = {
        project_id: projectId,
        po_number: data.po_number,
        vendor_name: data.vendor_name,
        description: data.description,
        task_id: data.task_id || undefined,
        order_date: data.order_date,
        expected_delivery_date: data.expected_delivery_date || undefined,
        lines: data.lines.map(line => ({
          category: line.category,
          subcategory: line.subcategory,
          quantity: line.quantity,
          unit_price: line.unit_price,
          description: line.description,
        })),
      };

      await createPurchaseOrder.mutateAsync(submissionData);
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error('Error creating purchase order:', error);
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
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="po_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PO Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="PO-2024-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vendor_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Vendor name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="order_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expected_delivery_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Delivery Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="task_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linked Task (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a task" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No task selected</SelectItem>
                      {tasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.name}
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
                    <Textarea placeholder="Purchase order description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Purchase Order Lines</CardTitle>
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
                                  {categories.map((category) => (
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
              <Button type="submit" disabled={createPurchaseOrder.isPending}>
                {createPurchaseOrder.isPending ? 'Creating...' : `Create PO ($${totalAmount.toLocaleString()})`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
