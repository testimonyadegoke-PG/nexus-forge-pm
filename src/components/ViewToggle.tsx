
import React from 'react';
import { Button } from '@/components/ui/button';
import { List, Table, LayoutGrid } from 'lucide-react';

export type View = 'list' | 'table' | 'cards';

interface ViewToggleProps {
  view: View;
  onViewChange: (view: View) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="flex items-center gap-1 border rounded-lg p-1">
      <Button
        variant={view === 'cards' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('cards')}
        className="px-3"
      >
        <LayoutGrid className="w-4 h-4" />
      </Button>
      <Button
        variant={view === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className="px-3"
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        variant={view === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
        className="px-3"
      >
        <Table className="w-4 h-4" />
      </Button>
    </div>
  );
};
