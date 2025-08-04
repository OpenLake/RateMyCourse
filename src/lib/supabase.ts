import { Database } from '@/types/supabase';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}
const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// DEBUG: Check auth session at module load
supabase.auth.getSession().then(res => {
  console.log("📦 [supabase.ts] Initial session:", res);
}).catch(err => {
  console.error("❌ [supabase.ts] Session fetch error:", err);
});

export { supabase };
// export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);






// export const getCurrentUser = async () => {
//   const { data: { session } } = await supabase.auth.getSession();
//   return session?.user ?? null;
// };

// export const getAnonymousId = async (): Promise<string | null> => {
//   const user = await getCurrentUser();
//   if (!user) return null;
  
//   const { data, error } = await supabase
//     .from('users_auth')
//     .select('anonymous_id')
//     .eq('user_id', user.id)
//     .single();
    
//   if (error || !data) return null;
//   return data.anonymous_id;
// };
