// services/course-service.ts
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { Course } from '@/types';

// Convert Firestore document to Course type
const courseConverter = {
  toFirestore(course: Course): DocumentData {
    return {
      id: course.id,
      name: course.name,
      department: course.department,
      description: course.description,
      avg_rating: course.avg_rating,
      rating_count: course.rating_count
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Course {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      department: data.department,
      description: data.description,
      avg_rating: data.avg_rating || 0,
      rating_count: data.rating_count || 0
    };
  }
};

// Get all courses
export const getAllCourses = async (): Promise<Course[]> => {
  const coursesRef = collection(db, 'courses').withConverter(courseConverter);
  const coursesSnapshot = await getDocs(coursesRef);
  return coursesSnapshot.docs.map(doc => doc.data());
};

// Get course by ID
export const getCourseById = async (courseId: string): Promise<Course | null> => {
  const courseRef = doc(db, 'courses', courseId).withConverter(courseConverter);
  const courseSnapshot = await getDoc(courseRef);
  
  if (courseSnapshot.exists()) {
    return courseSnapshot.data();
  }
  
  return null;
};

// Get courses by department
export const getCoursesByDepartment = async (department: string): Promise<Course[]> => {
  const coursesRef = collection(db, 'courses').withConverter(courseConverter);
  const q = query(coursesRef, where('department', '==', department));
  const coursesSnapshot = await getDocs(q);
  
  return coursesSnapshot.docs.map(doc => doc.data());
};

// Get top-rated courses
export const getTopRatedCourses = async (limit_count: number = 10): Promise<Course[]> => {
  const coursesRef = collection(db, 'courses').withConverter(courseConverter);
  const q = query(
    coursesRef, 
    where('rating_count', '>=', 3), // Only include courses with at least 3 ratings
    orderBy('rating_count', 'desc'),
    orderBy('avg_rating', 'desc'),
    limit(limit_count)
  );
  const coursesSnapshot = await getDocs(q);
  
  return coursesSnapshot.docs.map(doc => doc.data());
};