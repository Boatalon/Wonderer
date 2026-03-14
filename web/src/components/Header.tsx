import Link from 'next/link';
import { auth, signOut } from '@/auth';

export default async function Header() {
  const session = await auth();

  return (
    <header className="w-full p-4 border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 text-transparent bg-clip-text">
        Wonderer
      </Link>
      
      <nav className="flex items-center gap-6">
        {session?.user ? (
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Logged in as</span>
              <span className="text-sm font-semibold text-neutral-200">
                {(session.user as any).firstName || session.user.name || session.user.email} {(session.user as any).lastName || ''}
              </span>
            </div>
            <form action={async () => {
              'use server';
              await signOut();
            }}>
              <button className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-all border border-red-500/20">
                Sign Out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/register" className="text-sm px-5 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 rounded-xl text-white font-medium transition-all shadow-lg shadow-cyan-500/10">
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
