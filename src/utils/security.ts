
import { supabase } from '@/integrations/supabase/client';

export interface SecurityContext {
  userId: string | null;
  userRole: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPM: boolean;
}

export const getSecurityContext = async (): Promise<SecurityContext> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      userId: null,
      userRole: null,
      isAuthenticated: false,
      isAdmin: false,
      isPM: false,
    };
  }

  // Get user role from profiles table
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = profile?.role || 'viewer';

  return {
    userId: user.id,
    userRole,
    isAuthenticated: true,
    isAdmin: userRole === 'admin',
    isPM: userRole === 'admin' || userRole === 'pm',
  };
};

export const logSecurityEvent = async (
  event: string,
  resourceType: string,
  resourceId: string,
  details?: Record<string, any>
) => {
  const context = await getSecurityContext();
  
  if (!context.isAuthenticated) return;

  // Call the Supabase function
  await supabase.rpc('log_security_event', {
    event_type: event,
    user_id: context.userId,
    resource_type: resourceType,
    resource_id: resourceId,
    details: details || null,
  });
};

// Input sanitization helpers
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML/script tags
    .trim()
    .substring(0, 1000); // Limit length
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateProjectAccess = async (projectId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .single();

  return !error && !!data;
};
