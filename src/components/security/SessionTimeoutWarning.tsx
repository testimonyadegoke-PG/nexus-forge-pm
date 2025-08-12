
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getSessionTimeRemaining, isSessionExpired } from '@/utils/securityEnhanced';
import { AlertTriangle } from 'lucide-react';

export const SessionTimeoutWarning = () => {
  const { session, signOut } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!session) return;

    const checkSession = () => {
      if (isSessionExpired(session)) {
        signOut();
        return;
      }

      const remaining = getSessionTimeRemaining(session);
      setTimeRemaining(remaining);

      // Show warning when 5 minutes (300000ms) or less remaining
      if (remaining <= 300000 && remaining > 0) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    };

    // Check immediately
    checkSession();

    // Check every minute
    const interval = setInterval(checkSession, 60000);

    return () => clearInterval(interval);
  }, [session, signOut]);

  const extendSession = async () => {
    // Force a token refresh by making an authenticated request
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setShowWarning(false);
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
      signOut();
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!showWarning || !session) return null;

  return (
    <Alert variant="destructive" className="fixed top-4 right-4 z-50 max-w-md">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <div className="font-semibold">Session expiring soon</div>
          <div className="text-sm">Time remaining: {formatTime(timeRemaining)}</div>
        </div>
        <div className="flex gap-2 ml-4">
          <Button size="sm" variant="outline" onClick={extendSession}>
            Extend
          </Button>
          <Button size="sm" variant="destructive" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
