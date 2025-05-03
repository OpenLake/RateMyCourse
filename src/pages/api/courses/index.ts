import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../lib/firebase-admin';
import { Course } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // Get query parameters for filtering
      const { department, search } = req.query;
      
      // Start with the base query
      let query = adminDb.collection('courses');
      
      // Apply department filter if provided
      if (department && typeof department === 'string') {
        query = query.where('department', '==', department);
      }
      
      // Execute the query
      const coursesSnapshot = await query.get();
      
      // Process the results
      let courses = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      
      // Apply search filter if provided
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        courses = courses.filter(course => 
          course.name.toLowerCase().includes(searchLower) || 
          course.id.toLowerCase().includes(searchLower)
        );
      }
      
      return res.status(200).json(courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      return res.status(500).json({ error: 'Failed to fetch courses' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}