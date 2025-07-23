
import React, { useState } from 'react';
import { Plus, Search, ChevronDown, ChevronRight, Edit, Trash2, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BudgetCreationForm } from '@/components/forms/BudgetCreationForm';
import { BudgetEditForm } from '@/components/forms/BudgetEditForm';
import { useProjects } from '@/hooks/useProjects';
import { useProjectBudgets, Budget } from '@/hooks/useBudgets';
import { useProjectCostEntries } from '@/hooks/useCostEntries';

const Budgets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const { data: projects = [] } = useProjects();

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = projectFilter === 'all' || project.id === projectFilter;
    return matchesSearch && matchesProject;
  });

  const toggleProjectExpansion = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const ProjectBudgetRow = ({ project }: { project: any }) => {
    const { data: budgets = [] } = useProjectBudgets(project.id);
    const { data: costEntries = [] } = useProjectCostEntries(project.id);
    const isExpanded = expandedProjects.has(project.id);

    const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.allocated_amount), 0);
    const totalCosts = costEntries.reduce((sum, cost) => sum + Number(cost.amount), 0);
    const consumedPercentage = totalBudget > 0 ? (totalCosts / totalBudget) * 100 : 0;

    const getConsumptionColor = (percentage: number) => {
      if (percentage <= 75) return 'text-green-600 dark:text-green-400';
      if (percentage <= 90) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
    };

    return (
      <>
        <TableRow className="bg-muted/50">
          <TableCell>
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto"
                  onClick={() => toggleProjectExpansion(project.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" />
                  )}
                  <span className="font-medium">{project.name}</span>
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </TableCell>
          <TableCell className="font-medium">${totalBudget.toLocaleString()}</TableCell>
          <TableCell>
            <span className={getConsumptionColor(consumedPercentage)}>
              {consumedPercentage.toFixed(1)}%
            </span>
          </TableCell>
          <TableCell>{budgets.length} lines</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedProjectId(project.id);
                  setCreateDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Budget
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {isExpanded && (
          <TableRow>
            <TableCell colSpan={5} className="p-0">
              <div className="bg-background border-l-4 border-l-primary/20 ml-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-8">Category</TableHead>
                      <TableHead>Subcategory</TableHead>
                      <TableHead>Allocated Amount</TableHead>
                      <TableHead>Consumed</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgets.map((budget) => {
                      const budgetCosts = costEntries.filter(
                        cost => cost.category === budget.category && 
                                cost.subcategory === budget.subcategory
                      ).reduce((sum, cost) => sum + Number(cost.amount), 0);
                      const remaining = Number(budget.allocated_amount) - budgetCosts;
                      const budgetConsumption = Number(budget.allocated_amount) > 0 
                        ? (budgetCosts / Number(budget.allocated_amount)) * 100 
                        : 0;

                      return (
                        <TableRow key={budget.id}>
                          <TableCell className="pl-8">{budget.category}</TableCell>
                          <TableCell>{budget.subcategory || '-'}</TableCell>
                          <TableCell>${Number(budget.allocated_amount).toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={getConsumptionColor(budgetConsumption)}>
                              ${budgetCosts.toLocaleString()} ({budgetConsumption.toFixed(1)}%)
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                              ${remaining.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedBudget(budget);
                                  setEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {budgets.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                          No budget lines created yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TableCell>
          </TableRow>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budgets</h1>
          <p className="text-muted-foreground">Manage project budgets and track spending</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(project => (
              <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || projectFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'No projects available to create budgets for'}
          </p>
        </div>
      ) : (
        <div className="bg-card border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Total Budget</TableHead>
                <TableHead>Consumed</TableHead>
                <TableHead>Budget Lines</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <ProjectBudgetRow key={project.id} project={project} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <BudgetCreationForm
        projectId={selectedProjectId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedBudget && (
        <BudgetEditForm
          budget={selectedBudget}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </div>
  );
};

export default Budgets;
