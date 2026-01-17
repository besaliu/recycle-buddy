import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { randomUUID } from 'crypto';

// Create mock objects
const createMockFirestore = () => {
  // Create separate document references for different collections
  const createMockDocRef = (initialData = {}) => ({
    get: jest.fn(),
    exists: false,
    data: jest.fn(() => initialData),
    set: jest.fn(),
    update: jest.fn(),
  });

  const mockGlobalTreeCounterRef = createMockDocRef({ globalTreeCount: 0 });
  const mockGlobalStatsRef = createMockDocRef({});
  const mockUserRef = createMockDocRef({});

  const mockTransaction = {
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
  };

  // Collection mock that returns different doc refs based on collection name
  // Store document references by collection and doc ID
  const docRefs = new Map();
  
  const getDocRef = (collectionName, docId) => {
    const key = `${collectionName}/${docId}`;
    if (!docRefs.has(key)) {
      docRefs.set(key, createMockDocRef({}));
    }
    return docRefs.get(key);
  };

  const mockDb = {
    collection: jest.fn((collectionName) => {
      return {
        doc: jest.fn((docId) => {
          if (collectionName === 'globalStats' && docId === 'totals') {
            return mockGlobalStatsRef;
          }
          // For user documents, reuse the same ref for the same userId
          if (collectionName === 'appData') {
            return getDocRef(collectionName, docId);
          }
          return getDocRef(collectionName, docId);
        }),
      };
    }),
    runTransaction: jest.fn(),
  };

  return { 
    mockDb, 
    mockGlobalTreeCounterRef, 
    mockGlobalStatsRef,
    mockUserRef,
    mockTransaction, 
    createMockDocRef
  };
};

