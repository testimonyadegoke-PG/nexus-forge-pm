
import React, { useState } from 'react';
import { Plus, Search, Filter, Calendar, User, Project, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ViewToggle } from '@/components/ViewToggle';
import { TaskForm } from '@/components/TaskForm';
import { TaskEditForm } from '@/components/forms/TaskEditForm';
import { useProjects } from '@/hooks/useProjects';
import { useUsers } from '@/hooks/useUsers';
import { Task } from '@/hooks/useTasks';
import { format } from 'date-fns';

const Tasks = () => {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: projects = [] } = useProjects();
  const { data: users = [] } = useUsers();

  // Mock tasks data for demonstration
  const mockTasks: Task[] = [
    {
      id: '1',
      project_id: projects[0]?.id || '1',
      name: 'Design System Setup',
      description: 'Create a comprehensive design system for the application',
      start_date: '2024-01-15',
      end_date: '2024-01-25',
      duration: 10,
      progress: 75,
      assignee_id: users[0]?.id || '1',
      status: 'in-progress',
      dependencies: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      assignee: users[0] || { full_name: 'John Doe' }
    },
    {
      id: '2',
      project_id: projects[0]?.id || '1',
      name: 'API Integration',
      description: 'Integrate with third-party APIs for data synchronization',
      start_date: '2024-01-20',
      end_date: '2024-02-05',
      duration: 16,
      progress: 30,
      assignee_id: users[1]?.id || '2',
      status: 'in-progress',
      dependencies: ['1'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      assignee: users[1] || { full_name: 'Jane Smith' }
    },
    {
      id: '3',
      project_id: projects[1]?.id || '2',
      name: 'User Authentication',
      description: 'Implement user login and registration system',
      start_date: '2024-01-10',
      end_date: '2024-01-18',
      duration: 8,
      progress: 100,
      assignee_id: users[0]?.id || '1',
      status: 'completed',
      dependencies: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      assignee: users[0] || { full_name: 'John Doe' }
    }
  ];

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesProject = projectFilter === 'all' || task.project_id === projectFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assignee_id === assigneeFilter;
    
    return matchesSearch && matchesStatus && matchesProject && matchesAssignee;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'blocked': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const project = projects.find(p => p.id === task.project_id);
    
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{task.name}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  setSelectedTask(task);
                  setEditDialogOpen(true);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(task.status)} variant="secondary">
              {task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {task.progress}% Complete
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description || 'No description available'}
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Project className="h-4 w-4" />
                <span>{project?.name || 'Unknown Project'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span>{task.assignee?.full_name || 'Unassigned'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(task.start_date), 'MMM dd')} - {format(new Date(task.end_date), 'MMM dd, yyyy')}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{task.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${getProgressColor(task.progress)}`}
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const TaskRow = ({ task }: { task: Task }) => {
    const project = projects.find(p => p.id === task.project_id);
    
    return (
      <TableRow>
        <TableCell className="font-medium">{task.name}</TableCell>
        <TableCell>{task.assignee?.full_name || 'Unassigned'}</TableCell>
        <TableCell>
          <Button variant="link" className="p-0 h-auto">
            {project?.name || 'Unknown Project'}
          </Button>
        </TableCell>
        <TableCell>{format(new Date(task.start_date), 'MMM dd, yyyy')}</TableCell>
        <TableCell>{format(new Date(task.end_date), 'MMM dd, yyyy')}</TableCell>
        <TableCell>{task.duration} days</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(task.status)} variant="secondary">
              {task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <span className="text-sm">{task.progress}%</span>
            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getProgressColor(task.progress)}`}
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setSelectedTask(task);
                setEditDialogOpen(true);
              }}>
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
    );
  };

  const KanbanColumn = ({ status, tasks }: { status: string; tasks: Task[] }) => {
    const statusLabels = {
      'not-started': 'To Do',
      'in-progress': 'In Progress',
      'completed': 'Done',
      'blocked': 'Blocked'
    };

    return (
      <div className="flex-1 min-w-80">
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{statusLabels[status as keyof typeof statusLabels]}</h3>
            <Badge variant="secondary">{tasks.length}</Badge>
          </div>
          <div className="space-y-3">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage tasks across all projects</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <TaskForm onSuccess={() => setCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not-started">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Done</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ViewToggle 
          view={view} 
          onViewChange={(newView) => setView(newView as 'list' | 'kanban')} 
        />
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' || projectFilter !== 'all' || assigneeFilter !== 'all'
              ? 'Try adjusting your search or filter criteria' 
              : 'Get started by creating your first task'}
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>
      ) : (
        <>
          {view === 'list' ? (
            <div className="bg-card border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4">
              {['not-started', 'in-progress', 'completed', 'blocked'].map(status => (
                <KanbanColumn 
                  key={status} 
                  status={status} 
                  tasks={filteredTasks.filter(task => task.status === status)} 
                />
              ))}
            </div>
          )}
        </>
      )}

      {selectedTask && (
        <TaskEditForm 
          task={selectedTask}
          projectId={selectedTask.project_id}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </div>
  );
};

export default Tasks;
