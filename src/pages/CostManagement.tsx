
import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useProjectCostEntries } from '@/hooks/useCostEntries';
import { useProjects } from '@/hooks/useProjects';
import { CreateCostEntryForm } from '@/components/forms/CreateCostEntryForm';
import { EditCostEntryForm } from '@/components/forms/EditCostEntryForm';
import { CostDetailView } from '@/components/views/CostDetailView';
import { format } from 'date-fns';

const CostManagement = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedCostEntry, setSelectedCostEntry] = useState<any>(null);

  const { data: projects = [] } = useProjects();
  const { data: costEntries = [], isLoading } = useProjectCostEntries(selectedProjectId);

  const filteredCostEntries = costEntries.filter(entry => {
    const matchesSearch = entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalCost = filteredCostEntries.reduce((sum, entry) => sum + entry.amount, 0);

  const getSourceTypeColor = (type: string) => {
    switch (type) {
      case 'manual': return 'bg-blue-100 text-blue-800';
      case 'timesheet': return 'bg-green-100 text-green-800';
      case 'invoice': return 'bg-yellow-100 text-yellow-800';
      case 'expense': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (entry: any) => {
    setSelectedCostEntry(entry);
    setEditDialogOpen(true);
  };

  const handleView = (entry: any) => {
    setSelectedCostEntry(entry);
    setDetailDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cost Management</h1>
          <p className="text-muted-foreground">Track and manage project costs</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} disabled={!selectedProjectId}>
          <Plus className="h-4 w-4 mr-2" />
          Add Cost Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCostEntries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${filteredCostEntries
                .filter(entry => new Date(entry.entry_date).getMonth() === new Date().getMonth())
                .reduce((sum, entry) => sum + entry.amount, 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${filteredCostEntries.length > 0 ? Math.round(totalCost / filteredCostEntries.length).toLocaleString() : '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cost entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="labor">Labor</SelectItem>
              <SelectItem value="materials">Materials</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
              <SelectItem value="overhead">Overhead</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {!selectedProjectId ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
          <p className="text-muted-foreground">Choose a project to view its cost entries</p>
        </div>
      ) : filteredCostEntries.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No cost entries found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || categoryFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Get started by adding your first cost entry'}
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Cost Entry
          </Button>
        </div>
      ) : (
        <div className="bg-card border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCostEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{format(new Date(entry.entry_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="font-medium">{entry.description || 'No description'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{entry.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSourceTypeColor(entry.source_type)}>
                      {entry.source_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ${entry.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Filter className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(entry)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(entry)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateCostEntryForm
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        projectId={selectedProjectId}
      />

      <EditCostEntryForm
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        costEntry={selectedCostEntry}
      />

      <CostDetailView
        isOpen={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        onEdit={() => {
          setDetailDialogOpen(false);
          setEditDialogOpen(true);
        }}
        costEntry={selectedCostEntry}
      />
    </div>
  );
};

export default CostManagement;
