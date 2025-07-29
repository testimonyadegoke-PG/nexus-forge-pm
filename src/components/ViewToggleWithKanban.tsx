import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid, List, Kanban } from 'lucide-react';

interface ViewToggleProps {
  view: 'grid' | 'list' | 'kanban';
  setView: (view: 'grid' | 'list' | 'kanban') => void;
  showKanban?: boolean;
}

export const ViewToggleWithKanban: React.FC<ViewToggleProps> = ({ view, setView, showKanban = false }) => {
  return (
    <div className="flex items-center bg-muted rounded-lg p-1">
      <Button
        variant={view === 'grid' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setView('grid')}
        className="px-3 py-1 h-8"
        aria-label="Grid view"
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'list' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setView('list')}
        className="px-3 py-1 h-8"
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </Button>
      {showKanban && (
        <Button
          variant={view === 'kanban' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setView('kanban')}
          className="px-3 py-1 h-8"
          aria-label="Kanban view"
        >
          <Kanban className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
