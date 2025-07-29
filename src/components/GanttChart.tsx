import React from 'react';

export interface GanttChartProps {
  data?: any[];
}

export const GanttChart: React.FC<GanttChartProps> = ({ data = [] }) => {
  // Placeholder UI only
  return (
    <div className="border rounded p-4 bg-gray-50">
      <h3 className="font-bold mb-2">Gantt Chart (Coming Soon)</h3>
      <div className="text-muted-foreground text-sm">Timeline visualization for projects and tasks will appear here.</div>
    </div>
  );
};
