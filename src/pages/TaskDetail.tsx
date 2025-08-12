
import React from 'react';
import { useParams } from 'react-router-dom';
import { useTask } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, BarChart3, Edit, Maximize } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { data: task, isLoading, isError } = useTask(taskId || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading task</p>
      </div>
    );
  }

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
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Details</h1>
          <p className="text-muted-foreground">Manage your task information and progress</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={`/dashboard/tasks/${taskId}/fullscreen`}>
              <Maximize className="h-4 w-4 mr-2" />
              Full Screen
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/dashboard/tasks/${taskId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Task
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{task.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusVariant(task.status)}>
                {task.status.replace('-', ' ')}
              </Badge>
              <Badge variant="outline">{task.category}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-2">Description</h4>
            <p className="text-muted-foreground">{task.description || 'No description provided'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <h4 className="text-sm font-medium">Due Date</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(task.due_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {task.assignee && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h4 className="text-sm font-medium">Assignee</h4>
                    <p className="text-sm text-muted-foreground">{task.assignee.full_name}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Progress</h4>
                    <span className="text-sm font-medium">{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Duration</h4>
                <p className="text-sm text-muted-foreground">{task.duration} days</p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Date Range</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(task.start_date).toLocaleDateString()} - {new Date(task.end_date).toLocaleDateString()}
                </p>
              </div>

              {task.subcategory && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Subcategory</h4>
                  <p className="text-sm text-muted-foreground">{task.subcategory}</p>
                </div>
              )}
            </div>
          </div>

          {task.dependencies && task.dependencies.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Dependencies</h4>
              <div className="flex flex-wrap gap-2">
                {task.dependencies.map((dep, index) => (
                  <Badge key={index} variant="outline">{dep}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskDetail;
