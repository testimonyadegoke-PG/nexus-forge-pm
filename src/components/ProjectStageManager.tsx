
import React, { useState } from 'react';
import { useProjectStages, useCreateProjectStage, useUpdateProjectStage, useDeleteProjectStage, ProjectDimension } from '@/hooks/useProjectDimensions';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProjectDimensionForm } from '@/components/forms/ProjectDimensionForm';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, Edit } from 'lucide-react';

export const ProjectStageManager = () => {
  const [open, setOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<ProjectDimension | null>(null);

  const { data: stages = [], isLoading } = useProjectStages();
  const { mutate: createStage } = useCreateProjectStage();
  const { mutate: updateStage } = useUpdateProjectStage();
  const { mutate: deleteStage } = useDeleteProjectStage();

  const handleSubmit = (values: { name: string }) => {
    if (selectedStage) {
      updateStage({ ...values, id: selectedStage.id }, { onSuccess: () => setOpen(false) });
    } else {
      createStage(values, { onSuccess: () => setOpen(false) });
    }
  };

  const columns: ColumnDef<ProjectDimension>[] = [
    { accessorKey: 'name', header: 'Stage Name' },
    {
      id: 'actions',
      cell: ({ row }) => {
        const stage = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setSelectedStage(stage); setOpen(true); }}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteStage(stage.id)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Ensure stages is always an array
  const safeStages = Array.isArray(stages) ? stages : [];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedStage(null)}>Add Stage</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedStage ? 'Edit Stage' : 'Add New Stage'}</DialogTitle>
            </DialogHeader>
            <ProjectDimensionForm
              onSubmit={handleSubmit}
              initialData={selectedStage}
              submitButtonText={selectedStage ? 'Update' : 'Create'}
            />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={safeStages} isLoading={isLoading} />
    </div>
  );
};
