import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskForm } from "@/components/TaskForm";
import { EditProjectForm } from "@/components/forms/EditProjectForm";
import { ProjectSettingsForm } from "@/components/forms/ProjectSettingsForm";
import { TaskDetailView } from "@/components/views/TaskDetailView";
import { BudgetDetailView } from "@/components/views/BudgetDetailView";
import { BudgetCreationForm } from "@/components/forms/BudgetCreationForm";
import { useProject } from "@/hooks/useProjects";
import React from "react";
import { KpiCard } from "@/components/KpiCard";
import { BudgetActualBarChart } from "@/components/BudgetActualBarChart";
import { CostOverTimeLineChart } from "@/components/CostOverTimeLineChart";
import { TaskStatusDonutChart } from "@/components/TaskStatusDonutChart";

const ProjectSchedule = React.lazy(() => import("./ProjectSchedule"));
const ProjectReports = React.lazy(() => import("./ProjectReports"));

interface ProjectDetailChildProps {
  projectId: string;
}

const ProjectScheduleEmbed = ({ projectId }: ProjectDetailChildProps) => <ProjectSchedule projectId={projectId} />;
const ProjectReportsEmbed = ({ projectId }: ProjectDetailChildProps) => <ProjectReports projectId={projectId} />;

import { useProjectTasks } from "@/hooks/useTasks";
import { useProjectBudgets } from "@/hooks/useBudgets";
import { useProjectCostEntries } from "@/hooks/useCostEntries";
import { 
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Clock,
  Target,
  BarChart3,
  Settings,
  Plus,
  Filter,
  Download,
  Edit,
  TrendingUp,
  AlertTriangle,
  Eye
} from "lucide-react";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [showEditForm, setShowEditForm] = useState(false);
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState<string | null>(null);
  const [showBudgetDetail, setShowBudgetDetail] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  
  const { data: project, isLoading: projectLoading } = useProject(id!);
  const { data: tasksRaw } = useProjectTasks(id!);
  const { data: budgetsRaw } = useProjectBudgets(id!);
  const { data: costEntriesRaw } = useProjectCostEntries(id!);
  const tasks: { status: string; progress: number; assignee_id: string; due_date: string; }[] = Array.isArray(tasksRaw) ? tasksRaw : [];
  const budgets: { allocated_amount: number; category: string; subcategory?: string; }[] = Array.isArray(budgetsRaw) ? budgetsRaw : [];
  const costEntries: { amount: number; category: string; subcategory?: string; entry_date: string; }[] = Array.isArray(costEntriesRaw) ? costEntriesRaw : [];


  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'not-started': return 'status-planning';
      case 'in-progress': return 'status-active';
      case 'completed': return 'status-completed';
      case 'blocked': return 'status-cancelled';
      default: return 'status-planning';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.allocated_amount), 0);
  const totalSpent = costEntries.reduce((sum, c) => sum + Number(c.amount), 0);
  const avgProgress = tasks.length > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length) : 0;
  const teamSize = new Set(tasks.map(t => t.assignee_id).filter(Boolean)).size;

  const startDate = new Date(project.start_date);
  const endDate = new Date(project.end_date);
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const budgetsByCategory = budgets.reduce((acc, budget) => {
    if (!acc[budget.category]) {
      acc[budget.category] = {
        allocated: 0,
        spent: 0,
        subcategories: []
      };
    }
    acc[budget.category].allocated += Number(budget.allocated_amount);
    
    const categorySpent = costEntries
      .filter(c => c.category === budget.category)
      .reduce((sum, c) => sum + Number(c.amount), 0);
    acc[budget.category].spent = categorySpent;
    
    acc[budget.category].subcategories.push({
      name: budget.subcategory || 'General',
      allocated: Number(budget.allocated_amount),
      spent: costEntries
        .filter(c => c.category === budget.category && c.subcategory === budget.subcategory)
        .reduce((sum, c) => sum + Number(c.amount), 0)
    });
    
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/dashboard")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <p className="text-muted-foreground text-sm">{project.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${getStatusBadgeClass(project.status)} capitalize`}>
                {project.status.replace('-', ' ')}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setShowSettingsForm(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="hero" size="sm" onClick={() => setShowEditForm(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Project
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Intelligent KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <KpiCard
            title="Total Budget"
            value={formatCurrency(totalBudget)}
            icon={<DollarSign className="w-8 h-8" />}
            color="primary"
            description="Allocated for this project"
            deviation={totalBudget === 0 ? 0 : Math.round(((totalSpent - totalBudget) / totalBudget) * 100)}
            riskLevel={totalSpent > totalBudget ? "high" : totalSpent > 0.9 * totalBudget ? "medium" : "low"}
          />
          <KpiCard
            title="Total Actual Cost"
            value={formatCurrency(totalSpent)}
            icon={<TrendingUp className="w-8 h-8" />}
            color="danger"
            description="Spent to date"
          />
          <KpiCard
            title="Projects at Risk"
            value={project.status === 'blocked' ? 1 : 0}
            icon={<AlertTriangle className="w-8 h-8" />}
            color={project.status === 'blocked' ? "danger" : "success"}
            description={project.status === 'blocked' ? "This project is at risk" : "No risk detected"}
            riskLevel={project.status === 'blocked' ? "high" : "low"}
          />
          <KpiCard
            title="Overdue / Due Soon"
            value={tasks.filter(t => new Date(t.due_date) < new Date()).length +
              " / " +
              tasks.filter(t => {
                const due = new Date(t.due_date);
                const now = new Date();
                const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                return due >= now && due <= soon;
              }).length
            }
            icon={<Calendar className="w-8 h-8" />}
            color="warning"
            description="Overdue / Due in 7 days"
          />
          <KpiCard
            title="Budget Deviation %"
            value={totalBudget === 0 ? '0%' : ((totalSpent - totalBudget) / totalBudget * 100).toFixed(1) + '%'}
            icon={<BarChart3 className="w-8 h-8" />}
            color={totalSpent > totalBudget ? "danger" : totalSpent > 0.9 * totalBudget ? "warning" : "success"}
            deviation={totalBudget === 0 ? 0 : Math.round(((totalSpent - totalBudget) / totalBudget) * 100)}
          />
        </div>




        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Task Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskStatusDonutChart data={tasks} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Cost Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <CostOverTimeLineChart data={costEntries} />
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Budget vs. Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <BudgetActualBarChart data={budgets.map(b => ({
                    category: b.category,
                    budget: Number(b.allocated_amount),
                    actual: costEntries.filter(c => c.category === b.category).reduce((sum, c) => sum + Number(c.amount), 0)
                  }))} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <React.Suspense fallback={<div>Loading schedule...</div>}>
              <ProjectScheduleEmbed projectId={project.id} />
            </React.Suspense>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-6">
            <Card className="interactive-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Budget Management</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowBudgetDetail(true)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="hero" size="sm" onClick={() => setShowBudgetForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Budget
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(budgetsByCategory).map(([category, data]) => (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{category}</h4>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(data.spent)} of {formatCurrency(data.allocated)} spent
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm font-medium">
                          {data.allocated > 0 ? Math.round((data.spent / data.allocated) * 100) : 0}%
                        </div>
                        {data.allocated > 0 && data.spent / data.allocated > 0.9 && (
                          <AlertTriangle className="w-4 h-4 text-warning ml-auto" />
                        )}
                      </div>
                    </div>
                    
                    {data.subcategories && data.subcategories.length > 0 && (
                      <div className="ml-6 space-y-2">
                        {data.subcategories.map((sub: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                            <span className="text-sm">{sub.name}</span>
                            <div className="text-sm">
                              {formatCurrency(sub.spent)} / {formatCurrency(sub.allocated)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {budgets.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No budget entries yet. Add your first budget category!</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <React.Suspense fallback={<div>Loading reports...</div>}>
              <ProjectReportsEmbed projectId={project.id} />
            </React.Suspense>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals and Forms */}
      {showEditForm && (
        <EditProjectForm
          project={project}
          open={showEditForm}
          onOpenChange={setShowEditForm}
        />
      )}

      {showSettingsForm && (
        <ProjectSettingsForm
          project={project}
          open={showSettingsForm}
          onOpenChange={setShowSettingsForm}
        />
      )}

      {showTaskDetail && (
        <TaskDetailView
          taskId={showTaskDetail}
          projectId={project.id}
          open={!!showTaskDetail}
          onOpenChange={(open) => !open && setShowTaskDetail(null)}
        />
      )}

      {showBudgetDetail && (
        <BudgetDetailView
          projectId={project.id}
          projectName={project.name}
          open={showBudgetDetail}
          onOpenChange={setShowBudgetDetail}
        />
      )}

      {showBudgetForm && (
        <BudgetCreationForm
          projectId={project.id}
          open={showBudgetForm}
          onOpenChange={setShowBudgetForm}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
