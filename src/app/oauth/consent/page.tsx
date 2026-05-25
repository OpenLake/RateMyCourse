'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function OAuthConsentPage() {
  const { signInWithGoogle, isLoading } = useAuth();
  const [accepted, setAccepted] = useState(false);

  const handleContinue = async () => {
    if (!accepted || isLoading) return;
    await signInWithGoogle();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_10%_10%,rgba(20,184,166,0.15),transparent_50%),radial-gradient(900px_circle_at_90%_20%,rgba(245,158,11,0.16),transparent_55%),radial-gradient(700px_circle_at_50%_85%,rgba(14,165,233,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.95),rgba(2,6,23,0.75),rgba(2,6,23,0.95))]" />
      <div className="absolute -left-32 top-10 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl animate-pulse" />
      <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl animate-pulse" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
        <div className="consent-card w-full rounded-2xl border border-slate-700/60 bg-slate-900/70 p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] backdrop-blur">
          <div className="consent-fade flex items-center gap-3">
            <div className="rounded-xl border border-teal-400/40 bg-teal-400/10 p-3">
              <ShieldCheck className="h-6 w-6 text-teal-300" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-teal-200/80">Authorization</p>
              <h1 className="text-2xl font-mono font-bold tracking-tight text-slate-50">OAuth Consent</h1>
            </div>
          </div>

          <p className="consent-fade delay-1 mt-6 font-serif text-base text-slate-200/90">
            You are about to sign in with Google. This app will request basic profile access so we can
            create an anonymous ID for your reviews.
          </p>

          <div className="consent-fade delay-2 mt-6 rounded-xl border border-slate-700/60 bg-slate-950/60 p-4">
            <p className="text-sm font-mono uppercase tracking-[0.15em] text-amber-200/80">Requested Access</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200/90">
              <li className="flex items-start gap-2">
                <Lock className="mt-0.5 h-4 w-4 text-amber-300" />
                <span>Email address (used only to authenticate)</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="mt-0.5 h-4 w-4 text-amber-300" />
                <span>Basic profile (name and avatar)</span>
              </li>
            </ul>
          </div>

          <label className="consent-fade delay-3 mt-6 flex items-start gap-3 text-sm text-slate-200/90">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-500 bg-slate-900 text-teal-400"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span>
              I understand that my ratings are stored with an anonymous ID, not my email address.
            </span>
          </label>

          <div className="consent-fade delay-4 mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleContinue}
              disabled={!accepted || isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue with Google
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-slate-100"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .consent-fade {
          opacity: 0;
          transform: translateY(8px);
          animation: fadeUp 0.6s ease-out forwards;
        }
        .delay-1 {
          animation-delay: 120ms;
        }
        .delay-2 {
          animation-delay: 240ms;
        }
        .delay-3 {
          animation-delay: 360ms;
        }
        .delay-4 {
          animation-delay: 480ms;
        }
        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
