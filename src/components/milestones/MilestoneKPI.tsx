import React from 'react';
import { Milestone } from '@/types/milestone';

interface MilestoneKPIProps {
  milestones: Milestone[];
}

export const MilestoneKPI: React.FC<MilestoneKPIProps> = ({ milestones }) => {
  const total = milestones.length;
  const completed = milestones.filter(m => m.status === 'completed').length;
  const upcoming = milestones.filter(m => m.status === 'upcoming').length;
  const missed = milestones.filter(m => m.status === 'missed').length;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-card border rounded-lg p-4 flex flex-col items-center">
        <div className="text-2xl font-bold text-green-600">{completed}</div>
        <div className="text-xs text-muted-foreground">Completed</div>
      </div>
      <div className="bg-card border rounded-lg p-4 flex flex-col items-center">
        <div className="text-2xl font-bold text-yellow-600">{upcoming}</div>
        <div className="text-xs text-muted-foreground">Upcoming</div>
      </div>
      <div className="bg-card border rounded-lg p-4 flex flex-col items-center">
        <div className="text-2xl font-bold text-red-600">{missed}</div>
        <div className="text-xs text-muted-foreground">Missed</div>
      </div>
    </div>
  );
};
