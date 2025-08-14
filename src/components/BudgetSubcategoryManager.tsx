
import React, { useState } from 'react';
import { useBudgetSubcategories, useCreateBudgetSubcategory, useUpdateBudgetSubcategory, useDeleteBudgetSubcategory } from '@/hooks/useBudgetSubcategory';
import { useBudgetCategories } from '@/hooks/useBudgetCategory';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { BudgetSubcategoryForm } from '@/components/forms/BudgetSubcategoryForm';

interface BudgetSubcategory {
  id: number;
  name: string;
  category_id: number;
}

export const BudgetSubcategoryManager = () => {
  const [open, setOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<BudgetSubcategory | null>(null);

  const { data: subcategories = [], isLoading } = useBudgetSubcategories();
  const { data: categories = [] } = useBudgetCategories();
  const { mutate: createSubcategory } = useCreateBudgetSubcategory();
  const { mutate: updateSubcategory } = useUpdateBudgetSubcategory();
  const { mutate: deleteSubcategory } = useDeleteBudgetSubcategory();

  const handleSubmit = (values: { name: string; category_id: number }) => {
    if (selectedSubcategory) {
      updateSubcategory({ ...values, id: selectedSubcategory.id }, { onSuccess: () => setOpen(false) });
    } else {
      createSubcategory(values, { onSuccess: () => setOpen(false) });
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const columns: ColumnDef<BudgetSubcategory>[] = [
    { accessorKey: 'name', header: 'Subcategory Name' },
    { 
      accessorKey: 'category_id', 
      header: 'Category',
      cell: ({ row }) => getCategoryName(row.original.category_id)
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const subcategory = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setSelectedSubcategory(subcategory); setOpen(true); }}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteSubcategory(subcategory.id)} className="text-red-600">
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
            <Button onClick={() => setSelectedSubcategory(null)}>Add Subcategory</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}</DialogTitle>
            </DialogHeader>
            <BudgetSubcategoryForm
              onSubmit={handleSubmit}
              initialData={selectedSubcategory}
              categories={categories}
            />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={subcategories} isLoading={isLoading} />
    </div>
  );
};
