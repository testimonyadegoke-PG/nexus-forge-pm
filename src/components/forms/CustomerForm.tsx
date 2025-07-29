import React, { useState } from 'react';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/useCustomer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CustomerForm: React.FC = () => {
  const { data: customers = [], isLoading } = useCustomers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const [newCustomer, setNewCustomer] = useState({ name: '', company_id: undefined, email: '', phone: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState({ name: '', company_id: undefined, email: '', phone: '' });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomer.name.trim()) {
      createCustomer.mutate(newCustomer, {
        onSuccess: () => setNewCustomer({ name: '', company_id: undefined, email: '', phone: '' }),
      });
    }
  };

  const handleEdit = (customer: any) => {
    setEditingId(customer.id);
    setEditingValue({
      name: customer.name,
      company_id: customer.company_id,
      email: customer.email || '',
      phone: customer.phone || '',
    });
  };

  const handleUpdate = (id: number) => {
    if (editingValue.name.trim()) {
      updateCustomer.mutate({ id, ...editingValue }, {
        onSuccess: () => setEditingId(null),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this customer?')) {
      deleteCustomer.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex items-center gap-2">
        <Input
          value={newCustomer.name}
          onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
          placeholder="Name"
          className="w-32"
        />
        {/* Optionally add company select here */}
        <Input
          value={newCustomer.email}
          onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
          placeholder="Email"
          className="w-32"
        />
        <Input
          value={newCustomer.phone}
          onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
          placeholder="Phone"
          className="w-24"
        />
        <Button type="submit" disabled={createCustomer.isPending || !newCustomer.name.trim()}>
          Add
        </Button>
      </form>
      <div className="space-y-2">
        {isLoading && <div>Loading...</div>}
        {customers.map(customer => (
          <div key={customer.id} className="flex items-center gap-2">
            {editingId === customer.id ? (
              <>
                <Input
                  value={editingValue.name}
                  onChange={e => setEditingValue({ ...editingValue, name: e.target.value })}
                  className="w-32"
                />
                <Input
                  value={editingValue.email}
                  onChange={e => setEditingValue({ ...editingValue, email: e.target.value })}
                  className="w-32"
                />
                <Input
                  value={editingValue.phone}
                  onChange={e => setEditingValue({ ...editingValue, phone: e.target.value })}
                  className="w-24"
                />
                <Button size="sm" onClick={() => handleUpdate(customer.id)} disabled={updateCustomer.isPending}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="w-32">{customer.name}</span>
                <span className="w-32">{customer.email}</span>
                <span className="w-24">{customer.phone}</span>
                <Button size="sm" variant="outline" onClick={() => handleEdit(customer)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(customer.id)} disabled={deleteCustomer.isPending}>
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

export default CustomerForm;
