import React, { useState } from 'react';
import { useProjectStages, useCreateProjectStage, useUpdateProjectStage, useDeleteProjectStage } from '@/hooks/useProjectStage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ProjectStageForm: React.FC = () => {
  const { data: stages = [], isLoading } = useProjectStages();
  const createStage = useCreateProjectStage();
  const updateStage = useUpdateProjectStage();
  const deleteStage = useDeleteProjectStage();

  const [newStage, setNewStage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStage.trim()) {
      createStage.mutate(newStage, {
        onSuccess: () => setNewStage(''),
      });
    }
  };

  const handleEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditingValue(name);
  };

  const handleUpdate = (id: number) => {
    if (editingValue.trim()) {
      updateStage.mutate({ id, name: editingValue }, {
        onSuccess: () => setEditingId(null),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this stage?')) {
      deleteStage.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex items-center gap-2">
        <Input
          value={newStage}
          onChange={e => setNewStage(e.target.value)}
          placeholder="Add new stage"
        />
        <Button type="submit" disabled={createStage.isPending || !newStage.trim()}>
          Add
        </Button>
      </form>
      <div className="space-y-2">
        {isLoading && <div>Loading...</div>}
        {stages.map(stage => (
          <div key={stage.id} className="flex items-center gap-2">
            {editingId === stage.id ? (
              <>
                <Input
                  value={editingValue}
                  onChange={e => setEditingValue(e.target.value)}
                  className="w-48"
                />
                <Button size="sm" onClick={() => handleUpdate(stage.id)} disabled={updateStage.isPending}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="w-48">{stage.name}</span>
                <Button size="sm" variant="outline" onClick={() => handleEdit(stage.id, stage.name)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(stage.id)} disabled={deleteStage.isPending}>
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

export default ProjectStageForm;
