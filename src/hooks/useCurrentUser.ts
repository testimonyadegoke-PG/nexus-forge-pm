import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useCurrentUser() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    supabase.auth.getUser()
      .then(({ data, error }) => {
        if (!ignore) {
          setUser(data?.user || null);
          setError(error ? new Error(error.message) : null);
          setLoading(false);
        }
      });
    // Optional: subscribe to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      ignore = true;
      listener?.subscription.unsubscribe();
    };
  }, []);

  return { user, loading, error };
}
