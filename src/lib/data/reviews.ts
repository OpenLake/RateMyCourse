// Mock data for reviews
const reviews = [
  {
    id: 'rev101',
    courseId: 'cs101',
    courseName: 'Introduction to Computer Science',
    courseCode: 'CSL101',
    semester: 'Monsoon 2023',
    overallRating: 4.5,
    workloadRating: 3.5,
    contentRating: 4.8,
    teachingRating: 4.6,
    supportRating: 4.3,
    comment: 'Excellent course for beginners. The professor explained complex concepts in a simple way. The assignments were challenging but fun. The teaching assistants were very helpful during labs.',
    date: 'Dec 10, 2023',
    user: {
      id: 'user101',
      name: 'Rahul Singh',
      avatar: 'https://randomuser.me/api/portraits/men/11.jpg'
    }
  },
  {
    id: 'rev102',
    courseId: 'cs101',
    courseName: 'Introduction to Computer Science',
    courseCode: 'CSL101',
    semester: 'Monsoon 2023',
    overallRating: 4.2,
    workloadRating: 4.0,
    contentRating: 4.5,
    teachingRating: 4.0,
    supportRating: 4.2,
    comment: 'Great introductory course. The programming assignments were well-designed and helped me understand the concepts. The lectures were engaging and the professor was very approachable.',
    date: 'Dec 5, 2023',
    user: {
      id: 'user102',
      name: 'Priya Sharma',
      avatar: 'https://randomuser.me/api/portraits/women/11.jpg'
    }
  },
  {
    id: 'rev103',
    courseId: 'cs201',
    courseName: 'Data Structures and Algorithms',
    courseCode: 'CSL202',
    semester: 'Winter 2023',
    overallRating: 4.7,
    workloadRating: 4.5,
    contentRating: 4.8,
    teachingRating: 4.6,
    supportRating: 4.5,
    comment: 'Challenging but rewarding course. Dr. Desai is an excellent instructor who explains complex algorithms clearly. The assignments were difficult but helped reinforce the concepts.',
    date: 'May 15, 2023',
    user: {
      id: 'user103',
      name: 'Arun Kumar',
      avatar: 'https://randomuser.me/api/portraits/men/12.jpg'
    }
  },
  {
    id: 'rev104',
    courseId: 'ma101',
    courseName: 'Calculus and Linear Algebra',
    courseCode: 'MAL101',
    semester: 'Monsoon 2023',
    overallRating: 3.8,
    workloadRating: 4.2,
    contentRating: 4.0,
    teachingRating: 3.5,
    supportRating: 3.6,
    comment: 'The course content was comprehensive but the pace was sometimes too fast. The professor is very knowledgeable but could improve on explaining complex concepts for beginners.',
    date: 'Dec 12, 2023',
    user: {
      id: 'user104',
      name: 'Neha Gupta',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg'
    }
  },
  {
    id: 'rev105',
    courseId: 'ph101',
    courseName: 'Physics for Engineers',
    courseCode: 'PHL101',
    semester: 'Monsoon 2023',
    overallRating: 4.3,
    workloadRating: 3.8,
    contentRating: 4.5,
    teachingRating: 4.2,
    supportRating: 4.0,
    comment: 'Dr. Patel makes physics interesting and relatable. The lab experiments were well-designed and helped visualize the concepts. The problem sets were challenging but fair.',
    date: 'Dec 8, 2023',
    user: {
      id: 'user105',
      name: 'Vijay Mehta',
      avatar: 'https://randomuser.me/api/portraits/men/13.jpg'
    }
  },
  {
    id: 'rev106',
    courseId: 'ee201',
    courseName: 'Digital Electronics',
    courseCode: 'EEL201',
    semester: 'Winter 2023',
    overallRating: 4.6,
    workloadRating: 4.0,
    contentRating: 4.7,
    teachingRating: 4.8,
    supportRating: 4.5,
    comment: 'One of the best courses I\'ve taken. Dr. Sharma is passionate about the subject and it shows in his teaching. The lab sessions were hands-on and gave practical experience.',
    date: 'May 10, 2023',
    user: {
      id: 'user106',
      name: 'Sneha Patel',
      avatar: 'https://randomuser.me/api/portraits/women/13.jpg'
    }
  },
  // Professor reviews
  {
    id: 'rev201',
    professorId: 'fac101',
    course: 'Introduction to Computer Science (CSL101)',
    overallRating: 4.8,
    knowledgeRating: 4.9,
    teachingRating: 4.7,
    accessibilityRating: 4.6,
    fairnessRating: 4.7,
    comment: 'Dr. Kumar is an exceptional professor. His lectures are engaging and he explains complex concepts in an easy-to-understand manner. Hes always available during office hours and responds quickly to emails.',
    date: 'Dec 15, 2023',
    user: {
      id: 'user107',
      name: 'Akash Joshi',
      avatar: 'https://randomuser.me/api/portraits/men/14.jpg'
    }
  },
  {
    id: 'rev202',
    professorId: 'fac101',
    course: 'Operating Systems (CSL301)',
    overallRating: 4.6,
    knowledgeRating: 4.9,
    teachingRating: 4.5,
    accessibilityRating: 4.4,
    fairnessRating: 4.6,
    comment: 'Dr. Kumars Operating Systems course was challenging but extremely rewarding. His deep knowledge of the subject and real-world examples made the concepts clearer. The programming assignments were practical and interesting.',
    date: 'May 20, 2023',
    user: {
      id: 'user108',
      name: 'Divya Chauhan',
      avatar: 'https://randomuser.me/api/portraits/women/14.jpg'
    }
  },
  {
    id: 'rev203',
    professorId: 'fac102',
    course: 'Data Structures and Algorithms (CSL202)',
    overallRating: 4.7,
    knowledgeRating: 4.8,
    teachingRating: 4.6,
    accessibilityRating: 4.5,
    fairnessRating: 4.7,
    comment: 'Dr. Desai is a brilliant professor who makes algorithms interesting. Her problem-solving approach and clear explanations helped me grasp complex concepts. The assignments were challenging but well-designed to reinforce learning.',
    date: 'May 18, 2023',
    user: {
      id: 'user109',
      name: 'Ravi Sharma',
      avatar: 'https://randomuser.me/api/portraits/men/15.jpg'
    }
  },
  {
    id: 'rev204',
    professorId: 'fac103',
    course: 'Calculus and Linear Algebra (MAL101)',
    overallRating: 4.3,
    knowledgeRating: 4.7,
    teachingRating: 4.1,
    accessibilityRating: 4.0,
    fairnessRating: 4.4,
    comment: 'Dr. Singh is very knowledgeable but sometimes moves too quickly through difficult concepts. Her problem sets are well-designed and challenging. Shes helpful during office hours and provides good feedback on assignments.',
    date: 'Dec 14, 2023',
    user: {
      id: 'user110',
      name: 'Siddharth Verma',
      avatar: 'https://randomuser.me/api/portraits/men/16.jpg'
    }
  }
];

export function getRecentReviews() {
  // Filter only course reviews (not professor reviews)
  const courseReviews = reviews.filter(review => review.courseId);
  
  // Sort by date (newest first) and return top 4
  return [...courseReviews]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);
}

export function getReviewsByCourseId(courseId: string) {
  return reviews.filter(review => review.courseId === courseId);
}

export function getReviewsByProfessorId(professorId: string) {
  return reviews.filter(review => review.professorId === professorId);
}