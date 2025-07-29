import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectCategoryManager } from '@/components/ProjectCategoryManager';
import { ProjectStatusManager } from '@/components/ProjectStatusManager';
import { ProjectStageManager } from '@/components/ProjectStageManager';
import { ProjectPhaseManager } from '@/components/ProjectPhaseManager';

const ProjectSettings = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Project Settings</h1>
        <p className="text-muted-foreground">Manage project dimensions like categories, statuses, stages, and phases.</p>
      </header>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="statuses">Statuses</TabsTrigger>
          <TabsTrigger value="stages">Stages</TabsTrigger>
          <TabsTrigger value="phases">Phases</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <ProjectCategoryManager />
        </TabsContent>

        <TabsContent value="statuses">
          <ProjectStatusManager />
        </TabsContent>

        <TabsContent value="stages">
          <ProjectStageManager />
        </TabsContent>

        <TabsContent value="phases">
          <ProjectPhaseManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectSettings;
