import React, { useState } from 'react';
import { useProjectTypes, useCreateProjectType, useUpdateProjectType, useDeleteProjectType } from '@/hooks/useProjectType';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ProjectTypeForm: React.FC = () => {
  const { data: types = [], isLoading } = useProjectTypes();
  const createType = useCreateProjectType();
  const updateType = useUpdateProjectType();
  const deleteType = useDeleteProjectType();

  const [newType, setNewType] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newType.trim()) {
      createType.mutate(newType, {
        onSuccess: () => setNewType(''),
      });
    }
  };

  const handleEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditingValue(name);
  };

  const handleUpdate = (id: number) => {
    if (editingValue.trim()) {
      updateType.mutate({ id, name: editingValue }, {
        onSuccess: () => setEditingId(null),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this type?')) {
      deleteType.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex items-center gap-2">
        <Input
          value={newType}
          onChange={e => setNewType(e.target.value)}
          placeholder="Add new type"
        />
        <Button type="submit" disabled={createType.isPending || !newType.trim()}>
          Add
        </Button>
      </form>
      <div className="space-y-2">
        {isLoading && <div>Loading...</div>}
        {types.map(type => (
          <div key={type.id} className="flex items-center gap-2">
            {editingId === type.id ? (
              <>
                <Input
                  value={editingValue}
                  onChange={e => setEditingValue(e.target.value)}
                  className="w-48"
                />
                <Button size="sm" onClick={() => handleUpdate(type.id)} disabled={updateType.isPending}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="w-48">{type.name}</span>
                <Button size="sm" variant="outline" onClick={() => handleEdit(type.id, type.name)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(type.id)} disabled={deleteType.isPending}>
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

export default ProjectTypeForm;
