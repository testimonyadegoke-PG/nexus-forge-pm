
import React from 'react';
import { Project } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Eye, Edit, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectCardViewProps {
  projects: Project[];
}

export const ProjectCardView: React.FC<ProjectCardViewProps> = ({ projects }) => {
  const navigate = useNavigate();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'default';
      case 'on-hold':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'blocked':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'border-l-green-500';
      case 'completed':
        return 'border-l-blue-500';
      case 'on-hold':
        return 'border-l-yellow-500';
      case 'cancelled':
        return 'border-l-red-500';
      case 'blocked':
        return 'border-l-red-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} 
              className={`hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer border-l-4 ${getStatusColor(project.status)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg hover:text-primary" 
                        onClick={() => navigate(`/dashboard/projects/${project.id}`)}>
                {project.name}
              </CardTitle>
              <Badge variant={getStatusVariant(project.status)} className="ml-2">
                {project.status}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {project.description}
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                </span>
              </div>
              
              {project.manager && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{project.manager.full_name}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" 
                      onClick={() => navigate(`/dashboard/projects/${project.id}`)}>
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button variant="outline" size="sm" className="flex-1" 
                      onClick={() => navigate(`/dashboard/projects/${project.id}/edit`)}>
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
