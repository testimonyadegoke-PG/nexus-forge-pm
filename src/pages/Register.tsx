
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { sanitizeInputEnhanced, validateEmail, validatePassword, rateLimiter } from '@/utils/securityEnhanced';
import { useToast } from '@/hooks/use-toast';

const Register: React.FC = () => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Rate limiting check
    const clientId = 'register_' + (window.navigator.userAgent || 'unknown');
    if (!rateLimiter.isAllowed(clientId)) {
      const remaining = rateLimiter.getRemainingRequests(clientId);
      setError(`Too many registration attempts. Please wait before trying again. Remaining attempts: ${remaining}`);
      setLoading(false);
      return;
    }

    // Input validation and sanitization
    const sanitizedEmail = sanitizeInputEnhanced(email);
    const sanitizedFullName = sanitizeInputEnhanced(fullName);
    
    const emailErrors = validateEmail(sanitizedEmail);
    if (emailErrors.length > 0) {
      setError(emailErrors[0]);
      setLoading(false);
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors[0]);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!sanitizedFullName || sanitizedFullName.length < 2) {
      setError('Full name must be at least 2 characters long');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(sanitizedEmail, password);
      if (error) {
        setError(error);
        toast({
          title: "Registration Failed",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Successful",
          description: "Please check your email to verify your account",
        });
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', err);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <form className="bg-card p-8 rounded shadow-md w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6">Register</h2>
        <Input 
          type="text" 
          placeholder="Full Name" 
          value={fullName} 
          onChange={e => setFullName(e.target.value)} 
          required 
          className="mb-4"
          maxLength={100}
        />
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
          minLength={8}
        />
        <Input 
          type="password" 
          placeholder="Confirm Password" 
          value={confirmPassword} 
          onChange={e => setConfirmPassword(e.target.value)} 
          required 
          className="mb-4"
          minLength={8}
        />
        {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
        <div className="text-xs text-gray-500 mb-4">
          Password must contain at least 8 characters with uppercase, lowercase, number, and special character.
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
        <div className="mt-4 text-sm text-center">
          <span>Already have an account? </span>
          <a href="/login" className="text-blue-600 hover:underline">Sign In</a>
        </div>
      </form>
    </div>
  );
};

export default Register;
