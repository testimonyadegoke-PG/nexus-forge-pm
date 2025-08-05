import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Generic type for dimensions
export interface ProjectDimension {
  id: number;
  name: string;
}

// Generic hook creator for fetching dimensions - removed to avoid type issues
// Instead, we'll keep the specific hooks for each table

// Export hooks for Project Categories
export const useProjectCategories = () => {
  return useQuery<ProjectDimension[], Error>({
    queryKey: ['project_categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('project_categories').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    },
  });
};

export const useCreateProjectCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ProjectDimension, Error, { name: string }>({
    mutationFn: async (newData) => {
      const { data, error } = await supabase.from('project_categories').insert(newData).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Category created successfully.' });
      queryClient.invalidateQueries({ queryKey: ['project_categories'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to create category: ${error.message}`, variant: 'destructive' });
    },
  });
};

export const useUpdateProjectCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ProjectDimension, Error, { id: number; name: string }>({
    mutationFn: async ({ id, name }) => {
      const { data, error } = await supabase.from('project_categories').update({ name }).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Category updated successfully.' });
      queryClient.invalidateQueries({ queryKey: ['project_categories'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to update category: ${error.message}`, variant: 'destructive' });
    },
  });
};

export const useDeleteProjectCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      const { error } = await supabase.from('project_categories').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Category deleted successfully.' });
      queryClient.invalidateQueries({ queryKey: ['project_categories'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to delete category: ${error.message}`, variant: 'destructive' });
    },
  });
};

// Export hooks for Project Statuses
export const useProjectStatuses = () => {
  return useQuery<ProjectDimension[], Error>({
    queryKey: ['project_status'],
    queryFn: async () => {
      const { data, error } = await supabase.from('project_status').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    },
  });
};

export const useCreateProjectStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ProjectDimension, Error, { name: string }>({
    mutationFn: async (newData) => {
      const { data, error } = await supabase.from('project_status').insert(newData).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Status created successfully.' });
      queryClient.invalidateQueries({ queryKey: ['project_status'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to create status: ${error.message}`, variant: 'destructive' });
    },
  });
};

export const useUpdateProjectStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ProjectDimension, Error, { id: number; name: string }>({
    mutationFn: async ({ id, name }) => {
      const { data, error } = await supabase.from('project_status').update({ name }).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Status updated successfully.' });
      queryClient.invalidateQueries({ queryKey: ['project_status'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to update status: ${error.message}`, variant: 'destructive' });
    },
  });
};

export const useDeleteProjectStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      const { error } = await supabase.from('project_status').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Status deleted successfully.' });
      queryClient.invalidateQueries({ queryKey: ['project_status'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to delete status: ${error.message}`, variant: 'destructive' });
    },
  });
};

// Export hooks for Project Stages
export const useProjectStages = () => {
  return useQuery<ProjectDimension[], Error>({
    queryKey: ['project_stages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('project_stages').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    },
  });
};

export const useCreateProjectStage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ProjectDimension, Error, { name: string }>({
    mutationFn: async (newData) => {
      const { data, error } = await supabase.from('project_stages').insert(newData).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Stage created successfully.' });
      queryClient.invalidateQueries({ queryKey: ['project_stages'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to create stage: ${error.message}`, variant: 'destructive' });
    },
  });
};

export const useUpdateProjectStage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ProjectDimension, Error, { id: number; name: string }>({
    mutationFn: async ({ id, name }) => {
      const { data, error } = await supabase.from('project_stages').update({ name }).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Stage updated successfully.' });
      queryClient.invalidateQueries({ queryKey: ['project_stages'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to update stage: ${error.message}`, variant: 'destructive' });
    },
  });
};

export const useDeleteProjectStage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      const { error } = await supabase.from('project_stages').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Stage deleted successfully.' });
      queryClient.invalidateQueries({ queryKey: ['project_stages'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to delete stage: ${error.message}`, variant: 'destructive' });
    },
  });
};

// Export hooks for Project Phases
export const useProjectPhases = () => {
  return useQuery<ProjectDimension[], Error>({
    queryKey: ['project_phases'],
    queryFn: async () => {
      const { data, error } = await supabase.from('project_phases').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    },
  });
};

export const useCreateProjectPhase = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ProjectDimension, Error, { name: string }>({
    mutationFn: async (newData) => {
      const { data, error } = await supabase.from('project_phases').insert(newData).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Phase created successfully.' });
      queryClient.invalidateQueries({ queryKey: ['project_phases'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to create phase: ${error.message}`, variant: 'destructive' });
    },
  });
};

export const useUpdateProjectPhase = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ProjectDimension, Error, { id: number; name: string }>({
    mutationFn: async ({ id, name }) => {
      const { data, error } = await supabase.from('project_phases').update({ name }).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Phase updated successfully.' });
      queryClient.invalidateQueries({ queryKey: ['project_phases'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to update phase: ${error.message}`, variant: 'destructive' });
    },
  });
};

export const useDeleteProjectPhase = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      const { error } = await supabase.from('project_phases').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Phase deleted successfully.' });
      queryClient.invalidateQueries({ queryKey: ['project_phases'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to delete phase: ${error.message}`, variant: 'destructive' });
    },
  });
};
