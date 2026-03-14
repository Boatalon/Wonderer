'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyForm() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      router.push('/register');
    }
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Verification failed');
        setLoading(false);
      } else {
        router.push('/login?verified=true');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 text-transparent bg-clip-text text-center mb-6">
        Verify Email
      </h2>
      <p className="text-neutral-400 text-sm text-center mb-6">
        We sent a 6-digit code to <strong>{email}</strong>.
      </p>
      
      {error && <div className="bg-red-950/50 border border-red-900 text-red-400 p-3 rounded-xl mb-4 text-sm text-center">{error}</div>}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-400">6-Digit Code</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            maxLength={6}
            className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-center tracking-[0.5em] text-2xl placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-mono"
            placeholder="000000"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || otp.length < 6}
          className="mt-4 w-full bg-gradient-to-r from-cyan-600 to-emerald-500 hover:from-cyan-500 hover:to-emerald-400 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center p-4 font-sans text-neutral-100">
      <Suspense fallback={<div className="text-neutral-400">Loading...</div>}>
        <VerifyForm />
      </Suspense>
    </div>
  );
}
