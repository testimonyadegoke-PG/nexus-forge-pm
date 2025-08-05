import React, { useState } from 'react';
import { useBudgetSubcategories, useCreateBudgetSubcategory, useUpdateBudgetSubcategory, useDeleteBudgetSubcategory } from '@/hooks/useBudgetSubcategory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const BudgetSubcategoryForm: React.FC<{ categoryId?: number }> = ({ categoryId }) => {
  const { data: subcategories = [], isLoading } = useBudgetSubcategories();
  const createSubcategory = useCreateBudgetSubcategory();
  const updateSubcategory = useUpdateBudgetSubcategory();
  const deleteSubcategory = useDeleteBudgetSubcategory();

  const [newSubcategory, setNewSubcategory] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubcategory.trim() && categoryId) {
      createSubcategory.mutate({ name: newSubcategory, category_id: categoryId }, {
        onSuccess: () => setNewSubcategory(''),
      });
    }
  };

  const handleEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditingValue(name);
  };

  const handleUpdate = (id: number) => {
    if (editingValue.trim() && categoryId) {
      updateSubcategory.mutate({ id, name: editingValue, category_id: categoryId }, {
        onSuccess: () => setEditingId(null),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this subcategory?')) {
      deleteSubcategory.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex items-center gap-2">
        <Input
          value={newSubcategory}
          onChange={e => setNewSubcategory(e.target.value)}
          placeholder="Add new subcategory"
        />
        <Button type="submit" disabled={createSubcategory.isPending || !newSubcategory.trim() || !categoryId}>
          Add
        </Button>
      </form>
      <div className="space-y-2">
        {isLoading && <div>Loading...</div>}
        {subcategories.map(subcategory => (
          <div key={subcategory.id} className="flex items-center gap-2">
            {editingId === subcategory.id ? (
              <>
                <Input
                  value={editingValue}
                  onChange={e => setEditingValue(e.target.value)}
                  className="w-48"
                />
                <Button size="sm" onClick={() => handleUpdate(subcategory.id)} disabled={updateSubcategory.isPending}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="w-48">{subcategory.name}</span>
                <Button size="sm" variant="outline" onClick={() => handleEdit(subcategory.id, subcategory.name)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(subcategory.id)} disabled={deleteSubcategory.isPending}>
                  Delete
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetSubcategoryForm;
