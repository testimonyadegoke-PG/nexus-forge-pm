import React from 'react';
import { Milestone } from '@/types/milestone';

interface MilestoneListProps {
  milestones: Milestone[];
  onMilestoneClick?: (milestone: Milestone) => void;
  onEditMilestone?: (milestone: Milestone) => void;
}

export const MilestoneList: React.FC<MilestoneListProps> = ({ milestones, onMilestoneClick, onEditMilestone }) => (
  <div className="overflow-x-auto">
    <table id="milestone-list-table" className="min-w-full bg-white border rounded shadow text-sm">
      <thead>
        <tr className="bg-muted text-left">
          <th className="px-3 py-2">Name</th>
          <th className="px-3 py-2">Status</th>
          <th className="px-3 py-2">Due Date</th>
          <th className="px-3 py-2">Progress</th>
          <th className="px-3 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {milestones.length === 0 ? (
          <tr>
            <td colSpan={5} className="text-center text-muted-foreground py-4">No milestones found for this project.</td>
          </tr>
        ) : milestones.map((m) => (
          <tr
            key={m.id}
            className="hover:bg-muted/60 cursor-pointer group"
            onClick={() => onMilestoneClick && onMilestoneClick(m)}
          >
            <td className="px-3 py-2 font-medium text-primary flex items-center gap-2">
              {m.name}
            </td>
            <td className="px-3 py-2">
              {m.status === 'completed' && <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1" title="Completed"/>}
              {m.status === 'missed' && <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1" title="Missed"/>}
              {m.status === 'upcoming' && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1" title="Upcoming"/>}
              <span className="capitalize">{m.status}</span>
            </td>
            <td className="px-3 py-2">
              {m.due_date ? new Date(m.due_date).toLocaleDateString() : "No date"}
            </td>
            <td className="px-3 py-2">
              {typeof m.progress === 'number' ? `${m.progress}%` : ''}
            </td>
            <td className="px-3 py-2">
              {onEditMilestone && (
                <button
                  className="text-xs text-primary underline opacity-0 group-hover:opacity-100"
                  onClick={e => { e.stopPropagation(); onEditMilestone(m); }}
                >Edit</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
