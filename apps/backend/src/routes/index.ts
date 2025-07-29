import { Router } from 'express';
import regionsRouter from './regions';
import pathsRouter from './paths';
import pointsRouter from './points';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'wildeditor-backend'
  });
});

// API routes
router.use('/regions', regionsRouter);
router.use('/paths', pathsRouter);
router.use('/points', pointsRouter);

export default router;