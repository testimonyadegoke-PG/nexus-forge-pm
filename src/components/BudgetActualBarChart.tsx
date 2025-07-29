import React from 'react';
import { ChartContainer } from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartData {
  category: string;
  budget: number;
  actual: number;
}

export const BudgetActualBarChart: React.FC<{ data: ChartData[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl bg-card shadow-md p-4 min-h-[250px] flex items-center justify-center">
        <span className="text-muted-foreground">No budget data available</span>
      </div>
    );
  }

  const chartConfig = {
    budget: { label: 'Budget', color: '#82ca9d' },
    actual: { label: 'Actual', color: '#8884d8' },
  };

  return (
    <ChartContainer config={chartConfig}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
          />
          <Legend />
          <Bar dataKey="budget" fill="#82ca9d" name="Budget" />
          <Bar dataKey="actual" fill="#8884d8" name="Actual" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
