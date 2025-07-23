
import React from 'react';
import { X, Edit, Calendar, DollarSign, Tag, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CostEntry } from '@/hooks/useCostEntries';
import { format } from 'date-fns';

interface CostDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  costEntry: CostEntry | null;
}

export const CostDetailView: React.FC<CostDetailViewProps> = ({
  isOpen,
  onClose,
  onEdit,
  costEntry,
}) => {
  if (!costEntry) return null;

  const getSourceTypeColor = (type: string) => {
    switch (type) {
      case 'manual':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'timesheet':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'invoice':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'expense':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Cost Entry Details
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="text-2xl font-bold text-primary">
                    ${costEntry.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Category:</span>
                  <Badge variant="secondary">{costEntry.category}</Badge>
                </div>
                {costEntry.subcategory && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subcategory:</span>
                    <Badge variant="outline">{costEntry.subcategory}</Badge>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Source Type:</span>
                  <Badge className={getSourceTypeColor(costEntry.source_type)}>
                    {costEntry.source_type}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Entry Date:</span>
                  <span className="font-medium">
                    {format(new Date(costEntry.entry_date), 'PPP')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">
                    {format(new Date(costEntry.created_at), 'PPP')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Updated:</span>
                  <span className="font-medium">
                    {format(new Date(costEntry.updated_at), 'PPP')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Project ID:</span>
                <span className="font-medium">{costEntry.project_id}</span>
              </div>
            </CardContent>
          </Card>

          {costEntry.description && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {costEntry.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
