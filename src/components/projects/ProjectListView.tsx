
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Eye } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: string;
  manager?: {
    full_name: string;
  };
}

interface ProjectListViewProps {
  projects: Project[];
}

export const ProjectListView: React.FC<ProjectListViewProps> = ({ projects }) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleRowClick = (projectId: string) => {
    navigate(`/dashboard/projects/${projectId}`);
  };

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div
          key={project.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
          onClick={() => handleRowClick(project.id)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg truncate">{project.name}</h3>
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
              {project.description || 'No description available'}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {formatDate(project.start_date)} - {formatDate(project.end_date)}
                </span>
              </div>
              
              {project.manager && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{project.manager.full_name}</span>
                </div>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dashboard/projects/${project.id}`);
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        </div>
      ))}
    </div>
  );
};
