
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CostEntry {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  project_id: string;
}

interface CostEntryGridProps {
  costEntries: CostEntry[];
}

export const CostEntryGrid: React.FC<CostEntryGridProps> = ({ costEntries }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (costEntries.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No cost entries found
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {costEntries.map((entry) => (
        <Card key={entry.id}>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{entry.category}</Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-medium">{entry.description}</h3>
              <div className="text-2xl font-bold text-right">
                {formatCurrency(entry.amount)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
