import React, { useState } from 'react';
import { useUserRoles, useCreateUserRole, useUpdateUserRole, useDeleteUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const UserRoleForm: React.FC = () => {
  const { data: roles = [], isLoading } = useUserRoles();
  const createRole = useCreateUserRole();
  const updateRole = useUpdateUserRole();
  const deleteRole = useDeleteUserRole();

  const [newRole, setNewRole] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRole.trim()) {
      createRole.mutate(newRole, {
        onSuccess: () => setNewRole(''),
      });
    }
  };

  const handleEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditingValue(name);
  };

  const handleUpdate = (id: number) => {
    if (editingValue.trim()) {
      updateRole.mutate({ id, name: editingValue }, {
        onSuccess: () => setEditingId(null),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this role?')) {
      deleteRole.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex items-center gap-2">
        <Input
          value={newRole}
          onChange={e => setNewRole(e.target.value)}
          placeholder="Add new role"
        />
        <Button type="submit" disabled={createRole.isPending || !newRole.trim()}>
          Add
        </Button>
      </form>
      <div className="space-y-2">
        {isLoading && <div>Loading...</div>}
        {roles.map(role => (
          <div key={role.id} className="flex items-center gap-2">
            {editingId === role.id ? (
              <>
                <Input
                  value={editingValue}
                  onChange={e => setEditingValue(e.target.value)}
                  className="w-48"
                />
                <Button size="sm" onClick={() => handleUpdate(role.id)} disabled={updateRole.isPending}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="w-48">{role.name}</span>
                <Button size="sm" variant="outline" onClick={() => handleEdit(role.id, role.name)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(role.id)} disabled={deleteRole.isPending}>
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

export default UserRoleForm;
