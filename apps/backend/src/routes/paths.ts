import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getPaths,
  getPath,
  createPath,
  updatePath,
  deletePath
} from '../controllers/pathController.js';

const router = Router();

router.get('/', getPaths);
router.get('/:id', getPath);
router.post('/', authenticateToken, createPath);
router.put('/:id', authenticateToken, updatePath);
router.delete('/:id', authenticateToken, deletePath);

export default router;