import { supabaseAdmin } from '@/lib/supabase-admin';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid course ID' });
  }

  if (req.method === 'GET') {
    try {
      // Get the course document
      const { data: course, error: courseError } = await supabaseAdmin
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (courseError || !course) {
        return res.status(404).json({ error: 'Course not found' });
      }
      
      // Get the ratings for this course
      const { data: ratings, error: ratingsError } = await supabaseAdmin
        .from('ratings')
        .select('*')
        .eq('target_id', id)
        .eq('target_type', 'course');
      
      if (ratingsError) throw ratingsError;
      
      // Return the course with its ratings
      return res.status(200).json({
        ...course,
        ratings: ratings || []
      });
    } catch (error) {
      console.error('Error fetching course:', error);
      return res.status(500).json({ error: 'Failed to fetch course' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}