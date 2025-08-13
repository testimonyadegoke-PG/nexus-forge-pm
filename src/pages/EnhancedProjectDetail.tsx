import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '@/hooks/useProjects';
import { useProjectTasks } from '@/hooks/useTasks';
import { useProjectBudgets } from '@/hooks/useBudgets';
import { useProjectCostEntries } from '@/hooks/useCostEntries';
import { useProjectPurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useProjectBaselineCalculations, useUpdateProjectBaseline } from '@/hooks/useBaselineCalculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TaskHierarchicalView } from '@/components/tasks/TaskHierarchicalView';
import { BudgetsHierarchicalView } from '@/components/views/BudgetsHierarchicalView';
import { CostEntryTable } from '@/components/tables/CostEntryTable';
import { BaselineComparisonChart } from '@/components/financial/BaselineComparisonChart';
import { PurchaseOrderList } from '@/components/financial/PurchaseOrderList';
import { EnhancedCreateTaskForm } from '@/components/forms/EnhancedCreateTaskForm';
import { EnhancedCreateBudgetForm } from '@/components/forms/EnhancedCreateBudgetForm';
import { CreateCostEntryForm } from '@/components/forms/CreateCostEntryForm';
import { CreateCostEntryFormDialog } from '@/components/forms/CreateCostEntryFormDialog';
import { 
  CalendarDays, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Plus, 
  Settings,
  RefreshCw
} from 'lucide-react';

export const EnhancedProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createBudgetOpen, setCreateBudgetOpen] = useState(false);
  const [createCostEntryOpen, setCreateCostEntryOpen] = useState(false);

  const { data: project, isLoading: projectLoading } = useProject(id!);
  const { data: tasks = [] } = useProjectTasks(id!);
  const { data: budgets = [] } = useProjectBudgets(id!);
  const { data: costEntries = [] } = useProjectCostEntries(id!);
  const { data: purchaseOrders = [] } = useProjectPurchaseOrders(id!);
  const { data: baselines = [] } = useProjectBaselineCalculations(id!);
  const updateBaseline = useUpdateProjectBaseline();

  if (projectLoading) {
    return <div>Loading project...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

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

  const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.allocated_amount), 0);
  const totalCosts = costEntries.reduce((sum, cost) => sum + Number(cost.amount), 0);
  const totalCommitted = purchaseOrders.reduce((sum, po) => sum + Number(po.total_amount), 0);

  const handleUpdateBaseline = () => {
    updateBaseline.mutate(project.id);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Project Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground mt-2">{project.description}</p>
          <div className="flex items-center gap-4 mt-4">
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>
                {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
              </span>
            </div>
            {project.manager && (
              <span className="text-sm text-muted-foreground">
                Manager: {project.manager.full_name}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleUpdateBaseline}
            disabled={updateBaseline.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${updateBaseline.isPending ? 'animate-spin' : ''}`} />
            Update Baseline
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Project Settings
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Committed</p>
                <p className="text-2xl font-bold">{formatCurrency(totalCommitted)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Actual Spend</p>
                <p className="text-2xl font-bold">{formatCurrency(totalCosts)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CalendarDays className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBudget - totalCosts)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Baseline Comparison */}
      <BaselineComparisonChart baselines={baselines} projectId={project.id} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="tasks">Tasks & Schedule</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="costs">Cost Entries</TabsTrigger>
            <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
            <TabsTrigger value="financial">Financial Analysis</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateTaskOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateBudgetOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Budget
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateCostEntryOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Cost
            </Button>
          </div>
        </div>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskHierarchicalView tasks={tasks} projectId={project.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <BudgetsHierarchicalView />
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <CostEntryTable costEntries={costEntries.map(entry => ({
                ...entry,
                date: entry.entry_date
              }))} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchase-orders" className="space-y-4">
          <PurchaseOrderList purchaseOrders={purchaseOrders} projectId={project.id} />
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Planned Budget</span>
                    <span className="font-bold">{formatCurrency(totalBudget)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Committed (POs)</span>
                    <span className="font-bold">{formatCurrency(totalCommitted)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Actual Spend</span>
                    <span className="font-bold">{formatCurrency(totalCosts)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t-2">
                    <span className="text-sm font-medium">Remaining Budget</span>
                    <span className={`font-bold ${totalBudget - totalCosts >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(totalBudget - totalCosts)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add category breakdown chart here */}
                <p className="text-muted-foreground text-center py-8">
                  Category breakdown chart coming soon
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Forms */}
      <EnhancedCreateTaskForm
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        defaultProjectId={project.id}
      />

      <EnhancedCreateBudgetForm
        open={createBudgetOpen}
        onOpenChange={setCreateBudgetOpen}
        defaultProjectId={project.id}
      />

      <CreateCostEntryFormDialog
        open={createCostEntryOpen}
        onOpenChange={setCreateCostEntryOpen}
        projectId={project.id}
      />
    </div>
  );
};

export default EnhancedProjectDetail;
