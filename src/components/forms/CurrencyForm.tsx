import React, { useState } from 'react';
import { useCurrencies, useCreateCurrency, useUpdateCurrency, useDeleteCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CurrencyForm: React.FC = () => {
  const { data: currencies = [], isLoading } = useCurrencies();
  const createCurrency = useCreateCurrency();
  const updateCurrency = useUpdateCurrency();
  const deleteCurrency = useDeleteCurrency();

  const [newCurrency, setNewCurrency] = useState({ code: '', name: '', symbol: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState({ code: '', name: '', symbol: '' });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCurrency.code.trim() && newCurrency.name.trim()) {
      createCurrency.mutate(newCurrency, {
        onSuccess: () => setNewCurrency({ code: '', name: '', symbol: '' }),
      });
    }
  };

  const handleEdit = (id: number, code: string, name: string, symbol?: string) => {
    setEditingId(id);
    setEditingValue({ code, name, symbol: symbol || '' });
  };

  const handleUpdate = (id: number) => {
    if (editingValue.code.trim() && editingValue.name.trim()) {
      updateCurrency.mutate({ id, ...editingValue }, {
        onSuccess: () => setEditingId(null),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this currency?')) {
      deleteCurrency.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex items-center gap-2">
        <Input
          value={newCurrency.code}
          onChange={e => setNewCurrency({ ...newCurrency, code: e.target.value })}
          placeholder="Code (e.g. USD)"
          className="w-24"
        />
        <Input
          value={newCurrency.name}
          onChange={e => setNewCurrency({ ...newCurrency, name: e.target.value })}
          placeholder="Name (e.g. US Dollar)"
          className="w-32"
        />
        <Input
          value={newCurrency.symbol}
          onChange={e => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
          placeholder="Symbol ($)"
          className="w-16"
        />
        <Button type="submit" disabled={createCurrency.isPending || !newCurrency.code.trim() || !newCurrency.name.trim()}>
          Add
        </Button>
      </form>
      <div className="space-y-2">
        {isLoading && <div>Loading...</div>}
        {currencies.map(currency => (
          <div key={currency.id} className="flex items-center gap-2">
            {editingId === currency.id ? (
              <>
                <Input
                  value={editingValue.code}
                  onChange={e => setEditingValue({ ...editingValue, code: e.target.value })}
                  className="w-24"
                />
                <Input
                  value={editingValue.name}
                  onChange={e => setEditingValue({ ...editingValue, name: e.target.value })}
                  className="w-32"
                />
                <Input
                  value={editingValue.symbol}
                  onChange={e => setEditingValue({ ...editingValue, symbol: e.target.value })}
                  className="w-16"
                />
                <Button size="sm" onClick={() => handleUpdate(currency.id)} disabled={updateCurrency.isPending}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="w-24">{currency.code}</span>
                <span className="w-32">{currency.name}</span>
                <span className="w-16">{currency.symbol}</span>
                <Button size="sm" variant="outline" onClick={() => handleEdit(currency.id, currency.code, currency.name, currency.symbol)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(currency.id)} disabled={deleteCurrency.isPending}>
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

export default CurrencyForm;
