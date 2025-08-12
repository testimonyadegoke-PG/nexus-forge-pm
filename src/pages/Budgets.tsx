
import React, { useState } from 'react';
import { BudgetsHierarchicalView } from '@/components/views/BudgetsHierarchicalView';
import { CreateBudgetForm } from '@/components/forms/CreateBudgetForm';

const Budgets = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="container mx-auto py-10">
      <BudgetsHierarchicalView onCreateBudget={() => setCreateDialogOpen(true)} />
      
      <CreateBudgetForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
};

export default Budgets;
