
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEarnedValueMetrics, useCalculateEarnedValue } from '@/hooks/useEarnedValue';
import { TrendingUp, DollarSign, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface EarnedValueChartProps {
  projectId: string;
}

export const EarnedValueChart: React.FC<EarnedValueChartProps> = ({ projectId }) => {
  const { data: metrics = [], isLoading } = useEarnedValueMetrics(projectId);
  const calculateEVM = useCalculateEarnedValue();

  const handleCalculate = () => {
    calculateEVM.mutate(projectId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const chartData = metrics.map(metric => ({
    date: format(new Date(metric.measurement_date), 'MMM dd'),
    plannedValue: metric.planned_value,
    earnedValue: metric.earned_value,
    actualCost: metric.actual_cost
  }));

  const latestMetric = metrics[0];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Earned Value Management
            </CardTitle>
            <CardDescription>
              Track project performance against budget and schedule
            </CardDescription>
          </div>
          <Button onClick={handleCalculate} disabled={calculateEVM.isPending}>
            <RefreshCw className={`h-4 w-4 mr-2 ${calculateEVM.isPending ? 'animate-spin' : ''}`} />
            Calculate EVM
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {metrics.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No earned value metrics available</p>
            <p className="text-sm">Click "Calculate EVM" to generate metrics</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Performance Indicators */}
            {latestMetric && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {latestMetric.cost_performance_index.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">CPI</div>
                  <div className="text-xs">
                    {latestMetric.cost_performance_index >= 1 ? 'Under Budget' : 'Over Budget'}
                  </div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {latestMetric.schedule_performance_index.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">SPI</div>
                  <div className="text-xs">
                    {latestMetric.schedule_performance_index >= 1 ? 'Ahead/On Time' : 'Behind Schedule'}
                  </div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className={`text-2xl font-bold ${latestMetric.cost_variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(latestMetric.cost_variance)}
                  </div>
                  <div className="text-sm text-muted-foreground">Cost Variance</div>
                  <div className="text-xs">CV = EV - AC</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className={`text-2xl font-bold ${latestMetric.schedule_variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(latestMetric.schedule_variance)}
                  </div>
                  <div className="text-sm text-muted-foreground">Schedule Variance</div>
                  <div className="text-xs">SV = EV - PV</div>
                </div>
              </div>
            )}

            {/* EVM Chart */}
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="plannedValue"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Planned Value (PV)"
                  />
                  <Line
                    type="monotone"
                    dataKey="earnedValue"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    name="Earned Value (EV)"
                  />
                  <Line
                    type="monotone"
                    dataKey="actualCost"
                    stroke="#ffc658"
                    strokeWidth={2}
                    name="Actual Cost (AC)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Analysis Summary */}
            {latestMetric && (
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Project Health Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="mb-1">
                      <span className="font-medium">Budget Status:</span>
                      <span className={`ml-2 ${
                        latestMetric.cost_performance_index >= 1 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {latestMetric.cost_performance_index >= 1 ? 
                          `${formatCurrency(Math.abs(latestMetric.cost_variance))} under budget` : 
                          `${formatCurrency(Math.abs(latestMetric.cost_variance))} over budget`}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Schedule Status:</span>
                      <span className={`ml-2 ${
                        latestMetric.schedule_performance_index >= 1 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {latestMetric.schedule_performance_index >= 1 ? 'On track' : 'Behind schedule'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="mb-1">
                      <span className="font-medium">Earned Value:</span>
                      <span className="ml-2">{formatCurrency(latestMetric.earned_value)}</span>
                    </p>
                    <p>
                      <span className="font-medium">Actual Cost:</span>
                      <span className="ml-2">{formatCurrency(latestMetric.actual_cost)}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
