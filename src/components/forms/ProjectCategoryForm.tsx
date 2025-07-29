import React, { useState } from 'react';
import { useProjectCategories, useCreateProjectCategory, useUpdateProjectCategory, useDeleteProjectCategory } from '@/hooks/useProjectCategory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ProjectCategoryForm: React.FC = () => {
  const { data: categories = [], isLoading } = useProjectCategories();
  const createCategory = useCreateProjectCategory();
  const updateCategory = useUpdateProjectCategory();
  const deleteCategory = useDeleteProjectCategory();

  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      createCategory.mutate(newCategory, {
        onSuccess: () => setNewCategory(''),
      });
    }
  };

  const handleEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditingValue(name);
  };

  const handleUpdate = (id: number) => {
    if (editingValue.trim()) {
      updateCategory.mutate({ id, name: editingValue }, {
        onSuccess: () => setEditingId(null),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this category?')) {
      deleteCategory.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex items-center gap-2">
        <Input
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          placeholder="Add new category"
        />
        <Button type="submit" disabled={createCategory.isPending || !newCategory.trim()}>
          Add
        </Button>
      </form>
      <div className="space-y-2">
        {isLoading && <div>Loading...</div>}
        {categories.map(category => (
          <div key={category.id} className="flex items-center gap-2">
            {editingId === category.id ? (
              <>
                <Input
                  value={editingValue}
                  onChange={e => setEditingValue(e.target.value)}
                  className="w-48"
                />
                <Button size="sm" onClick={() => handleUpdate(category.id)} disabled={updateCategory.isPending}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="w-48">{category.name}</span>
                <Button size="sm" variant="outline" onClick={() => handleEdit(category.id, category.name)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(category.id)} disabled={deleteCategory.isPending}>
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

export default ProjectCategoryForm;
