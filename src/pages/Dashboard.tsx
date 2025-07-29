import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useProjects } from "@/hooks/useProjects";
import { useBudgets } from "@/hooks/useBudgets";
import { useCostEntries } from "@/hooks/useCostEntries";
import { useTasks } from "@/hooks/useTasks";
import { 
  DollarSign, 
  TrendingUp,
  Clock,
  AlertTriangle,
  FolderPlus,
  CheckCircle
} from "lucide-react";
import React from 'react';
import { Database } from "@/integrations/supabase/types";

// Define types based on the database schema
type Project = Database['public']['Tables']['projects']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];
type Budget = Database['public']['Tables']['budgets']['Row'];
type CostEntry = Database['public']['Tables']['cost_entries']['Row'];

// Helper Components for a cleaner structure

const KpiCard = ({ title, value, icon, description }: { title: string, value: string, icon: React.ReactNode, description: string }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const ProjectCard = ({ project, progress }: { project: Project, progress: number }) => {
  const navigate = useNavigate();
  return (
    <div 
      className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      onClick={() => navigate(`/dashboard/projects/${project.id}/overview`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/dashboard/projects/${project.id}/overview`)}
    >
      <div>
        <h3 className="font-semibold text-primary">{project.name}</h3>
        <p className="text-sm text-muted-foreground">Due: {new Date(project.end_date).toLocaleDateString()}</p>
      </div>
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="flex-grow">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-right text-muted-foreground mt-1">{progress}%</p>
        </div>
        {project.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
      </div>
    </div>
  );
};

const PortfolioOverviewCard = ({ totalBudget, totalSpent }: { totalBudget: number, totalSpent: number }) => (
  <Card className="shadow-sm">
    <CardHeader>
      <CardTitle>Portfolio Overview</CardTitle>
      <CardDescription>High-level financial summary.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Total Budget</span>
        <span className="font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalBudget)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Total Spent</span>
        <span className="font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalSpent)}</span>
      </div>
      <Progress value={totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0} />
    </CardContent>
  </Card>
);

const UpcomingDeadlinesCard = ({ tasks, projects }: { tasks: Task[], projects: Project[] }) => (
  <Card className="shadow-sm">
    <CardHeader>
      <CardTitle>Upcoming Deadlines</CardTitle>
      <CardDescription>Key dates to watch out for.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {tasks
        .filter(t => new Date(t.end_date) > new Date())
        .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())
        .slice(0, 4)
        .map(task => (
          <div key={task.id} className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium">{task.name}</p>
              <p className="text-xs text-muted-foreground">{projects.find(p => p.id === task.project_id)?.name}</p>
            </div>
            <Badge variant="outline">{new Date(task.end_date).toLocaleDateString()}</Badge>
          </div>
        ))}
        {tasks.filter(t => new Date(t.end_date) > new Date()).length === 0 && (
          <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
        )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets();
  const { data: costs = [], isLoading: costsLoading } = useCostEntries();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateProjectProgress = (projectId: string) => {
    const projectTasks = (tasks as Task[]).filter(t => t.project_id === projectId);
    if (projectTasks.length === 0) return 0;
    const totalProgress = projectTasks.reduce((sum, task) => sum + (task.progress || 0), 0);
    return Math.round(totalProgress / projectTasks.length);
  };

  const totalBudget = (budgets as Budget[]).reduce((sum, budget) => sum + Number(budget.allocated_amount), 0);
  const totalSpent = (costs as CostEntry[]).reduce((sum, cost) => sum + Number(cost.amount), 0);

  const overdueTasksCount = (tasks as Task[]).filter(task => new Date(task.end_date) < new Date() && task.status !== 'completed').length;

  const projectsAtRiskCount = (projects as Project[]).filter(p => {
    const projectBudgets = (budgets as Budget[]).filter(b => b.project_id === p.id);
    const projectTotalBudget = projectBudgets.reduce((sum, b) => sum + Number(b.allocated_amount), 0);
    if (projectTotalBudget === 0) return false;
    const projectCosts = (costs as CostEntry[]).filter(c => c.project_id === p.id);
    const projectTotalCosts = projectCosts.reduce((sum, c) => sum + Number(c.amount), 0);
    const isOverBudget = (projectTotalCosts / projectTotalBudget) > 0.9;
    const isOverdue = new Date(p.end_date) < new Date() && p.status !== 'completed';
    return isOverBudget || isOverdue;
  }).length;

  const isLoading = projectsLoading || budgetsLoading || costsLoading || tasksLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const activeProjects = (projects as Project[]).filter(p => p.status === 'active').length;

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your project portfolio overview.</p>
        </div>
        <Button onClick={() => navigate('/dashboard/projects/new')}>
          <FolderPlus className="w-4 h-4 mr-2" />
          Create Project
        </Button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Portfolio Budget" value={formatCurrency(totalBudget)} icon={<DollarSign />} description={`${formatCurrency(totalSpent)} spent`} />
        <KpiCard title="Active Projects" value={activeProjects.toString()} icon={<TrendingUp />} description={`${(projects as Project[]).length} total projects`} />
        <KpiCard title="Overdue Tasks" value={overdueTasksCount.toString()} icon={<Clock />} description="Across all active projects" />
        <KpiCard title="Projects at Risk" value={projectsAtRiskCount.toString()} icon={<AlertTriangle />} description="Over budget or schedule" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Active Projects</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/projects')}>View All</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {(projects as Project[]).filter(p => p.status === 'active').slice(0, 5).map(project => (
                <ProjectCard key={project.id} project={project} progress={calculateProjectProgress(project.id)} />
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <PortfolioOverviewCard totalBudget={totalBudget} totalSpent={totalSpent} />
          <UpcomingDeadlinesCard tasks={tasks as Task[]} projects={projects as Project[]} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
