// services/auth-service.ts
import { auth, db } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  User as FirebaseUser,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';

// Function to validate IIT Bhilai email domain
export const validateEmail = (email: string): boolean => {
  return email.endsWith('@iitbhilai.ac.in');
};

// Function to generate a secure hash of the email
export const hashEmail = (email: string, salt: string): string => {
  return CryptoJS.SHA256(email + salt).toString();
};

// Function to create a new user
export const registerUser = async (email: string, password: string): Promise<FirebaseUser> => {
  if (!validateEmail(email)) {
    throw new Error('Only IIT Bhilai email addresses are allowed');
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(`Registration failed: ${error.message}`);
  }
};

// Function to sign in a user
export const signInUser = async (email: string, password: string): Promise<FirebaseUser> => {
  if (!validateEmail(email)) {
    throw new Error('Only IIT Bhilai email addresses are allowed');
  }
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(`Sign in failed: ${error.message}`);
  }
};

// Function to sign out
export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};

// Function to create or get anonymous ID
export const getOrCreateAnonymousId = async (user: FirebaseUser): Promise<string> => {
  if (!user.emailVerified) {
    throw new Error('Email must be verified before generating an anonymous ID');
  }
  
  const userDocRef = doc(db, 'users_auth', user.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (userDoc.exists()) {
    const userData = userDoc.data();
    return userData.anonymous_id;
  } else {
    // Generate new anonymous identity
    const salt = CryptoJS.lib.WordArray.random(16).toString();
    const email_hash = hashEmail(user.email!, salt);
    const anonymous_id = uuidv4();
    
    // Store in Firestore
    await setDoc(userDocRef, {
      email_hash,
      anonymous_id,
      salt,
      verification_status: true,
      created_at: Timestamp.now(),
      last_login: Timestamp.now()
    });
    
    return anonymous_id;
  }
};

// Function to update last login
export const updateLastLogin = async (userId: string): Promise<void> => {
  const userDocRef = doc(db, 'users_auth', userId);
  await setDoc(userDocRef, { last_login: Timestamp.now() }, { merge: true });
};