import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Calendar, User, MoreVertical, Edit, Trash2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ViewToggle } from '@/components/ViewToggle';
import { TaskForm } from '@/components/TaskForm';
import { TaskEditForm } from '@/components/forms/TaskEditForm';
import { TaskEditFormWrapper } from '@/components/TaskEditFormWrapper';
import { useProjects } from '@/hooks/useProjects';
import { useUsers } from '@/hooks/useUsers';
import { Task, useCreateTask, useProjectTasks } from '@/hooks/useTasks';
import { BulkImportExport } from '@/components/BulkImportExport';
import { format } from 'date-fns';

const Tasks = () => {
  const { mutateAsync: createTask } = useCreateTask();
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [view, setView] = useState<'list' | 'grid' | 'kanban'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: projects = [] } = useProjects();
  const { data: users = [] } = useUsers();

  const filteredProjects = projects.filter(project => {
    const matchesProject = projectFilter === 'all' || project.id === projectFilter;
    return matchesProject;
  });
  const selectedExportProjectId = projectFilter === 'all' && filteredProjects.length > 0 ? filteredProjects[0].id : projectFilter;
  const { data: tasksRaw = [] } = useProjectTasks(selectedExportProjectId === 'all' ? '' : selectedExportProjectId);
  const tasks: Task[] = Array.isArray(tasksRaw) ? tasksRaw : [];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesProject = projectFilter === 'all' || task.project_id === projectFilter;
    const matchesAssignee = assigneeFilter === 'all' || String(task.assignee_id) === assigneeFilter;
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
    const assignee = users.find(u => u.id === task.assignee_id);
    const isOverdue = new Date(task.end_date) < new Date() && task.status !== 'completed';

    const handleCardClick = () => {
      setSelectedTask(task);
      setEditDialogOpen(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleCardClick();
      }
    };

    return (
      <div
        className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer flex flex-col gap-3"
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`View details for task ${task.name}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-primary leading-tight">{task.name}</h3>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(task.status)}`}>{task.status.replace('-', ' ')}</Badge>
              {isOverdue && <Badge variant="destructive">Overdue</Badge>}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {project?.name || 'No Project'}
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {task.description || 'No description provided.'}
        </p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{assignee?.full_name || 'Unassigned'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Due: {format(new Date(task.end_date), 'MMM dd, yyyy')}</span>
          </div>
        </div>
        <div>
          <Progress value={task.progress || 0} className="h-2" />
          <p className="text-xs text-right text-muted-foreground mt-1">{task.progress || 0}%</p>
        </div>
      </div>
    );
  };

  const TaskRow = ({ task }: { task: Task }) => {
    const project = projects.find(p => p.id === task.project_id);
    const assignee = users.find(u => u.id === task.assignee_id);
    const isOverdue = new Date(task.end_date) < new Date() && task.status !== 'completed';

    return (
      <TableRow 
        tabIndex={0} 
        aria-label={`Task ${task.name}`}
        className="cursor-pointer"
        onClick={() => {
          setSelectedTask(task);
          setEditDialogOpen(true);
        }}
      >
        <TableCell className="font-medium flex items-center gap-2">
          {task.name}
          {isOverdue && <Badge variant="destructive" className="ml-2">Overdue</Badge>}
        </TableCell>
        <TableCell>{assignee?.full_name || 'Unassigned'}</TableCell>
        <TableCell>
          <Button variant="link" className="p-0 h-auto">
            {project?.name || 'Unknown Project'}
          </Button>
        </TableCell>
        <TableCell>{format(new Date(task.start_date), 'MMM dd, yyyy')}</TableCell>
        <TableCell>{format(new Date(task.end_date), 'MMM dd, yyyy')}</TableCell>
        <TableCell>{task.duration} days</TableCell>
        <TableCell>
          <Badge className={getStatusColor(task.status)} variant="secondary">
            {task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Progress value={task.progress || 0} className="w-16 h-2"/>
            <span className="text-sm text-muted-foreground">{task.progress}%</span>
          </div>
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                setSelectedTask(task);
                setEditDialogOpen(true);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={(e) => e.stopPropagation()}>
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
    const statusLabels: { [key: string]: string } = {
      'not-started': 'To Do',
      'in-progress': 'In Progress',
      'completed': 'Done',
      'blocked': 'Blocked'
    };

    return (
      <div className="flex-1 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-4 text-lg">{statusLabels[status]} <span className="text-sm font-normal text-muted-foreground">({tasks.length})</span></h3>
        <div className="space-y-4">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage all tasks across your projects.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setBulkImportOpen(true)}>Import/Export</Button>
          <Button onClick={() => navigate('/dashboard/tasks/create')}><Plus className="h-4 w-4 mr-2" />Create Task</Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-auto flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search tasks..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
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
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {users.map(u => <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <ViewToggle view={view} setView={setView} />
        </CardContent>
      </Card>

      {view === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {view === 'list' && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map(task => (
                <TaskRow key={task.id} task={task} />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {view === 'kanban' && (
        <div className="flex gap-6 overflow-x-auto pb-4">
          {['not-started', 'in-progress', 'completed', 'blocked'].map(status => (
            <KanbanColumn 
              key={status} 
              status={status} 
              tasks={filteredTasks.filter(t => t.status === status)}
            />
          ))}
        </div>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <TaskEditFormWrapper
              task={selectedTask}
              projectId={selectedTask.project_id}
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
            />
          )}
        </DialogContent>
      </Dialog>

      <BulkImportExport 
        isOpen={bulkImportOpen} 
        onClose={() => setBulkImportOpen(false)}
        projectId={selectedExportProjectId}
        exportData={filteredTasks}
      />
    </div>
  );
};
export default Tasks;
