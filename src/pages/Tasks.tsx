
import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ViewToggle } from '@/components/ViewToggle';
import { TaskListView } from '@/components/tasks/TaskListView';
import { TaskTableView } from '@/components/tasks/TaskTableView';
import { TaskCardView } from '@/components/tasks/TaskCardView';
import { Plus, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Tasks = () => {
  const navigate = useNavigate();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: projects = [] } = useProjects();
  const [view, setView] = useState<'list' | 'table' | 'cards'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesProject = projectFilter === 'all' || task.project_id === projectFilter;
    return matchesSearch && matchesStatus && matchesProject;
  });

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderTaskView = () => {
    switch (view) {
      case 'list':
        return <TaskListView tasks={filteredTasks} groupByProject={projectFilter === 'all'} />;
      case 'table':
        return <TaskTableView tasks={filteredTasks} />;
      case 'cards':
      default:
        return <TaskCardView tasks={filteredTasks} />;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track your project tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onViewChange={setView} />
          <Button onClick={() => navigate('/dashboard/tasks/create')} className="gap-2">
            <Plus className="w-4 h-4" />
            New Task
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
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Content */}
      <div className="min-h-96">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">No tasks found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all' || projectFilter !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Get started by creating your first task'
                    }
                  </p>
                </div>
                {!searchQuery && statusFilter === 'all' && projectFilter === 'all' && (
                  <Button onClick={() => navigate('/dashboard/tasks/create')} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Your First Task
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          renderTaskView()
        )}
      </div>

      {/* Stats */}
      {filteredTasks.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{filteredTasks.length}</div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {filteredTasks.filter(t => t.status === 'in-progress').length}
                </div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {filteredTasks.filter(t => t.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {filteredTasks.filter(t => t.status === 'blocked').length}
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

export default Tasks;
