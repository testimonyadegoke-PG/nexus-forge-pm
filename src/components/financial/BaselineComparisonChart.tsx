
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, Target, ShoppingCart } from 'lucide-react';
import { BaselineCalculation } from '@/hooks/useBaselineCalculations';

interface BaselineComparisonChartProps {
  baselines: BaselineCalculation[];
  projectId: string;
}

export const BaselineComparisonChart: React.FC<BaselineComparisonChartProps> = ({ 
  baselines, 
  projectId 
}) => {
  const latestBaseline = baselines.find(b => !b.task_id && !b.budget_line_id);

  if (!latestBaseline) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No baseline data available</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-red-600';
    if (variance < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="h-4 w-4 text-red-600" />;
    if (variance < 0) return <TrendingDown className="h-4 w-4 text-green-600" />;
    return <Target className="h-4 w-4 text-gray-600" />;
  };

  const actualPercentage = latestBaseline.planned_amount > 0 
    ? (latestBaseline.actual_amount / latestBaseline.planned_amount) * 100 
    : 0;

  const committedPercentage = latestBaseline.planned_amount > 0 
    ? (latestBaseline.committed_amount / latestBaseline.planned_amount) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Financial Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-muted-foreground">Planned Budget</span>
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(latestBaseline.planned_amount)}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShoppingCart className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-muted-foreground">Committed (POs)</span>
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(latestBaseline.committed_amount)}
              </div>
              <div className="text-sm text-muted-foreground">
                {committedPercentage.toFixed(1)}% of budget
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-muted-foreground">Actual Spend</span>
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(latestBaseline.actual_amount)}
              </div>
              <div className="text-sm text-muted-foreground">
                {actualPercentage.toFixed(1)}% of budget
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Baseline Progress</span>
                <span className="text-sm text-muted-foreground">
                  {latestBaseline.baseline_percentage.toFixed(1)}% expected
                </span>
              </div>
              <Progress value={latestBaseline.baseline_percentage} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Budget Utilization</span>
                <span className="text-sm text-muted-foreground">
                  {actualPercentage.toFixed(1)}% used
                </span>
              </div>
              <Progress value={actualPercentage} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Committed Spend</span>
                <span className="text-sm text-muted-foreground">
                  {committedPercentage.toFixed(1)}% committed
                </span>
              </div>
              <Progress value={committedPercentage} className="h-2" />
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Variance from Baseline
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {getVarianceIcon(latestBaseline.variance_amount)}
                  <span className={`font-bold ${getVarianceColor(latestBaseline.variance_amount)}`}>
                    {formatCurrency(Math.abs(latestBaseline.variance_amount))}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {latestBaseline.variance_amount > 0 ? 'over baseline' : 
                     latestBaseline.variance_amount < 0 ? 'under baseline' : 'on baseline'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-muted-foreground">
                  Expected by Now
                </span>
                <div className="text-lg font-bold">
                  {formatCurrency(latestBaseline.baseline_amount)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
