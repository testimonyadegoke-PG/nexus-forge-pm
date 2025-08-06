import React from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AccessRightsManager from '@/components/AccessRightsManager';
import WbsManager from '@/components/WbsManager';
import { Shield, Trees, Target, TrendingUp, Bell, BarChart3 } from 'lucide-react';

const ProjectAdvanced = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>Project ID not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Project Management</h1>
          <p className="text-muted-foreground">
            Advanced scheduling, analysis, and control features for comprehensive project management.
          </p>
        </header>

        <Tabs defaultValue="access" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="access" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Access
            </TabsTrigger>
            <TabsTrigger value="wbs" className="flex items-center gap-2">
              <Trees className="h-4 w-4" />
              WBS
            </TabsTrigger>
            <TabsTrigger value="baselines" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Baselines
            </TabsTrigger>
            <TabsTrigger value="critical-path" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Critical Path
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="evm" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              EVM
            </TabsTrigger>
          </TabsList>

          <TabsContent value="access" className="space-y-4">
            <AccessRightsManager projectId={id} />
          </TabsContent>

          <TabsContent value="wbs" className="space-y-4">
            <WbsManager projectId={id} />
          </TabsContent>

          <TabsContent value="baselines" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Project Baselines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Baseline management functionality will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="critical-path" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Critical Path Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Critical path analysis functionality will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Scheduling Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Scheduling alerts functionality will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evm" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Earned Value Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Earned Value Management functionality will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectAdvanced;
