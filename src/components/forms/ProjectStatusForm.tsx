import React, { useState } from 'react';
import { useProjectStatuses, useCreateProjectStatus, useUpdateProjectStatus, useDeleteProjectStatus } from '@/hooks/useProjectStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ProjectStatusForm: React.FC = () => {
  const { data: statuses = [], isLoading } = useProjectStatuses();
  const createStatus = useCreateProjectStatus();
  const updateStatus = useUpdateProjectStatus();
  const deleteStatus = useDeleteProjectStatus();

  const [newStatus, setNewStatus] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStatus.trim()) {
      createStatus.mutate(newStatus, {
        onSuccess: () => setNewStatus(''),
      });
    }
  };

  const handleEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditingValue(name);
  };

  const handleUpdate = (id: number) => {
    if (editingValue.trim()) {
      updateStatus.mutate({ id, name: editingValue }, {
        onSuccess: () => setEditingId(null),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this status?')) {
      deleteStatus.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex items-center gap-2">
        <Input
          value={newStatus}
          onChange={e => setNewStatus(e.target.value)}
          placeholder="Add new status"
        />
        <Button type="submit" disabled={createStatus.isPending || !newStatus.trim()}>
          Add
        </Button>
      </form>
      <div className="space-y-2">
        {isLoading && <div>Loading...</div>}
        {statuses.map(status => (
          <div key={status.id} className="flex items-center gap-2">
            {editingId === status.id ? (
              <>
                <Input
                  value={editingValue}
                  onChange={e => setEditingValue(e.target.value)}
                  className="w-48"
                />
                <Button size="sm" onClick={() => handleUpdate(status.id)} disabled={updateStatus.isPending}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="w-48">{status.name}</span>
                <Button size="sm" variant="outline" onClick={() => handleEdit(status.id, status.name)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(status.id)} disabled={deleteStatus.isPending}>
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

export default ProjectStatusForm;
