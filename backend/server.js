import express from 'express';
import { setupMiddleware } from './middleware/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import llmRoutes from './routes/llmRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import firebaseRoutes from './routes/firebaseRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Setup middleware (CORS, body parsing)
setupMiddleware(app);

// Routes
app.use('/api', llmRoutes);
app.use('/api', healthRoutes);
app.use('/api', firebaseRoutes);
app.use('/', healthRoutes); // Root route

// Error handling middleware (must be after routes)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Recycle Buddy API Server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   LLM endpoint: POST http://localhost:${PORT}/api/callLLM`);
  console.log(`   Firebase endpoints:`);
  console.log(`     GET  http://localhost:${PORT}/api/getTreeCount`);
  console.log(`     POST http://localhost:${PORT}/api/incrementTreeCount\n`);
});
