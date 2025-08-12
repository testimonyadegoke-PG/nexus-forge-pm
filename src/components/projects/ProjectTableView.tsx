
import React from 'react';
import { Project } from '@/hooks/useProjects';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectTableViewProps {
  projects: Project[];
}

export const ProjectTableView: React.FC<ProjectTableViewProps> = ({ projects }) => {
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
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell>
                <div>
                  <div className="font-medium hover:text-primary" 
                       onClick={() => navigate(`/dashboard/projects/${project.id}`)}>
                    {project.name}
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {project.description}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(project.status)}>
                  {project.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(project.start_date).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(project.end_date).toLocaleDateString()}</TableCell>
              <TableCell>{project.manager?.full_name || '-'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/projects/${project.id}`)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/projects/${project.id}/edit`)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
