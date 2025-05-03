// lib/firebase-admin.ts
import { getApps, initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Load service account from environment variables or JSON file
let serviceAccount: ServiceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) as ServiceAccount;
} else {
  try {
    // For local development, you can use a JSON file
    serviceAccount = require('../../serviceAccountKey.json');
  } catch (error) {
    console.error('Error loading service account:', error);
    throw new Error('Firebase service account not configured properly');
  }
}

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
  });
}

// Initialize services
const adminAuth = getAuth();
const adminDb = getFirestore();

export { adminAuth, adminDb };