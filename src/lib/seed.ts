import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import professorsData from './data/professors.json';
import coursesData from './data/courses.json';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Professor {
  name: string;
  email: string;
  research_interests?: string[];
  website?: string;
  avatar_url?: string;
  department: string;
  post?: string;
}

interface Course {
  id?: string;
  code: string;
  title: string;
  credits: string | number;
  department: string;
}

// Helper function to add delay between requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry failed operations
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`  ⏳ Retrying... (${i + 1}/${maxRetries})`);
      await delay(delayMs * (i + 1)); // Exponential backoff
    }
  }
  throw new Error('Max retries reached');
}

async function seedProfessors() {
  console.log('🌱 Seeding professors...');
  let successCount = 0;
  let errorCount = 0;

  for (const professor of professorsData as Professor[]) {
    try {
      await retryOperation(async () => {
        const { error } = await supabase
          .from('professors')
          .upsert(
            {
              name: professor.name,
              email: professor.email,
              post: professor.post || 'Professor',
              department: professor.department,
              research_interests: professor.research_interests || [],
              website: professor.website || null,
              avatar_url: professor.avatar_url || null,
              overall_rating: 0,
              knowledge_rating: 0,
              teaching_rating: 0,
              approachability_rating: 0,
              review_count: 0,
            },
            { onConflict: 'email' }
          );

        if (error) throw error;
      });

      successCount++;
      console.log(`✅ Inserted professor: ${professor.name}`);
    } catch (error: any) {
      errorCount++;
      console.error(`❌ Error inserting professor: ${professor.name}`, error?.message || error);
    }

    // Small delay between each insert to avoid rate limiting
    await delay(100);
  }

  console.log(`\n📊 Professors: ${successCount} successful, ${errorCount} failed\n`);
}

async function seedCourses() {
  console.log('🌱 Seeding courses...');

  const courseArray = Array.isArray(coursesData)
    ? coursesData.flat()
    : Object.values(coursesData).flat();

  console.log('📦 Total courses to insert:', courseArray.length);

  let successCount = 0;
  let errorCount = 0;

  for (const course of courseArray as Course[]) {
    const { id, ...rest } = course;

    try {
      await retryOperation(async () => {
        const { error } = await supabase
          .from('courses')
          .upsert(
            {
              code: rest.code,
              title: rest.title,
              credits: typeof rest.credits === 'string' ? parseInt(rest.credits) : rest.credits,
              department: rest.department,
              overall_rating: 0,
              difficulty_rating: 0,
              workload_rating: 0,
              review_count: 0,
            },
            { onConflict: 'code' }
          );

        if (error) throw error;
      });

      successCount++;
      if (successCount % 50 === 0) {
        console.log(`  📈 Progress: ${successCount}/${courseArray.length} courses inserted...`);
      }
    } catch (error: any) {
      errorCount++;
      console.error(`❌ Error inserting course: ${rest.code}`, error?.message || error);
    }

    // Small delay between each insert to avoid rate limiting
    await delay(50);
  }

  console.log(`\n📊 Courses: ${successCount} successful, ${errorCount} failed\n`);
}

(async () => {
  console.log('⏳ Seeding data...');
  await seedProfessors();
  await seedCourses();
  console.log('✅ Seeding complete');
})();
