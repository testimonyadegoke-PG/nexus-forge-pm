
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  sanitizeInputEnhanced, 
  validateEmail, 
  rateLimiter, 
  logEnhancedSecurityEvent,
  generateCSRFToken,
  setCSRFToken 
} from '@/utils/securityEnhanced';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').refine(
    (email) => validateEmail(email).length === 0,
    'Invalid email format'
  ),
  password: z.string().min(1, 'Password is required'),
  csrf_token: z.string(),
});

export const SecureLoginForm = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>('');

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      csrf_token: '',
    },
  });

  React.useEffect(() => {
    // Generate and set CSRF token
    const token = generateCSRFToken();
    setCsrfToken(token);
    setCSRFToken(token);
    form.setValue('csrf_token', token);
  }, [form]);

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setError('');
      setIsLoading(true);

      // Rate limiting check
      const clientKey = `login:${values.email}`;
      if (!rateLimiter.isAllowed(clientKey)) {
        const remaining = rateLimiter.getRemainingRequests(clientKey);
        setError(`Too many login attempts. Please wait before trying again. Remaining attempts: ${remaining}`);
        return;
      }

      // Sanitize inputs
      const sanitizedEmail = sanitizeInputEnhanced(values.email);

      // Log login attempt
      await logEnhancedSecurityEvent('LOGIN_ATTEMPT', 'auth', 'login', {
        email: sanitizedEmail,
        timestamp: new Date().toISOString(),
      });

      const { error } = await signIn(sanitizedEmail, values.password);
      
      if (error) {
        await logEnhancedSecurityEvent('LOGIN_FAILED', 'auth', 'login', {
          email: sanitizedEmail,
          error: error,
        });
        setError(error);
      } else {
        await logEnhancedSecurityEvent('LOGIN_SUCCESS', 'auth', 'login', {
          email: sanitizedEmail,
        });
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" name="csrf_token" value={csrfToken} />
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" maxLength={320} autoComplete="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" autoComplete="current-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
    </Form>
  );
};
