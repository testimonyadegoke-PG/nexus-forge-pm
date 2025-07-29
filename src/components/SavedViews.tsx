import React from 'react';

export interface SavedView {
  id: string;
  name: string;
  filters: Record<string, any>;
}

export interface SavedViewsProps {
  views: SavedView[];
  onSelect: (view: SavedView) => void;
}

export const SavedViews: React.FC<SavedViewsProps> = ({ views, onSelect }) => {
  return (
    <div className="my-4">
      <h3 className="font-bold mb-2">Saved Views (Coming Soon)</h3>
      <ul className="space-y-1">
        {views.map(view => (
          <li key={view.id}>
            <button
              className="underline text-blue-600 hover:text-blue-800 text-sm"
              onClick={() => onSelect(view)}
            >
              {view.name}
            </button>
          </li>
        ))}
      </ul>
      <div className="text-xs text-muted-foreground mt-2">Save and quickly switch between custom filters and layouts.</div>
    </div>
  );
};
