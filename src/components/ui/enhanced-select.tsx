
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface EnhancedSelectProps {
  options: Option[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  canCreate?: boolean;
  onCreate?: (name: string) => Promise<void>;
  onEdit?: (value: string, name: string) => Promise<void>;
}

export const EnhancedSelect: React.FC<EnhancedSelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  canCreate = false,
  onCreate,
  onEdit
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [editingItem, setEditingItem] = useState<Option | null>(null);

  const handleCreate = async () => {
    if (newItemName.trim() && onCreate) {
      await onCreate(newItemName.trim());
      setNewItemName('');
      setIsCreateOpen(false);
    }
  };

  const handleEdit = async () => {
    if (editingItem && newItemName.trim() && onEdit) {
      await onEdit(editingItem.value, newItemName.trim());
      setNewItemName('');
      setEditingItem(null);
      setIsEditOpen(false);
    }
  };

  const openEditDialog = (option: Option) => {
    setEditingItem(option);
    setNewItemName(option.label);
    setIsEditOpen(true);
  };

  return (
    <>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <div key={option.value} className="flex items-center justify-between group">
              <SelectItem value={option.value} className="flex-1">
                {option.label}
              </SelectItem>
              {canCreate && onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditDialog(option);
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
          {canCreate && onCreate && (
            <div className="border-t pt-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </div>
          )}
        </SelectContent>
      </Select>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Enter name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreate();
                }
              }}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Enter name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleEdit();
                }
              }}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit}>Update</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
