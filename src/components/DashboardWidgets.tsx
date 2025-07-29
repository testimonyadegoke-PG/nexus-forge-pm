import React from 'react';

export interface DashboardWidget {
  id: string;
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export interface DashboardWidgetsProps {
  widgets: DashboardWidget[];
}

export const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({ widgets }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {widgets.map(widget => (
        <div key={widget.id} className="bg-white border rounded shadow p-4 flex items-center gap-2">
          {widget.icon && <span className="text-xl text-blue-500">{widget.icon}</span>}
          <div>
            <div className="text-xs text-muted-foreground">{widget.label}</div>
            <div className="font-bold text-lg">{widget.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
