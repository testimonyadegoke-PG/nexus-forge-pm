
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectCategoryManager } from '@/components/ProjectCategoryManager';
import { ProjectPhaseManager } from '@/components/ProjectPhaseManager';
import { ProjectStageManager } from '@/components/ProjectStageManager';
import { ProjectStatusManager } from '@/components/ProjectStatusManager';
import { BudgetCategoryManager } from '@/components/BudgetCategoryManager';
import { BudgetSubcategoryManager } from '@/components/BudgetSubcategoryManager';
import { 
  FolderTree, 
  GitBranch, 
  Target, 
  CheckCircle, 
  DollarSign, 
  Tags 
} from 'lucide-react';

export const DimensionManager = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dimension Management</h1>
          <p className="text-muted-foreground">
            Manage all project and budget dimensions from one central location
          </p>
        </div>
      </div>

      <Tabs defaultValue="project-categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="project-categories" className="flex items-center gap-2">
            <FolderTree className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="project-phases" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Phases
          </TabsTrigger>
          <TabsTrigger value="project-stages" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Stages
          </TabsTrigger>
          <TabsTrigger value="project-status" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Status
          </TabsTrigger>
          <TabsTrigger value="budget-categories" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Budget Categories
          </TabsTrigger>
          <TabsTrigger value="budget-subcategories" className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Subcategories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="project-categories">
          <Card>
            <CardHeader>
              <CardTitle>Project Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectCategoryManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="project-phases">
          <Card>
            <CardHeader>
              <CardTitle>Project Phases</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectPhaseManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="project-stages">
          <Card>
            <CardHeader>
              <CardTitle>Project Stages</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectStageManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="project-status">
          <Card>
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectStatusManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget-categories">
          <Card>
            <CardHeader>
              <CardTitle>Budget Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetCategoryManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget-subcategories">
          <Card>
            <CardHeader>
              <CardTitle>Budget Subcategories</CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetSubcategoryManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
