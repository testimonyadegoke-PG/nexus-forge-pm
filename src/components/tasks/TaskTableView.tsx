
import React from 'react';
import { Task } from '@/hooks/useTasks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TaskTableViewProps {
  tasks: Task[];
}

export const TaskTableView: React.FC<TaskTableViewProps> = ({ tasks }) => {
  const navigate = useNavigate();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'default';
      case 'blocked':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell>
                <div>
                  <div className="font-medium hover:text-primary" 
                       onClick={() => navigate(`/dashboard/tasks/${task.id}`)}>
                    {task.name}
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {task.description}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(task.status)}>
                  {task.status.replace('-', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{task.category}</Badge>
              </TableCell>
              <TableCell>{task.assignee?.full_name || '-'}</TableCell>
              <TableCell>{new Date(task.due_date).toLocaleDateString()}</TableCell>
              <TableCell>{task.progress}%</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/tasks/${task.id}`)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/tasks/${task.id}/edit`)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
