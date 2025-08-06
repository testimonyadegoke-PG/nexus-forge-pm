
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { AccessRight, ProjectAccess } from '@/types/scheduling';

// Mock data for now since Supabase types aren't updated
const mockAccessRights: AccessRight[] = [
  { id: 1, name: 'Viewer', description: 'Can only view the files', level: 1 },
  { id: 2, name: 'Commenter', description: 'Can view and comment on the files', level: 2 },
  { id: 3, name: 'Editor', description: 'Can view, comment, organize files, add new files, and edit existing files', level: 3 },
  { id: 4, name: 'Administrator', description: 'Full access and can manage members', level: 4 },
];

export const useAccessRights = () => {
  return useQuery<AccessRight[]>({
    queryKey: ['access_rights'],
    queryFn: async () => {
      // TODO: Replace with actual Supabase query once types are updated
      return mockAccessRights;
    },
  });
};

export const useProjectAccess = (projectId: string) => {
  return useQuery<ProjectAccess[]>({
    queryKey: ['project_access', projectId],
    queryFn: async () => {
      // TODO: Replace with actual Supabase query once types are updated
      return [];
    },
    enabled: !!projectId,
  });
};

export const useGrantProjectAccess = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      projectId, 
      userId, 
      accessRightId 
    }: { 
      projectId: string; 
      userId: string; 
      accessRightId: number; 
    }) => {
      // TODO: Replace with actual Supabase mutation once types are updated
      console.log('Granting access:', { projectId, userId, accessRightId });
      return { id: 'mock', project_id: projectId, user_id: userId, access_right_id: accessRightId };
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Project access granted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['project_access', variables.projectId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to grant access: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useRevokeProjectAccess = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ projectId, userId }: { projectId: string; userId: string }) => {
      // TODO: Replace with actual Supabase mutation once types are updated
      console.log('Revoking access:', { projectId, userId });
      return { projectId, userId };
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Project access revoked successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['project_access', data.projectId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to revoke access: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
