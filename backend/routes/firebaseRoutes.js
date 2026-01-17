import express from 'express';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

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
 * POST /api/incrementGlobalTreeCount
 * Increment the global tree count in Firestore
 */
router.post('/incrementGlobalTreeCount', async (req, res) => {
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Firebase is not initialized. Please configure Firebase credentials.',
    });
  }

  try {
    const globalTreeCounterRef = db.collection("globalStats").doc("totals");

    const newGlobalTreeCount = await db.runTransaction(async (transaction) => {
      const sfDoc = await transaction.get(globalTreeCounterRef);

      if (!sfDoc.exists) {
        transaction.set(globalTreeCounterRef, { globalTreeCount: 1 });
        return 1;
      }

      const currentCount = sfDoc.data().globalTreeCount || 0;
      const updatedCount = currentCount + 1;
      transaction.update(globalTreeCounterRef, {
        globalTreeCount: admin.firestore.FieldValue.increment(1)
      });
      return updatedCount;
    });

    return res.status(200).json({
      success: true,
      message: "Global tree count incremented successfully!",
      globalTreeCount: newGlobalTreeCount
    });
  } catch (error) {
    console.error("Error incrementing global tree count:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to increment global tree count.",
      error: error.message
    });
  }
});

/**
 * GET /api/getGlobalTreeCount
 * Get the current global tree count from Firestore
 */
router.get('/getGlobalTreeCount', async (req, res) => {
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Firebase is not initialized. Please configure Firebase credentials.',
    });
  }

  try {
    const globalTreeCounterRef = db.collection("globalStats").doc("totals");
    const docSnapshot = await globalTreeCounterRef.get();

    let globalTreeCount = 0; // Default to 0 if document or field doesn't exist

    if (docSnapshot.exists) {
      const data = docSnapshot.data();
      if (data && typeof data.globalTreeCount === 'number') {
        globalTreeCount = data.globalTreeCount;
      }
    }

    return res.status(200).json({
      success: true,
      globalTreeCount: globalTreeCount,
      message: "Successfully retrieved global tree count."
    });
  } catch (error) {
    console.error("Error getting global tree count:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve global tree count.",
      error: error.message
    });
  }
});

/**
 * POST /api/incrementGlobalItemsScanned
 * Increment the global items scanned count
 */
router.post('/incrementGlobalItemsScanned', async (req, res) => {
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Firebase is not initialized. Please configure Firebase credentials.',
    });
  }

  try {
    const globalTotalsRef = db.collection('globalStats').doc('totals');
    const incrementAmount = req.body.amount || 1;

    const newCount = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(globalTotalsRef);

      if (!doc.exists) {
        transaction.set(globalTotalsRef, { globalItemsScanned: incrementAmount });
        return incrementAmount;
      }

      const currentCount = doc.data().globalItemsScanned || 0;
      const updatedCount = currentCount + incrementAmount;
      transaction.update(globalTotalsRef, {
        globalItemsScanned: admin.firestore.FieldValue.increment(incrementAmount)
      });
      return updatedCount;
    });

    return res.status(200).json({
      success: true,
      message: 'Global items scanned incremented successfully!',
      globalItemsScanned: newCount
    });
  } catch (error) {
    console.error('Error incrementing global items scanned:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to increment global items scanned.',
      error: error.message
    });
  }
});

/**
 * GET /api/getGlobalItemsScanned
 * Get the current global items scanned count
 */
router.get('/getGlobalItemsScanned', async (req, res) => {
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Firebase is not initialized. Please configure Firebase credentials.',
    });
  }

  try {
    const globalTotalsRef = db.collection('globalStats').doc('totals');
    const docSnapshot = await globalTotalsRef.get();

    let globalItemsScanned = 0;

    if (docSnapshot.exists) {
      const data = docSnapshot.data();
      if (data && typeof data.globalItemsScanned === 'number') {
        globalItemsScanned = data.globalItemsScanned;
      }
    }

    return res.status(200).json({
      success: true,
      globalItemsScanned: globalItemsScanned,
      message: 'Successfully retrieved global items scanned count.'
    });
  } catch (error) {
    console.error('Error getting global items scanned:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve global items scanned count.',
      error: error.message
    });
  }
});

/**
 * POST /api/incrementGlobalCO2Saved
 * Increment the global CO2 saved amount
 */
