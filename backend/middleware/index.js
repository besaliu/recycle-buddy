import cors from 'cors';
import express from 'express';

/**
 * Configure Express middleware (CORS, body parsing)
 * Note: Error handler should be added after routes in server.js
 */
export function setupMiddleware(app) {
  // CORS for mobile web app
  app.use(cors());
  
  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
}
