
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Project {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled' | 'blocked';
  created_by: string;
  manager_id: string;
  created_at: string;
  updated_at: string;
  category_id?: string;
  phase_id?: string;
  stage_id?: string;
  manager?: {
    full_name: string;
  };
}

export interface CreateProjectData {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  status_id?: number;
  stage_id?: number;
  category_id?: number;
  subcategory_id?: number;
  type_id?: number;
  phase_id?: number;
  company_id?: number;
  customer_id?: number;
  currency_id?: number;
  manager_id?: string;
}

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          manager:users!projects_manager_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          manager:users!projects_manager_id_fkey(full_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Project;
    },
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateProjectData) => {
      const { data: result, error } = await supabase
        .from('projects')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      const previousProjects = queryClient.getQueryData<Project[]>(['projects']);
      if (previousProjects) {
        queryClient.setQueryData<Project[]>(['projects'], [
          { ...newProject, id: 'temp-id', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), status: 'planning', created_by: '', manager_id: newProject.manager_id || '', manager: undefined, description: newProject.description || '' },
          ...previousProjects
        ]);
      }
      return { previousProjects };
    },
    onError: (error, _newProject, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData<Project[]>(['projects'], context.previousProjects);
      }
      toast({
        title: "Error",
        description: "Failed to create project: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateProjectData> }) => {
      const { data: result, error } = await supabase
        .from('projects')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update project: " + error.message,
        variant: "destructive",
      });
    },
  });
};
