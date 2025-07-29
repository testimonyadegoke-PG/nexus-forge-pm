import React from "react";
import { Milestone } from "@/types/milestone";
import * as Tooltip from "@radix-ui/react-tooltip";

interface MilestoneGanttMarkerProps {
  milestone: Milestone;
  left: number; // pixel position on Gantt timeline
  top?: number;
  onHover?: (milestone: Milestone) => void;
  onClick?: (milestone: Milestone) => void;
}

export const MilestoneGanttMarker: React.FC<MilestoneGanttMarkerProps> = ({ milestone, left, top = 0, onHover, onClick }) => {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <div
          style={{
            position: 'absolute',
            left,
            top,
            width: 24,
            height: 24,
            transform: 'translate(-50%, 0)',
            zIndex: 10,
            cursor: 'pointer',
          }}
          role="button"
          tabIndex={0}
          aria-label={`Milestone: ${milestone.name}`}
          onMouseEnter={() => onHover?.(milestone)}
          onClick={() => onClick?.(milestone)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              onClick?.(milestone);
            }
          }}
        >
          {/* Diamond shape */}
          <svg width={24} height={24} viewBox="0 0 24 24">
            <polygon
              points="12,2 22,12 12,22 2,12"
              fill={milestone.is_achieved ? '#22c55e' : milestone.status === 'missed' ? '#ef4444' : '#6366f1'}
              stroke="#222"
              strokeWidth={milestone.is_achieved ? 2 : 1}
            />
          </svg>
        </div>
      </Tooltip.Trigger>
      <Tooltip.Content side="top" align="center" className="rounded bg-white px-3 py-2 text-xs shadow border">
        <div className="font-bold text-primary mb-1">{milestone.name}</div>
        <div>Due: {new Date(milestone.due_date).toLocaleDateString()}</div>
        <div>Status: <span className="capitalize">{milestone.status}</span></div>
      </Tooltip.Content>
    </Tooltip.Root>
  );
};
