import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  BarChart3,
  Clock,
  Target,
  AlertTriangle
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  progress: number;
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
  };
  startDate: string;
  endDate: string;
  teamSize: number;
  manager: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects] = useState<Project[]>([
    {
      id: "1",
      name: "Office Renovation Project",
      description: "Complete renovation of headquarters including new HVAC, electrical, and interior design",
      status: "active",
      progress: 68,
      budget: { allocated: 250000, spent: 170000, remaining: 80000 },
      startDate: "2024-01-15",
      endDate: "2024-06-30",
      teamSize: 12,
      manager: "Sarah Johnson"
    },
    {
      id: "2", 
      name: "ERP System Implementation",
      description: "Deployment of new enterprise resource planning system across all departments",
      status: "planning",
      progress: 15,
      budget: { allocated: 500000, spent: 75000, remaining: 425000 },
      startDate: "2024-03-01",
      endDate: "2024-12-15",
      teamSize: 8,
      manager: "Michael Chen"
    },
    {
      id: "3",
      name: "Marketing Campaign Q2",
      description: "Digital marketing campaign for product launch in Q2 2024",
      status: "completed",
      progress: 100,
      budget: { allocated: 150000, spent: 142000, remaining: 8000 },
      startDate: "2024-04-01", 
      endDate: "2024-06-30",
      teamSize: 6,
      manager: "Emily Rodriguez"
    }
  ]);

  const getStatusBadgeClass = (status: Project['status']) => {
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

  const totalBudget = projects.reduce((sum, p) => sum + p.budget.allocated, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.budget.spent, 0);
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalTeamMembers = projects.reduce((sum, p) => sum + p.teamSize, 0);

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
              <Button className="hero-button">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
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
                {Math.round((totalSpent / totalBudget) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Overall utilization
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
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
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                {/* Budget */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="font-medium">{formatCurrency(project.budget.allocated)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Spent: {formatCurrency(project.budget.spent)}</span>
                    <span>Remaining: {formatCurrency(project.budget.remaining)}</span>
                  </div>
                  <Progress 
                    value={(project.budget.spent / project.budget.allocated) * 100} 
                    className="h-1" 
                  />
                </div>

                {/* Project Info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(project.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {project.teamSize}
                  </div>
                </div>

                {/* Manager */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">PM: {project.manager}</span>
                  {project.budget.spent / project.budget.allocated > 0.9 && (
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
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8 interactive-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common project management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 justify-start">
                <Plus className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Create Project</div>
                  <div className="text-sm text-muted-foreground">Start a new project</div>
                </div>
              </Button>
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