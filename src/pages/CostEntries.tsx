
import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Edit, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ViewToggle } from '@/components/ViewToggle';
import { CreateCostEntryForm } from '@/components/forms/CreateCostEntryForm';
import { EditCostEntryForm } from '@/components/forms/EditCostEntryForm';
import { CostDetailView } from '@/components/views/CostDetailView';
import { useProjectCostEntries, CostEntry } from '@/hooks/useCostEntries';
import { format } from 'date-fns';

export const CostEntries: React.FC = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<CostEntry | null>(null);

  // Mock data - replace with actual hook call
  const mockEntries: CostEntry[] = [
    {
      id: '1',
      project_id: 'project-1',
      category: 'Labor',
      subcategory: 'Internal Staff',
      amount: 5000,
      source_type: 'timesheet',
      entry_date: '2024-01-15',
      description: 'Development team work for Q1',
      created_by: 'user-1',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      project_id: 'project-1',
      category: 'Materials',
      subcategory: 'Supplies',
      amount: 1200,
      source_type: 'invoice',
      entry_date: '2024-01-16',
      description: 'Office supplies and equipment',
      created_by: 'user-2',
      created_at: '2024-01-16T14:30:00Z',
      updated_at: '2024-01-16T14:30:00Z',
    },
  ];

  const handleEdit = (entry: CostEntry) => {
    setSelectedEntry(entry);
    setShowEditForm(true);
  };

  const handleView = (entry: CostEntry) => {
    setSelectedEntry(entry);
    setShowDetailView(true);
  };

  const getSourceTypeColor = (type: string) => {
    switch (type) {
      case 'manual':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'timesheet':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'invoice':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'expense':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const filteredEntries = mockEntries.filter(entry =>
    entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.subcategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Cost Entries</h1>
          <p className="text-muted-foreground">Track and manage project costs</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Cost Entry
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cost entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{entry.category}</CardTitle>
                    {entry.subcategory && (
                      <p className="text-sm text-muted-foreground">{entry.subcategory}</p>
                    )}
                  </div>
                  <Badge className={getSourceTypeColor(entry.source_type)}>
                    {entry.source_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <span className="font-bold text-lg">${entry.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <span className="text-sm">{format(new Date(entry.entry_date), 'MMM d, yyyy')}</span>
                  </div>
                  {entry.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {entry.description}
                    </p>
                  )}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleView(entry)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(entry)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-left p-4 font-medium">Subcategory</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Source</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-4 font-medium">{entry.category}</td>
                    <td className="p-4 text-muted-foreground">{entry.subcategory || '-'}</td>
                    <td className="p-4 font-bold">${entry.amount.toLocaleString()}</td>
                    <td className="p-4">
                      <Badge className={getSourceTypeColor(entry.source_type)}>
                        {entry.source_type}
                      </Badge>
                    </td>
                    <td className="p-4">{format(new Date(entry.entry_date), 'MMM d, yyyy')}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleView(entry)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(entry)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CreateCostEntryForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
      />

      <EditCostEntryForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        costEntry={selectedEntry}
      />

      <CostDetailView
        isOpen={showDetailView}
        onClose={() => setShowDetailView(false)}
        onEdit={() => {
          setShowDetailView(false);
          setShowEditForm(true);
        }}
        costEntry={selectedEntry}
      />
    </div>
  );
};
