
import React, { useState } from 'react';
import { useProjectPhases, useCreateProjectPhase, useUpdateProjectPhase, useDeleteProjectPhase, ProjectDimension } from '@/hooks/useProjectDimensions';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProjectDimensionForm } from '@/components/forms/ProjectDimensionForm';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, Edit } from 'lucide-react';

export const ProjectPhaseManager = () => {
  const [open, setOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<ProjectDimension | null>(null);

  const { data: phases = [], isLoading } = useProjectPhases();
  const { mutate: createPhase } = useCreateProjectPhase();
  const { mutate: updatePhase } = useUpdateProjectPhase();
  const { mutate: deletePhase } = useDeleteProjectPhase();

  const handleSubmit = (values: { name: string }) => {
    if (selectedPhase) {
      updatePhase({ ...values, id: selectedPhase.id }, { onSuccess: () => setOpen(false) });
    } else {
      createPhase(values, { onSuccess: () => setOpen(false) });
    }
  };

  const columns: ColumnDef<ProjectDimension>[] = [
    { accessorKey: 'name', header: 'Phase Name' },
    {
      id: 'actions',
      cell: ({ row }) => {
        const phase = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setSelectedPhase(phase); setOpen(true); }}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deletePhase(phase.id)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Ensure phases is always an array
  const safePhases = Array.isArray(phases) ? phases : [];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedPhase(null)}>Add Phase</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedPhase ? 'Edit Phase' : 'Add New Phase'}</DialogTitle>
            </DialogHeader>
            <ProjectDimensionForm
              onSubmit={handleSubmit}
              initialData={selectedPhase}
              submitButtonText={selectedPhase ? 'Update' : 'Create'}
            />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={safePhases} isLoading={isLoading} />
    </div>
  );
};
