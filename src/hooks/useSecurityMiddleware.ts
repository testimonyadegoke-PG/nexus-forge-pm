
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getEnhancedSecurityContext, EnhancedSecurityContext, rateLimiter } from '@/utils/securityEnhanced';
import { useToast } from '@/hooks/use-toast';

export const useSecurityMiddleware = () => {
  const { user } = useAuth();
  const [securityContext, setSecurityContext] = useState<EnhancedSecurityContext | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      getEnhancedSecurityContext().then(setSecurityContext);
    } else {
      setSecurityContext(null);
    }
  }, [user]);

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

  return {
    securityContext,
    checkRateLimit,
    requireAdmin,
    requirePM,
  };
};
