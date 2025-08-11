
import DOMPurify from 'dompurify';
import { supabase } from '@/integrations/supabase/client';

// Enhanced input sanitization with comprehensive XSS protection
export const sanitizeInputEnhanced = (input: string): string => {
  if (!input) return '';
  
  // Use DOMPurify for comprehensive XSS protection
  const cleaned = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
  
  return cleaned.trim().substring(0, 1000); // Limit length
};

// Sanitize HTML content (for rich text editors)
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3'],
    ALLOWED_ATTR: ['href', 'title'],
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover']
  });
};

// Rate limiting implementation
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private readonly maxRequests = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  isAllowed(key: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      this.limits.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemainingRequests(key: string): number {
    const entry = this.limits.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - entry.count);
  }
}

export const rateLimiter = new RateLimiter();

// CSRF token generation and validation
export const generateCSRFToken = (): string => {
  return crypto.randomUUID();
};

export const setCSRFToken = (token: string): void => {
  sessionStorage.setItem('csrf_token', token);
};

export const getCSRFToken = (): string | null => {
  return sessionStorage.getItem('csrf_token');
};

export const validateCSRFToken = (token: string): boolean => {
  const storedToken = getCSRFToken();
  return storedToken === token;
};

// Enhanced security context with audit logging
export interface EnhancedSecurityContext {
  userId: string | null;
  userRole: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPM: boolean;
  sessionId: string;
}

export const getEnhancedSecurityContext = async (): Promise<EnhancedSecurityContext> => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!user || !session) {
    return {
      userId: null,
      userRole: null,
      isAuthenticated: false,
      isAdmin: false,
      isPM: false,
      sessionId: '',
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
    sessionId: session.access_token.substring(0, 16), // First 16 chars for logging
  };
};

// Enhanced audit logging with more details
export const logEnhancedSecurityEvent = async (
  event: string,
  resourceType: string,
  resourceId: string,
  details?: Record<string, any>
) => {
  const context = await getEnhancedSecurityContext();
  
  if (!context.isAuthenticated) return;

  const auditDetails = {
    ...details,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    sessionId: context.sessionId,
    userRole: context.userRole,
  };

  // Call the Supabase function
  await supabase.rpc('log_security_event', {
    event_type: event,
    user_id: context.userId,
    resource_type: resourceType,
    resource_id: resourceId,
    details: auditDetails,
  });
};

// Authorization middleware
export const requireRole = (requiredRole: 'admin' | 'pm' | 'viewer') => {
  return async (): Promise<boolean> => {
    const context = await getEnhancedSecurityContext();
    
    if (!context.isAuthenticated) return false;
    
    switch (requiredRole) {
      case 'admin':
        return context.isAdmin;
      case 'pm':
        return context.isPM;
      case 'viewer':
        return true; // All authenticated users are viewers
      default:
        return false;
    }
  };
};

// Project access verification with enhanced security
export const verifyProjectAccess = async (projectId: string, action: 'read' | 'write' | 'admin' = 'read'): Promise<boolean> => {
  const context = await getEnhancedSecurityContext();
  
  if (!context.isAuthenticated) return false;
  if (context.isAdmin) return true;

  const { data: project } = await supabase
    .from('projects')
    .select('created_by, manager_id')
    .eq('id', projectId)
    .single();

  if (!project) return false;

  const hasAccess = project.created_by === context.userId || project.manager_id === context.userId;
  
  if (hasAccess) {
    await logEnhancedSecurityEvent('PROJECT_ACCESS_CHECK', 'project', projectId, {
      action,
      granted: true,
      reason: 'User is project creator or manager'
    });
  } else {
    await logEnhancedSecurityEvent('PROJECT_ACCESS_DENIED', 'project', projectId, {
      action,
      granted: false,
      reason: 'User is not project creator or manager'
    });
  }
  
  return hasAccess;
};

// Enhanced input validation with security focus
export const validateProjectName = (name: string): string[] => {
  const errors: string[] = [];
  
  if (!name || name.trim().length === 0) {
    errors.push('Project name is required');
  }
  
  if (name.length > 200) {
    errors.push('Project name must be less than 200 characters');
  }
  
  // Check for potentially malicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /data:text\/html/i,
    /vbscript:/i,
    /expression\(/i
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(name))) {
    errors.push('Project name contains invalid characters');
  }
  
  return errors;
};

export const validateEmail = (email: string): string[] => {
  const errors: string[] = [];
  
  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  }
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  }
  
  if (email.length > 320) {
    errors.push('Email is too long');
  }
  
  // Check for potentially malicious patterns in email
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(email))) {
    errors.push('Email contains invalid characters');
  }
  
  return errors;
};

// Password validation with security requirements
export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return errors;
};

// Session security helpers
export const isSessionExpired = (session: any): boolean => {
  if (!session || !session.expires_at) return true;
  return new Date().getTime() > session.expires_at * 1000;
};

export const getSessionTimeRemaining = (session: any): number => {
  if (!session || !session.expires_at) return 0;
  return Math.max(0, session.expires_at * 1000 - new Date().getTime());
};
