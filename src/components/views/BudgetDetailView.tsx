
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProjectBudgets } from '@/hooks/useBudgets';
import { useProjectCostEntries } from '@/hooks/useCostEntries';
import { BudgetCreationForm } from '@/components/forms/BudgetCreationForm';
import { BudgetEditForm } from '@/components/forms/BudgetEditForm';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

interface BudgetDetailViewProps {
  projectId: string;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BudgetDetailView = ({ projectId, projectName, open, onOpenChange }: BudgetDetailViewProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  
  const { data: budgets = [] } = useProjectBudgets(projectId);
  const { data: costEntries = [] } = useProjectCostEntries(projectId);

  if (!open) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Calculate totals and spending
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.allocated_amount), 0);
  const totalSpent = costEntries.reduce((sum, c) => sum + Number(c.amount), 0);
  const remainingBudget = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Group budgets by category
  const budgetsByCategory = budgets.reduce((acc, budget) => {
    if (!acc[budget.category]) {
      acc[budget.category] = {
        allocated: 0,
        spent: 0,
        budgets: []
      };
    }
    acc[budget.category].allocated += Number(budget.allocated_amount);
    acc[budget.category].budgets.push(budget);
    
    // Calculate spent amount for this category
    const categorySpent = costEntries
      .filter(c => c.category === budget.category)
      .reduce((sum, c) => sum + Number(c.amount), 0);
    acc[budget.category].spent = categorySpent;
    
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="container mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Budget Management</h1>
              <p className="text-muted-foreground">{projectName}</p>
            </div>
          </div>
          <Button variant="hero" size="sm" onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Budget Line
          </Button>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-2xl font-bold">{formatCurrency(remainingBudget)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Used</p>
                  <p className="text-2xl font-bold">{spentPercentage.toFixed(1)}%</p>
                </div>
                {spentPercentage > 90 ? (
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                ) : (
                  <TrendingUp className="w-8 h-8 text-info" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Budget Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{spentPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={spentPercentage} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Spent: {formatCurrency(totalSpent)}</span>
                <span>Remaining: {formatCurrency(remainingBudget)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Budget by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(budgetsByCategory).map(([category, data]) => (
                <div key={category} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{category}</h3>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(data.allocated)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(data.spent)} spent
                      </p>
                    </div>
                  </div>
                  
                  <Progress 
                    value={data.allocated > 0 ? (data.spent / data.allocated) * 100 : 0} 
                    className="h-2" 
                  />
                  
                  <div className="grid gap-2">
                    {data.budgets.map((budget: any) => (
                      <div key={budget.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{budget.subcategory || 'General'}</span>
                            <Badge variant="outline" className="text-xs">
                              {formatCurrency(budget.allocated_amount)}
                            </Badge>
                          </div>
                          {budget.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {budget.description}
                            </p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingBudget(budget)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {budgets.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No budget entries yet.</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setShowCreateForm(true)}
                  >
                    Create your first budget line
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Budget Form */}
      {showCreateForm && (
        <BudgetCreationForm
          projectId={projectId}
          open={showCreateForm}
          onOpenChange={setShowCreateForm}
        />
      )}

      {/* Edit Budget Form */}
      {editingBudget && (
        <BudgetEditForm
          budget={editingBudget}
          open={!!editingBudget}
          onOpenChange={(open) => !open && setEditingBudget(null)}
        />
      )}
    </div>
  );
};
