
import React, { useState } from 'react';
import { useContacts, useCreateContact, useUpdateContact, useDeleteContact } from '@/hooks/useContact';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ContactForm: React.FC<{ customerId?: number }> = ({ customerId }) => {
  const { data: contacts = [], isLoading } = useContacts(customerId);
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', role: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState({ name: '', email: '', phone: '', role: '' });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newContact.name.trim()) {
      createContact.mutate({ ...newContact, customer_id: customerId }, {
        onSuccess: () => setNewContact({ name: '', email: '', phone: '', role: '' }),
      });
    }
  };

  const handleEdit = (contact: any) => {
    setEditingId(contact.id);
    setEditingValue({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      role: contact.role || '',
    });
  };

  const handleUpdate = (id: number) => {
    if (editingValue.name.trim()) {
      updateContact.mutate({ id, ...editingValue, customer_id: customerId }, {
        onSuccess: () => setEditingId(null),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this contact?')) {
      deleteContact.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex items-center gap-2">
        <Input
          value={newContact.name}
          onChange={e => setNewContact({ ...newContact, name: e.target.value })}
          placeholder="Name"
          className="w-32"
        />
        <Input
          value={newContact.email}
          onChange={e => setNewContact({ ...newContact, email: e.target.value })}
          placeholder="Email"
          className="w-32"
        />
        <Input
          value={newContact.phone}
          onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
          placeholder="Phone"
          className="w-24"
        />
        <Input
          value={newContact.role}
          onChange={e => setNewContact({ ...newContact, role: e.target.value })}
          placeholder="Role"
          className="w-24"
        />
        <Button type="submit" disabled={createContact.isPending || !newContact.name.trim()}>
          Add
        </Button>
      </form>
      <div className="space-y-2">
        {isLoading && <div>Loading...</div>}
        {contacts.map(contact => (
          <div key={contact.id} className="flex items-center gap-2">
            {editingId === contact.id ? (
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
                <Input
                  value={editingValue.role}
                  onChange={e => setEditingValue({ ...editingValue, role: e.target.value })}
                  className="w-24"
                />
                <Button size="sm" onClick={() => handleUpdate(contact.id)} disabled={updateContact.isPending}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="w-32">{contact.name}</span>
                <span className="w-32">{contact.email}</span>
                <span className="w-24">{contact.phone}</span>
                <span className="w-24">{contact.role}</span>
                <Button size="sm" variant="outline" onClick={() => handleEdit(contact)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(contact.id)} disabled={deleteContact.isPending}>
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

export default ContactForm;