router.post('/incrementGlobalCO2Saved', async (req, res) => {
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Firebase is not initialized. Please configure Firebase credentials.',
    });
  }

  try {
    const { amount } = req.body;
    
    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Must be a non-negative number.',
      });
    }

    const globalTotalsRef = db.collection('globalStats').doc('totals');

    const newAmount = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(globalTotalsRef);

      if (!doc.exists) {
        transaction.set(globalTotalsRef, { globalCO2Saved: amount });
        return amount;
      }

      const currentAmount = doc.data().globalCO2Saved || 0;
      const updatedAmount = currentAmount + amount;
      transaction.update(globalTotalsRef, {
        globalCO2Saved: admin.firestore.FieldValue.increment(amount)
      });
      return updatedAmount;
    });

    return res.status(200).json({
      success: true,
      message: 'Global CO2 saved incremented successfully!',
      globalCO2Saved: newAmount
    });
  } catch (error) {
    console.error('Error incrementing global CO2 saved:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to increment global CO2 saved.',
      error: error.message
    });
  }
});

/**
 * GET /api/getGlobalCO2Saved
 * Get the current global CO2 saved amount
 */
router.get('/getGlobalCO2Saved', async (req, res) => {
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Firebase is not initialized. Please configure Firebase credentials.',
    });
  }

  try {
    const globalTotalsRef = db.collection('globalStats').doc('totals');
    const docSnapshot = await globalTotalsRef.get();

    let globalCO2Saved = 0;

    if (docSnapshot.exists) {
      const data = docSnapshot.data();
      if (data && typeof data.globalCO2Saved === 'number') {
        globalCO2Saved = data.globalCO2Saved;
      }
    }

    return res.status(200).json({
      success: true,
      globalCO2Saved: globalCO2Saved,
      message: 'Successfully retrieved global CO2 saved amount.'
    });
  } catch (error) {
    console.error('Error getting global CO2 saved:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve global CO2 saved amount.',
      error: error.message
    });
  }
});

/**
 * POST /api/incrementGlobalUserCount
 * Increment the global user count
 */
router.post('/incrementGlobalUserCount', async (req, res) => {
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Firebase is not initialized. Please configure Firebase credentials.',
    });
  }

  try {
    const globalTotalsRef = db.collection('globalStats').doc('totals');
    const incrementAmount = req.body.amount || 1;

    const newCount = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(globalTotalsRef);

      if (!doc.exists) {
        transaction.set(globalTotalsRef, { globalUserCount: incrementAmount });
        return incrementAmount;
      }

      const currentCount = doc.data().globalUserCount || 0;
      const updatedCount = currentCount + incrementAmount;
      transaction.update(globalTotalsRef, {
        globalUserCount: admin.firestore.FieldValue.increment(incrementAmount)
      });
      return updatedCount;
    });

    return res.status(200).json({
      success: true,
      message: 'Global user count incremented successfully!',
      globalUserCount: newCount
    });
  } catch (error) {
    console.error('Error incrementing global user count:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to increment global user count.',
      error: error.message
    });
  }
});

/**
 * GET /api/getGlobalUserCount
 * Get the current global user count
 */
router.get('/getGlobalUserCount', async (req, res) => {
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Firebase is not initialized. Please configure Firebase credentials.',
    });
  }

  try {
    const globalTotalsRef = db.collection('globalStats').doc('totals');
    const docSnapshot = await globalTotalsRef.get();

    let globalUserCount = 0;

    if (docSnapshot.exists) {
      const data = docSnapshot.data();
      if (data && typeof data.globalUserCount === 'number') {
        globalUserCount = data.globalUserCount;
      }
    }

    return res.status(200).json({
      success: true,
      globalUserCount: globalUserCount,
      message: 'Successfully retrieved global user count.'
    });
  } catch (error) {
    console.error('Error getting global user count:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve global user count.',
      error: error.message
    });
  }
});

// ============================================================================
// User Management Endpoints
// ============================================================================

/**
 * POST /api/createUser
 * Create a new user profile
 */
router.post('/createUser', async (req, res) => {
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Firebase is not initialized. Please configure Firebase credentials.',
    });
  }

  try {
    const { userId, username, peopleCount = 1 } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'username is required.',
      });
    }

    // Generate UUID for the user
    const userUUID = randomUUID();
    const finalUserId = userId || userUUID;

    const userProfileRef = db.collection('appData').doc(finalUserId);
    const globalTotalsRef = db.collection('globalStats').doc('totals');

    // Check if user already exists
    const existingUser = await userProfileRef.get();
    if (existingUser.exists) {
      return res.status(409).json({
        success: false,
        message: 'User already exists.',
        user: existingUser.data()
      });
    }

    // Create new user profile and increment global user count atomically
    await db.runTransaction(async (transaction) => {
      // Create new user profile
      transaction.set(userProfileRef, {
        username: username,
        UUID: userUUID,
        People: peopleCount,
        totalItemsScannedByUser: 0,
        totalCO2SavedByUser: 0,
        individualTrees: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Increment global user count
      transaction.update(globalTotalsRef, {
        globalUserCount: admin.firestore.FieldValue.increment(1)
      });
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully!',
      userId: finalUserId,
      UUID: userUUID,
      user: {
        username,
        UUID: userUUID,
        People: peopleCount,
        totalItemsScannedByUser: 0,
        totalCO2SavedByUser: 0,
        individualTrees: 0
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user.',
      error: error.message
    });
  }
});

