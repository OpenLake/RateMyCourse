// services/professor-service.ts
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
import { Professor } from '@/types';

// Convert Firestore document to Professor type
const professorConverter = {
  toFirestore(professor: Professor): DocumentData {
    return {
      id: professor.id,
      name: professor.name,
      department: professor.department,
      designation: professor.designation,
      avg_rating: professor.avg_rating,
      rating_count: professor.rating_count
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Professor {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      department: data.department,
      designation: data.designation,
      avg_rating: data.avg_rating || 0,
      rating_count: data.rating_count || 0
    };
  }
};

// Get all professors
export const getAllProfessors = async (): Promise<Professor[]> => {
  const professorsRef = collection(db, 'professors').withConverter(professorConverter);
  const professorsSnapshot = await getDocs(professorsRef);
  return professorsSnapshot.docs.map(doc => doc.data());
};

// Get professor by ID
export const getProfessorById = async (professorId: string): Promise<Professor | null> => {
  const professorRef = doc(db, 'professors', professorId).withConverter(professorConverter);
  const professorSnapshot = await getDoc(professorRef);
  
  if (professorSnapshot.exists()) {
    return professorSnapshot.data();
  }
  
  return null;
};

// Get professors by department
export const getProfessorsByDepartment = async (department: string): Promise<Professor[]> => {
  const professorsRef = collection(db, 'professors').withConverter(professorConverter);
  const q = query(professorsRef, where('department', '==', department));
  const professorsSnapshot = await getDocs(q);
  
  return professorsSnapshot.docs.map(doc => doc.data());
};

// Get top-rated professors
export const getTopRatedProfessors = async (limit_count: number = 10): Promise<Professor[]> => {
  const professorsRef = collection(db, 'professors').withConverter(professorConverter);
  const q = query(
    professorsRef, 
    where('rating_count', '>=', 3), // Only include professors with at least 3 ratings
    orderBy('rating_count', 'desc'),
    orderBy('avg_rating', 'desc'),
    limit(limit_count)
  );
  const professorsSnapshot = await getDocs(q);
  
  return professorsSnapshot.docs.map(doc => doc.data());
};