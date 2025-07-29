import React, { useState } from 'react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProduct';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ProductForm: React.FC = () => {
  const { data: products = [], isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [newProduct, setNewProduct] = useState({ sku: '', name: '', description: '', unit_price: 0, currency_id: 1, category_id: undefined, subcategory_id: undefined });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState({ sku: '', name: '', description: '', unit_price: 0, currency_id: 1, category_id: undefined, subcategory_id: undefined });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.name.trim() && newProduct.sku.trim()) {
      createProduct.mutate(newProduct, {
        onSuccess: () => setNewProduct({ sku: '', name: '', description: '', unit_price: 0, currency_id: 1, category_id: undefined, subcategory_id: undefined }),
      });
    }
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setEditingValue({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      unit_price: product.unit_price,
      currency_id: product.currency_id,
      category_id: product.category_id,
      subcategory_id: product.subcategory_id,
    });
  };

  const handleUpdate = (id: number) => {
    if (editingValue.name.trim() && editingValue.sku.trim()) {
      updateProduct.mutate({ id, ...editingValue }, {
        onSuccess: () => setEditingId(null),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this product?')) {
      deleteProduct.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex items-center gap-2 flex-wrap">
        <Input
          value={newProduct.sku}
          onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
          placeholder="SKU"
          className="w-24"
        />
        <Input
          value={newProduct.name}
          onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
          placeholder="Name"
          className="w-32"
        />
        <Input
          value={newProduct.description}
          onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
          placeholder="Description"
          className="w-40"
        />
        <Input
          type="number"
          value={newProduct.unit_price}
          onChange={e => setNewProduct({ ...newProduct, unit_price: Number(e.target.value) })}
          placeholder="Unit Price"
          className="w-24"
        />
        {/* Add selects for currency, category, subcategory if needed */}
        <Button type="submit" disabled={createProduct.isPending || !newProduct.name.trim() || !newProduct.sku.trim()}>
          Add
        </Button>
      </form>
      <div className="space-y-2">
        {isLoading && <div>Loading...</div>}
        {products.map(product => (
          <div key={product.id} className="flex items-center gap-2 flex-wrap">
            {editingId === product.id ? (
              <>
                <Input
                  value={editingValue.sku}
                  onChange={e => setEditingValue({ ...editingValue, sku: e.target.value })}
                  className="w-24"
                />
                <Input
                  value={editingValue.name}
                  onChange={e => setEditingValue({ ...editingValue, name: e.target.value })}
                  className="w-32"
                />
                <Input
                  value={editingValue.description}
                  onChange={e => setEditingValue({ ...editingValue, description: e.target.value })}
                  className="w-40"
                />
                <Input
                  type="number"
                  value={editingValue.unit_price}
                  onChange={e => setEditingValue({ ...editingValue, unit_price: Number(e.target.value) })}
                  className="w-24"
                />
                <Button size="sm" onClick={() => handleUpdate(product.id)} disabled={updateProduct.isPending}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="w-24">{product.sku}</span>
                <span className="w-32">{product.name}</span>
                <span className="w-40">{product.description}</span>
                <span className="w-24">{product.unit_price}</span>
                <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)} disabled={deleteProduct.isPending}>
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

export default ProductForm;
