import express from 'express';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const router = express.Router();

// Get the directory of the current module (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // Get project ID from .firebaserc or environment variable
    let projectId = process.env.FIREBASE_PROJECT_ID;
    
    if (!projectId) {
      try {
        const firebasercPath = join(__dirname, '..', '.firebaserc');
        const firebaserc = JSON.parse(readFileSync(firebasercPath, 'utf8'));
        projectId = firebaserc.projects?.default || firebaserc.projects?.default;
      } catch (e) {
        // .firebaserc not found, will use environment variable or default
      }
    }

    // Try to initialize with service account if provided
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (serviceAccountPath) {
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: projectId || serviceAccount.project_id,
      });
      console.log('✓ Firebase Admin initialized with service account file');
    } else if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: projectId || serviceAccount.project_id,
      });
      console.log('✓ Firebase Admin initialized with service account JSON from env');
    } else {
      // Initialize with project ID (will use Application Default Credentials)
      admin.initializeApp({
        projectId: projectId || 'recycle-buddy-e82ea',
      });
      console.log(`✓ Firebase Admin initialized with project ID: ${projectId || 'recycle-buddy-e82ea'}`);
    }
  } catch (error) {
    console.warn('⚠ Firebase Admin initialization failed:', error.message);
    console.warn('   Firebase endpoints will not work until Firebase is properly configured.');
    console.warn('   Options:');
    console.warn('   1. Set FIREBASE_SERVICE_ACCOUNT_PATH to your service account key file, OR');
    console.warn('   2. Set FIREBASE_SERVICE_ACCOUNT_JSON to your service account JSON, OR');
    console.warn('   3. Use Application Default Credentials (gcloud auth application-default login)');
  }
}

const db = admin.apps.length > 0 ? admin.firestore() : null;

/**
 * POST /api/incrementTreeCount
 * Increment the tree count in Firestore
 */
router.post('/incrementTreeCount', async (req, res) => {
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Firebase is not initialized. Please configure Firebase credentials.',
    });
  }

  try {
    const treeCounterRef = db.collection("appData").doc("treeCounter");

    const newTreeCount = await db.runTransaction(async (transaction) => {
      const sfDoc = await transaction.get(treeCounterRef);

      if (!sfDoc.exists) {
        transaction.set(treeCounterRef, { treeCount: 1 });
        return 1;
      }

      const currentCount = sfDoc.data().treeCount || 0;
      const updatedCount = currentCount + 1;
      transaction.update(treeCounterRef, {
        treeCount: admin.firestore.FieldValue.increment(1)
      });
      return updatedCount;
    });

    return res.status(200).json({
      success: true,
      message: "Tree count incremented successfully!",
      treeCount: newTreeCount
    });
  } catch (error) {
    console.error("Error incrementing tree count:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to increment tree count.",
      error: error.message
    });
  }
});

/**
 * GET /api/getTreeCount
 * Get the current tree count from Firestore
 */
router.get('/getTreeCount', async (req, res) => {
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Firebase is not initialized. Please configure Firebase credentials.',
    });
  }

  try {
    const treeCounterRef = db.collection("appData").doc("treeCounter");
    const docSnapshot = await treeCounterRef.get();

    let treeCount = 0; // Default to 0 if document or field doesn't exist

    if (docSnapshot.exists) {
      const data = docSnapshot.data();
      if (data && typeof data.treeCount === 'number') {
        treeCount = data.treeCount;
      }
    }

    return res.status(200).json({
      success: true,
      treeCount: treeCount,
      message: "Successfully retrieved tree count."
    });
  } catch (error) {
    console.error("Error getting tree count:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve tree count.",
      error: error.message
    });
  }
});

export default router;
