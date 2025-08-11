
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { sanitizeInputEnhanced, validateEmail, rateLimiter } from '@/utils/securityEnhanced';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Rate limiting check
    const clientId = 'login_' + (window.navigator.userAgent || 'unknown');
    if (!rateLimiter.isAllowed(clientId)) {
      const remaining = rateLimiter.getRemainingRequests(clientId);
      setError(`Too many login attempts. Please wait before trying again. Remaining attempts: ${remaining}`);
      setLoading(false);
      return;
    }

    // Input validation and sanitization
    const sanitizedEmail = sanitizeInputEnhanced(email);
    const emailErrors = validateEmail(sanitizedEmail);
    
    if (emailErrors.length > 0) {
      setError(emailErrors[0]);
      setLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signIn(sanitizedEmail, password);
      if (error) {
        setError(error);
        toast({
          title: "Login Failed",
          description: "Invalid credentials or account not found",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <form className="bg-card p-8 rounded shadow-md w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6">Sign In</h2>
        <Input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          className="mb-4"
          maxLength={320}
        />
        <Input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
          className="mb-4"
          minLength={6}
        />
        {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
        <div className="mt-4 text-sm text-center">
          <span>Don't have an account? </span>
          <a href="/register" className="text-blue-600 hover:underline">Register</a>
        </div>
        <div className="mt-2 text-sm text-center">
          <a href="/forgot-password" className="text-blue-600 hover:underline">Forgot Password?</a>
        </div>
      </form>
    </div>
  );
};

export default Login;
