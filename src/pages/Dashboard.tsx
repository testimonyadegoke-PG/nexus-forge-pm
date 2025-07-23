
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectForm } from "@/components/ProjectForm";
import { useProjects } from "@/hooks/useProjects";
import { useProjectBudgets } from "@/hooks/useBudgets";
import { useProjectCostEntries } from "@/hooks/useCostEntries";
import { useProjectTasks } from "@/hooks/useTasks";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  BarChart3,
  Clock,
  Target,
  AlertTriangle
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'planning': return 'status-planning';
      case 'active': return 'status-active';
      case 'on-hold': return 'status-on-hold';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
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

  const calculateProjectProgress = (projectId: string) => {
    // This is a simplified calculation - in a real app you'd want to aggregate task progress
    const project = projects.find(p => p.id === projectId);
    if (!project) return 0;
    
    const now = new Date();
    const start = new Date(project.start_date);
    const end = new Date(project.end_date);
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  };

  const calculateProjectBudget = (projectId: string) => {
    // This would be calculated from actual budget and cost data
    // For now, returning sample values
    return {
      allocated: 250000,
      spent: 170000,
      remaining: 80000
    };
  };

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalBudget = projects.reduce((sum, p) => sum + calculateProjectBudget(p.id).allocated, 0);
  const totalSpent = projects.reduce((sum, p) => sum + calculateProjectBudget(p.id).spent, 0);
  const totalTeamMembers = projects.length * 8; // Sample calculation

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-hero bg-clip-text text-transparent">
                PowerGen PPM
              </h1>
              <p className="text-muted-foreground mt-1">Project Portfolio Management</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Today
              </Button>
              <ProjectForm />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="interactive-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(totalSpent)} spent
              </p>
            </CardContent>
          </Card>

          <Card className="interactive-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjects}</div>
              <p className="text-xs text-muted-foreground">
                {projects.length} total projects
              </p>
            </CardContent>
          </Card>

          <Card className="interactive-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTeamMembers}</div>
              <p className="text-xs text-muted-foreground">
                Across all projects
              </p>
            </CardContent>
          </Card>

          <Card className="interactive-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
              <TrendingUp className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Overall utilization
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => {
            const progress = calculateProjectProgress(project.id);
            const budget = calculateProjectBudget(project.id);
            const teamSize = 8; // Sample team size
            
            return (
              <Card 
                key={project.id} 
                className="interactive-card group cursor-pointer"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-smooth">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {project.description}
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusBadgeClass(project.status)} capitalize`}>
                      {project.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Budget */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="font-medium">{formatCurrency(budget.allocated)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Spent: {formatCurrency(budget.spent)}</span>
                      <span>Remaining: {formatCurrency(budget.remaining)}</span>
                    </div>
                    <Progress 
                      value={(budget.spent / budget.allocated) * 100} 
                      className="h-1" 
                    />
                  </div>

                  {/* Project Info */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(project.end_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {teamSize}
                    </div>
                  </div>

                  {/* Manager */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      PM: {project.manager?.full_name || 'Unassigned'}
                    </span>
                    {budget.spent / budget.allocated > 0.9 && (
                      <AlertTriangle className="w-4 h-4 text-warning" />
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Reports
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8 interactive-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common project management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ProjectForm />
              <Button variant="outline" className="h-auto p-4 justify-start">
                <BarChart3 className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">View Reports</div>
                  <div className="text-sm text-muted-foreground">Analyze performance</div>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4 justify-start">
                <Users className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Manage Team</div>
                  <div className="text-sm text-muted-foreground">Assign resources</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
