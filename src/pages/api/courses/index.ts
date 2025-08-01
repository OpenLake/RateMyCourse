import type { NextApiRequest, NextApiResponse } from 'next';
import { Course } from '../../../types';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // Get query parameters for filtering
      const { department, search } = req.query;
      
      // Start with the base query
      let query = supabaseAdmin.from('courses').select('*');
      
      // Apply department filter if provided
      if (department && typeof department === 'string') {
        query = query.eq('department', department);
      }
      
      // If there's a search parameter, we'll need to filter after fetching
      // since Supabase doesn't support complex text searching in the same way
      const { data: courses, error } = await query;
      
      if (error) throw error;
      
      // Apply search filter if provided
      let filteredCourses = courses as Course[];
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        filteredCourses = filteredCourses.filter(course => 
          course.title.toLowerCase().includes(searchLower) || 
          course.id.toLowerCase().includes(searchLower)
        );
      }
      
      return res.status(200).json(filteredCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      return res.status(500).json({ error: 'Failed to fetch courses' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}