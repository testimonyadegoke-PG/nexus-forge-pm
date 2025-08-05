
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface CostEntry {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  project_id: string;
}

interface CostEntryTableProps {
  costEntries: CostEntry[];
}

export const CostEntryTable: React.FC<CostEntryTableProps> = ({ costEntries }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {costEntries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">{entry.description}</TableCell>
              <TableCell>
                <Badge variant="outline">{entry.category}</Badge>
              </TableCell>
              <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
              <TableCell className="text-right font-bold">
                {formatCurrency(entry.amount)}
              </TableCell>
            </TableRow>
          ))}
          {costEntries.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No cost entries found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
