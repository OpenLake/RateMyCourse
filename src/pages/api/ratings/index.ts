import type { NextApiRequest, NextApiResponse } from 'next';
import { adminAuth, adminDb } from '../../../lib/firebase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST method for creating ratings
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
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

    // Get the rating data from the request body
    const { 
      target_id, 
      target_type, 
      rating_value, 
      comment, 
      semester, 
      year 
    } = req.body;

    // Validate required fields
    if (!target_id || !target_type || !rating_value) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if target exists (course or professor)
    let targetDoc;
    if (target_type === 'course') {
      targetDoc = await adminDb.collection('courses').doc(target_id).get();
    } else if (target_type === 'professor') {
      targetDoc = await adminDb.collection('professors').doc(target_id).get();
    } else {
      return res.status(400).json({ error: 'Invalid target type' });
    }

    if (!targetDoc.exists) {
      return res.status(404).json({ error: `${target_type} not found` });
    }

    // Check if user already submitted a rating for this target
    const existingRatingSnapshot = await adminDb
      .collection('ratings')
      .where('anonymous_id', '==', anonymousId)
      .where('target_id', '==', target_id)
      .where('target_type', '==', target_type)
      .limit(1)
      .get();

    if (!existingRatingSnapshot.empty) {
      return res.status(400).json({ error: 'You have already rated this item' });
    }

    // Create the new rating document
    const now = new Date();
    const newRatingRef = adminDb.collection('ratings').doc();
    const newRating = {
      id: newRatingRef.id,
      anonymous_id: anonymousId,
      target_id,
      target_type,
      rating_value: Number(rating_value),
      comment: comment || '',
      semester: semester || '',
      year: year ? Number(year) : new Date().getFullYear(),
      created_at: now,
      updated_at: now,
      helpfulness_score: 0,
      is_flagged: false
    };

    // Start a transaction to update both the rating and the target's average
    await adminDb.runTransaction(async (transaction) => {
      // Add the new rating
      transaction.set(newRatingRef, newRating);
      
      // Update the target's rating stats
      const targetData = targetDoc.data();
      const currentRatingCount = targetData?.rating_count || 0;
      const currentAvgRating = targetData?.avg_rating || 0;
      
      // Calculate the new average rating
      const newRatingCount = currentRatingCount + 1;
      const newAvgRating = (currentAvgRating * currentRatingCount + Number(rating_value)) / newRatingCount;
      
      // Update the target document
      transaction.update(targetDoc.ref, {
        rating_count: newRatingCount,
        avg_rating: newAvgRating
      });
    });

    return res.status(201).json({ success: true, rating_id: newRatingRef.id });
  } catch (error) {
    console.error('Error creating rating:', error);
    return res.status(500).json({ error: 'Failed to create rating' });
  }
}