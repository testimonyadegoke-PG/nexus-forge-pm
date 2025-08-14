
import React, { useState } from 'react';
import { useBudgetCategories, useCreateBudgetCategory, useUpdateBudgetCategory, useDeleteBudgetCategory } from '@/hooks/useBudgetCategory';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProjectDimensionForm } from '@/components/forms/ProjectDimensionForm';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, Edit } from 'lucide-react';

interface BudgetCategory {
  id: number;
  name: string;
}

export const BudgetCategoryManager = () => {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(null);

  const { data: categories = [], isLoading } = useBudgetCategories();
  const { mutate: createCategory } = useCreateBudgetCategory();
  const { mutate: updateCategory } = useUpdateBudgetCategory();
  const { mutate: deleteCategory } = useDeleteBudgetCategory();

  const handleSubmit = (values: { name: string }) => {
    if (selectedCategory) {
      updateCategory({ ...values, id: selectedCategory.id }, { onSuccess: () => setOpen(false) });
    } else {
      createCategory(values.name, { onSuccess: () => setOpen(false) });
    }
  };

  const columns: ColumnDef<BudgetCategory>[] = [
    { accessorKey: 'name', header: 'Category Name' },
    {
      id: 'actions',
      cell: ({ row }) => {
        const category = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setSelectedCategory(category); setOpen(true); }}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteCategory(category.id)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedCategory(null)}>Add Budget Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedCategory ? 'Edit Budget Category' : 'Add New Budget Category'}</DialogTitle>
            </DialogHeader>
            <ProjectDimensionForm
              onSubmit={handleSubmit}
              initialData={selectedCategory}
              submitButtonText={selectedCategory ? 'Update' : 'Create'}
            />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={categories} isLoading={isLoading} />
    </div>
  );
};
