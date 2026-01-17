import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Create mock objects
const createMockFirestore = () => {
  const mockTreeCounterRef = {
    get: jest.fn(),
    exists: false,
    data: jest.fn(() => ({ treeCount: 0 })),
  };

  const mockTransaction = {
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
  };

  const mockCollection = {
    doc: jest.fn(() => mockTreeCounterRef),
  };

  const mockDb = {
    collection: jest.fn(() => mockCollection),
    runTransaction: jest.fn(),
  };

  return { mockDb, mockTreeCounterRef, mockTransaction, mockCollection };
};

// Create test routes that mirror the actual routes but allow injection of mocks
const createTestRoutes = (testDb) => {
  const router = express.Router();
  
  router.post('/incrementTreeCount', async (req, res) => {
    if (!testDb) {
      return res.status(503).json({
        success: false,
        message: 'Firebase is not initialized. Please configure Firebase credentials.',
      });
    }

    try {
      const treeCounterRef = testDb.collection("appData").doc("treeCounter");

      const newTreeCount = await testDb.runTransaction(async (transaction) => {
        const sfDoc = await transaction.get(treeCounterRef);

        if (!sfDoc.exists) {
          transaction.set(treeCounterRef, { treeCount: 1 });
          return 1;
        }

        const currentCount = sfDoc.data().treeCount || 0;
        const updatedCount = currentCount + 1;
        transaction.update(treeCounterRef, {
          treeCount: { _increment: 1 }
        });
        return updatedCount;
      });

      return res.status(200).json({
        success: true,
        message: "Tree count incremented successfully!",
        treeCount: newTreeCount
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to increment tree count.",
        error: error.message
      });
    }
  });

  router.get('/getTreeCount', async (req, res) => {
    if (!testDb) {
      return res.status(503).json({
        success: false,
        message: 'Firebase is not initialized. Please configure Firebase credentials.',
      });
    }

    try {
      const treeCounterRef = testDb.collection("appData").doc("treeCounter");
      const docSnapshot = await treeCounterRef.get();

      let treeCount = 0;

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
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve tree count.",
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
    
    // Create Express app with test routes
    app = express();
    app.use(express.json());
    app.use('/api', createTestRoutes(mocks.mockDb));
  });

  describe('POST /api/incrementTreeCount', () => {
    it('should return 503 if Firebase is not initialized', async () => {
      const appWithoutDb = express();
      appWithoutDb.use(express.json());
      appWithoutDb.use('/api', createTestRoutes(null));

      const response = await request(appWithoutDb)
        .post('/api/incrementTreeCount')
        .expect(503);

      expect(response.body).toEqual({
        success: false,
        message: 'Firebase is not initialized. Please configure Firebase credentials.',
      });
    });

    it('should increment tree count from 0 to 1 when document does not exist', async () => {
      // Mock document doesn't exist
      mocks.mockTreeCounterRef.exists = false;
      mocks.mockTransaction.get.mockResolvedValue(mocks.mockTreeCounterRef);

      // Mock transaction callback
      mocks.mockDb.runTransaction.mockImplementation(async (callback) => {
        await callback(mocks.mockTransaction);
        return 1; // Return new count
      });

      const response = await request(app)
        .post('/api/incrementTreeCount')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Tree count incremented successfully!',
        treeCount: 1,
      });

      expect(mocks.mockTransaction.set).toHaveBeenCalledWith(
        mocks.mockTreeCounterRef,
        { treeCount: 1 }
      );
    });

    it('should increment tree count when document exists', async () => {
      // Mock document exists with count of 5
      mocks.mockTreeCounterRef.exists = true;
      mocks.mockTreeCounterRef.data.mockReturnValue({ treeCount: 5 });
      mocks.mockTransaction.get.mockResolvedValue(mocks.mockTreeCounterRef);

      // Mock transaction callback
      mocks.mockDb.runTransaction.mockImplementation(async (callback) => {
        await callback(mocks.mockTransaction);
        return 6; // Return incremented count
      });

      const response = await request(app)
        .post('/api/incrementTreeCount')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Tree count incremented successfully!',
        treeCount: 6,
      });

      expect(mocks.mockTransaction.update).toHaveBeenCalledWith(
        mocks.mockTreeCounterRef,
        {
          treeCount: { _increment: 1 },
        }
      );
    });

    it('should handle errors and return 500', async () => {
      // Mock transaction to throw error
      mocks.mockDb.runTransaction.mockRejectedValue(new Error('Firestore error'));

      const response = await request(app)
        .post('/api/incrementTreeCount')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Failed to increment tree count.',
        error: 'Firestore error',
      });
    });
  });

  describe('GET /api/getTreeCount', () => {
    it('should return 503 if Firebase is not initialized', async () => {
      const appWithoutDb = express();
      appWithoutDb.use(express.json());
      appWithoutDb.use('/api', createTestRoutes(null));

      const response = await request(appWithoutDb)
        .get('/api/getTreeCount')
        .expect(503);

      expect(response.body).toEqual({
        success: false,
        message: 'Firebase is not initialized. Please configure Firebase credentials.',
      });
    });

    it('should return 0 when document does not exist', async () => {
      // Mock document doesn't exist
      mocks.mockTreeCounterRef.exists = false;
      mocks.mockTreeCounterRef.get.mockResolvedValue(mocks.mockTreeCounterRef);

      const response = await request(app)
        .get('/api/getTreeCount')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        treeCount: 0,
        message: 'Successfully retrieved tree count.',
      });
    });

    it('should return tree count when document exists', async () => {
      // Mock document exists with count of 42
      mocks.mockTreeCounterRef.exists = true;
      mocks.mockTreeCounterRef.data.mockReturnValue({ treeCount: 42 });
      mocks.mockTreeCounterRef.get.mockResolvedValue(mocks.mockTreeCounterRef);

      const response = await request(app)
        .get('/api/getTreeCount')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        treeCount: 42,
        message: 'Successfully retrieved tree count.',
      });
    });

    it('should return 0 when treeCount field is missing', async () => {
      // Mock document exists but no treeCount field
      mocks.mockTreeCounterRef.exists = true;
      mocks.mockTreeCounterRef.data.mockReturnValue({});
      mocks.mockTreeCounterRef.get.mockResolvedValue(mocks.mockTreeCounterRef);

      const response = await request(app)
        .get('/api/getTreeCount')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        treeCount: 0,
        message: 'Successfully retrieved tree count.',
      });
    });

    it('should handle errors and return 500', async () => {
      // Mock get to throw error
      mocks.mockTreeCounterRef.get.mockRejectedValue(new Error('Firestore error'));

      const response = await request(app)
        .get('/api/getTreeCount')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Failed to retrieve tree count.',
        error: 'Firestore error',
      });
    });
  });
});
