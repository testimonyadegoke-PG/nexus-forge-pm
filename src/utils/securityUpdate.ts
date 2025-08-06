
// Update the existing security.ts to use enhanced security features
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInputEnhanced, validateEmail as enhancedValidateEmail, logEnhancedSecurityEvent } from './securityEnhanced';

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

// Use enhanced logging
export const logSecurityEvent = logEnhancedSecurityEvent;

// Use enhanced input sanitization
export const sanitizeInput = sanitizeInputEnhanced;

// Use enhanced email validation
export const validateEmail = (email: string): boolean => {
  const errors = enhancedValidateEmail(email);
  return errors.length === 0;
};

export const validateProjectAccess = async (projectId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .single();

  return !error && !!data;
};
