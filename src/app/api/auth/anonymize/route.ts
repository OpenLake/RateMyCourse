import { NextResponse } from 'next/server';
import { randomBytes, pbkdf2 } from 'crypto';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

const pbkdf2Async = promisify(pbkdf2);

export async function POST() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const authId = session.user.id;
  const email = session.user.email;

  const { data: existing, error: lookupError } = await supabase
    .from('users')
    .select('anonymous_id')
    .eq('auth_id', authId)
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }

  if (existing) {
    return NextResponse.json({ anonymousId: existing.anonymous_id });
  }

  const primarySalt = randomBytes(32).toString('hex');
  const primaryHash = await pbkdf2Async(email, primarySalt, 100000, 64, 'sha512');
  const verificationToken = primaryHash.toString('hex').slice(0, 64);

  const secondarySalt = randomBytes(32).toString('hex');
  const verificationHashBuf = await pbkdf2Async(
    verificationToken,
    secondarySalt,
    50000,
    64,
    'sha512',
  );
  const verificationHash = verificationHashBuf.toString('hex');

  const anonymousId = uuidv4();

  const { error: insertError } = await supabase
    .from('users')
    .insert({
      auth_id: authId,
      anonymous_id: anonymousId,
      verification_hash: verificationHash,
      salt: secondarySalt,
    });

  if (insertError) {
    return NextResponse.json({ error: 'Failed to store identity' }, { status: 500 });
  }

  return NextResponse.json({ anonymousId });
}
