import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Dummy reviews for MAL100 (Mathematics course)
const dummyReviews = [
  {
    rating: 5,
    difficulty: 2,
    workload: 3,
    comment: "Excellent course! The professor explains complex mathematical concepts in a very clear and structured way. The assignments are well-designed and help reinforce the theory. I found the lectures engaging and the course material is very well organized."
  },
  {
    rating: 4,
    difficulty: 3,
    workload: 4,
    comment: "Good course overall. The content is challenging but rewarding. The professor is knowledgeable and approachable. However, the workload can be quite heavy with weekly problem sets. Would recommend attending all lectures and tutorial sessions."
  },
  {
    rating: 3,
    difficulty: 4,
    workload: 5,
    comment: "The course is tough and requires a lot of dedication. The assignments are time-consuming and sometimes feel overwhelming. The professor is good but the pace is quite fast. You really need to keep up with the lectures and do practice problems regularly."
  },
  {
    rating: 5,
    difficulty: 3,
    workload: 3,
    comment: "Amazing course! The professor makes mathematics interesting and relatable. The problem-solving sessions are particularly helpful. The exams are fair and test your understanding rather than just memorization. Highly recommend this course for anyone interested in math."
  },
  {
    rating: 4,
    difficulty: 3,
    workload: 4,
    comment: "Well-structured course with clear learning objectives. The lectures are informative and the professor provides good examples. The tutorials are helpful for clarifying doubts. The grading is fair. Just make sure to solve practice problems regularly."
  },
  {
    rating: 2,
    difficulty: 5,
    workload: 5,
    comment: "Very challenging course. The professor goes through concepts quickly and expects a lot from students. The assignments are difficult and take a lot of time. The exams are quite tough. Would not recommend unless you have a strong math background."
  },
  {
    rating: 5,
    difficulty: 2,
    workload: 2,
    comment: "Fantastic course! The professor is extremely patient and explains everything step by step. The course material is well-paced and the assignments are reasonable. Great introduction to mathematical thinking. The teaching assistants are also very helpful."
  },
  {
    rating: 4,
    difficulty: 3,
    workload: 3,
    comment: "Solid course with good teaching. The professor uses interactive methods which make learning fun. The problem sets are challenging but doable. Office hours are very useful for getting help. Overall a positive learning experience."
  },
  {
    rating: 3,
    difficulty: 4,
    workload: 4,
    comment: "Decent course but can be improved. The lectures are sometimes hard to follow and the professor could provide more examples. The assignments are tough but fair. The textbook is helpful for self-study. Attend tutorials regularly for better understanding."
  },
  {
    rating: 5,
    difficulty: 2,
    workload: 3,
    comment: "Excellent course with brilliant teaching! The professor has a passion for mathematics which is contagious. The course is well-organized with clear explanations. The assignments help build problem-solving skills. The exams test concepts thoroughly. Highly recommended!"
  }
];

async function addDummyReviews() {
  console.log('🔍 Looking for course MAL100...\n');

  // Find the course
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, code, title')
    .eq('code', 'MAL100')
    .single();

  if (courseError || !course) {
    console.error('❌ Course MAL100 not found:', courseError?.message);
    return;
  }

  console.log(`✅ Found course: ${course.code} - ${course.title}`);
  console.log(`   Course ID: ${course.id}\n`);

  console.log('👥 Creating dummy anonymous users...\n');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < dummyReviews.length; i++) {
    const review = dummyReviews[i];
    
    try {
      // Create a dummy anonymous ID
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .insert({
          anonymous_id: `00000000-0000-0000-0000-00000000000${i}`, // Dummy UUIDs
          target_id: course.id,
          target_type: 'course',
          rating_value: review.rating,
          difficulty_rating: review.difficulty,
          workload_rating: review.workload,
          comment: review.comment
        })
        .select();

      if (reviewError) {
        console.error(`❌ Review ${i + 1} failed:`, reviewError.message);
        errorCount++;
      } else {
        successCount++;
        console.log(`✅ Review ${i + 1}/10 added (Rating: ${review.rating}⭐)`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error: any) {
      console.error(`❌ Review ${i + 1} error:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary: ${successCount} successful, ${errorCount} failed`);
  console.log('\n✅ Dummy reviews added! You can now test:');
  console.log('   - AI-Generated Course Summary');
  console.log('   - Key Themes Extraction');
  console.log('\n🌐 Visit the course page for MAL100 to see the features in action!');
}

addDummyReviews();
