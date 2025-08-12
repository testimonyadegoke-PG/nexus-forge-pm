import React, { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ViewToggle, View } from '@/components/ViewToggle';
import { ProjectListView } from '@/components/projects/ProjectListView';
import { ProjectTableView } from '@/components/projects/ProjectTableView';
import { ProjectCardView } from '@/components/projects/ProjectCardView';
import { Plus, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const navigate = useNavigate();
  const { data: projects = [], isLoading, error } = useProjects();
  const [view, setView] = useState<View>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading projects: {error.message}</p>
      </div>
    );
  }

  const renderProjectView = () => {
    switch (view) {
      case 'list':
        return <ProjectListView projects={filteredProjects} />;
      case 'table':
        return <ProjectTableView projects={filteredProjects} />;
      case 'grid':
      case 'cards':
      default:
        return <ProjectCardView projects={filteredProjects} />;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage and track your project portfolio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onViewChange={setView} />
          <Button onClick={() => navigate('/dashboard/projects/create')} className="gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Content */}
      <div className="min-h-96">
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">No projects found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'Get started by creating your first project'
                    }
                  </p>
                </div>
                {!searchQuery && statusFilter === 'all' && (
                  <Button onClick={() => navigate('/dashboard/projects/create')} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Your First Project
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          renderProjectView()
        )}
      </div>

      {/* Stats */}
      {filteredProjects.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{filteredProjects.length}</div>
                <div className="text-sm text-muted-foreground">Total Projects</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {filteredProjects.filter(p => p.status === 'active').length}
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {filteredProjects.filter(p => p.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredProjects.filter(p => p.status === 'on-hold').length}
                </div>
                <div className="text-sm text-muted-foreground">On Hold</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {filteredProjects.filter(p => p.status === 'blocked').length}
                </div>
                <div className="text-sm text-muted-foreground">Blocked</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Projects;
