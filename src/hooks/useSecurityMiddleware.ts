
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getEnhancedSecurityContext, EnhancedSecurityContext, rateLimiter, isSessionExpired } from '@/utils/securityEnhanced';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useSecurityMiddleware = () => {
  const { user, session } = useAuth();
  const [securityContext, setSecurityContext] = useState<EnhancedSecurityContext | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && session) {
      // Check if session is expired
      if (isSessionExpired(session)) {
        toast({
          title: "Session Expired",
          description: "Please log in again",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      getEnhancedSecurityContext().then(setSecurityContext);
    } else {
      setSecurityContext(null);
    }
  }, [user, session, navigate, toast]);

  const checkRateLimit = (action: string): boolean => {
    if (!user) return false;
    
    const key = `${user.id}:${action}`;
    const allowed = rateLimiter.isAllowed(key);
    
    if (!allowed) {
      const remaining = rateLimiter.getRemainingRequests(key);
      toast({
        title: "Rate Limit Exceeded",
        description: `Please wait before trying again. Remaining requests: ${remaining}`,
        variant: "destructive",
      });
    }
    
    return allowed;
  };

  const requireAdmin = (): boolean => {
    if (!securityContext?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Administrator privileges required",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const requirePM = (): boolean => {
    if (!securityContext?.isPM) {
      toast({
        title: "Access Denied",
        description: "Project Manager privileges required",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const requireAuthenticated = (): boolean => {
    if (!securityContext?.isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this feature",
        variant: "destructive",
      });
      navigate('/login');
      return false;
    }
    return true;
  };

  return {
    securityContext,
    checkRateLimit,
    requireAdmin,
    requirePM,
    requireAuthenticated,
  };
};
