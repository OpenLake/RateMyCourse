'use client';

import { useEffect, useState, useRef } from 'react'; // Import useRef
import { useRouter } from 'next/navigation';
import { handleAuthCallback } from '@/lib/supabase-auth';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react'; // Added loader icon

export default function AuthCallback() {
  const router = useRouter();
  const { refreshAnonymousId } = useAuth();
  const [message, setMessage] = useState('Processing login...');
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false); // Use useRef to prevent re-render loops

  useEffect(() => {
    let mounted = true;

    const processAuth = async () => {
      if (!mounted || hasRun.current) return; // Check .current
      hasRun.current = true; // Set .current

      try {
        const { user, anonymousId, error } = await handleAuthCallback();

        if (error) {
          if (error.code === '23505') {
            console.warn('User exists. Proceeding.');
          } else if (error.message?.includes('expired') || error.status === 401) {
            setMessage('Session expired. Try signing in again.');
            setError(error.message);
            return;
          } else {
            setMessage('Authentication failed.');
            setError(error.message);
            return;
          }
        }

        if (!user || !anonymousId) {
          setMessage('Missing user or anonymousId.');
          setError('Could not complete authentication.');
          return;
        }

        setMessage('Authentication successful! Redirecting...');
        await refreshAnonymousId();

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        // Removed the 1-second setTimeout delay to speed up redirect
        router.push('/auth/verify');
      } catch (err) {
        setMessage('Unexpected error.');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    processAuth();

    return () => {
      mounted = false;
    };
  }, [router, refreshAnonymousId]); // Removed hasRun from dependencies

  // HIGHLIGHT-START
  return (
    // Updated <main> tag to match src/app/page.tsx, plus centering
    <main className="relative bg-background min-h-screen font-sans overflow-hidden flex flex-col items-center justify-center p-4">
      {/* ----- START: Copied from src/app/page.tsx ----- */}
      {/* Texture overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40 dark:opacity-60" />
      {/* Noise texture */}
      <div className="absolute inset-0 bg-noise opacity-[0.06] dark:opacity-[0.1] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuODUiIG51bU9jdGF2ZXM9IjQiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjQiLz48L3N2Zz4=')] opacity-10 dark:opacity-20 mix-blend-soft-light pointer-events-none" />
      {/* Gradient accents */}
      <div className="absolute top-10 sm:top-20 -left-20 sm:-left-40 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 sm:bottom-40 -right-20 sm:-right-40 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-primary/8 dark:bg-primary/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      {/* ----- END: Copied from src/app/page.tsx ----- */}

      {/* Themed Card - now with z-10 and the correct dark mode gradient */}
      <div
        className={`
          relative z-10 
          w-full max-w-md rounded-xl p-8 shadow-2xl border
          text-gray-800 transition-colors
          bg-white 
          dark:border-white/10
          dark:text-foreground
          dark:bg-[radial-gradient(ellipse_at_top,_#0b0f1f,_#151a38_60%,_#1a1446_100%)]
        `}
      >
        <h1 className="mb-6 text-2xl font-bold">Authentication</h1>

        {!error && (
          <div className="flex items-center space-x-3">
            <Loader2 className="h-5 w-5 text-gray-500 dark:text-muted-foreground animate-spin" />
            <div className="text-lg text-gray-700 dark:text-muted-foreground">
              {message}
            </div>
          </div>
        )}

        {error && (
          <div
            className="rounded-md border p-4 text-sm 
                       bg-red-50 border-red-200 text-red-700
                       dark:bg-destructive/20 dark:border-destructive/50 dark:text-destructive-foreground"
          >
            <p className="font-bold">Error: {error}</p>
            <p className="mt-2">
              <button
                onClick={() => router.push('/auth/signin')}
                className="font-medium underline"
              >
                Return to sign in
              </button>
            </p>
          </div>
        )}
      </div>
    </main>
  );
  // HIGHLIGHT-END
}