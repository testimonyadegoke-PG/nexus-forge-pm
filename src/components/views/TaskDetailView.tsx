
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTask } from '@/hooks/useTasks';
import { TaskEditForm } from '@/components/forms/TaskEditForm';
import { formatDate } from '@/lib/utils';

interface TaskDetailViewProps {
  taskId: string;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaskDetailView: React.FC<TaskDetailViewProps> = ({
  taskId,
  projectId,
  open,
  onOpenChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const { data: task, isLoading } = useTask(taskId);

  if (isLoading || !task) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'; // Changed from 'success' to valid variant
      case 'in-progress':
        return 'default';
      case 'blocked':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (isEditing) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskEditForm
            task={task}
            onSuccess={() => {
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Badge variant={getStatusVariant(task.status)}>
              {task.status?.replace('-', ' ') || 'No Status'}
            </Badge>
            <Badge variant={getPriorityVariant(task.priority || 'low')}>
              {task.priority || 'No Priority'}
            </Badge>
          </div>

          {task.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Due Date</h4>
              <p className="text-muted-foreground">
                {task.due_date ? formatDate(task.due_date) : 'No due date'}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Progress</h4>
              <p className="text-muted-foreground">{task.progress || 0}%</p>
            </div>
          </div>

          {task.estimated_hours && (
            <div>
              <h4 className="font-medium mb-1">Estimated Hours</h4>
              <p className="text-muted-foreground">{task.estimated_hours} hours</p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={() => setIsEditing(true)}>
              Edit Task
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
