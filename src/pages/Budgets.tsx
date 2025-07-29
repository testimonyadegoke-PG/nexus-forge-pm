import React from 'react';
import { useBudgets } from '@/hooks/useBudgets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Budgets = () => {
  const { data: budgets, isLoading, error } = useBudgets();
  const navigate = useNavigate();

  if (isLoading) return <div>Loading budgets...</div>;
  if (error) return <div>Error loading budgets: {error.message}</div>;

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Budgets</CardTitle>
          <Button onClick={() => navigate('/dashboard/budgets/new')}>
            <Plus className="mr-2 h-4 w-4" /> Create Budget
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Subcategory</TableHead>
                <TableHead>Allocated Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets?.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell>{budget.project_id}</TableCell>
                  <TableCell>{budget.category}</TableCell>
                  <TableCell>{budget.subcategory}</TableCell>
                  <TableCell>${budget.allocated_amount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Budgets;
