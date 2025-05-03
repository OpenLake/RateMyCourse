import type { NextApiRequest, NextApiResponse } from 'next';
import { adminAuth, adminDb } from '../../../lib/firebase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid rating ID' });
  }

  // Get the Firebase Auth token from the request headers
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Extract and verify the token
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Get the user's anonymous ID from Firestore
    const userDoc = await adminDb.collection('users_auth').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const anonymousId = userData?.anonymous_id;
    
    if (!anonymousId) {
      return res.status(400).json({ error: 'Anonymous ID not found for user' });
    }

    // Get the rating document
    const ratingDoc = await adminDb.collection('ratings').doc(id).get();
    
    if (!ratingDoc.exists) {
      return res.status(404).json({ error: 'Rating not found' });
    }
    
    const ratingData = ratingDoc.data();
    
    // Check if the anonymous ID matches (user is the author of the rating)
    if (ratingData?.anonymous_id !== anonymousId) {
      return res.status(403).json({ error: 'You do not have permission to modify this rating' });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { rating_value, comment, semester, year } = req.body;
      
      // Get the current rating data
      const oldRatingValue = ratingData?.rating_value;
      const target_id = ratingData?.target_id;
      const target_type = ratingData?.target_type;
      
      // Prepare update data
      const updateData: any = {
        updated_at: new Date()
      };
      
      if (rating_value !== undefined) updateData.rating_value = Number(rating_value);
      if (comment !== undefined) updateData.comment = comment;
      if (semester !== undefined) updateData.semester = semester;
      if (year !== undefined) updateData.year = Number(year);
      
      // Get the target document (course or professor)
      const targetDoc = await adminDb
        .collection(target_type === 'course' ? 'courses' : 'professors')
        .doc(target_id)
        .get();
      
      if (!targetDoc.exists) {
        return res.status(404).json({ error: `${target_type} not found` });
      }
      
      // Start a transaction to update both the rating and the target's average
      await adminDb.runTransaction(async (transaction) => {
        // Update the rating
        transaction.update(ratingDoc.ref, updateData);
        
        // Only update the target's rating stats if the rating value changed
        if (rating_value !== undefined && Number(rating_value) !== oldRatingValue) {
          const targetData = targetDoc.data();
          const currentRatingCount = targetData?.rating_count || 0;
          const currentAvgRating = targetData?.avg_rating || 0;
          
          // Calculate the new average rating
          const newAvgRating = (currentAvgRating * currentRatingCount - oldRatingValue + Number(rating_value)) / currentRatingCount;
          
          // Update the target document
          transaction.update(targetDoc.ref, {
            avg_rating: newAvgRating
          });
        }
      });
      
      return res.status(200).json({ success: true });
    } else if (req.method === 'DELETE') {
      const target_id = ratingData?.target_id;
      const target_type = ratingData?.target_type;
      const oldRatingValue = ratingData?.rating_value;
      
      // Get the target document (course or professor)
      const targetDoc = await adminDb
        .collection(target_type === 'course' ? 'courses' : 'professors')
        .doc(target_id)
        .get();
      
      if (!targetDoc.exists) {
        return res.status(404).json({ error: `${target_type} not found` });
      }
      
      // Start a transaction to delete the rating and update the target's average
      await adminDb.runTransaction(async (transaction) => {
        // Delete the rating
        transaction.delete(ratingDoc.ref);
        
        // Update the target's rating stats
        const targetData = targetDoc.data();
        const currentRatingCount = targetData?.rating_count || 0;
        const currentAvgRating = targetData?.avg_rating || 0;
        
        if (currentRatingCount <= 1) {
          // If this was the only rating, reset the stats
          transaction.update(targetDoc.ref, {
            rating_count: 0,
            avg_rating: 0
          });
        } else {
          // Calculate the new average rating
          const newRatingCount = currentRatingCount - 1;
          const newAvgRating = (currentAvgRating * currentRatingCount - oldRatingValue) / newRatingCount;
          
          // Update the target document
          transaction.update(targetDoc.ref, {
            rating_count: newRatingCount,
            avg_rating: newAvgRating
          });
        }
      });
      
      return res.status(200).json({ success: true });
    } else {
      res.setHeader('Allow', ['PUT', 'PATCH', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error handling rating:', error);
    return res.status(500).json({ error: 'Failed to process rating' });
  }
}