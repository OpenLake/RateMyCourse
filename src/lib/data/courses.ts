import { Course } from '@/lib/types';

// Mock data for courses
const courses: Course[] = [
  {
    id: 'cs101',
    name: 'Introduction to Computer Science',
    code: 'CSL101',
    department: 'Computer Science',
    type: 'Core',
    credits: 4,
    description: 'This course provides an introduction to computer science and programming using Python. Students will learn fundamental concepts of programming and problem-solving.',
    rating: 4.5,
    difficulty: 2.3,
    workload: 3.2,
    contentQuality: 4.7,
    reviewCount: 124,
    instructors: [
      {
        id: 'fac101',
        name: 'Dr. Rajesh Kumar',
        department: 'Computer Science',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
      },
      {
        id: 'fac102',
        name: 'Dr. Anita Desai',
        department: 'Computer Science',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
      }
    ]
  },
  {
    id: 'cs201',
    name: 'Data Structures and Algorithms',
    code: 'CSL202',
    department: 'Computer Science',
    type: 'Core',
    credits: 4,
    description: 'This course covers fundamental data structures and algorithms. Topics include arrays, linked lists, stacks, queues, trees, graphs, sorting, searching, and algorithm analysis.',
    rating: 4.2,
    difficulty: 3.8,
    workload: 4.1,
    contentQuality: 4.5,
    reviewCount: 98,
    instructors: [
      {
        id: 'fac102',
        name: 'Dr. Anita Desai',
        department: 'Computer Science',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
      }
    ]
  },
  {
    id: 'ma101',
    name: 'Calculus and Linear Algebra',
    code: 'MAL101',
    department: 'Mathematics',
    type: 'Core',
    credits: 4,
    description: 'This course introduces calculus and linear algebra concepts essential for science and engineering students.',
    rating: 3.9,
    difficulty: 4.2,
    workload: 4.0,
    contentQuality: 4.1,
    reviewCount: 145,
    instructors: [
      {
        id: 'fac103',
        name: 'Dr. Priya Singh',
        department: 'Mathematics',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
      }
    ]
  },
  {
    id: 'ph101',
    name: 'Physics for Engineers',
    code: 'PHL101',
    department: 'Physics',
    type: 'Core',
    credits: 4,
    description: 'This course covers fundamental concepts of physics for engineering students, including mechanics, thermodynamics, and electromagnetism.',
    rating: 4.1,
    difficulty: 3.5,
    workload: 3.8,
    contentQuality: 4.3,
    reviewCount: 132,
    instructors: [
      {
        id: 'fac104',
        name: 'Dr. Amit Patel',
        department: 'Physics',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
      }
    ]
  },
  {
    id: 'ee201',
    name: 'Digital Electronics',
    code: 'EEL201',
    department: 'Electrical Engineering',
    type: 'Core',
    credits: 3,
    description: 'This course covers digital logic design, Boolean algebra, combinational and sequential circuits, and digital system design.',
    rating: 4.3,
    difficulty: 3.2,
    workload: 3.5,
    contentQuality: 4.4,
    reviewCount: 87,
    instructors: [
      {
        id: 'fac105',
        name: 'Dr. Rajeev Sharma',
        department: 'Electrical Engineering',
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
      }
    ]
  },
  {
    id: 'cs301',
    name: 'Operating Systems',
    code: 'CSL301',
    department: 'Computer Science',
    type: 'Core',
    credits: 4,
    description: 'This course covers the principles and design of operating systems, including process management, memory management, file systems, and security.',
    rating: 4.4,
    difficulty: 4.0,
    workload: 4.2,
    contentQuality: 4.6,
    reviewCount: 76,
    instructors: [
      {
        id: 'fac101',
        name: 'Dr. Rajesh Kumar',
        department: 'Computer Science',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
      }
    ]
  }
];

export function getAllCourses(): Course[] {
  return courses;
}

export function getCourseById(id: string): Course | undefined {
  return courses.find(course => course.id === id);
}

export function getFeaturedCourses(): Course[] {
  // Return the top 3 highest rated courses
  return [...courses]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);
}

export function getRelatedCourses(courseId: string): Course[] {
  const course = getCourseById(courseId);
  if (!course) return [];
  
  // Return courses in the same department, excluding the current course
  return courses
    .filter(c => c.department === course.department && c.id !== course.id)
    .slice(0, 3);
}

export function getProfessorCourses(professorId: string): Course[] {
  // Return courses taught by the specified professor
  return courses.filter(course => 
    course.instructors.some(instructor => instructor.id === professorId)
  );
}