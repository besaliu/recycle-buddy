    import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Get the directory of the current module (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

/**
 * Initialize Firebase Admin SDK
 * Supports multiple initialization methods for different environments:
 * 1. Service account file (local development)
 * 2. Service account JSON from environment variable (deployment)
 * 3. Application Default Credentials (Cloud Run, Cloud Functions, etc.)
 */
let db = null;

function initializeFirebase() {
  // Return existing instance if already initialized
  if (admin.apps.length > 0) {
    db = admin.firestore();
    return db;
  }

  try {
    // Get project ID from environment variable or .firebaserc
    let projectId = process.env.FIREBASE_PROJECT_ID;
    
    if (!projectId) {
      try {
        const firebasercPath = join(__dirname, '..', '.firebaserc');
        const firebaserc = JSON.parse(readFileSync(firebasercPath, 'utf8'));
        projectId = firebaserc.projects?.default;
      } catch (e) {
        // .firebaserc not found, will use default
      }
    }

    projectId = projectId || 'recycle-buddy-e82ea';

    // Method 1: Service account file (best for local development)
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (serviceAccountPath) {
      try {
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: projectId || serviceAccount.project_id,
        });
        db = admin.firestore();
        console.log('✓ Firebase Admin initialized with service account file');
        return db;
      } catch (error) {
        console.warn('⚠ Failed to initialize with service account file:', error.message);
      }
    }

    // Method 2: Service account JSON from environment variable (best for deployment)
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (serviceAccountJson) {
      try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: projectId || serviceAccount.project_id,
        });
        db = admin.firestore();
        console.log('✓ Firebase Admin initialized with service account JSON from env');
        return db;
      } catch (error) {
        console.warn('⚠ Failed to initialize with service account JSON:', error.message);
      }
    }

    // Method 3: Application Default Credentials (for Cloud Run, Cloud Functions, GCE, etc.)
    // This automatically uses the service account attached to the resource
    try {
      admin.initializeApp({
        projectId: projectId,
      });
      db = admin.firestore();
      console.log(`✓ Firebase Admin initialized with Application Default Credentials (project: ${projectId})`);
      return db;
    } catch (error) {
      console.warn('⚠ Failed to initialize with Application Default Credentials:', error.message);
    }

    // If all methods failed
    throw new Error('All Firebase initialization methods failed');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    console.error('\n📋 Setup Options:');
    console.error('   For Local Development:');
    console.error('   1. Set FIREBASE_SERVICE_ACCOUNT_PATH to your service account key file path');
    console.error('      Example: FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json');
    console.error('');
    console.error('   For Deployment (Cloud Run, Cloud Functions, etc.):');
    console.error('   1. Set FIREBASE_SERVICE_ACCOUNT_JSON to your service account JSON string');
    console.error('      Example: FIREBASE_SERVICE_ACCOUNT_JSON=\'{"type":"service_account",...}\'');
    console.error('   2. OR use Application Default Credentials (automatically available in GCP)');
    console.error('      No configuration needed - Firebase will use the attached service account');
    console.error('');
    return null;
  }
}

// Initialize Firebase on module load
db = initializeFirebase();

export { db, initializeFirebase };
