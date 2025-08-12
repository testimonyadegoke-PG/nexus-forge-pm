
import React from 'react';
import { useProject } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Calendar, BarChart3, Maximize } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, isError } = useProject(id || '');

  if (isLoading) {
    return <div>Loading project details...</div>;
  }

  if (isError) {
    return <div>Error loading project</div>;
  }

  if (!id) {
    return <div>Project not found</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Details</h1>
          <p className="text-muted-foreground">Manage your project information and progress</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={`/projects/${id}/fullscreen`}>
              <Maximize className="h-4 w-4 mr-2" />
              Full Screen
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={`/projects/${id}/schedule`}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={`/projects/${id}/reports`}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/projects/${id}/advanced`}>
              <Settings className="h-4 w-4 mr-2" />
              Advanced
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{project?.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge>{project?.status}</Badge>
            {project?.manager?.full_name && (
              <div className="text-sm text-muted-foreground">
                Managed by {project?.manager?.full_name}
              </div>
            )}
          </div>
          <p>{project?.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium">Start Date</h4>
              <p className="text-muted-foreground">{project?.start_date}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">End Date</h4>
              <p className="text-muted-foreground">{project?.end_date}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetail;
