// FILE: lib/supabase-admin.ts
import { Database } from '@/types/supabase';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase admin environment variables');
}

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey
);

