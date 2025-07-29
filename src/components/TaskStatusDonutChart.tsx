import React from 'react';
import { ChartContainer } from '@/components/ui/chart';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Task {
  status: string;
}

export const TaskStatusDonutChart: React.FC<{ data: Task[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl bg-card shadow-md p-4 min-h-[250px] flex items-center justify-center">
        <span className="text-muted-foreground">No task data available</span>
      </div>
    );
  }

  const statusCounts = data.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status],
  }));

  const COLORS: Record<string, string> = {
    'To Do': 'hsl(var(--muted-foreground))',
    'In Progress': 'hsl(var(--primary))',
    'Done': 'hsl(var(--success))',
  };

  const chartConfig = chartData.reduce((acc, entry) => {
    acc[entry.name] = { label: entry.name, color: COLORS[entry.name] || '#8884d8' };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  return (
    <ChartContainer config={chartConfig}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
          />
          <Legend />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
