'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerifyAuth() {
  const { user, anonymousId, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // This is your existing useEffect logic. It remains unchanged.
  // (Note: The redirect-to-home is still commented out, as in your original file)
  useEffect(() => {
    // Only run logic once loading is complete
    if (!isLoading) {
      if (!isAuthenticated) {
        // Case 1: User is NOT authenticated. Redirect to sign-in page.
        router.push('/auth/signin');
      }
      else {
        // Case 2: User IS authenticated. Wait 1 second, then redirect to home.
        const timer = setTimeout(() => {
          router.push('/');
        }, 1000); // 1000ms = 1 second

        // Clean up the timer if the component unmounts
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, isAuthenticated, router]);

  // HIGHLIGHT-START
  return (
    // Updated <main> tag to match src/app/page.tsx, plus centering
    <main className="relative bg-background min-h-screen font-sans overflow-hidden flex flex-col items-center justify-center p-4">
      {/* ----- START: Copied from src/app/page.tsx ----- */}
      {/* Texture overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40 dark:opacity-60" />
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

      {/* Auth Card - now with z-10 and the correct gradient */}
      <div
        className={`
          relative z-10 
          w-full max-w-md rounded-xl p-8 shadow-2xl border
          border-border text-foreground transition-colors
          bg-card 
          dark:border-white/10
          dark:bg-[radial-gradient(ellipse_at_top,_#0b0f1f,_#151a38_60%,_#1a1446_100%)]
        `}
      >
        {/* ----- LOADING STATE ----- */}
        {isLoading && (
          <>
            <h1 className="mb-6 text-2xl font-bold">Verifying Authentication</h1>
            <p className="text-lg text-muted-foreground">Loading...</p>
            <div className="mt-6 space-y-3">
              <div className="h-4 bg-muted/50 rounded w-3/4 animate-pulse"></div>
              <div className="h-10 bg-muted/50 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-muted/50 rounded w-1/2 animate-pulse"></div>
            </div>
          </>
        )}

        {/* ----- NOT AUTHENTICATED STATE ----- */}
        {!isLoading && !isAuthenticated && (
          <>
            <h1 className="mb-6 text-2xl font-bold">Authentication Required</h1>
            <p className="mb-4 text-lg text-muted-foreground">
              You need to be signed in to view this page.
            </p>
            <Link
              href="/auth/signin"
              className="inline-block rounded-md bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90 transition"
            >
              Sign In
            </Link>
          </>
        )}

        {/* ----- AUTHENTICATED SUCCESS STATE ----- */}
        {!isLoading && isAuthenticated && user && (
          <>
            <h1 className="mb-6 text-2xl font-bold">Authentication Successful</h1>

            {/* Green Alert Box (theme-aware) */}
            <div className="mb-6 rounded-md bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 p-4 text-green-800 dark:text-green-300">
              <p className="font-medium">You are now signed in!</p>
              {/* This text is from your file, but commented out, just like in your original */}
              {/* <p className="text-sm">Redirecting to homepage in 1 second...</p> */}
            </div>

            <div className="mb-6">
              <p className="mb-2 text-sm text-muted-foreground">
                This is your secure anonymous ID:
              </p>
              {/* Muted Code Block (theme-aware) */}
              <div className="overflow-auto rounded-md bg-muted p-3 border border-border">
                <code className="text-xs text-muted-foreground">
                  {anonymousId || 'Loading ID...'}
                </code>
              </div>
            </div>

            {/* Blue Alert Box (theme-aware) */}
            <div className="mb-6 rounded-md bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 p-4 text-sm text-blue-800 dark:text-blue-300">
              <p>
                <strong>Privacy Note:</strong> Your email ({user.email}) is only
                used for authentication. All your ratings use your anonymous ID instead.
              </p>
            </div>

            {/* Themed Buttons */}
            <div className="flex space-x-4">
              <Link
                href="/dashboard"
                className="flex-1 rounded-md bg-primary px-4 py-2 text-center text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/"
                className="flex-1 rounded-md border bg-secondary px-4 py-2 text-center text-secondary-foreground transition-colors hover:bg-secondary/80"
              >
                Back to Home
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
  // HIGHLIGHT-END
}