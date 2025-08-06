
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSchedulingAlerts, useMarkAlertAsRead, useGenerateSchedulingAlerts } from '@/hooks/useSchedulingAlerts';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Clock, AlertTriangle, Calendar, RefreshCw, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface SchedulingAlertsDashboardProps {
  projectId?: string;
}

export const SchedulingAlertsDashboard: React.FC<SchedulingAlertsDashboardProps> = ({ projectId }) => {
  const { user } = useAuth();
  const { data: alertsData, isLoading } = useSchedulingAlerts(user?.id);
  const alerts = alertsData || [];
  const markAsRead = useMarkAlertAsRead();
  const generateAlerts = useGenerateSchedulingAlerts();

  const filteredAlerts = projectId 
    ? alerts.filter(alert => alert.project_id === projectId)
    : alerts;

  const unreadAlerts = filteredAlerts.filter(alert => !alert.is_read);
  const readAlerts = filteredAlerts.filter(alert => alert.is_read);

  const handleMarkAsRead = (alertId: string) => {
    markAsRead.mutate(alertId);
  };

  const handleGenerateAlerts = () => {
    if (projectId) {
      generateAlerts.mutate(projectId);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-red-400';
      case 'medium': return 'bg-yellow-400';
      case 'low': return 'bg-blue-400';
      default: return 'bg-gray-400';
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'deadline_approaching': return <Clock className="h-4 w-4" />;
      case 'task_overdue': return <AlertTriangle className="h-4 w-4" />;
      case 'milestone_missed': return <Calendar className="h-4 w-4" />;
      case 'resource_overallocation': return <Bell className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
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
              <Bell className="h-5 w-5" />
              Scheduling Alerts
              {unreadAlerts.length > 0 && (
                <Badge variant="destructive">{unreadAlerts.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Stay informed about project deadlines and resource issues
            </CardDescription>
          </div>
          {projectId && (
            <Button onClick={handleGenerateAlerts} disabled={generateAlerts.isPending}>
              <RefreshCw className={`h-4 w-4 mr-2 ${generateAlerts.isPending ? 'animate-spin' : ''}`} />
              Generate Alerts
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No scheduling alerts</p>
            <p className="text-sm">All tasks are on track!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Unread Alerts */}
            {unreadAlerts.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  New Alerts ({unreadAlerts.length})
                </h4>
                <div className="space-y-3">
                  {unreadAlerts.map((alert) => (
                    <div key={alert.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)} text-white`}>
                            {getAlertIcon(alert.alert_type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium">{alert.message}</h5>
                              <Badge variant="secondary">{alert.severity}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>Project: {alert.project?.name}</p>
                              {alert.task && <p>Task: {alert.task.name}</p>}
                              {alert.milestone && <p>Milestone: {alert.milestone.name}</p>}
                              {alert.due_date && (
                                <p>Due: {format(new Date(alert.due_date), 'MMM dd, yyyy')}</p>
                              )}
                              <p>Created: {format(new Date(alert.alert_date), 'MMM dd, yyyy HH:mm')}</p>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsRead(alert.id)}
                          disabled={markAsRead.isPending}
                        >
                          Mark Read
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Read Alerts */}
            {readAlerts.length > 0 && (
              <div>
                <h4 className="font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Previous Alerts ({readAlerts.length})
                </h4>
                <div className="space-y-3">
                  {readAlerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4 opacity-75">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)} text-white opacity-60`}>
                          {getAlertIcon(alert.alert_type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-muted-foreground">{alert.message}</h5>
                            <Badge variant="outline">{alert.severity}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Project: {alert.project?.name}</p>
                            {alert.task && <p>Task: {alert.task.name}</p>}
                            {alert.milestone && <p>Milestone: {alert.milestone.name}</p>}
                            <p>Created: {format(new Date(alert.alert_date), 'MMM dd, yyyy HH:mm')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {readAlerts.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      ... and {readAlerts.length - 5} more read alerts
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
