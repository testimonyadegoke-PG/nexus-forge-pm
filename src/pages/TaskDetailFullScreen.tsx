
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTask } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Save } from 'lucide-react';
import { TaskEditFormWrapper } from '@/components/TaskEditFormWrapper';
import TaskDetail from './TaskDetail';

const TaskDetailFullScreen = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { data: task, isLoading } = useTask(taskId || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Task Not Found</h2>
          <p className="text-muted-foreground mb-4">The task you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard/tasks')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/projects/${task.project_id}/tasks`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tasks
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{task.name}</h1>
                <p className="text-sm text-muted-foreground">Task Details</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Task
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <TaskDetail />
      </div>

      {task && (
        <TaskEditFormWrapper
          task={task}
          projectId={task.project_id}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </div>
  );
};

export default TaskDetailFullScreen;
