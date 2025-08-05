import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProject } from '@/hooks/useProjects';
import { useProjectTasks } from '@/hooks/useTasks';
import { useBudgets } from '@/hooks/useBudgets';
import { useProjectCostEntries } from '@/hooks/useCostEntries';
import BudgetCreationForm from '@/components/forms/BudgetCreationForm';
import { BudgetDetailView } from '@/components/views/BudgetDetailView';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Plus,
  BarChart3
} from 'lucide-react';
import { ProjectComponentWrapper } from '@/components/ProjectComponentsWrapper';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showBudgetDetail, setShowBudgetDetail] = useState(false);
  
  const { data: project, isLoading: projectLoading } = useProject(id!);
  const { data: tasks = [] } = useProjectTasks(id!);
  const { data: budgets = [] } = useBudgets(id!);
  const { data: costEntries = [] } = useProjectCostEntries(id!);

  if (projectLoading) {
    return <div>Loading...</div>;
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

  // Calculate project metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.allocated_amount || 0), 0);
  const totalSpent = costEntries.reduce((sum, cost) => sum + Number(cost.amount || 0), 0);
  const remainingBudget = totalBudget - totalSpent;

  return (
    <div className="container mx-auto px-6 py-6">
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground mt-1">{project.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
              {project.status}
            </Badge>
          </div>
        </div>

        {/* Project Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold">{progressPercentage.toFixed(0)}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <Progress value={progressPercentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Spent</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tasks</p>
                  <p className="text-2xl font-bold">{completedTasks}/{totalTasks}</p>
                </div>
                <Clock className="w-8 h-8 text-info" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Project Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{task.name}</p>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                      <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No tasks yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Budget Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Budget Overview</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowBudgetDetail(true)}
                  >
                    View Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Allocated</span>
                    <span className="font-bold">{formatCurrency(totalBudget)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Spent</span>
                    <span className="font-bold text-warning">{formatCurrency(totalSpent)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Remaining</span>
                    <span className="font-bold text-success">{formatCurrency(remainingBudget)}</span>
                  </div>
                  <Progress 
                    value={totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0} 
                    className="mt-4" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <ProjectComponentWrapper projectId={id!}>
            <div>Task management components will go here</div>
          </ProjectComponentWrapper>
        </TabsContent>

        <TabsContent value="budget">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Budget Management</h2>
              <Button onClick={() => setShowBudgetForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Budget
              </Button>
            </div>
            
            <div className="grid gap-4">
              {budgets.map((budget) => (
                <Card key={budget.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{budget.name}</h3>
                        <p className="text-sm text-muted-foreground">{budget.category}</p>
                        {budget.description && (
                          <p className="text-sm text-muted-foreground mt-1">{budget.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(budget.allocated_amount)}</p>
                        <Badge variant="outline">{budget.category}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {budgets.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No budget entries yet.</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => setShowBudgetForm(true)}
                    >
                      Create your first budget
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="team">
          <ProjectComponentWrapper projectId={id!}>
            <div>Team management components will go here</div>
          </ProjectComponentWrapper>
        </TabsContent>
      </Tabs>

      {/* Budget Creation Form */}
      {showBudgetForm && (
        <BudgetCreationForm
          projectId={id!}
          open={showBudgetForm}
          onOpenChange={setShowBudgetForm}
        />
      )}

      {/* Budget Detail View */}
      {showBudgetDetail && (
        <BudgetDetailView
          projectId={id!}
          projectName={project.name}
          open={showBudgetDetail}
          onOpenChange={setShowBudgetDetail}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
