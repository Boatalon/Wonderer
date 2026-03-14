'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
      } else {
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center p-4 font-sans text-neutral-100">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 text-transparent bg-clip-text text-center mb-6">
          Create Account
        </h2>
        
        {error && <div className="bg-red-950/50 border border-red-900 text-red-400 p-3 rounded-xl mb-4 text-sm text-center">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-400">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-mono text-sm"
              placeholder="John Doe"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-mono text-sm"
              placeholder="you@ku.th"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-mono text-sm"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-gradient-to-r from-cyan-600 to-emerald-500 hover:from-cyan-500 hover:to-emerald-400 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
