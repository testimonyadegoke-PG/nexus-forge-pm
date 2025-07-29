import React, { useState } from 'react';
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '@/hooks/useCompany';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CompanyForm: React.FC = () => {
  const { data: companies = [], isLoading } = useCompanies();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();

  const [newCompany, setNewCompany] = useState({ name: '', address: '', phone: '', email: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState({ name: '', address: '', phone: '', email: '' });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCompany.name.trim()) {
      createCompany.mutate(newCompany, {
        onSuccess: () => setNewCompany({ name: '', address: '', phone: '', email: '' }),
      });
    }
  };

  const handleEdit = (company: any) => {
    setEditingId(company.id);
    setEditingValue({ name: company.name, address: company.address || '', phone: company.phone || '', email: company.email || '' });
  };

  const handleUpdate = (id: number) => {
    if (editingValue.name.trim()) {
      updateCompany.mutate({ id, ...editingValue }, {
        onSuccess: () => setEditingId(null),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this company?')) {
      deleteCompany.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex items-center gap-2">
        <Input
          value={newCompany.name}
          onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
          placeholder="Name"
          className="w-32"
        />
        <Input
          value={newCompany.address}
          onChange={e => setNewCompany({ ...newCompany, address: e.target.value })}
          placeholder="Address"
          className="w-32"
        />
        <Input
          value={newCompany.phone}
          onChange={e => setNewCompany({ ...newCompany, phone: e.target.value })}
          placeholder="Phone"
          className="w-24"
        />
        <Input
          value={newCompany.email}
          onChange={e => setNewCompany({ ...newCompany, email: e.target.value })}
          placeholder="Email"
          className="w-32"
        />
        <Button type="submit" disabled={createCompany.isPending || !newCompany.name.trim()}>
          Add
        </Button>
      </form>
      <div className="space-y-2">
        {isLoading && <div>Loading...</div>}
        {companies.map(company => (
          <div key={company.id} className="flex items-center gap-2">
            {editingId === company.id ? (
              <>
                <Input
                  value={editingValue.name}
                  onChange={e => setEditingValue({ ...editingValue, name: e.target.value })}
                  className="w-32"
                />
                <Input
                  value={editingValue.address}
                  onChange={e => setEditingValue({ ...editingValue, address: e.target.value })}
                  className="w-32"
                />
                <Input
                  value={editingValue.phone}
                  onChange={e => setEditingValue({ ...editingValue, phone: e.target.value })}
                  className="w-24"
                />
                <Input
                  value={editingValue.email}
                  onChange={e => setEditingValue({ ...editingValue, email: e.target.value })}
                  className="w-32"
                />
                <Button size="sm" onClick={() => handleUpdate(company.id)} disabled={updateCompany.isPending}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="w-32">{company.name}</span>
                <span className="w-32">{company.address}</span>
                <span className="w-24">{company.phone}</span>
                <span className="w-32">{company.email}</span>
                <Button size="sm" variant="outline" onClick={() => handleEdit(company)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(company.id)} disabled={deleteCompany.isPending}>
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

export default CompanyForm;
