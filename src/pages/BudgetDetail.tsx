
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBudget } from '@/hooks/useBudgets';
import { useProject } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  DollarSign, 
  Calendar,
  User,
  Tag,
  FileText,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { BudgetEditForm } from '@/components/forms/BudgetEditForm';

const BudgetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const { data: budget, isLoading: budgetLoading } = useBudget(id || '');
  const { data: project } = useProject(budget?.project_id || '');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (budgetLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Budget Not Found</h2>
          <p className="text-muted-foreground mb-4">The budget you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard/budgets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Budgets
          </Button>
        </div>
      </div>
    );
  }

  // Mock data for consumption and progress - in real app, this would come from cost entries
  const consumed = Number(budget.allocated_amount) * 0.65; // 65% consumed
  const remaining = Number(budget.allocated_amount) - consumed;
  const progressPercentage = (consumed / Number(budget.allocated_amount)) * 100;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/budgets')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Budgets
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{budget.name}</h1>
            <p className="text-muted-foreground">
              Budget for {project?.name || 'Unknown Project'}
            </p>
          </div>
        </div>
        <Button onClick={() => setEditDialogOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Budget
        </Button>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Allocated</p>
                <p className="text-2xl font-bold">{formatCurrency(Number(budget.allocated_amount))}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Consumed</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(consumed)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(remaining)}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usage</p>
                <p className="text-2xl font-bold">{progressPercentage.toFixed(1)}%</p>
              </div>
              <div className="h-8 w-8 relative">
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progressPercentage.toFixed(1)}% of budget used</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Consumed: {formatCurrency(consumed)}</span>
              <span>Remaining: {formatCurrency(remaining)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Budget Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <Badge variant="outline">{budget.category}</Badge>
                </div>
              </div>
              
              {budget.subcategory && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Subcategory</p>
                    <Badge variant="secondary">{budget.subcategory}</Badge>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">{formatDate(budget.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created By</p>
                  <p className="text-sm text-muted-foreground">{budget.created_by}</p>
                </div>
              </div>

              {budget.description && (
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-muted-foreground">{budget.description}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent>
            {project ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">{project.name}</h4>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Status</p>
                    <Badge>{project.status}</Badge>
                  </div>
                  <div>
                    <p className="font-medium">Manager</p>
                    <p className="text-muted-foreground">{project.manager?.full_name || 'Unassigned'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Start Date</p>
                    <p className="text-muted-foreground">{formatDate(project.start_date)}</p>
                  </div>
                  <div>
                    <p className="font-medium">End Date</p>
                    <p className="text-muted-foreground">{formatDate(project.end_date)}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                  className="w-full"
                >
                  View Project Details
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <p>Project information not available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Lines - Placeholder for future implementation */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Lines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <p>Budget line details will be displayed here</p>
            <p className="text-sm">This feature is coming soon</p>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {budget && (
        <BudgetEditForm
          budget={budget}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </div>
  );
};

export default BudgetDetail;
