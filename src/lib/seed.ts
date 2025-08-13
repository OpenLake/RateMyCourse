// import 'dotenv/config';
// import { supabase } from './supabase';
// import professors from './data/professors.json' assert { type: 'json' };
// import courses from './data/courses.json' assert { type: 'json' };


// interface Course {
//   id: string;
//   code: string;
//   name: string;
//   // add other fields as needed
// }
// async function seedProfessors() {
//   console.log('🌱 Seeding professors...');

//   for (const professor of professors) {
//     const {
//       name, // don't insert custom id
//       education, // remove if not in table
//       ...rest
//     } = professor;
   

//     const { error } = await supabase
//       .from('professors')
//       .upsert(
//         {
//           ...rest,
//           overall_rating: 0,
//           knowledge_rating: 0,
//           teaching_rating: 0,
//           approachability_rating: 0,
//           review_count: 0,
//         },
//         { onConflict: 'email' } // uses email to deduplicate
//       );

//     if (error) {
//       console.error('❌ Error inserting professor:', error.message);
//     }
//   }
// }

// async function seedCourses() {
//   console.log('🌱 Seeding courses...');

//   const courseArray = Array.isArray(courses)
//     ? courses.flat()
//     : Object.values(courses).flat();

//   console.log(
//     '📦 courseArray preview:',
//     courseArray.slice?.(0, 3) || Object.values(courseArray).slice(0, 3)
//   );

//   for (const course of courseArray) {
//     const { id, ...rest } = course;

//     const { error } = await supabase
//       .from('courses')
//       .upsert(
//         {
//           ...rest,
//           rating: 0,
//           review_count: 0,
//         },
//         { onConflict: 'code' } // assumes 'code' is unique for each course
//       );

//     if (error) {
//       console.error('❌ Error inserting course:', error.message);
//     }
//   }
// }

// (async () => {
//   console.log('⏳ Seeding data...');
//   await seedProfessors();
//   await seedCourses();
//   console.log('✅ Seeding complete');
// })();
