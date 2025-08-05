
import React, { useState } from 'react';
import { useProjectTasks, Task } from '@/hooks/useTasks';
import { useUsers } from '@/hooks/useUsers';
import { useProjects } from '@/hooks/useProjects';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { TaskEditForm } from '@/components/forms/TaskEditForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProjectTasksListProps {
  projectId: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'not-started': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'blocked': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const TaskRow = ({ task, onEdit }: { task: Task; onEdit: (task: Task) => void; }) => {
  const { data: projects = [] } = useProjects();
  const { data: users = [] } = useUsers();
  const project = projects.find(p => p.id === task.project_id);
  const assignee = users.find(u => u.id === task.assignee_id);
  const isOverdue = new Date(task.end_date) < new Date() && task.status !== 'completed';

  return (
    <TableRow 
      tabIndex={0} 
      aria-label={`Task ${task.name}`}
      className="cursor-pointer"
      onClick={() => onEdit(task)}
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
              onEdit(task);
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

export const ProjectTasksList: React.FC<ProjectTasksListProps> = ({ projectId }) => {
  const { data: tasksRaw, isLoading } = useProjectTasks(projectId);
  const tasks: Task[] = Array.isArray(tasksRaw) ? tasksRaw : [];
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setEditDialogOpen(true);
  };

  const handleTaskUpdated = () => {
    setEditDialogOpen(false);
    setSelectedTask(null);
  };

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <>
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
          {tasks.map(task => (
            <TaskRow key={task.id} task={task} onEdit={handleEdit} />
          ))}
        </TableBody>
      </Table>

      {selectedTask && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Task: {selectedTask.name}</DialogTitle>
            </DialogHeader>
            <TaskEditForm task={selectedTask} onSuccess={handleTaskUpdated} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
