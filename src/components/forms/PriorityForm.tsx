import React, { useState } from 'react';
import { usePriorities, useCreatePriority, useUpdatePriority, useDeletePriority } from '@/hooks/usePriority';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PriorityForm: React.FC = () => {
  const { data: priorities = [], isLoading } = usePriorities();
  const createPriority = useCreatePriority();
  const updatePriority = useUpdatePriority();
  const deletePriority = useDeletePriority();

  const [newPriority, setNewPriority] = useState('');
  const [newRank, setNewRank] = useState<number>(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingRank, setEditingRank] = useState<number>(1);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPriority.trim()) {
      createPriority.mutate(newPriority, {
        onSuccess: () => {
          setNewPriority('');
          setNewRank(1);
        },
      });
    }
  };

  const handleEdit = (id: number, name: string, rank?: number) => {
    setEditingId(id);
    setEditingValue(name);
    setEditingRank(rank || 1);
  };

  const handleUpdate = (id: number) => {
    if (editingValue.trim()) {
      updatePriority.mutate({ id, name: editingValue, rank: editingRank }, {
        onSuccess: () => setEditingId(null),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this priority?')) {
      deletePriority.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex items-center gap-2">
        <Input
          value={newPriority}
          onChange={e => setNewPriority(e.target.value)}
          placeholder="Add new priority"
        />
        <Input
          type="number"
          min={1}
          value={newRank}
          onChange={e => setNewRank(Number(e.target.value))}
          className="w-20"
          placeholder="Rank"
        />
        <Button type="submit" disabled={createPriority.isPending || !newPriority.trim()}>
          Add
        </Button>
      </form>
      <div className="space-y-2">
        {isLoading && <div>Loading...</div>}
        {priorities.map(priority => (
          <div key={priority.id} className="flex items-center gap-2">
            {editingId === priority.id ? (
              <>
                <Input
                  value={editingValue}
                  onChange={e => setEditingValue(e.target.value)}
                  className="w-48"
                />
                <Input
                  type="number"
                  min={1}
                  value={editingRank}
                  onChange={e => setEditingRank(Number(e.target.value))}
                  className="w-20"
                  placeholder="Rank"
                />
                <Button size="sm" onClick={() => handleUpdate(priority.id)} disabled={updatePriority.isPending}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="w-48">{priority.name}</span>
                <span className="w-20">{priority.rank}</span>
                <Button size="sm" variant="outline" onClick={() => handleEdit(priority.id, priority.name, priority.rank)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(priority.id)} disabled={deletePriority.isPending}>
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

export default PriorityForm;
