import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../lib/firebase-admin';

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
      const courseDoc = await adminDb.collection('courses').doc(id).get();
      
      if (!courseDoc.exists) {
        return res.status(404).json({ error: 'Course not found' });
      }
      
      // Get the ratings for this course
      const ratingsSnapshot = await adminDb
        .collection('ratings')
        .where('target_id', '==', id)
        .where('target_type', '==', 'course')
        .get();
      
      const ratings = ratingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Return the course with its ratings
      return res.status(200).json({
        id: courseDoc.id,
        ...courseDoc.data(),
        ratings
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