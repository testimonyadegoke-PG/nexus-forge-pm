
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurityMiddleware } from '@/hooks/useSecurityMiddleware';
import { SessionTimeoutWarning } from './SessionTimeoutWarning';
import { logEnhancedSecurityEvent } from '@/utils/securityEnhanced';

interface SecurityContextType {
  isSecure: boolean;
  lastActivity: Date;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { securityContext } = useSecurityMiddleware();
  const [lastActivity, setLastActivity] = React.useState(new Date());

  useEffect(() => {
    if (user) {
      // Log session start
      logEnhancedSecurityEvent('SESSION_START', 'auth', 'session', {
        userId: user.id,
        timestamp: new Date().toISOString(),
      });
    }

    return () => {
      if (user) {
        // Log session end
        logEnhancedSecurityEvent('SESSION_END', 'auth', 'session', {
          userId: user.id,
          timestamp: new Date().toISOString(),
        });
      }
    };
  }, [user]);

  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(new Date());
    };

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, []);

  const contextValue: SecurityContextType = {
    isSecure: !!securityContext?.isAuthenticated,
    lastActivity,
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
      <SessionTimeoutWarning />
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within SecurityProvider');
  }
  return context;
};
