
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCriticalPathAnalysis, useCalculateCriticalPath } from '@/hooks/useCriticalPath';
import { AlertTriangle, Clock, Zap, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface CriticalPathViewProps {
  projectId: string;
}

export const CriticalPathView: React.FC<CriticalPathViewProps> = ({ projectId }) => {
  const { data: analysisData, isLoading } = useCriticalPathAnalysis(projectId);
  const analysis = analysisData || [];
  const calculateCriticalPath = useCalculateCriticalPath();

  const criticalTasks = analysis.filter(item => item.is_critical);
  const nonCriticalTasks = analysis.filter(item => !item.is_critical);

  const handleRecalculate = () => {
    calculateCriticalPath.mutate(projectId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-20 bg-muted rounded"></div>
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
              <Zap className="h-5 w-5" />
              Critical Path Analysis
            </CardTitle>
            <CardDescription>
              Identify critical tasks that impact project completion
            </CardDescription>
          </div>
          <Button onClick={handleRecalculate} disabled={calculateCriticalPath.isPending}>
            <RefreshCw className={`h-4 w-4 mr-2 ${calculateCriticalPath.isPending ? 'animate-spin' : ''}`} />
            Recalculate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {analysis.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No critical path analysis available</p>
            <p className="text-sm">Click "Recalculate" to generate analysis</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Critical Tasks */}
            <div>
              <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Critical Tasks ({criticalTasks.length})
              </h4>
              <div className="space-y-2">
                {criticalTasks.map((item) => (
                  <div key={item.id} className="border border-red-200 rounded-lg p-3 bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">{item.task?.name}</h5>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>Early Start: {format(new Date(item.early_start!), 'MMM dd')}</span>
                          <span>Early Finish: {format(new Date(item.early_finish!), 'MMM dd')}</span>
                          <span>Slack: {item.total_slack} days</span>
                        </div>
                      </div>
                      <Badge variant="destructive">Critical</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Non-Critical Tasks with Slack */}
            {nonCriticalTasks.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Non-Critical Tasks ({nonCriticalTasks.length})
                </h4>
                <div className="space-y-2">
                  {nonCriticalTasks
                    .sort((a, b) => a.total_slack - b.total_slack)
                    .map((item) => (
                    <div key={item.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">{item.task?.name}</h5>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>Early Start: {format(new Date(item.early_start!), 'MMM dd')}</span>
                            <span>Early Finish: {format(new Date(item.early_finish!), 'MMM dd')}</span>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {item.total_slack} days slack
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Summary */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Analysis Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Tasks:</span>
                  <span className="ml-2 font-medium">{analysis.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Critical Tasks:</span>
                  <span className="ml-2 font-medium text-red-600">{criticalTasks.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Analysis Date:</span>
                  <span className="ml-2 font-medium">
                    {analysis[0] && format(new Date(analysis[0].analysis_date), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Risk Level:</span>
                  <span className={`ml-2 font-medium ${
                    criticalTasks.length > analysis.length * 0.5 ? 'text-red-600' : 
                    criticalTasks.length > analysis.length * 0.3 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {criticalTasks.length > analysis.length * 0.5 ? 'High' : 
                     criticalTasks.length > analysis.length * 0.3 ? 'Medium' : 'Low'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
