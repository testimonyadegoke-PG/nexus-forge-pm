
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTask, Task } from '@/hooks/useTasks';
import { TaskEditForm } from '@/components/forms/TaskEditForm';

interface TaskDetailViewProps {
  taskId: string;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

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

  const typedTask = task as Task;

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
            task={typedTask}
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
          <DialogTitle>{typedTask.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Badge variant={getStatusVariant(typedTask.status)}>
              {typedTask.status?.replace('-', ' ') || 'No Status'}
            </Badge>
          </div>

          {typedTask.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground">{typedTask.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Due Date</h4>
              <p className="text-muted-foreground">
                {typedTask.due_date ? formatDate(typedTask.due_date) : 'No due date'}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Progress</h4>
              <p className="text-muted-foreground">{typedTask.progress || 0}%</p>
            </div>
          </div>

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
