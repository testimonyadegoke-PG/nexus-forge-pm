
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ListChecks, Users, BarChart3, Edit, Settings } from 'lucide-react';
import { EnhancedEditProjectForm } from '@/components/forms/EnhancedEditProjectForm';
import { AdvancedProjectSettings } from '@/components/AdvancedProjectSettings';
import { CreateCostEntryFormDialog } from '@/components/forms/CreateCostEntryFormDialog';
import { CreateDropdown } from '@/components/CreateDropdown';

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading, error } = useProject(projectId || '');
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [createCostEntryOpen, setCreateCostEntryOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
          <Link to="/dashboard/projects" className="text-primary hover:underline">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'on-hold':
        return 'secondary';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'blocked':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <p className="text-muted-foreground">{project.description || 'No description provided'}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusVariant(project.status)}>
                {project.status.replace('-', ' ')}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setEditProjectOpen(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setAdvancedSettingsOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Advanced
              </Button>
              <CreateDropdown />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium">Start Date</div>
                <div className="text-muted-foreground">
                  {new Date(project.start_date).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">End Date</div>
                <div className="text-muted-foreground">
                  {new Date(project.end_date).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Category</div>
                <div className="text-muted-foreground">{project.category_id || 'Not specified'}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Phase</div>
                <div className="text-muted-foreground">{project.phase_id || 'Not specified'}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Stage</div>
                <div className="text-muted-foreground">{project.stage_id || 'Not specified'}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Manager</div>
                <div className="text-muted-foreground">{project.manager?.full_name || 'Not assigned'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      {project && (
        <>
          <EnhancedEditProjectForm
            project={project}
            open={editProjectOpen}
            onOpenChange={setEditProjectOpen}
          />
          <AdvancedProjectSettings
            projectId={project.id}
            open={advancedSettingsOpen}
            onOpenChange={setAdvancedSettingsOpen}
          />
        </>
      )}

      <CreateCostEntryFormDialog
        projectId={projectId}
        open={createCostEntryOpen}
        onOpenChange={setCreateCostEntryOpen}
      />
    </div>
  );
};

export default ProjectDetail;
