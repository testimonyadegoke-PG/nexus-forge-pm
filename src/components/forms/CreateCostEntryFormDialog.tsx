
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateCostEntryForm } from './CreateCostEntryForm';

interface CreateCostEntryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export const CreateCostEntryFormDialog: React.FC<CreateCostEntryFormDialogProps> = ({
  open,
  onOpenChange,
  projectId
}) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Cost Entry</DialogTitle>
        </DialogHeader>
        <CreateCostEntryForm 
          projectId={projectId} 
          isOpen={open}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};
