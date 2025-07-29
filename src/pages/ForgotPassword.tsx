import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    setLoading(false);
    if (error) setError(error.message);
    else setMessage('Check your email for a password reset link.');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <form className="bg-card p-8 rounded shadow-md w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6">Forgot Password</h2>
        <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="mb-4" />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {message && <div className="text-green-600 mb-2">{message}</div>}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</Button>
        <div className="mt-4 text-sm text-center">
          <a href="/login" className="text-blue-600 hover:underline">Back to Login</a>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
