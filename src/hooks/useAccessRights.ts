
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AccessRight, ProjectAccess } from '@/types/scheduling';

export const useAccessRights = () => {
  return useQuery<AccessRight[]>({
    queryKey: ['access_rights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_rights')
        .select('*')
        .order('level', { ascending: true });
      
      if (error) throw error;
      return data as AccessRight[];
    },
  });
};

export const useProjectAccess = (projectId: string) => {
  return useQuery<ProjectAccess[]>({
    queryKey: ['project_access', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_access')
        .select(`
          *,
          access_right:access_rights(*),
          user:users(full_name, email)
        `)
        .eq('project_id', projectId);
      
      if (error) throw error;
      return data as ProjectAccess[];
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
      const { data, error } = await supabase
        .from('project_access')
        .upsert({
          project_id: projectId,
          user_id: userId,
          access_right_id: accessRightId,
          granted_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from('project_access')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) throw error;
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
