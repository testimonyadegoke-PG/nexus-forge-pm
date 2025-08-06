
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trees, Plus, Edit2, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { useWbsItems, useCreateWbsItem, useUpdateWbsItem, useDeleteWbsItem } from '@/hooks/useWbs';
import { WbsItem } from '@/types/scheduling';

interface WbsManagerProps {
  projectId: string;
}

const WbsManager: React.FC<WbsManagerProps> = ({ projectId }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WbsItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    wbs_code: '',
    name: '',
    description: '',
    parent_id: '',
    level: 1
  });

  const { data: wbsItems = [] } = useWbsItems(projectId);
  const createItem = useCreateWbsItem();
  const updateItem = useUpdateWbsItem();
  const deleteItem = useDeleteWbsItem();

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      updateItem.mutate({ 
        id: editingItem.id, 
        data: formData 
      });
    } else {
      createItem.mutate({
        ...formData,
        project_id: projectId,
        sort_order: 0
      });
    }
    
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({ wbs_code: '', name: '', description: '', parent_id: '', level: 1 });
  };

  const openEditDialog = (item: WbsItem) => {
    setEditingItem(item);
    setFormData({
      wbs_code: item.wbs_code,
      name: item.name,
      description: item.description || '',
      parent_id: item.parent_id || '',
      level: item.level
    });
    setIsDialogOpen(true);
  };

  const renderWbsItem = (item: WbsItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    return (
      <div key={item.id}>
        <div 
          className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-lg"
          style={{ marginLeft: level * 20 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleExpanded(item.id)}
            className={hasChildren ? '' : 'invisible'}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          
          <Badge variant="outline" className="text-xs">
            {item.wbs_code}
          </Badge>
          
          <span className="flex-1 font-medium">{item.name}</span>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEditDialog(item)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteItem.mutate(item.id)}
              disabled={deleteItem.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {item.children!.map(child => renderWbsItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trees className="h-5 w-5" />
            Work Breakdown Structure
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add WBS Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit WBS Item' : 'Create WBS Item'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wbs_code">WBS Code</Label>
                  <Input
                    id="wbs_code"
                    value={formData.wbs_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, wbs_code: e.target.value }))}
                    placeholder="e.g., 1.2.3"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={createItem.isPending || updateItem.isPending}
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {wbsItems.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No WBS items created yet. Start by adding a root item.
          </p>
        ) : (
          <div className="space-y-1">
            {wbsItems.map(item => renderWbsItem(item))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WbsManager;
