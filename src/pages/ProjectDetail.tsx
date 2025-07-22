import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface Task {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  duration: number;
  progress: number;
  assignee: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  dependencies: string[];
}

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  subcategories?: BudgetCategory[];
}

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");

  // Mock project data
  const project = {
    id: id || "1",
    name: "Office Renovation Project",
    description: "Complete renovation of headquarters including new HVAC, electrical, and interior design",
    status: "active" as const,
    progress: 68,
    budget: { allocated: 250000, spent: 170000, remaining: 80000 },
    startDate: "2024-01-15",
    endDate: "2024-06-30",
    teamSize: 12,
    manager: "Sarah Johnson"
  };

  const [tasks] = useState<Task[]>([
    {
      id: "1",
      name: "Project Planning & Design",
      startDate: "2024-01-15",
      endDate: "2024-02-15",
      duration: 30,
      progress: 100,
      assignee: "Sarah Johnson",
      status: "completed",
      dependencies: []
    },
    {
      id: "2", 
      name: "Permit Applications",
      startDate: "2024-02-01",
      endDate: "2024-02-28",
      duration: 28,
      progress: 100,
      assignee: "Mike Chen",
      status: "completed",
      dependencies: ["1"]
    },
    {
      id: "3",
      name: "HVAC Installation",
      startDate: "2024-03-01",
      endDate: "2024-04-15",
      duration: 45,
      progress: 85,
      assignee: "HVAC Team",
      status: "in-progress",
      dependencies: ["2"]
    },
    {
      id: "4",
      name: "Electrical Work",
      startDate: "2024-03-15",
      endDate: "2024-05-01",
      duration: 47,
      progress: 60,
      assignee: "Electrical Team",
      status: "in-progress", 
      dependencies: ["2"]
    },
    {
      id: "5",
      name: "Interior Design & Finishing",
      startDate: "2024-05-01",
      endDate: "2024-06-30",
      duration: 60,
      progress: 0,
      assignee: "Design Team",
      status: "not-started",
      dependencies: ["3", "4"]
    }
  ]);

  const [budgetCategories] = useState<BudgetCategory[]>([
    {
      id: "1",
      name: "Labor",
      allocated: 120000,
      spent: 85000,
      remaining: 35000,
      subcategories: [
        { id: "1a", name: "Project Management", allocated: 25000, spent: 18000, remaining: 7000 },
        { id: "1b", name: "Construction Labor", allocated: 70000, spent: 50000, remaining: 20000 },
        { id: "1c", name: "Design Services", allocated: 25000, spent: 17000, remaining: 8000 }
      ]
    },
    {
      id: "2",
      name: "Materials",
      allocated: 80000,
      spent: 55000,
      remaining: 25000,
      subcategories: [
        { id: "2a", name: "HVAC Equipment", allocated: 35000, spent: 30000, remaining: 5000 },
        { id: "2b", name: "Electrical Materials", allocated: 25000, spent: 15000, remaining: 10000 },
        { id: "2c", name: "Finishing Materials", allocated: 20000, spent: 10000, remaining: 10000 }
      ]
    },
    {
      id: "3",
      name: "Equipment & Tools",
      allocated: 30000,
      spent: 20000,
      remaining: 10000
    },
    {
      id: "4",
      name: "Overhead",
      allocated: 20000,
      spent: 10000,
      remaining: 10000
    }
  ]);

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
                {project.status}
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
                  <p className="text-2xl font-bold">{project.progress}%</p>
                </div>
                <Target className="w-8 h-8 text-primary" />
              </div>
              <Progress value={project.progress} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="interactive-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="text-2xl font-bold">{formatCurrency(project.budget.allocated)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-success" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatCurrency(project.budget.spent)} spent
              </div>
            </CardContent>
          </Card>

          <Card className="interactive-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Team Size</p>
                  <p className="text-2xl font-bold">{project.teamSize}</p>
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
                  <p className="text-2xl font-bold">
                    {Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))}
                  </p>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border border-border rounded-md">
                      <div className="space-y-1">
                        <p className="font-medium">{task.name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{task.assignee}</span>
                          <span>•</span>
                          <span>{formatDate(task.startDate)} - {formatDate(task.endDate)}</span>
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
                </CardContent>
              </Card>

              {/* Budget Overview */}
              <Card className="interactive-card">
                <CardHeader>
                  <CardTitle>Budget Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {budgetCategories.map((category) => (
                    <div key={category.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{category.name}</span>
                        <span>{formatCurrency(category.allocated)}</span>
                      </div>
                      <Progress value={(category.spent / category.allocated) * 100} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Spent: {formatCurrency(category.spent)}</span>
                        <span>Remaining: {formatCurrency(category.remaining)}</span>
                      </div>
                    </div>
                  ))}
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
                    <Button variant="hero" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Gantt Chart Placeholder */}
                  <div className="bg-muted/30 rounded-lg p-8 text-center">
                    <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">Interactive Gantt Chart</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Advanced Gantt chart with drag-and-drop functionality will be implemented here
                    </p>
                    <Button variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      View Timeline
                    </Button>
                  </div>
                  
                  {/* Task List */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Task List</h4>
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 border border-border rounded-md hover:bg-muted/50 transition-smooth">
                        <div className="space-y-1">
                          <p className="font-medium">{task.name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{task.assignee}</span>
                            <span>{task.duration} days</span>
                            <span>{formatDate(task.startDate)} - {formatDate(task.endDate)}</span>
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
                      Add Cost
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {budgetCategories.map((category) => (
                  <div key={category.id} className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{category.name}</h4>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(category.spent)} of {formatCurrency(category.allocated)} spent
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm font-medium">
                          {Math.round((category.spent / category.allocated) * 100)}%
                        </div>
                        {category.spent / category.allocated > 0.9 && (
                          <AlertTriangle className="w-4 h-4 text-warning ml-auto" />
                        )}
                      </div>
                    </div>
                    
                    {category.subcategories && (
                      <div className="ml-6 space-y-2">
                        {category.subcategories.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
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
                        <span className="text-sm font-medium">On Track</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Cost Performance</span>
                        <span className="text-sm font-medium text-warning">At Risk</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Quality Score</span>
                        <span className="text-sm font-medium text-success">Excellent</span>
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