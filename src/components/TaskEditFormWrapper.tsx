
import React from 'react';
import { TaskEditForm } from '@/components/forms/TaskEditForm';
import { Task } from '@/hooks/useTasks';

interface TaskEditFormWrapperProps {
  task: Task;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaskEditFormWrapper: React.FC<TaskEditFormWrapperProps> = ({ 
  task, 
  projectId, 
  open, 
  onOpenChange 
}) => {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <TaskEditForm 
      task={task} 
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
};
