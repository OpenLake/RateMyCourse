import { Professor } from '@/lib/types';

// Mock data for professor
const professor: Professor[] = [
  {
    id: 'fac101',
    name: 'Dr. Rajesh Kumar',
    title: 'Associate Professor',
    email: 'rajesh.kumar@iitbhilai.ac.in',
    department: 'Computer Science',
    specialization: 'Distributed Systems, Cloud Computing',
    bio: 'Dr. Rajesh Kumar is an Associate Professor in the Department of Computer Science at IIT Bhilai. His research interests include distributed systems, cloud computing, and high-performance computing.',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    website: 'https://example.com/rajesh-kumar',
    rating: 4.7,
    knowledgeRating: 4.9,
    teachingRating: 4.6,
    accessibilityRating: 4.5,
    reviewCount: 87,
    teachingStyles: ['Interactive', 'Research-oriented', 'Project-based'],
    researchInterests: [
      'Distributed Systems',
      'Cloud Computing',
      'High-Performance Computing',
      'Fault Tolerance'
    ],
    education: [
      'Ph.D. in Computer Science, IIT Delhi',
      'M.Tech in Computer Science, IIT Kanpur',
      'B.Tech in Computer Science, NIT Warangal'
    ],
    courses: [
      { id: 'cs101', name: 'Introduction to Computer Science', code: 'CSL101' },
      { id: 'cs301', name: 'Operating Systems', code: 'CSL301' }
    ],
    officeHours: [
      { day: 'Monday', time: '2:00 PM - 4:00 PM' },
      { day: 'Thursday', time: '10:00 AM - 12:00 PM' }
    ]
  },
  {
    id: 'fac102',
    name: 'Dr. Anita Desai',
    title: 'Assistant Professor',
    email: 'anita.desai@iitbhilai.ac.in',
    department: 'Computer Science',
    specialization: 'Algorithms, Theoretical Computer Science',
    bio: 'Dr. Anita Desai is an Assistant Professor in the Department of Computer Science at IIT Bhilai. Her research focuses on algorithm design, computational complexity, and theoretical computer science.',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    rating: 4.5,
    knowledgeRating: 4.8,
    teachingRating: 4.3,
    accessibilityRating: 4.4,
    reviewCount: 62,
    teachingStyles: ['Problem-solving', 'Lecture-based', 'Whiteboard coding'],
    researchInterests: [
      'Algorithm Design',
      'Computational Complexity',
      'Graph Algorithms',
      'Approximation Algorithms'
    ],
    education: [
      'Ph.D. in Computer Science, IISc Bangalore',
      'M.S. in Computer Science, Stanford University',
      'B.Tech in Computer Science, IIT Bombay'
    ],
    courses: [
      { id: 'cs101', name: 'Introduction to Computer Science', code: 'CSL101' },
      { id: 'cs201', name: 'Data Structures and Algorithms', code: 'CSL202' }
    ],
    officeHours: [
      { day: 'Tuesday', time: '11:00 AM - 1:00 PM' },
      { day: 'Friday', time: '3:00 PM - 5:00 PM' }
    ]
  },
  {
    id: 'fac103',
    name: 'Dr. Priya Singh',
    title: 'Professor',
    email: 'priya.singh@iitbhilai.ac.in',
    department: 'Mathematics',
    specialization: 'Applied Mathematics, Numerical Analysis',
    bio: 'Dr. Priya Singh is a Professor in the Department of Mathematics at IIT Bhilai. Her research interests include applied mathematics, numerical analysis, and differential equations.',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    website: 'https://example.com/priya-singh',
    rating: 4.2,
    knowledgeRating: 4.6,
    teachingRating: 4.0,
    accessibilityRating: 4.1,
    reviewCount: 95,
    teachingStyles: ['Theoretical', 'Visual', 'Application-oriented'],
    researchInterests: [
      'Numerical Analysis',
      'Differential Equations',
      'Scientific Computing',
      'Mathematical Modeling'
    ],
    education: [
      'Ph.D. in Mathematics, University of Cambridge',
      'M.Sc. in Mathematics, IIT Bombay',
      'B.Sc. in Mathematics, St. Stephen\'s College, Delhi'
    ],
    courses: [
      { id: 'ma101', name: 'Calculus and Linear Algebra', code: 'MAL101' }
    ],
    officeHours: [
      { day: 'Monday', time: '10:00 AM - 12:00 PM' },
      { day: 'Wednesday', time: '2:00 PM - 4:00 PM' }
    ]
  },
  {
    id: 'fac104',
    name: 'Dr. Amit Patel',
    title: 'Associate Professor',
    email: 'amit.patel@iitbhilai.ac.in',
    department: 'Physics',
    specialization: 'Condensed Matter Physics, Quantum Physics',
    bio: 'Dr. Amit Patel is an Associate Professor in the Department of Physics at IIT Bhilai. His research focuses on condensed matter physics, quantum physics, and nanomaterials.',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    rating: 4.3,
    knowledgeRating: 4.7,
    teachingRating: 4.2,
    accessibilityRating: 4.0,
    reviewCount: 78,
    teachingStyles: ['Experimental', 'Theoretical', 'Lab-based'],
    researchInterests: [
      'Condensed Matter Physics',
      'Quantum Physics',
      'Nanomaterials',
      'Optoelectronics'
    ],
    education: [
      'Ph.D. in Physics, Cornell University',
      'M.Sc. in Physics, IIT Madras',
      'B.Sc. in Physics, University of Mumbai'
    ],
    courses: [
      { id: 'ph101', name: 'Physics for Engineers', code: 'PHL101' }
    ],
    officeHours: [
      { day: 'Tuesday', time: '2:00 PM - 4:00 PM' },
      { day: 'Thursday', time: '11:00 AM - 1:00 PM' }
    ]
  },
  {
    id: 'fac105',
    name: 'Dr. Rajeev Sharma',
    title: 'Assistant Professor',
    email: 'rajeev.sharma@iitbhilai.ac.in',
    department: 'Electrical Engineering',
    specialization: 'Digital Systems, VLSI Design',
    bio: 'Dr. Rajeev Sharma is an Assistant Professor in the Department of Electrical Engineering at IIT Bhilai. His research interests include digital systems, VLSI design, and embedded systems.',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    website: 'https://example.com/rajeev-sharma',
    rating: 4.6,
    knowledgeRating: 4.7,
    teachingRating: 4.6,
    accessibilityRating: 4.5,
    reviewCount: 56,
    teachingStyles: ['Practical', 'Hands-on', 'Project-based'],
    researchInterests: [
      'Digital Systems',
      'VLSI Design',
      'Embedded Systems',
      'Low Power Design'
    ],
    education: [
      'Ph.D. in Electrical Engineering, Georgia Tech',
      'M.Tech in VLSI Design, IIT Delhi',
      'B.Tech in Electronics and Communication, NIT Trichy'
    ],
    courses: [
      { id: 'ee201', name: 'Digital Electronics', code: 'EEL201' }
    ],
    officeHours: [
      { day: 'Wednesday', time: '10:00 AM - 12:00 PM' },
      { day: 'Friday', time: '1:00 PM - 3:00 PM' }
    ]
  }
];

export function getAllProfessor(): Professor[] {
  return professor;
}

export function getProfessorById(id: string): Professor | undefined {
  return professor.find(f => f.id === id);
}