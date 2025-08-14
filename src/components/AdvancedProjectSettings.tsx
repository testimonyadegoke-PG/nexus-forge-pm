
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  Clock, 
  DollarSign, 
  Users, 
  Settings,
  AlertTriangle 
} from 'lucide-react';

interface AdvancedProjectSettingsProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdvancedProjectSettings: React.FC<AdvancedProjectSettingsProps> = ({
  projectId,
  open,
  onOpenChange
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Project Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="constraints" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="constraints" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Constraints
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Automation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="constraints">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Time Constraints
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-duration">Maximum Project Duration (days)</Label>
                    <Input id="max-duration" type="number" placeholder="365" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buffer-time">Buffer Time (%)</Label>
                    <Input id="buffer-time" type="number" placeholder="10" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="strict-deadlines" />
                    <Label htmlFor="strict-deadlines">Enforce strict deadlines</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Cost Constraints
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-budget">Maximum Budget</Label>
                    <Input id="max-budget" type="number" placeholder="100000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cost-variance">Allowed Cost Variance (%)</Label>
                    <Input id="cost-variance" type="number" placeholder="5" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="budget-approval" />
                    <Label htmlFor="budget-approval">Require approval for budget changes</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Project Visibility</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="private" name="visibility" value="private" />
                        <Label htmlFor="private">Private</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="team" name="visibility" value="team" />
                        <Label htmlFor="team">Team Members Only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="organization" name="visibility" value="organization" />
                        <Label htmlFor="organization">Organization Wide</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Edit Permissions</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="allow-task-edit" />
                        <Label htmlFor="allow-task-edit">Allow task editing</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="allow-budget-edit" />
                        <Label htmlFor="allow-budget-edit">Allow budget editing</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="allow-timeline-edit" />
                        <Label htmlFor="allow-timeline-edit">Allow timeline changes</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notifications</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="notify-changes" />
                        <Label htmlFor="notify-changes">Notify on changes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="notify-deadlines" />
                        <Label htmlFor="notify-deadlines">Deadline reminders</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="notify-budget" />
                        <Label htmlFor="notify-budget">Budget alerts</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Resource Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-team-size">Maximum Team Size</Label>
                    <Input id="max-team-size" type="number" placeholder="10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resource-pool">Resource Pool</Label>
                    <Input id="resource-pool" placeholder="Development Team" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="resource-conflicts" />
                  <Label htmlFor="resource-conflicts">Check for resource conflicts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="auto-assignment" />
                  <Label htmlFor="auto-assignment">Enable automatic task assignment</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation">
            <Card>
              <CardHeader>
                <CardTitle>Automation Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-status-update" />
                    <Label htmlFor="auto-status-update">Auto-update project status based on task completion</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-milestone-tracking" />
                    <Label htmlFor="auto-milestone-tracking">Automatically track milestone achievements</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-cost-calculation" />
                    <Label htmlFor="auto-cost-calculation">Auto-calculate baseline costs</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-reports" />
                    <Label htmlFor="auto-reports">Generate weekly progress reports</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