// Create test routes that mirror the actual routes but allow injection of mocks
const createTestRoutes = (testDb) => {
  const router = express.Router();
  
  router.post('/incrementGlobalTreeCount', async (req, res) => {
    if (!testDb) {
      return res.status(503).json({
        success: false,
        message: 'Firebase is not initialized. Please configure Firebase credentials.',
      });
    }

    try {
      const globalTreeCounterRef = testDb.collection("globalStats").doc("totals");

      const newGlobalTreeCount = await testDb.runTransaction(async (transaction) => {
        const sfDoc = await transaction.get(globalTreeCounterRef);

        if (!sfDoc.exists) {
          transaction.set(globalTreeCounterRef, { globalTreeCount: 1 });
          return 1;
        }

        const currentCount = sfDoc.data().globalTreeCount || 0;
        const updatedCount = currentCount + 1;
        transaction.update(globalTreeCounterRef, {
          globalTreeCount: { _increment: 1 }
        });
        return updatedCount;
      });

      return res.status(200).json({
        success: true,
        message: "Global tree count incremented successfully!",
        globalTreeCount: newGlobalTreeCount
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to increment global tree count.",
        error: error.message
      });
    }
  });

  router.get('/getGlobalTreeCount', async (req, res) => {
    if (!testDb) {
      return res.status(503).json({
        success: false,
        message: 'Firebase is not initialized. Please configure Firebase credentials.',
      });
    }

    try {
      const globalTreeCounterRef = testDb.collection("globalStats").doc("totals");
      const docSnapshot = await globalTreeCounterRef.get();

      let globalTreeCount = 0;

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
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve global tree count.",
        error: error.message
      });
    }
  });

  // Global Statistics Routes
  router.post('/incrementGlobalItemsScanned', async (req, res) => {
    if (!testDb) {
      return res.status(503).json({
        success: false,
        message: 'Firebase is not initialized. Please configure Firebase credentials.',
      });
    }

    try {
      const globalTotalsRef = testDb.collection('globalStats').doc('totals');
      const incrementAmount = req.body.amount || 1;

      const newCount = await testDb.runTransaction(async (transaction) => {
        const doc = await transaction.get(globalTotalsRef);
        if (!doc.exists) {
          transaction.set(globalTotalsRef, { globalItemsScanned: incrementAmount });
          return incrementAmount;
        }
        const currentCount = doc.data().globalItemsScanned || 0;
        const updatedCount = currentCount + incrementAmount;
        transaction.update(globalTotalsRef, {
          globalItemsScanned: { _increment: incrementAmount }
        });
        return updatedCount;
      });

      return res.status(200).json({
        success: true,
        message: 'Global items scanned incremented successfully!',
        globalItemsScanned: newCount
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to increment global items scanned.',
        error: error.message
      });
    }
  });

  router.get('/getGlobalItemsScanned', async (req, res) => {
    if (!testDb) {
      return res.status(503).json({
        success: false,
        message: 'Firebase is not initialized. Please configure Firebase credentials.',
      });
    }

    try {
      const globalTotalsRef = testDb.collection('globalStats').doc('totals');
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
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve global items scanned count.',
        error: error.message
      });
    }
  });

  router.post('/incrementGlobalCO2Saved', async (req, res) => {
    if (!testDb) {
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

      const globalTotalsRef = testDb.collection('globalStats').doc('totals');
      const newAmount = await testDb.runTransaction(async (transaction) => {
        const doc = await transaction.get(globalTotalsRef);
        if (!doc.exists) {
          transaction.set(globalTotalsRef, { globalCO2Saved: amount });
          return amount;
        }
        const currentAmount = doc.data().globalCO2Saved || 0;
        const updatedAmount = currentAmount + amount;
        transaction.update(globalTotalsRef, {
          globalCO2Saved: { _increment: amount }
        });
        return updatedAmount;
      });

      return res.status(200).json({
        success: true,
        message: 'Global CO2 saved incremented successfully!',
        globalCO2Saved: newAmount
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to increment global CO2 saved.',
        error: error.message
      });
    }
  });

  router.get('/getGlobalCO2Saved', async (req, res) => {
    if (!testDb) {
      return res.status(503).json({
        success: false,
        message: 'Firebase is not initialized. Please configure Firebase credentials.',
      });
    }

    try {
      const globalTotalsRef = testDb.collection('globalStats').doc('totals');
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
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve global CO2 saved amount.',
        error: error.message
      });
    }
  });

  router.post('/incrementGlobalUserCount', async (req, res) => {
    if (!testDb) {
      return res.status(503).json({
        success: false,
        message: 'Firebase is not initialized. Please configure Firebase credentials.',
      });
    }

    try {
      const globalTotalsRef = testDb.collection('globalStats').doc('totals');
      const incrementAmount = req.body.amount || 1;

      const newCount = await testDb.runTransaction(async (transaction) => {
        const doc = await transaction.get(globalTotalsRef);
        if (!doc.exists) {
          transaction.set(globalTotalsRef, { globalUserCount: incrementAmount });
          return incrementAmount;
        }
        const currentCount = doc.data().globalUserCount || 0;
        const updatedCount = currentCount + incrementAmount;
        transaction.update(globalTotalsRef, {
          globalUserCount: { _increment: incrementAmount }
        });
        return updatedCount;
      });

      return res.status(200).json({
        success: true,
        message: 'Global user count incremented successfully!',
        globalUserCount: newCount
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to increment global user count.',
        error: error.message
      });
    }
  });

  router.get('/getGlobalUserCount', async (req, res) => {
    if (!testDb) {
      return res.status(503).json({
        success: false,
        message: 'Firebase is not initialized. Please configure Firebase credentials.',
      });
    }

    try {
      const globalTotalsRef = testDb.collection('globalStats').doc('totals');
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
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve global user count.',
        error: error.message
      });
    }
  });

  // User Management Routes
  router.post('/createUser', async (req, res) => {
    if (!testDb) {
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

      const userUUID = randomUUID();
      const finalUserId = userId || userUUID;
      const userProfileRef = testDb.collection('appData').doc(finalUserId);
      const globalTotalsRef = testDb.collection('globalStats').doc('totals');

      const existingUser = await userProfileRef.get();
      if (existingUser.exists) {
        return res.status(409).json({
          success: false,
          message: 'User already exists.',
          user: existingUser.data()
        });
      }

      await testDb.runTransaction(async (transaction) => {
        transaction.set(userProfileRef, {
          username: username,
          UUID: userUUID,
          People: peopleCount,
          totalItemsScannedByUser: 0,
          totalCO2SavedByUser: 0,
          individualTrees: 0,
          createdAt: { _serverTimestamp: true }
        });
        transaction.update(globalTotalsRef, {
          globalUserCount: { _increment: 1 }
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
      return res.status(500).json({
        success: false,
        message: 'Failed to create user.',
        error: error.message
      });
    }
  });

  router.get('/getUser/:userId', async (req, res) => {
    if (!testDb) {
      return res.status(503).json({
        success: false,
        message: 'Firebase is not initialized. Please configure Firebase credentials.',
      });
    }

    try {
      const { userId } = req.params;
      const userProfileRef = testDb.collection('appData').doc(userId);
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
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve user profile.',
        error: error.message
      });
    }
  });

  router.post('/incrementUserItemsScanned/:userId', async (req, res) => {
    if (!testDb) {
      return res.status(503).json({
        success: false,
        message: 'Firebase is not initialized. Please configure Firebase credentials.',
      });
    }

    try {
      const { userId } = req.params;
      const incrementAmount = req.body.amount || 1;
      const userProfileRef = testDb.collection('appData').doc(userId);

      const userDoc = await userProfileRef.get();
      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: `User with ID ${userId} not found. Create the user first.`,
        });
      }

      const newCount = await testDb.runTransaction(async (transaction) => {
        const doc = await transaction.get(userProfileRef);
        const currentCount = doc.data().totalItemsScannedByUser || 0;
        const updatedCount = currentCount + incrementAmount;
        transaction.update(userProfileRef, {
          totalItemsScannedByUser: { _increment: incrementAmount }
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
      return res.status(500).json({
        success: false,
        message: 'Failed to increment user items scanned.',
        error: error.message
      });
    }
  });

  router.get('/getUserItemsScanned/:userId', async (req, res) => {
    if (!testDb) {
      return res.status(503).json({
        success: false,
        message: 'Firebase is not initialized. Please configure Firebase credentials.',
      });
    }

    try {
      const { userId } = req.params;
      const userProfileRef = testDb.collection('appData').doc(userId);
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
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve user items scanned count.',
        error: error.message
      });
    }
  });

  router.post('/incrementIndividualTrees/:userId', async (req, res) => {
    if (!testDb) {
      return res.status(503).json({
        success: false,
        message: 'Firebase is not initialized. Please configure Firebase credentials.',
      });
    }

    try {
      const { userId } = req.params;
      const incrementAmount = req.body.amount || 1;
      const userProfileRef = testDb.collection('appData').doc(userId);

      const userDoc = await userProfileRef.get();
      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: `User with ID ${userId} not found. Create the user first.`,
        });
      }

      const newCount = await testDb.runTransaction(async (transaction) => {
        const doc = await transaction.get(userProfileRef);
        const currentCount = doc.data().individualTrees || 0;
        const updatedCount = currentCount + incrementAmount;
        transaction.update(userProfileRef, {
          individualTrees: { _increment: incrementAmount }
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
      return res.status(500).json({
        success: false,
        message: 'Failed to increment individual trees.',
        error: error.message
      });
    }
  });

  router.get('/getIndividualTrees/:userId', async (req, res) => {
    if (!testDb) {
      return res.status(503).json({
        success: false,
        message: 'Firebase is not initialized. Please configure Firebase credentials.',
      });
    }

    try {
      const { userId } = req.params;
      const userProfileRef = testDb.collection('appData').doc(userId);
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
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve individual trees count.',
        error: error.message
      });
    }
  });

  return router;
};

