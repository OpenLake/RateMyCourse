import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkReviews() {
  const { data: course } = await supabase
    .from('courses')
    .select('id, code, title, review_count, overall_rating, difficulty_rating, workload_rating')
    .eq('code', 'MAL100')
    .single();

  console.log('\n📊 MAL100 Course Stats:');
  console.log('=======================');
  console.log('Course:', course?.code, '-', course?.title);
  console.log('Reviews:', course?.review_count);
  console.log('Overall Rating:', course?.overall_rating, '⭐');
  console.log('Difficulty:', course?.difficulty_rating, '/5');
  console.log('Workload:', course?.workload_rating, '/5');
  
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating_value, comment')
    .eq('target_id', course?.id)
    .eq('target_type', 'course');
  
  console.log('\n📝 Sample Reviews:');
  reviews?.slice(0, 3).forEach((r, i) => {
    console.log(`\n${i + 1}. Rating: ${r.rating_value}⭐`);
    console.log(`   "${r.comment.substring(0, 100)}..."`);
  });
  
  console.log('\n✅ Ready to test features!');
}

checkReviews();
