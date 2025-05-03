// services/rating-service.ts
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy, 
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  runTransaction
} from 'firebase/firestore';
import { Rating } from '@/types';

// Convert Firestore document to Rating type
const ratingConverter = {
  toFirestore(rating: Partial<Rating>): DocumentData {
    return {
      anonymous_id: rating.anonymous_id,
      target_id: rating.target_id,
      target_type: rating.target_type,
      rating_value: rating.rating_value,
      comment: rating.comment,
      semester: rating.semester,
      year: rating.year,
      created_at: rating.created_at || Timestamp.now(),
      updated_at: Timestamp.now(),
      helpfulness_score: rating.helpfulness_score || 0,
      is_flagged: rating.is_flagged || false
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Rating {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      anonymous_id: data.anonymous_id,
      target_id: data.target_id,
      target_type: data.target_type,
      rating_value: data.rating_value,
      comment: data.comment,
      semester: data.semester,
      year: data.year,
      created_at: data.created_at.toDate(),
      updated_at: data.updated_at.toDate(),
      helpfulness_score: data.helpfulness_score || 0,
      is_flagged: data.is_flagged || false
    };
  }
};

// Create a new rating
export const createRating = async (rating: Omit<Rating, 'id' | 'created_at' | 'updated_at' | 'helpfulness_score' | 'is_flagged'>): Promise<string> => {
  try {
    // Start a transaction
    return await runTransaction(db, async (transaction) => {
      // Create the rating
      const ratingsRef = collection(db, 'ratings').withConverter(ratingConverter);
      const newRatingRef = doc(ratingsRef);
      
      transaction.set(newRatingRef, {
        ...rating,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
        helpfulness_score: 0,
        is_flagged: false
      });

      // Update the average rating for the target (course or professor)
      const targetRef = doc(db, rating.target_type + 's', rating.target_id);
      const targetDoc = await transaction.get(targetRef);
      
      if (!targetDoc.exists()) {
        throw new Error(`${rating.target_type} not found`);
      }
      
      const targetData = targetDoc.data();
      const currentRatingCount = targetData.rating_count || 0;
      const currentAvgRating = targetData.avg_rating || 0;
      
      // Calculate new average
      const newRatingCount = currentRatingCount + 1;
      const newAvgRating = ((currentAvgRating * currentRatingCount) + rating.rating_value) / newRatingCount;
      
      // Update the target
      transaction.update(targetRef, {
        avg_rating: newAvgRating,
        rating_count: newRatingCount
      });
      
      return newRatingRef.id;
    });
  } catch (error: any) {
    console.error('Error creating rating:', error);
    throw new Error(`Failed to create rating: ${error.message}`);
  }
};

// Get ratings for a specific target (course or professor)
export const getRatingsForTarget = async (targetId: string, targetType: 'course' | 'professor'): Promise<Rating[]> => {
  const ratingsRef = collection(db, 'ratings').withConverter(ratingConverter);
  const q = query(
    ratingsRef,
    where('target_id', '==', targetId),
    where('target_type', '==', targetType),
    orderBy('created_at', 'desc')
  );
  
  const ratingsSnapshot = await getDocs(q);
  return ratingsSnapshot.docs.map(doc => doc.data());
};

// Get ratings by anonymous ID (for the user's dashboard)
export const getRatingsByAnonymousId = async (anonymousId: string): Promise<Rating[]> => {
  const ratingsRef = collection(db, 'ratings').withConverter(ratingConverter);
  const q = query(
    ratingsRef,
    where('anonymous_id', '==', anonymousId),
    orderBy('created_at', 'desc')
  );
  
  const ratingsSnapshot = await getDocs(q);
  return ratingsSnapshot.docs.map(doc => doc.data());
};

// Update a rating
export const updateRating = async (
  ratingId: string, 
  anonymousId: string, 
  updates: Partial<Rating>
): Promise<void> => {
  const ratingRef = doc(db, 'ratings', ratingId);
  const ratingDoc = await getDoc(ratingRef);
  
  if (!ratingDoc.exists()) {
    throw new Error('Rating not found');
  }
  
  const ratingData = ratingDoc.data();
  
  // Verify ownership
  if (ratingData.anonymous_id !== anonymousId) {
    throw new Error('You can only update your own ratings');
  }
  
  // Only update allowed fields
  const allowedUpdates = {
    rating_value: updates.rating_value,
    comment: updates.comment,
    semester: updates.semester,
    year: updates.year,
    updated_at: Timestamp.now()
  };
  
  // If rating value has changed, update target's average
  if (updates.rating_value && updates.rating_value !== ratingData.rating_value) {
    await runTransaction(db, async (transaction) => {
      // Get the target
      const targetRef = doc(db, ratingData.target_type + 's', ratingData.target_id);
      const targetDoc = await transaction.get(targetRef);
      
      if (!targetDoc.exists()) {
        throw new Error(`${ratingData.target_type} not found`);
      }
      
      const targetData = targetDoc.data();
      const currentRatingCount = targetData.rating_count || 0;
      const currentAvgRating = targetData.avg_rating || 0;
      
      // Calculate new average by removing old rating and adding new one
// services/rating-service.ts (continued)
      // Calculate new average by removing old rating and adding new one
      const newAvgRating = 
        ((currentAvgRating * currentRatingCount) - ratingData.rating_value + updates.rating_value) / 
        currentRatingCount;
      
      // Update the target and rating
      transaction.update(targetRef, { avg_rating: newAvgRating });
      transaction.update(ratingRef, allowedUpdates);
    });
  } else {
    // Just update the rating without changing target's average
    await updateDoc(ratingRef, allowedUpdates);
  }
};

// Delete a rating
export const deleteRating = async (ratingId: string, anonymousId: string): Promise<void> => {
  try {
    await runTransaction(db, async (transaction) => {
      const ratingRef = doc(db, 'ratings', ratingId);
      const ratingDoc = await transaction.get(ratingRef);
      
      if (!ratingDoc.exists()) {
        throw new Error('Rating not found');
      }
      
      const ratingData = ratingDoc.data();
      
      // Verify ownership
      if (ratingData.anonymous_id !== anonymousId) {
        throw new Error('You can only delete your own ratings');
      }
      
      // Get the target
      const targetRef = doc(db, ratingData.target_type + 's', ratingData.target_id);
      const targetDoc = await transaction.get(targetRef);
      
      if (targetDoc.exists()) {
        const targetData = targetDoc.data();
        const currentRatingCount = targetData.rating_count || 0;
        
        // Only update the target if it has ratings
        if (currentRatingCount > 0) {
          // If this is the only rating, reset average
          if (currentRatingCount === 1) {
            transaction.update(targetRef, {
              avg_rating: 0,
              rating_count: 0
            });
          } else {
            // Recalculate average without this rating
            const currentAvgRating = targetData.avg_rating || 0;
            const newRatingCount = currentRatingCount - 1;
            const newAvgRating = ((currentAvgRating * currentRatingCount) - ratingData.rating_value) / newRatingCount;
            
            transaction.update(targetRef, {
              avg_rating: newAvgRating,
              rating_count: newRatingCount
            });
          }
        }
      }
      
      // Delete the rating
      transaction.delete(ratingRef);
    });
  } catch (error: any) {
    console.error('Error deleting rating:', error);
    throw new Error(`Failed to delete rating: ${error.message}`);
  }
};

// Flag a rating
export const flagRating = async (
  ratingId: string,
  anonymousId: string,
  reason: string
): Promise<void> => {
  // Create a flag entry
  const flagsRef = collection(db, 'flags');
  await addDoc(flagsRef, {
    rating_id: ratingId,
    reason,
    anonymous_id: anonymousId,
    status: 'pending',
    created_at: Timestamp.now()
  });
  
  // Mark the rating as flagged
  const ratingRef = doc(db, 'ratings', ratingId);
  await updateDoc(ratingRef, { is_flagged: true });
};

// Vote on a rating
export const voteOnRating = async (
  ratingId: string,
  anonymousId: string,
  voteType: 'helpful' | 'unhelpful'
): Promise<void> => {
  try {
    // Check if user already voted on this rating
    const votesRef = collection(db, 'votes');
    const q = query(
      votesRef,
      where('rating_id', '==', ratingId),
      where('anonymous_id', '==', anonymousId)
    );
    
    const votesSnapshot = await getDocs(q);
    
    if (!votesSnapshot.empty) {
      // User already voted, update their vote
      const voteDoc = votesSnapshot.docs[0];
      const previousVoteType = voteDoc.data().vote_type;
      
      // If vote type is the same, do nothing
      if (previousVoteType === voteType) {
        return;
      }
      
      // Update the vote
      await updateDoc(doc(votesRef, voteDoc.id), {
        vote_type: voteType,
        created_at: Timestamp.now()
      });
      
      // Update helpfulness score
      await runTransaction(db, async (transaction) => {
        const ratingRef = doc(db, 'ratings', ratingId);
        const ratingDoc = await transaction.get(ratingRef);
        
        if (!ratingDoc.exists()) {
          throw new Error('Rating not found');
        }
        
        const ratingData = ratingDoc.data();
        let helpfulnessScore = ratingData.helpfulness_score || 0;
        
        // Remove previous vote effect
        if (previousVoteType === 'helpful') {
          helpfulnessScore -= 1;
        } else {
          helpfulnessScore += 1;
        }
        
        // Add new vote effect
        if (voteType === 'helpful') {
          helpfulnessScore += 1;
        } else {
          helpfulnessScore -= 1;
        }
        
        transaction.update(ratingRef, { helpfulness_score: helpfulnessScore });
      });
    } else {
      // New vote
      await addDoc(votesRef, {
        rating_id: ratingId,
        anonymous_id: anonymousId,
        vote_type: voteType,
        created_at: Timestamp.now()
      });
      
      // Update helpfulness score
      const ratingRef = doc(db, 'ratings', ratingId);
      const ratingDoc = await getDoc(ratingRef);
      
      if (ratingDoc.exists()) {
        const ratingData = ratingDoc.data();
        let helpfulnessScore = ratingData.helpfulness_score || 0;
        
        if (voteType === 'helpful') {
          helpfulnessScore += 1;
        } else {
          helpfulnessScore -= 1;
        }
        
        await updateDoc(ratingRef, { helpfulness_score: helpfulnessScore });
      }
    }
  } catch (error: any) {
    console.error('Error voting on rating:', error);
    throw new Error(`Failed to vote on rating: ${error.message}`);
  }
};