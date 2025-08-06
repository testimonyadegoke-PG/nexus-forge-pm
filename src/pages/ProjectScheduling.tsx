
import React from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BaselineManager } from '@/components/scheduling/BaselineManager';
import { CriticalPathView } from '@/components/scheduling/CriticalPathView';
import { ResourceCapacityPlanner } from '@/components/scheduling/ResourceCapacityPlanner';
import { SchedulingAlertsDashboard } from '@/components/scheduling/SchedulingAlertsDashboard';
import { EarnedValueChart } from '@/components/scheduling/EarnedValueChart';
import { Calendar, Zap, Users, Bell, TrendingUp } from 'lucide-react';

const ProjectScheduling = () => {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) {
    return <div>Project not found</div>;
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Project Scheduling</h1>
        <p className="text-muted-foreground">
          Advanced scheduling tools for project planning and control
        </p>
      </div>

      <Tabs defaultValue="baselines" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="baselines" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Baselines
          </TabsTrigger>
          <TabsTrigger value="critical-path" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Critical Path
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="earned-value" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            EVM
          </TabsTrigger>
        </TabsList>

        <TabsContent value="baselines">
          <BaselineManager projectId={projectId} />
        </TabsContent>

        <TabsContent value="critical-path">
          <CriticalPathView projectId={projectId} />
        </TabsContent>

        <TabsContent value="resources">
          <ResourceCapacityPlanner projectId={projectId} />
        </TabsContent>

        <TabsContent value="alerts">
          <SchedulingAlertsDashboard projectId={projectId} />
        </TabsContent>

        <TabsContent value="earned-value">
          <EarnedValueChart projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectScheduling;
