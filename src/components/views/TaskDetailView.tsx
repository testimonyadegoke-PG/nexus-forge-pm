
import React from 'react';
import { useParams } from 'react-router-dom';
import { useTasks } from '@/hooks/useTasks';
import { useUsers } from '@/hooks/useUsers';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, User, Clock, BarChart } from 'lucide-react';
import { format } from 'date-fns';

export const TaskDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: tasksRaw } = useTasks();
  const { data: usersRaw } = useUsers();
  const { data: projectsRaw } = useProjects();

  // Ensure we're working with arrays
  const tasks = Array.isArray(tasksRaw) ? tasksRaw : [];
  const users = Array.isArray(usersRaw) ? usersRaw : [];
  const projects = Array.isArray(projectsRaw) ? projectsRaw : [];

  const task = tasks.find(t => t.id === id);
  const assignee = users.filter(u => u.id === task?.assignee_id)[0];
  const relatedTasks = tasks.filter(t => t.project_id === task?.project_id && t.id !== id);

  if (!task) {
    return <div>Task not found</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started': return 'secondary';
      case 'in-progress': return 'default';
      case 'completed': return 'success';
      case 'blocked': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={getStatusColor(task.status)}>
              {task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignee</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm">{assignee?.full_name || 'Unassigned'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm">{format(new Date(task.due_date), 'MMM dd, yyyy')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm">{task.duration} days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{task.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {task.description || 'No description provided'}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Progress</h4>
                <div className="flex items-center space-x-2">
                  <Progress value={task.progress || 0} className="flex-1" />
                  <span className="text-sm text-muted-foreground">{task.progress}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(task.start_date), 'MMM dd, yyyy')}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium">End Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(task.end_date), 'MMM dd, yyyy')}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">Category</p>
                <p className="text-sm text-muted-foreground">{task.category}</p>
              </div>

              {task.subcategory && (
                <div>
                  <p className="text-sm font-medium">Subcategory</p>
                  <p className="text-sm text-muted-foreground">{task.subcategory}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
