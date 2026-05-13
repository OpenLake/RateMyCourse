import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  console.log('🔍 Checking database status...\n');

  // Check professors
  const { data: professors, error: profError } = await supabase
    .from('professors')
    .select('id', { count: 'exact', head: true });
  
  if (profError) {
    console.error('❌ Error checking professors:', profError.message);
  } else {
    console.log(`✅ Professors: ${professors?.length || 0} records`);
  }

  // Check courses
  const { data: courses, error: courseError, count } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true });
  
  if (courseError) {
    console.error('❌ Error checking courses:', courseError.message);
  } else {
    console.log(`✅ Courses: ${count || 0} records`);
  }

  // Check reviews
  const { count: reviewCount } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true });
  
  console.log(`✅ Reviews: ${reviewCount || 0} records`);
  
  console.log('\n✅ Database check complete!');
}

checkDatabase();
