
import React from 'react';
import { Grid, List, Trello } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type View = 'grid' | 'list' | 'kanban';

interface ViewToggleProps {
  view: View;
  setView: (view: View) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, setView }) => {
  return (
    <div className="flex items-center border border-border rounded-lg p-1 bg-background">
      <Button
        variant={view === 'grid' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setView('grid')}
        className="h-8 px-3"
        aria-label="Grid view"
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'list' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setView('list')}
        className="h-8 px-3"
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'kanban' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setView('kanban')}
        className="h-8 px-3"
        aria-label="Kanban view"
      >
        <Trello className="h-4 w-4" />
      </Button>
    </div>
  );
};
