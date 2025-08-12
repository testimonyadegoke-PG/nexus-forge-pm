
import React from 'react';
import { Task } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Eye, Edit, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

interface TaskCardViewProps {
  tasks: Task[];
}

export const TaskCardView: React.FC<TaskCardViewProps> = ({ tasks }) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-l-green-500';
      case 'in-progress':
        return 'border-l-blue-500';
      case 'blocked':
        return 'border-l-red-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task) => (
        <Card key={task.id} 
              className={`hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer border-l-4 ${getStatusColor(task.status)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg hover:text-primary line-clamp-2" 
                        onClick={() => navigate(`/dashboard/tasks/${task.id}`)}>
                {task.name}
              </CardTitle>
              <div className="flex flex-col gap-1 ml-2">
                <Badge variant={getStatusVariant(task.status)} className="text-xs">
                  {task.status.replace('-', ' ')}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {task.category}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {task.description}
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </span>
              </div>
              
              {task.assignee && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{task.assignee.full_name}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{task.progress}%</span>
                </div>
                <Progress value={task.progress} className="h-2" />
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" 
                      onClick={() => navigate(`/dashboard/tasks/${task.id}`)}>
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button variant="outline" size="sm" className="flex-1" 
                      onClick={() => navigate(`/dashboard/tasks/${task.id}/edit`)}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
