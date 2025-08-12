
import React from 'react';
import { Project } from '@/hooks/useProjects';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Eye, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectListViewProps {
  projects: Project[];
}

export const ProjectListView: React.FC<ProjectListViewProps> = ({ projects }) => {
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

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold hover:text-primary" 
                      onClick={() => navigate(`/dashboard/projects/${project.id}`)}>
                    {project.name}
                  </h3>
                  <Badge variant={getStatusVariant(project.status)}>
                    {project.status}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground mb-3 line-clamp-2">
                  {project.description}
                </p>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}</span>
                  </div>
                  {project.manager && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{project.manager.full_name}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/projects/${project.id}`)}>
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/projects/${project.id}/edit`)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
