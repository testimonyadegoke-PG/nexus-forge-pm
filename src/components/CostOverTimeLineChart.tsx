import React from 'react';
import { ChartContainer } from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface CostEntry {
  entry_date: string;
  amount: number;
}

export const CostOverTimeLineChart: React.FC<{ data: CostEntry[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl bg-card shadow-md p-4 min-h-[250px] flex items-center justify-center">
        <span className="text-muted-foreground">No cost data available</span>
      </div>
    );
  }

  const processedData = data
    .filter(entry => entry.entry_date && !isNaN(new Date(entry.entry_date).getTime()))
    .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime())
    .reduce((acc, entry) => {
      const lastEntry = acc[acc.length - 1];
      const cumulativeAmount = (lastEntry ? lastEntry.cumulative : 0) + entry.amount;
      acc.push({ entry_date: entry.entry_date, cumulative: cumulativeAmount });
      return acc;
    }, [] as { entry_date: string; cumulative: number }[]);

  const chartConfig = {
    cumulative: { label: 'Cumulative Cost', color: '#8884d8' },
  };

  return (
    <ChartContainer config={chartConfig}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="entry_date" 
            tickFormatter={(tick) => {
              try {
                return format(new Date(tick), 'MMM d');
              } catch (e) {
                return '';
              }
            }} 
          />
          <YAxis />
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
            labelFormatter={(label) => {
              try {
                return format(new Date(label), 'PPP');
              } catch (e) {
                return '';
              }
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="cumulative" stroke="hsl(var(--primary))" name="Cumulative Cost" />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