/**
 * GET /api/getUser/:userId
 * Get a user's profile
 */
router.get('/getUser/:userId', async (req, res) => {
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Firebase is not initialized. Please configure Firebase credentials.',
    });
  }

  try {
    const { userId } = req.params;
    const userProfileRef = db.collection('appData').doc(userId);
    const docSnapshot = await userProfileRef.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found.`,
      });
    }

    const userData = docSnapshot.data();

    return res.status(200).json({
      success: true,
      userId: userId,
      user: userData,
      message: 'Successfully retrieved user profile.'
    });
  } catch (error) {
    console.error('Error getting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile.',
      error: error.message
    });
  }
});

/**
 * POST /api/incrementUserItemsScanned/:userId
 * Increment the total items scanned by a specific user
 */
router.post('/incrementUserItemsScanned/:userId', async (req, res) => {
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Firebase is not initialized. Please configure Firebase credentials.',
    });
  }

  try {
    const { userId } = req.params;
    const incrementAmount = req.body.amount || 1;
    const userProfileRef = db.collection('appData').doc(userId);

    // Check if user exists first
    const userDoc = await userProfileRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found. Create the user first.`,
      });
    }

    const newCount = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(userProfileRef);
      const currentCount = doc.data().totalItemsScannedByUser || 0;
      const updatedCount = currentCount + incrementAmount;
      transaction.update(userProfileRef, {
        totalItemsScannedByUser: admin.firestore.FieldValue.increment(incrementAmount)
      });
      return updatedCount;
    });

    return res.status(200).json({
      success: true,
      message: 'User items scanned incremented successfully!',
      userId: userId,
      totalItemsScannedByUser: newCount
    });
  } catch (error) {
    console.error('Error incrementing user items scanned:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to increment user items scanned.',
      error: error.message
    });
  }
});

/**
 * GET /api/getUserItemsScanned/:userId
 * Get the total items scanned by a specific user
 */
router.get('/getUserItemsScanned/:userId', async (req, res) => {
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Firebase is not initialized. Please configure Firebase credentials.',
    });
  }

  try {
    const { userId } = req.params;
    const userProfileRef = db.collection('appData').doc(userId);
    const docSnapshot = await userProfileRef.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found.`,
      });
    }

    const userData = docSnapshot.data();
    const totalItemsScannedByUser = userData.totalItemsScannedByUser || 0;

    return res.status(200).json({
      success: true,
      userId: userId,
      totalItemsScannedByUser: totalItemsScannedByUser,
      message: 'Successfully retrieved user items scanned count.'
    });
  } catch (error) {
    console.error('Error getting user items scanned:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user items scanned count.',
      error: error.message
    });
  }
});

/**
 * POST /api/incrementIndividualTrees/:userId
 * Increment the individual trees count for a specific user
 */
router.post('/incrementIndividualTrees/:userId', async (req, res) => {
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Firebase is not initialized. Please configure Firebase credentials.',
    });
  }

  try {
    const { userId } = req.params;
    const incrementAmount = req.body.amount || 1;
    const userProfileRef = db.collection('appData').doc(userId);

    // Check if user exists first
    const userDoc = await userProfileRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found. Create the user first.`,
      });
    }

    const newCount = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(userProfileRef);
      const currentCount = doc.data().individualTrees || 0;
      const updatedCount = currentCount + incrementAmount;
      transaction.update(userProfileRef, {
        individualTrees: admin.firestore.FieldValue.increment(incrementAmount)
      });
      return updatedCount;
    });

    return res.status(200).json({
      success: true,
      message: 'Individual trees incremented successfully!',
      userId: userId,
      individualTrees: newCount
    });
  } catch (error) {
    console.error('Error incrementing individual trees:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to increment individual trees.',
      error: error.message
    });
  }
});

/**
 * GET /api/getIndividualTrees/:userId
 * Get the individual trees count for a specific user
 */
router.get('/getIndividualTrees/:userId', async (req, res) => {
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Firebase is not initialized. Please configure Firebase credentials.',
    });
  }

  try {
    const { userId } = req.params;
    const userProfileRef = db.collection('appData').doc(userId);
    const docSnapshot = await userProfileRef.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found.`,
      });
    }

    const userData = docSnapshot.data();
    const individualTrees = userData.individualTrees || 0;

    return res.status(200).json({
      success: true,
      userId: userId,
      individualTrees: individualTrees,
      message: 'Successfully retrieved individual trees count.'
    });
  } catch (error) {
    console.error('Error getting individual trees:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve individual trees count.',
      error: error.message
    });
  }
});

export default router;
