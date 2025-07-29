import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Register: React.FC = () => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signUp(email, password);
    setLoading(false);
    if (error) setError(error);
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <form className="bg-card p-8 rounded shadow-md w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6">Register</h2>
        <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="mb-4" />
        <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="mb-4" />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Registering...' : 'Register'}</Button>
        <div className="mt-4 text-sm text-center">
          <span>Already have an account? </span>
          <a href="/login" className="text-blue-600 hover:underline">Sign In</a>
        </div>
      </form>
    </div>
  );
};

export default Register;