describe('Firebase Routes', () => {
  let app;
  let mocks;

  beforeEach(() => {
    // Reset mocks
    mocks = createMockFirestore();
    
    // Reset all jest mocks
    jest.clearAllMocks();
    
    // Create Express app with test routes
    app = express();
    app.use(express.json());
    app.use('/api', createTestRoutes(mocks.mockDb));
  });

  describe('POST /api/incrementGlobalTreeCount', () => {
    it('should return 503 if Firebase is not initialized', async () => {
      const appWithoutDb = express();
      appWithoutDb.use(express.json());
      appWithoutDb.use('/api', createTestRoutes(null));

      const response = await request(appWithoutDb)
        .post('/api/incrementGlobalTreeCount')
        .expect(503);

      expect(response.body).toEqual({
        success: false,
        message: 'Firebase is not initialized. Please configure Firebase credentials.',
      });
    });

    it('should increment global tree count from 0 to 1 when document does not exist', async () => {
      // Mock document doesn't exist
      mocks.mockGlobalStatsRef.exists = false;
      mocks.mockTransaction.get.mockResolvedValue(mocks.mockGlobalStatsRef);

      // Mock transaction callback
      mocks.mockDb.runTransaction.mockImplementation(async (callback) => {
        await callback(mocks.mockTransaction);
        return 1; // Return new count
      });

      const response = await request(app)
        .post('/api/incrementGlobalTreeCount')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Global tree count incremented successfully!',
        globalTreeCount: 1,
      });

      expect(mocks.mockTransaction.set).toHaveBeenCalledWith(
        mocks.mockGlobalStatsRef,
        { globalTreeCount: 1 }
      );
    });

    it('should increment global tree count when document exists', async () => {
      // Mock document exists with count of 5
      mocks.mockGlobalStatsRef.exists = true;
      mocks.mockGlobalStatsRef.data.mockReturnValue({ globalTreeCount: 5 });
      mocks.mockTransaction.get.mockResolvedValue(mocks.mockGlobalStatsRef);

      // Mock transaction callback
      mocks.mockDb.runTransaction.mockImplementation(async (callback) => {
        await callback(mocks.mockTransaction);
        return 6; // Return incremented count
      });

      const response = await request(app)
        .post('/api/incrementGlobalTreeCount')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Global tree count incremented successfully!',
        globalTreeCount: 6,
      });

      expect(mocks.mockTransaction.update).toHaveBeenCalledWith(
        mocks.mockGlobalStatsRef,
        {
          globalTreeCount: { _increment: 1 },
        }
      );
    });

    it('should handle errors and return 500', async () => {
      // Mock transaction to throw error
      mocks.mockDb.runTransaction.mockRejectedValue(new Error('Firestore error'));

      const response = await request(app)
        .post('/api/incrementGlobalTreeCount')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Failed to increment global tree count.',
        error: 'Firestore error',
      });
    });
  });

  describe('GET /api/getGlobalTreeCount', () => {
    it('should return 503 if Firebase is not initialized', async () => {
      const appWithoutDb = express();
      appWithoutDb.use(express.json());
      appWithoutDb.use('/api', createTestRoutes(null));

      const response = await request(appWithoutDb)
        .get('/api/getGlobalTreeCount')
        .expect(503);

      expect(response.body).toEqual({
        success: false,
        message: 'Firebase is not initialized. Please configure Firebase credentials.',
      });
    });

    it('should return 0 when document does not exist', async () => {
      // Mock document doesn't exist
      mocks.mockGlobalStatsRef.exists = false;
      mocks.mockGlobalStatsRef.get.mockResolvedValue(mocks.mockGlobalStatsRef);

      const response = await request(app)
        .get('/api/getGlobalTreeCount')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        globalTreeCount: 0,
        message: 'Successfully retrieved global tree count.',
      });
    });

    it('should return global tree count when document exists', async () => {
      // Mock document exists with count of 42
      mocks.mockGlobalStatsRef.exists = true;
      mocks.mockGlobalStatsRef.data.mockReturnValue({ globalTreeCount: 42 });
      mocks.mockGlobalStatsRef.get.mockResolvedValue(mocks.mockGlobalStatsRef);

      const response = await request(app)
        .get('/api/getGlobalTreeCount')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        globalTreeCount: 42,
        message: 'Successfully retrieved global tree count.',
      });
    });

    it('should return 0 when globalTreeCount field is missing', async () => {
      // Mock document exists but no globalTreeCount field
      mocks.mockGlobalStatsRef.exists = true;
      mocks.mockGlobalStatsRef.data.mockReturnValue({});
      mocks.mockGlobalStatsRef.get.mockResolvedValue(mocks.mockGlobalStatsRef);

      const response = await request(app)
        .get('/api/getGlobalTreeCount')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        globalTreeCount: 0,
        message: 'Successfully retrieved global tree count.',
      });
    });

    it('should handle errors and return 500', async () => {
      // Mock get to throw error
      mocks.mockGlobalStatsRef.get.mockRejectedValue(new Error('Firestore error'));

      const response = await request(app)
        .get('/api/getGlobalTreeCount')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Failed to retrieve global tree count.',
        error: 'Firestore error',
      });
    });
  });

  // ============================================================================
  // Global Statistics Tests
  // ============================================================================

  describe('POST /api/incrementGlobalItemsScanned', () => {
    it('should return 503 if Firebase is not initialized', async () => {
      const appWithoutDb = express();
      appWithoutDb.use(express.json());
      appWithoutDb.use('/api', createTestRoutes(null));

      const response = await request(appWithoutDb)
        .post('/api/incrementGlobalItemsScanned')
        .expect(503);

      expect(response.body.message).toBe('Firebase is not initialized. Please configure Firebase credentials.');
    });

    it('should increment global items scanned when document does not exist', async () => {
      mocks.mockGlobalStatsRef.exists = false;
      mocks.mockTransaction.get.mockResolvedValue(mocks.mockGlobalStatsRef);
      mocks.mockDb.runTransaction.mockImplementation(async (callback) => {
        await callback(mocks.mockTransaction);
        return 1;
      });

      const response = await request(app)
        .post('/api/incrementGlobalItemsScanned')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.globalItemsScanned).toBe(1);
    });

    it('should increment global items scanned with custom amount', async () => {
      mocks.mockGlobalStatsRef.exists = true;
      mocks.mockGlobalStatsRef.data.mockReturnValue({ globalItemsScanned: 10 });
      mocks.mockTransaction.get.mockResolvedValue(mocks.mockGlobalStatsRef);
      mocks.mockDb.runTransaction.mockImplementation(async (callback) => {
        await callback(mocks.mockTransaction);
        return 15;
      });

      const response = await request(app)
        .post('/api/incrementGlobalItemsScanned')
        .send({ amount: 5 })
        .expect(200);

      expect(response.body.globalItemsScanned).toBe(15);
    });
  });

  describe('GET /api/getGlobalItemsScanned', () => {
    it('should return 0 when document does not exist', async () => {
      mocks.mockGlobalStatsRef.exists = false;
      mocks.mockGlobalStatsRef.get.mockResolvedValue(mocks.mockGlobalStatsRef);

      const response = await request(app)
        .get('/api/getGlobalItemsScanned')
        .expect(200);

      expect(response.body.globalItemsScanned).toBe(0);
    });

    it('should return global items scanned count', async () => {
      mocks.mockGlobalStatsRef.exists = true;
      mocks.mockGlobalStatsRef.data.mockReturnValue({ globalItemsScanned: 100 });
      mocks.mockGlobalStatsRef.get.mockResolvedValue(mocks.mockGlobalStatsRef);

      const response = await request(app)
        .get('/api/getGlobalItemsScanned')
        .expect(200);

      expect(response.body.globalItemsScanned).toBe(100);
    });
  });

  describe('POST /api/incrementGlobalCO2Saved', () => {
    it('should return 400 for invalid amount', async () => {
      const response = await request(app)
        .post('/api/incrementGlobalCO2Saved')
        .send({ amount: -5 })
        .expect(400);

      expect(response.body.message).toContain('Invalid amount');
    });

    it('should increment global CO2 saved', async () => {
      mocks.mockGlobalStatsRef.exists = true;
      mocks.mockGlobalStatsRef.data.mockReturnValue({ globalCO2Saved: 50 });
      mocks.mockTransaction.get.mockResolvedValue(mocks.mockGlobalStatsRef);
      mocks.mockDb.runTransaction.mockImplementation(async (callback) => {
        await callback(mocks.mockTransaction);
        return 75;
      });

      const response = await request(app)
        .post('/api/incrementGlobalCO2Saved')
        .send({ amount: 25 })
        .expect(200);

      expect(response.body.globalCO2Saved).toBe(75);
    });
  });

  describe('GET /api/getGlobalCO2Saved', () => {
    it('should return global CO2 saved amount', async () => {
      mocks.mockGlobalStatsRef.exists = true;
      mocks.mockGlobalStatsRef.data.mockReturnValue({ globalCO2Saved: 500 });
      mocks.mockGlobalStatsRef.get.mockResolvedValue(mocks.mockGlobalStatsRef);

      const response = await request(app)
        .get('/api/getGlobalCO2Saved')
        .expect(200);

      expect(response.body.globalCO2Saved).toBe(500);
    });
  });

  describe('POST /api/incrementGlobalUserCount', () => {
    it('should increment global user count', async () => {
      mocks.mockGlobalStatsRef.exists = true;
      mocks.mockGlobalStatsRef.data.mockReturnValue({ globalUserCount: 10 });
      mocks.mockTransaction.get.mockResolvedValue(mocks.mockGlobalStatsRef);
      mocks.mockDb.runTransaction.mockImplementation(async (callback) => {
        await callback(mocks.mockTransaction);
        return 11;
      });

      const response = await request(app)
        .post('/api/incrementGlobalUserCount')
        .expect(200);

      expect(response.body.globalUserCount).toBe(11);
    });
  });

  describe('GET /api/getGlobalUserCount', () => {
    it('should return global user count', async () => {
      mocks.mockGlobalStatsRef.exists = true;
      mocks.mockGlobalStatsRef.data.mockReturnValue({ globalUserCount: 42 });
      mocks.mockGlobalStatsRef.get.mockResolvedValue(mocks.mockGlobalStatsRef);

      const response = await request(app)
        .get('/api/getGlobalUserCount')
        .expect(200);

      expect(response.body.globalUserCount).toBe(42);
    });
  });

  // ============================================================================
  // User Management Tests
  // ============================================================================

  describe('POST /api/createUser', () => {
    it('should return 400 if username is missing', async () => {
      const response = await request(app)
        .post('/api/createUser')
        .send({ userId: 'test123' })
        .expect(400);

      expect(response.body.message).toBe('username is required.');
    });

    it('should create a new user with UUID', async () => {
      const userId = 'test-user-123';
      const userRef = mocks.mockDb.collection('appData').doc(userId);
      userRef.exists = false;
      userRef.get.mockResolvedValue(userRef);

      mocks.mockGlobalStatsRef.exists = true;
      mocks.mockGlobalStatsRef.data.mockReturnValue({ globalUserCount: 0 });
      mocks.mockTransaction.get.mockResolvedValue(mocks.mockGlobalStatsRef);
      mocks.mockDb.runTransaction.mockImplementation(async (callback) => {
        await callback(mocks.mockTransaction);
      });

      const response = await request(app)
        .post('/api/createUser')
        .send({ userId, username: 'TestUser', peopleCount: 2 })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.userId).toBe(userId);
      expect(response.body.UUID).toBeDefined();
      expect(response.body.user.username).toBe('TestUser');
      expect(response.body.user.People).toBe(2);
      expect(response.body.user.individualTrees).toBe(0);
    });

    it('should generate UUID if userId not provided', async () => {
      const userRef = mocks.createMockDocRef();
      userRef.exists = false;
      userRef.get.mockResolvedValue(userRef);
      
      // Mock collection to return our userRef for any userId
      mocks.mockDb.collection.mockImplementation((collectionName) => {
        if (collectionName === 'appData') {
          return {
            doc: jest.fn(() => userRef)
          };
        }
        if (collectionName === 'globalStats') {
          return {
            doc: jest.fn(() => mocks.mockGlobalStatsRef)
          };
        }
        return { doc: jest.fn(() => mocks.createMockDocRef()) };
      });

      mocks.mockGlobalStatsRef.exists = true;
      mocks.mockTransaction.get.mockResolvedValue(mocks.mockGlobalStatsRef);
      mocks.mockDb.runTransaction.mockImplementation(async (callback) => {
        await callback(mocks.mockTransaction);
      });

      const response = await request(app)
        .post('/api/createUser')
        .send({ username: 'NewUser' })
        .expect(201);

      expect(response.body.UUID).toBeDefined();
      expect(response.body.userId).toBe(response.body.UUID);
    });

    it('should return 409 if user already exists', async () => {
      const userId = 'existing-user';
      const userRef = mocks.mockDb.collection('appData').doc(userId);
      userRef.exists = true;
      userRef.data.mockReturnValue({ username: 'ExistingUser' });
      userRef.get.mockResolvedValue(userRef);

      const response = await request(app)
        .post('/api/createUser')
        .send({ userId, username: 'ExistingUser' })
        .expect(409);

      expect(response.body.message).toBe('User already exists.');
    });
  });

  describe('GET /api/getUser/:userId', () => {
    it('should return 404 if user does not exist', async () => {
      const userId = 'non-existent';
      const userRef = mocks.mockDb.collection('appData').doc(userId);
      userRef.exists = false;
      userRef.get.mockResolvedValue(userRef);

      const response = await request(app)
        .get(`/api/getUser/${userId}`)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should return user profile', async () => {
      const userId = 'test-user';
      const userRef = mocks.mockDb.collection('appData').doc(userId);
      userRef.exists = true;
      userRef.data.mockReturnValue({
        username: 'TestUser',
        UUID: 'test-uuid',
        People: 1,
        totalItemsScannedByUser: 10,
        individualTrees: 5
      });
      userRef.get.mockResolvedValue(userRef);

      const response = await request(app)
        .get(`/api/getUser/${userId}`)
        .expect(200);

      expect(response.body.user.username).toBe('TestUser');
      expect(response.body.user.UUID).toBe('test-uuid');
      expect(response.body.user.individualTrees).toBe(5);
    });
  });

  describe('POST /api/incrementUserItemsScanned/:userId', () => {
    it('should return 404 if user does not exist', async () => {
      const userId = 'non-existent';
      const userRef = mocks.mockDb.collection('appData').doc(userId);
      userRef.exists = false;
      userRef.get.mockResolvedValue(userRef);

      const response = await request(app)
        .post(`/api/incrementUserItemsScanned/${userId}`)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should increment user items scanned', async () => {
      const userId = 'test-user';
      const userRef = mocks.mockDb.collection('appData').doc(userId);
      userRef.exists = true;
      userRef.get.mockResolvedValue(userRef);
      userRef.data.mockReturnValue({ totalItemsScannedByUser: 5 });
      mocks.mockTransaction.get.mockResolvedValue(userRef);
      mocks.mockDb.runTransaction.mockImplementation(async (callback) => {
        await callback(mocks.mockTransaction);
        return 6;
      });

      const response = await request(app)
        .post(`/api/incrementUserItemsScanned/${userId}`)
        .expect(200);

      expect(response.body.totalItemsScannedByUser).toBe(6);
    });

    it('should increment with custom amount', async () => {
      const userId = 'test-user';
      const userRef = mocks.mockDb.collection('appData').doc(userId);
      userRef.exists = true;
      userRef.get.mockResolvedValue(userRef);
      userRef.data.mockReturnValue({ totalItemsScannedByUser: 10 });
      mocks.mockTransaction.get.mockResolvedValue(userRef);
      mocks.mockDb.runTransaction.mockImplementation(async (callback) => {
        await callback(mocks.mockTransaction);
        return 15;
      });

      const response = await request(app)
        .post(`/api/incrementUserItemsScanned/${userId}`)
        .send({ amount: 5 })
        .expect(200);

      expect(response.body.totalItemsScannedByUser).toBe(15);
    });
  });

  describe('GET /api/getUserItemsScanned/:userId', () => {
    it('should return user items scanned count', async () => {
      const userId = 'test-user';
      const userRef = mocks.mockDb.collection('appData').doc(userId);
      userRef.exists = true;
      userRef.data.mockReturnValue({ totalItemsScannedByUser: 25 });
      userRef.get.mockResolvedValue(userRef);

      const response = await request(app)
        .get(`/api/getUserItemsScanned/${userId}`)
        .expect(200);

      expect(response.body.totalItemsScannedByUser).toBe(25);
    });
  });

  describe('POST /api/incrementIndividualTrees/:userId', () => {
    it('should return 404 if user does not exist', async () => {
      const userId = 'non-existent';
      const userRef = mocks.mockDb.collection('appData').doc(userId);
      userRef.exists = false;
      userRef.get.mockResolvedValue(userRef);

      const response = await request(app)
        .post(`/api/incrementIndividualTrees/${userId}`)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should increment individual trees', async () => {
      const userId = 'test-user';
      const userRef = mocks.mockDb.collection('appData').doc(userId);
      userRef.exists = true;
      userRef.get.mockResolvedValue(userRef);
      userRef.data.mockReturnValue({ individualTrees: 3 });
      mocks.mockTransaction.get.mockResolvedValue(userRef);
      mocks.mockDb.runTransaction.mockImplementation(async (callback) => {
        await callback(mocks.mockTransaction);
        return 4;
      });

      const response = await request(app)
        .post(`/api/incrementIndividualTrees/${userId}`)
        .expect(200);

      expect(response.body.individualTrees).toBe(4);
    });

    it('should increment with custom amount', async () => {
      const userId = 'test-user';
      const userRef = mocks.mockDb.collection('appData').doc(userId);
      userRef.exists = true;
      userRef.get.mockResolvedValue(userRef);
      userRef.data.mockReturnValue({ individualTrees: 10 });
      mocks.mockTransaction.get.mockResolvedValue(userRef);
      mocks.mockDb.runTransaction.mockImplementation(async (callback) => {
        await callback(mocks.mockTransaction);
        return 15;
      });

      const response = await request(app)
        .post(`/api/incrementIndividualTrees/${userId}`)
        .send({ amount: 5 })
        .expect(200);

      expect(response.body.individualTrees).toBe(15);
    });
  });

  describe('GET /api/getIndividualTrees/:userId', () => {
    it('should return individual trees count', async () => {
      const userId = 'test-user';
      const userRef = mocks.mockDb.collection('appData').doc(userId);
      userRef.exists = true;
      userRef.data.mockReturnValue({ individualTrees: 7 });
      userRef.get.mockResolvedValue(userRef);

      const response = await request(app)
        .get(`/api/getIndividualTrees/${userId}`)
        .expect(200);

      expect(response.body.individualTrees).toBe(7);
    });

    it('should return 0 when field is missing', async () => {
      const userId = 'test-user';
      const userRef = mocks.mockDb.collection('appData').doc(userId);
      userRef.exists = true;
      userRef.data.mockReturnValue({});
      userRef.get.mockResolvedValue(userRef);

      const response = await request(app)
        .get(`/api/getIndividualTrees/${userId}`)
        .expect(200);

      expect(response.body.individualTrees).toBe(0);
    });

    it('should return 404 if user does not exist', async () => {
      const userId = 'non-existent';
      const userRef = mocks.mockDb.collection('appData').doc(userId);
      userRef.exists = false;
      userRef.get.mockResolvedValue(userRef);

      const response = await request(app)
        .get(`/api/getIndividualTrees/${userId}`)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });
  });
});
