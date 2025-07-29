import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) setError(error.message);
    else {
      setMessage('Password updated! You can now log in.');
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <form className="bg-card p-8 rounded shadow-md w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
        <Input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} required className="mb-4" />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {message && <div className="text-green-600 mb-2">{message}</div>}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</Button>
      </form>
    </div>
  );
};

export default ResetPassword;
