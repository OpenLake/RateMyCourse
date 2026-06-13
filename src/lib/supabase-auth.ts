import { supabase } from './supabase';

export const signInWithMagicLink = async (email: string): Promise<{ error: any | null }> => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { error };
};

export const handleAuthCallback = async (): Promise<{
  user: any;
  anonymousId: string | null;
  error: any | null;
}> => {
  let session = null;
  for (let i = 0; i < 10; i++) {
    const { data } = await supabase.auth.getSession();
    session = data?.session;
    if (session?.user?.id) break;
    await new Promise((r) => setTimeout(r, 50));
  }

  if (!session?.user?.id) {
    return {
      user: null,
      anonymousId: null,
      error: new Error('No valid session after waiting.'),
    };
  }

  if (!session.user.email) {
    return {
      user: session.user,
      anonymousId: null,
      error: new Error('User email is required for anonymous identity generation.'),
    };
  }

  try {
    const response = await fetch('/api/auth/anonymize', {
      method: 'POST',
      credentials: 'same-origin',
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({} as any));
      return {
        user: session.user,
        anonymousId: null,
        error: new Error(body?.error || `Anonymization failed (${response.status})`),
      };
    }

    const { anonymousId } = await response.json();
    return { user: session.user, anonymousId, error: null };
  } catch (err) {
    return { user: session.user, anonymousId: null, error: err };
  }
};

export const getAnonymousId = async (): Promise<{
  anonymousId: string | null;
  error: any | null;
}> => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.user?.id) {
    return { anonymousId: null, error: error || new Error('No session found') };
  }

  const { data, error: dbError } = await supabase
    .from('users')
    .select('anonymous_id')
    .eq('auth_id', session.user.id)
    .maybeSingle();

  if (dbError) {
    return { anonymousId: null, error: dbError };
  }

  if (!data) {
    return { anonymousId: null, error: new Error('Anonymous ID not found for this user.') };
  }

  return { anonymousId: data.anonymous_id, error: null };
};
