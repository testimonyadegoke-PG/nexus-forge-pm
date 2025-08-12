
import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Table } from 'lucide-react';

export type View = 'list' | 'table' | 'cards' | 'grid';

interface ViewToggleProps {
  view: View;
  onViewChange: (view: View) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="flex items-center border rounded-lg p-1 bg-muted/20">
      <Button
        variant={view === 'list' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className="px-3"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'table' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
        className="px-3"
      >
        <Table className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'cards' || view === 'grid' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('cards')}
        className="px-3"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
};
