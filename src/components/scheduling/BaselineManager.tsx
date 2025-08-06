
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useProjectBaselines, useCreateBaseline, useSetCurrentBaseline } from '@/hooks/useBaselines';
import { Calendar, Star, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface BaselineManagerProps {
  projectId: string;
}

export const BaselineManager: React.FC<BaselineManagerProps> = ({ projectId }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: baselinesData, isLoading } = useProjectBaselines(projectId);
  const baselines = baselinesData || [];
  const createBaseline = useCreateBaseline();
  const setCurrentBaseline = useSetCurrentBaseline();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createBaseline.mutateAsync({
      projectId,
      name,
      description
    });

    setName('');
    setDescription('');
    setIsDialogOpen(false);
  };

  const handleSetCurrent = (baselineId: string) => {
    setCurrentBaseline.mutate(baselineId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Project Baselines</CardTitle>
            <CardDescription>
              Capture and compare project snapshots over time
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Baseline
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Baseline</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="name">Baseline Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Sprint 1 Baseline"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createBaseline.isPending}>
                    {createBaseline.isPending ? 'Creating...' : 'Create Baseline'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {baselines.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No baselines created yet</p>
            <p className="text-sm">Create your first baseline to track project progress</p>
          </div>
        ) : (
          <div className="space-y-4">
            {baselines.map((baseline) => (
              <div key={baseline.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{baseline.name}</h4>
                      {baseline.is_current && (
                        <Badge variant="default">
                          <Star className="h-3 w-3 mr-1" />
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {baseline.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Created: {format(new Date(baseline.baseline_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  {!baseline.is_current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetCurrent(baseline.id)}
                      disabled={setCurrentBaseline.isPending}
                    >
                      Set as Current
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
