import Link from 'next/link';
import { auth, signOut } from '@/auth';

export default async function Header() {
  const session = await auth();

  return (
    <header className="w-full p-4 border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 text-transparent bg-clip-text">
        Wonderer
      </Link>
      
      <nav className="flex items-center gap-4">
        {session?.user ? (
          <>
            <span className="text-sm text-neutral-400">
              Welcome, {session.user.name || session.user.email}
            </span>
            <form action={async () => {
              'use server';
              await signOut();
            }}>
              <button className="text-sm text-red-400 hover:text-red-300 transition-colors">
                Sign Out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm text-neutral-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/register" className="text-sm px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-white transition-colors">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
