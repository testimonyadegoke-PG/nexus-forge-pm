
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProjectTasks, Task } from '@/hooks/useTasks';
import { useProject } from '@/hooks/useProjects';
import { TaskEditForm } from '@/components/forms/TaskEditForm';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Clock, 
  Edit,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react';

interface TaskDetailViewProps {
  taskId: string;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaskDetailView = ({ taskId, projectId, open, onOpenChange }: TaskDetailViewProps) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const { data: tasks = [] } = useProjectTasks(projectId);
  const { data: project } = useProject(projectId);
  
  const task = tasks.find(t => t.id === taskId);
  const subtasks = tasks.filter(t => t.dependencies?.includes(taskId));
  const dependentTasks = tasks.filter(t => task?.dependencies?.includes(t.id));

  if (!task || !open) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'in-progress': return <PlayCircle className="w-4 h-4 text-info" />;
      case 'blocked': return <AlertCircle className="w-4 h-4 text-destructive" />;
      default: return <PauseCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'not-started': return 'status-planning';
      case 'in-progress': return 'status-active';
      case 'completed': return 'status-completed';
      case 'blocked': return 'status-cancelled';
      default: return 'status-planning';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="container mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{task.name}</h1>
              <p className="text-muted-foreground">{project?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${getStatusBadgeClass(task.status)} capitalize`}>
              {getStatusIcon(task.status)}
              <span className="ml-2">{task.status.replace('-', ' ')}</span>
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setShowEditForm(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Task
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Task Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">
                    {task.description || 'No description provided'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completion</span>
                      <span>{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dependencies */}
            {dependentTasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Dependencies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dependentTasks.map((depTask) => (
                      <div key={depTask.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{depTask.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {depTask.assignee?.full_name || 'Unassigned'}
                          </p>
                        </div>
                        <Badge className={`${getStatusBadgeClass(depTask.status)} text-xs`}>
                          {depTask.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subtasks */}
            {subtasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Subtasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{subtask.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {subtask.assignee?.full_name || 'Unassigned'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{subtask.progress}%</span>
                          <Badge className={`${getStatusBadgeClass(subtask.status)} text-xs`}>
                            {subtask.status.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Details */}
            <Card>
              <CardHeader>
                <CardTitle>Task Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Assignee</p>
                    <p className="font-medium">{task.assignee?.full_name || 'Unassigned'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{formatDate(task.start_date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">{formatDate(task.end_date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{task.duration} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Log Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-4">
                  Activity logging coming soon
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <TaskEditForm
          task={task}
          projectId={projectId}
          open={showEditForm}
          onOpenChange={setShowEditForm}
        />
      )}
    </div>
  );
};
