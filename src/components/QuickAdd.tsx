import React from 'react';
import { Button } from '@/components/ui/button';

export interface QuickAddProps {
  onAddProject: () => void;
  onAddTask: () => void;
}

export const QuickAdd: React.FC<QuickAddProps> = ({ onAddProject, onAddTask }) => {
  return (
    <div className="flex gap-2 mb-4">
      <Button variant="outline" size="sm" onClick={onAddProject}>+ Project</Button>
      <Button variant="outline" size="sm" onClick={onAddTask}>+ Task</Button>
    </div>
  );
};
