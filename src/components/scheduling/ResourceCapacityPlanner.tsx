
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useResourceCapacity, useUpdateResourceCapacity, useResourceAllocation } from '@/hooks/useResourceCapacity';
import { useUsers } from '@/hooks/useUsers';
import { Users, Calendar, AlertCircle } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

interface ResourceCapacityPlannerProps {
  projectId?: string;
}

export const ResourceCapacityPlanner: React.FC<ResourceCapacityPlannerProps> = ({ projectId }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [availableHours, setAvailableHours] = useState('8');

  const currentWeek = {
    start: format(startOfWeek(new Date()), 'yyyy-MM-dd'),
    end: format(endOfWeek(new Date()), 'yyyy-MM-dd')
  };

  const { data: users = [] } = useUsers();
  const { data: capacity = [] } = useResourceCapacity(undefined, currentWeek);
  const { data: allocation = [] } = useResourceAllocation(projectId);
  const updateCapacity = useUpdateResourceCapacity();

  const handleUpdateCapacity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    await updateCapacity.mutateAsync({
      user_id: selectedUserId,
      date: selectedDate,
      available_hours: parseFloat(availableHours)
    });

    setSelectedUserId('');
    setAvailableHours('8');
  };

  // Group capacity by user
  const capacityByUser = capacity.reduce((acc, cap) => {
    const userId = cap.user_id;
    if (!acc[userId]) {
      acc[userId] = [];
    }
    acc[userId].push(cap);
    return acc;
  }, {} as Record<string, typeof capacity>);

  // Calculate overallocation
  const overallocatedUsers = allocation.filter(alloc => {
    const userCapacity = capacity.find(cap => 
      cap.user_id === alloc.user_id && cap.date === alloc.date
    );
    return userCapacity && alloc.allocated_hours > userCapacity.available_hours;
  });

  return (
    <div className="space-y-6">
      {/* Capacity Planning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Resource Capacity Planning
          </CardTitle>
          <CardDescription>
            Manage team member availability and working hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateCapacity} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="user">Team Member</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="hours">Available Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={availableHours}
                  onChange={(e) => setAvailableHours(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={!selectedUserId || updateCapacity.isPending}>
                  {updateCapacity.isPending ? 'Updating...' : 'Update Capacity'}
                </Button>
              </div>
            </div>
          </form>

          {/* Capacity Overview */}
          <div>
            <h4 className="font-semibold mb-3">Current Week Capacity</h4>
            {Object.entries(capacityByUser).map(([userId, userCapacity]) => {
              const user = users.find(u => u.id === userId);
              if (!user) return null;

              return (
                <div key={userId} className="border rounded-lg p-4 mb-4">
                  <h5 className="font-medium mb-2">{user.full_name}</h5>
                  <div className="grid grid-cols-7 gap-2 text-sm">
                    {Array.from({ length: 7 }, (_, i) => {
                      const date = format(addDays(startOfWeek(new Date()), i), 'yyyy-MM-dd');
                      const dayCapacity = userCapacity.find(cap => cap.date === date);
                      const dayAllocation = allocation.find(alloc => 
                        alloc.user_id === userId && alloc.date === date
                      );

                      return (
                        <div key={date} className="text-center">
                          <div className="font-medium text-xs mb-1">
                            {format(new Date(date), 'EEE dd')}
                          </div>
                          <div className={`text-xs p-2 rounded ${
                            dayAllocation && dayCapacity && dayAllocation.allocated_hours > dayCapacity.available_hours
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {dayAllocation?.allocated_hours || 0}h / {dayCapacity?.available_hours || 8}h
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Overallocation Alerts */}
      {overallocatedUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Resource Overallocation
            </CardTitle>
            <CardDescription>
              Team members with more work assigned than available capacity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overallocatedUsers.map((alloc, index) => {
                const user = users.find(u => u.id === alloc.user_id);
                const capacityItem = capacity.find(cap => 
                  cap.user_id === alloc.user_id && cap.date === alloc.date
                );

                return (
                  <div key={index} className="border border-red-200 rounded-lg p-3 bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">{user?.full_name}</h5>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(alloc.date), 'MMM dd, yyyy')} - 
                          Allocated: {alloc.allocated_hours}h, Available: {capacityItem?.available_hours || 8}h
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Tasks: {alloc.tasks.join(', ')}
                        </p>
                      </div>
                      <div className="text-red-600 font-semibold">
                        +{(alloc.allocated_hours - (capacityItem?.available_hours || 8)).toFixed(1)}h
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
