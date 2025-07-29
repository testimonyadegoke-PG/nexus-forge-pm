import React, { useState } from 'react';
import { useProjectPhases, useCreateProjectPhase, useUpdateProjectPhase, useDeleteProjectPhase } from '@/hooks/useProjectPhase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ProjectPhaseForm: React.FC = () => {
  const { data: phases = [], isLoading } = useProjectPhases();
  const createPhase = useCreateProjectPhase();
  const updatePhase = useUpdateProjectPhase();
  const deletePhase = useDeleteProjectPhase();

  const [newPhase, setNewPhase] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPhase.trim()) {
      createPhase.mutate(newPhase, {
        onSuccess: () => setNewPhase(''),
      });
    }
  };

  const handleEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditingValue(name);
  };

  const handleUpdate = (id: number) => {
    if (editingValue.trim()) {
      updatePhase.mutate({ id, name: editingValue }, {
        onSuccess: () => setEditingId(null),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this phase?')) {
      deletePhase.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex items-center gap-2">
        <Input
          value={newPhase}
          onChange={e => setNewPhase(e.target.value)}
          placeholder="Add new phase"
        />
        <Button type="submit" disabled={createPhase.isPending || !newPhase.trim()}>
          Add
        </Button>
      </form>
      <div className="space-y-2">
        {isLoading && <div>Loading...</div>}
        {phases.map(phase => (
          <div key={phase.id} className="flex items-center gap-2">
            {editingId === phase.id ? (
              <>
                <Input
                  value={editingValue}
                  onChange={e => setEditingValue(e.target.value)}
                  className="w-48"
                />
                <Button size="sm" onClick={() => handleUpdate(phase.id)} disabled={updatePhase.isPending}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="w-48">{phase.name}</span>
                <Button size="sm" variant="outline" onClick={() => handleEdit(phase.id, phase.name)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(phase.id)} disabled={deletePhase.isPending}>
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

export default ProjectPhaseForm;
