
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  sanitizeInputEnhanced, 
  validateEmail, 
  validatePassword,
  rateLimiter, 
  logEnhancedSecurityEvent,
  generateCSRFToken,
  setCSRFToken 
} from '@/utils/securityEnhanced';

const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').refine(
    (email) => validateEmail(email).length === 0,
    'Invalid email format'
  ),
  password: z.string().refine(
    (password) => validatePassword(password).length === 0,
    'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
  ),
  confirmPassword: z.string(),
  csrf_token: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const SecureRegisterForm = () => {
  const { signUp } = useAuth();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>('');

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
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

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      setError('');
      setSuccess('');
      setIsLoading(true);

      // Rate limiting check
      const clientKey = `register:${values.email}`;
      if (!rateLimiter.isAllowed(clientKey)) {
        const remaining = rateLimiter.getRemainingRequests(clientKey);
        setError(`Too many registration attempts. Please wait before trying again. Remaining attempts: ${remaining}`);
        return;
      }

      // Additional validation
      const emailErrors = validateEmail(values.email);
      const passwordErrors = validatePassword(values.password);
      
      if (emailErrors.length > 0) {
        setError(emailErrors.join(', '));
        return;
      }
      
      if (passwordErrors.length > 0) {
        setError(passwordErrors.join(', '));
        return;
      }

      // Sanitize inputs
      const sanitizedEmail = sanitizeInputEnhanced(values.email);

      // Log registration attempt
      await logEnhancedSecurityEvent('REGISTER_ATTEMPT', 'auth', 'register', {
        email: sanitizedEmail,
        timestamp: new Date().toISOString(),
      });

      const { error } = await signUp(sanitizedEmail, values.password);
      
      if (error) {
        await logEnhancedSecurityEvent('REGISTER_FAILED', 'auth', 'register', {
          email: sanitizedEmail,
          error: error,
        });
        setError(error);
      } else {
        await logEnhancedSecurityEvent('REGISTER_SUCCESS', 'auth', 'register', {
          email: sanitizedEmail,
        });
        setSuccess('Registration successful! Please check your email to confirm your account.');
        form.reset();
      }
    } catch (err) {
      console.error('Registration error:', err);
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
        
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
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
                <Input {...field} type="password" autoComplete="new-password" />
              </FormControl>
              <FormMessage />
              <div className="text-xs text-muted-foreground">
                Password must contain: 8+ characters, uppercase, lowercase, number, special character
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" autoComplete="new-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
};
