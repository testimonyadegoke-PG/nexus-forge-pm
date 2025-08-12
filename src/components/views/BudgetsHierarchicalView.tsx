
import React, { useState } from 'react';
import { useBudgets } from '@/hooks/useBudgets';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, DollarSign, Plus, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BudgetsHierarchicalViewProps {
  onCreateBudget?: () => void;
}

export const BudgetsHierarchicalView: React.FC<BudgetsHierarchicalViewProps> = ({ onCreateBudget }) => {
  const navigate = useNavigate();
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const groupBudgetsByProject = () => {
    const grouped: Record<string, typeof budgets> = {};
    
    budgets.forEach(budget => {
      if (!grouped[budget.project_id]) {
        grouped[budget.project_id] = [];
      }
      grouped[budget.project_id].push(budget);
    });

    return grouped;
  };

  const groupedBudgets = groupBudgetsByProject();

  const getProjectTotalBudget = (projectId: string) => {
    return groupedBudgets[projectId]?.reduce((sum, budget) => sum + Number(budget.allocated_amount), 0) || 0;
  };

  const handleBudgetClick = (budgetId: string) => {
    navigate(`/dashboard/budgets/${budgetId}`);
  };

  if (budgetsLoading || projectsLoading) {
    return <div>Loading budgets...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Project Budgets</h2>
        <Button onClick={onCreateBudget}>
          <Plus className="h-4 w-4 mr-2" />
          Create Budget
        </Button>
      </div>

      <div className="space-y-4">
        {projects.map((project) => {
          const projectBudgets = groupedBudgets[project.id] || [];
          const totalBudget = getProjectTotalBudget(project.id);
          const isExpanded = expandedProjects.has(project.id);

          if (projectBudgets.length === 0) return null;

          return (
            <Card key={project.id}>
              <Collapsible
                open={isExpanded}
                onOpenChange={() => toggleProject(project.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                        <div>
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {projectBudgets.length} budget{projectBudgets.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{formatCurrency(totalBudget)}</div>
                        <Badge variant="secondary">
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {projectBudgets.map((budget) => (
                        <Card 
                          key={budget.id} 
                          className="border-l-4 border-l-primary cursor-pointer hover:shadow-md transition-all"
                          onClick={() => handleBudgetClick(budget.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold">{budget.name}</h4>
                                  <Badge variant="outline">{budget.category}</Badge>
                                  {budget.subcategory && (
                                    <Badge variant="secondary" className="text-xs">
                                      {budget.subcategory}
                                    </Badge>
                                  )}
                                </div>
                                
                                {budget.description && (
                                  <p className="text-sm text-muted-foreground mb-3">
                                    {budget.description}
                                  </p>
                                )}

                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4" />
                                    <span>Allocated: {formatCurrency(Number(budget.allocated_amount))}</span>
                                  </div>
                                  <div className="text-muted-foreground">
                                    Created: {new Date(budget.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBudgetClick(budget.id);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <div className="text-right">
                                  <div className="text-lg font-bold">
                                    {formatCurrency(Number(budget.allocated_amount))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}

        {Object.keys(groupedBudgets).length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground mb-4">
                <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No budgets found</p>
              </div>
              <Button onClick={onCreateBudget}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Budget
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
