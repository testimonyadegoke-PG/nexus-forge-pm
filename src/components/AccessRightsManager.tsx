
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, UserPlus, Shield } from 'lucide-react';
import { useAccessRights, useProjectAccess, useGrantProjectAccess, useRevokeProjectAccess } from '@/hooks/useAccessRights';
import { useUsers } from '@/hooks/useUsers';

interface AccessRightsManagerProps {
  projectId: string;
}

const AccessRightsManager: React.FC<AccessRightsManagerProps> = ({ projectId }) => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedAccessRight, setSelectedAccessRight] = useState<string>('');

  const { data: accessRights = [] } = useAccessRights();
  const { data: projectAccess = [] } = useProjectAccess(projectId);
  const { data: users = [] } = useUsers();
  const grantAccess = useGrantProjectAccess();
  const revokeAccess = useRevokeProjectAccess();

  const getAccessLevelBadge = (level: number) => {
    const colors = {
      1: 'bg-blue-100 text-blue-800',
      2: 'bg-green-100 text-green-800', 
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleGrantAccess = () => {
    if (selectedUser && selectedAccessRight) {
      grantAccess.mutate({
        projectId,
        userId: selectedUser,
        accessRightId: parseInt(selectedAccessRight)
      });
      setSelectedUser('');
      setSelectedAccessRight('');
    }
  };

  const availableUsers = users.filter(
    user => !projectAccess.some(access => access.user_id === user.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Access Rights Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Grant new access */}
        <div className="space-y-4">
          <h4 className="font-medium">Grant Project Access</h4>
          <div className="flex gap-2">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select user..." />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedAccessRight} onValueChange={setSelectedAccessRight}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select access level..." />
              </SelectTrigger>
              <SelectContent>
                {accessRights.map(right => (
                  <SelectItem key={right.id.toString()} value={right.id.toString()}>
                    {right.name} - {right.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleGrantAccess}
              disabled={!selectedUser || !selectedAccessRight || grantAccess.isPending}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Grant
            </Button>
          </div>
        </div>

        {/* Current access rights */}
        <div className="space-y-4">
          <h4 className="font-medium">Current Project Access</h4>
          {projectAccess.length === 0 ? (
            <p className="text-muted-foreground text-sm">No additional access rights granted.</p>
          ) : (
            <div className="space-y-2">
              {projectAccess.map(access => (
                <div key={access.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{access.user?.full_name}</p>
                      <p className="text-sm text-muted-foreground">{access.user?.email}</p>
                    </div>
                    {access.access_right && (
                      <Badge className={getAccessLevelBadge(access.access_right.level)}>
                        {access.access_right.name}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => revokeAccess.mutate({ projectId, userId: access.user_id })}
                    disabled={revokeAccess.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessRightsManager;
