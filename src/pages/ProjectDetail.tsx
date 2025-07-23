
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskForm } from "@/components/TaskForm";
import { useProject } from "@/hooks/useProjects";
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
  AlertTriangle
} from "lucide-react";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: project, isLoading: projectLoading } = useProject(id!);
  const { data: tasks = [] } = useProjectTasks(id!);
  const { data: budgets = [] } = useProjectBudgets(id!);
  const { data: costEntries = [] } = useProjectCostEntries(id!);

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

  // Calculate project statistics
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.allocated_amount), 0);
  const totalSpent = costEntries.reduce((sum, c) => sum + Number(c.amount), 0);
  const avgProgress = tasks.length > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length) : 0;
  const teamSize = new Set(tasks.map(t => t.assignee_id).filter(Boolean)).size;

  // Calculate duration
  const startDate = new Date(project.start_date);
  const endDate = new Date(project.end_date);
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Group budgets by category
  const budgetsByCategory = budgets.reduce((acc, budget) => {
    if (!acc[budget.category]) {
      acc[budget.category] = {
        allocated: 0,
        spent: 0,
        subcategories: []
      };
    }
    acc[budget.category].allocated += Number(budget.allocated_amount);
    
    // Calculate spent amount for this category
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
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="hero" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Project
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="interactive-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold">{avgProgress}%</p>
                </div>
                <Target className="w-8 h-8 text-primary" />
              </div>
              <Progress value={avgProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="interactive-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-success" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatCurrency(totalSpent)} spent
              </div>
            </CardContent>
          </Card>

          <Card className="interactive-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Team Size</p>
                  <p className="text-2xl font-bold">{teamSize}</p>
                </div>
                <Users className="w-8 h-8 text-info" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Active members
              </div>
            </CardContent>
          </Card>

          <Card className="interactive-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-2xl font-bold">{duration}</p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Days total
              </div>
            </CardContent>
          </Card>
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
              {/* Recent Tasks */}
              <Card className="interactive-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Tasks</span>
                    <TaskForm projectId={project.id} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border border-border rounded-md">
                      <div className="space-y-1">
                        <p className="font-medium">{task.name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{task.assignee?.full_name || 'Unassigned'}</span>
                          <span>•</span>
                          <span>{formatDate(task.start_date)} - {formatDate(task.end_date)}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge className={`${getStatusBadgeClass(task.status)} text-xs`}>
                          {task.status.replace('-', ' ')}
                        </Badge>
                        <div className="text-sm font-medium">{task.progress}%</div>
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No tasks yet. Create your first task!</p>
                  )}
                </CardContent>
              </Card>

              {/* Budget Overview */}
              <Card className="interactive-card">
                <CardHeader>
                  <CardTitle>Budget Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(budgetsByCategory).map(([category, data]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{category}</span>
                        <span>{formatCurrency(data.allocated)}</span>
                      </div>
                      <Progress value={data.allocated > 0 ? (data.spent / data.allocated) * 100 : 0} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Spent: {formatCurrency(data.spent)}</span>
                        <span>Remaining: {formatCurrency(data.allocated - data.spent)}</span>
                      </div>
                    </div>
                  ))}
                  {budgets.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No budget entries yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card className="interactive-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Project Schedule</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <TaskForm projectId={project.id} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Task List */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Task List</h4>
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 border border-border rounded-md hover:bg-muted/50 transition-smooth">
                        <div className="space-y-1">
                          <p className="font-medium">{task.name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{task.assignee?.full_name || 'Unassigned'}</span>
                            <span>{task.duration} days</span>
                            <span>{formatDate(task.start_date)} - {formatDate(task.end_date)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={`${getStatusBadgeClass(task.status)} text-xs`}>
                            {task.status.replace('-', ' ')}
                          </Badge>
                          <div className="text-right">
                            <div className="text-sm font-medium">{task.progress}%</div>
                            <Progress value={task.progress} className="w-20 h-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                    {tasks.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">No tasks yet. Create your first task to get started!</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-6">
            <Card className="interactive-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Budget Management</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="hero" size="sm">
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
            <Card className="interactive-card">
              <CardHeader>
                <CardTitle>Project Reports</CardTitle>
                <CardDescription>
                  Comprehensive analytics and insights for project performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Schedule Performance</span>
                        <span className="text-sm font-medium">
                          {avgProgress > 80 ? 'On Track' : avgProgress > 50 ? 'At Risk' : 'Behind'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Cost Performance</span>
                        <span className="text-sm font-medium text-warning">
                          {totalBudget > 0 && totalSpent / totalBudget > 0.9 ? 'At Risk' : 'On Track'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Task Completion</span>
                        <span className="text-sm font-medium text-success">
                          {tasks.filter(t => t.status === 'completed').length}/{tasks.length} tasks
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Generate Status Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Analytics Dashboard
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        Export Project Data
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetail;
