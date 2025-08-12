
import React from 'react';
import { Task } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Eye, Edit, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TaskListViewProps {
  tasks: Task[];
  groupByProject?: boolean;
}

export const TaskListView: React.FC<TaskListViewProps> = ({ tasks, groupByProject = false }) => {
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

  const groupedTasks = groupByProject 
    ? tasks.reduce((acc, task) => {
        if (!acc[task.project_id]) {
          acc[task.project_id] = [];
        }
        acc[task.project_id].push(task);
        return acc;
      }, {} as Record<string, Task[]>)
    : { 'all': tasks };

  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks).map(([projectId, projectTasks]) => (
        <div key={projectId}>
          {groupByProject && projectId !== 'all' && (
            <h3 className="text-lg font-semibold mb-4">
              Project: {projectTasks[0]?.project_id}
            </h3>
          )}
          
          <div className="space-y-4">
            {projectTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-medium hover:text-primary" 
                            onClick={() => navigate(`/dashboard/tasks/${task.id}`)}>
                          {task.name}
                        </h4>
                        <Badge variant={getStatusVariant(task.status)}>
                          {task.status.replace('-', ' ')}
                        </Badge>
                        <Badge variant="outline">{task.category}</Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {task.description}
                      </p>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                        {task.assignee && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{task.assignee.full_name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <BarChart className="w-4 h-4" />
                          <span>{task.progress}% complete</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/tasks/${task.id}`)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/tasks/${task.id}/edit`)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
