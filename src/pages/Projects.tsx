
import React, { useState } from 'react';
import { Plus, Search, Filter, Grid, List, Edit, Eye, Archive, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ViewToggle } from '@/components/ViewToggle';
import { ProjectForm } from '@/components/ProjectForm';
import { EditProjectForm } from '@/components/forms/EditProjectForm';
import { ProjectSettingsForm } from '@/components/forms/ProjectSettingsForm';
import { useProjects } from '@/hooks/useProjects';
import { useProjectBudgets } from '@/hooks/useBudgets';
import { useProjectCostEntries } from '@/hooks/useCostEntries';
import { Project } from '@/hooks/useProjects';
import { format } from 'date-fns';

const Projects = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: projects = [], isLoading } = useProjects();

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const ProjectCard = ({ project }: { project: Project }) => {
    const { data: budgets = [] } = useProjectBudgets(project.id);
    const { data: costEntries = [] } = useProjectCostEntries(project.id);
    
    const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.allocated_amount), 0);
    const totalCosts = costEntries.reduce((sum, cost) => sum + Number(cost.amount), 0);
    const spentPercentage = totalBudget > 0 ? (totalCosts / totalBudget) * 100 : 0;

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'on-hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      }
    };

    const getBudgetStatusColor = (percentage: number) => {
      if (percentage <= 75) return 'text-green-600 dark:text-green-400';
      if (percentage <= 90) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
    };

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.open(`/dashboard/project/${project.id}`, '_self')}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSelectedProject(project);
                  setEditDialogOpen(true);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSelectedProject(project);
                  setSettingsDialogOpen(true);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Badge className={getStatusColor(project.status)} variant="secondary">
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description || 'No description available'}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Start:</span>
                <br />
                {format(new Date(project.start_date), 'MMM dd, yyyy')}
              </div>
              <div>
                <span className="font-medium">End:</span>
                <br />
                {format(new Date(project.end_date), 'MMM dd, yyyy')}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Budget:</span>
                <span className="text-sm">${totalBudget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Spent:</span>
                <span className={`text-sm font-medium ${getBudgetStatusColor(spentPercentage)}`}>
                  {spentPercentage.toFixed(1)}% (${totalCosts.toLocaleString()})
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    spentPercentage <= 75 ? 'bg-green-500' : 
                    spentPercentage <= 90 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                />
              </div>
            </div>
            {project.manager && (
              <div className="text-sm">
                <span className="font-medium">Manager:</span> {project.manager.full_name}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const ProjectRow = ({ project }: { project: Project }) => {
    const { data: budgets = [] } = useProjectBudgets(project.id);
    const { data: costEntries = [] } = useProjectCostEntries(project.id);
    
    const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.allocated_amount), 0);
    const totalCosts = costEntries.reduce((sum, cost) => sum + Number(cost.amount), 0);
    const spentPercentage = totalBudget > 0 ? (totalCosts / totalBudget) * 100 : 0;

    return (
      <TableRow>
        <TableCell className="font-medium">{project.name}</TableCell>
        <TableCell>
          <Badge variant="secondary" className="capitalize">
            {project.status.replace('-', ' ')}
          </Badge>
        </TableCell>
        <TableCell>{format(new Date(project.start_date), 'MMM dd, yyyy')}</TableCell>
        <TableCell>{format(new Date(project.end_date), 'MMM dd, yyyy')}</TableCell>
        <TableCell>${totalBudget.toLocaleString()}</TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <span className={spentPercentage <= 75 ? 'text-green-600' : spentPercentage <= 90 ? 'text-yellow-600' : 'text-red-600'}>
              {spentPercentage.toFixed(1)}%
            </span>
            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  spentPercentage <= 75 ? 'bg-green-500' : 
                  spentPercentage <= 90 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              />
            </div>
          </div>
        </TableCell>
        <TableCell>{project.manager?.full_name || 'Unassigned'}</TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.open(`/dashboard/project/${project.id}`, '_self')}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedProject(project);
                setEditDialogOpen(true);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedProject(project);
                setSettingsDialogOpen(true);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
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
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage and track all your projects</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm onSuccess={() => setCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Get started by creating your first project'}
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      ) : (
        <>
          {view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="bg-card border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <ProjectRow key={project.id} project={project} />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      {selectedProject && (
        <>
          <EditProjectForm 
            project={selectedProject}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
          <ProjectSettingsForm
            project={selectedProject}
            open={settingsDialogOpen}
            onOpenChange={setSettingsDialogOpen}
          />
        </>
      )}
    </div>
  );
};

export default Projects;
