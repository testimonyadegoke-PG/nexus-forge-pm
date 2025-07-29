import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Login: React.FC = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error);
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <form className="bg-card p-8 rounded shadow-md w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6">Sign In</h2>
        <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="mb-4" />
        <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="mb-4" />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
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
