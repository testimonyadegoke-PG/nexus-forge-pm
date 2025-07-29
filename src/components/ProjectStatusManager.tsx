import React, { useState } from 'react';
import { useProjectStatuses, useCreateProjectStatus, useUpdateProjectStatus, useDeleteProjectStatus, ProjectDimension } from '@/hooks/useProjectDimensions';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProjectDimensionForm } from '@/components/forms/ProjectDimensionForm';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, Edit } from 'lucide-react';

export const ProjectStatusManager = () => {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ProjectDimension | null>(null);

  const { data: statuses = [], isLoading } = useProjectStatuses();
  const { mutate: createStatus } = useCreateProjectStatus();
  const { mutate: updateStatus } = useUpdateProjectStatus();
  const { mutate: deleteStatus } = useDeleteProjectStatus();

  const handleSubmit = (values: { name: string }) => {
    if (selectedStatus) {
      updateStatus({ ...values, id: selectedStatus.id }, { onSuccess: () => setOpen(false) });
    } else {
      createStatus(values, { onSuccess: () => setOpen(false) });
    }
  };

  const columns: ColumnDef<ProjectDimension>[] = [
    { accessorKey: 'name', header: 'Status Name' },
    {
      id: 'actions',
      cell: ({ row }) => {
        const status = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setSelectedStatus(status); setOpen(true); }}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteStatus(status.id)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedStatus(null)}>Add Status</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedStatus ? 'Edit Status' : 'Add New Status'}</DialogTitle>
            </DialogHeader>
            <ProjectDimensionForm
              onSubmit={handleSubmit}
              initialData={selectedStatus}
              submitButtonText={selectedStatus ? 'Update' : 'Create'}
            />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={statuses} isLoading={isLoading} />
    </div>
  );
};
