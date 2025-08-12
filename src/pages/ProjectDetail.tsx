
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '@/hooks/useProjects';
import { useProjectTasks } from '@/hooks/useTasks';
import { useProjectBudgets } from '@/hooks/useBudgets';
import { useProjectCostEntries } from '@/hooks/useCostEntries';
import { useProjectMilestones } from '@/hooks/useMilestones';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Settings, 
  Calendar, 
  BarChart3, 
  Maximize, 
  DollarSign,
  CheckSquare,
  Target,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProjectGanttChart } from '@/components/ProjectGanttChart';
import { BaselineManager } from '@/components/scheduling/BaselineManager';
import { CriticalPathView } from '@/components/scheduling/CriticalPathView';
import { EarnedValueChart } from '@/components/scheduling/EarnedValueChart';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, isError } = useProject(id || '');
  const { data: tasks = [] } = useProjectTasks(id || '');
  const { data: budgets = [] } = useProjectBudgets(id || '');
  const { data: costEntries = [] } = useProjectCostEntries(id || '');
  const { data: milestones = [] } = useProjectMilestones(id || '');

  if (isLoading) {
    return <div>Loading project details...</div>;
  }

  if (isError || !id) {
    return <div>Error loading project</div>;
  }

  // Calculate project metrics
  const totalBudget = budgets.reduce((sum: number, budget: any) => sum + Number(budget.allocated_amount || 0), 0);
  const totalSpent = costEntries.reduce((sum: number, cost: any) => sum + Number(cost.amount || 0), 0);
  const completedTasks = tasks.filter((task: any) => task.status === 'completed').length;
  const taskProgress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  const budgetUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project?.name}</h1>
          <p className="text-muted-foreground">Comprehensive project overview and management</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={`/dashboard/projects/${id}/fullscreen`}>
              <Maximize className="h-4 w-4 mr-2" />
              Full Screen
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={`/dashboard/projects/${id}/schedule`}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={`/dashboard/projects/${id}/reports`}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/dashboard/projects/${id}/advanced`}>
              <Settings className="h-4 w-4 mr-2" />
              Advanced
            </Link>
          </Button>
        </div>
      </div>

      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-4">
              <Progress value={budgetUsed} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {budgetUsed.toFixed(1)}% used ({formatCurrency(totalSpent)})
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasks Progress</p>
                <p className="text-2xl font-bold">{completedTasks}/{tasks.length}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-4">
              <Progress value={taskProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {taskProgress.toFixed(1)}% complete
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Milestones</p>
                <p className="text-2xl font-bold">{milestones.length}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-4">
              <Badge className="bg-green-100 text-green-800">
                {milestones.filter((m: any) => m.is_achieved).length} Achieved
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="text-lg px-3 py-1">{project?.status}</Badge>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                Manager: {project?.manager?.full_name || 'Unassigned'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="baselines">Baselines</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-muted-foreground">{project?.description || 'No description available'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Start Date</h4>
                    <p className="text-muted-foreground">{project?.start_date}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">End Date</h4>
                    <p className="text-muted-foreground">{project?.end_date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm">Project created</p>
                      <p className="text-xs text-muted-foreground">{new Date(project?.created_at || '').toLocaleDateString()}</p>
                    </div>
                  </div>
                  {tasks.slice(0, 3).map((task: any) => (
                    <div key={task.id} className="flex items-start gap-3">
                      <CheckSquare className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm">Task: {task.name}</p>
                        <p className="text-xs text-muted-foreground">Status: {task.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gantt">
          <ProjectGanttChart projectId={id} />
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Project Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{task.name}</h4>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{task.status}</Badge>
                      <Progress value={task.progress || 0} className="w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
                    <p className="text-sm text-muted-foreground">Spent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatCurrency(totalBudget - totalSpent)}</p>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                  </div>
                </div>
                <Progress value={budgetUsed} className="h-3" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {budgets.map((budget: any) => (
                    <div key={budget.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{budget.name}</h4>
                        <p className="text-sm text-muted-foreground">{budget.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(budget.allocated_amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="space-y-6">
            <CriticalPathView projectId={id} />
            <EarnedValueChart projectId={id} />
          </div>
        </TabsContent>

        <TabsContent value="baselines">
          <BaselineManager projectId={id} />
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Project Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Performance Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <DollarSign className="h-6 w-6 mb-2" />
                  Financial Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Resource Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  Timeline Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;
